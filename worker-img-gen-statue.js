/**
 * Cloudflare Worker — AI Image Generator (OpenAI-Compatible API)
 * + /card self-caching word-card endpoint (KV-backed) for English with Asya trainer.
 * + /statue reference-image endpoint (FLUX.2 klein 9B, multipart) — NEW.
 *
 * Env vars: API_KEY (Bearer for /v1 routes).
 * Bindings: AI (Workers AI), CARDS (KV namespace "word-cards"), IMAGES (optional, for resizing).
 */

const SUPPORTED_MODELS = [
  "@cf/black-forest-labs/flux-1-schnell",
  "@cf/black-forest-labs/flux-2-klein-9b",
  "@cf/stabilityai/stable-diffusion-xl-base-1.0",
  "@cf/bytedance/stable-diffusion-xl-lightning",
  "@cf/lykon/dreamshaper-8-lcm",
];

const DEFAULT_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const REF_MODEL = "@cf/black-forest-labs/flux-2-klein-9b";
const MULTIPART_REQUIRED_MODELS = new Set([
  "@cf/black-forest-labs/flux-2-klein-9b",
]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return corsResponse();
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({ status: "ok", models: SUPPORTED_MODELS, ref_model: REF_MODEL });
    }

    // NEW: reference-image generation (keeps the face from the source photo).
    // GET /statue?u=<public image url>&p=<prompt>&w=1024&h=1365&seed=123
    if (url.pathname === "/statue" && request.method === "GET") {
      return handleReference(url, env);
    }

    // Оживление кадра: image-to-video. /video отдаёт JSON со ссылкой,
    // /video.mp4 сразу редиректит на файл. Подробности — внизу файла.
    if ((url.pathname === "/video" || url.pathname === "/video.mp4") && request.method === "GET") {
      return handleVideo(url, env, url.pathname.endsWith(".mp4"));
    }

    // Public self-caching word-card image endpoint.
    if (url.pathname === "/verify" && request.method === "GET") {
      return handleVerify(url, env);
    }
    if (url.pathname === "/make" && request.method === "GET") {
      const p = url.searchParams.get("p") || "";
      if (!p) return json({ error: "p required" }, 400);
      try {
        const params = { prompt: p, steps: 8 };
        const rr = await env.AI.run(DEFAULT_MODEL, params);
        const bytes = base64ToUint8(extractBase64FromAIResult(rr));
        return new Response(bytes, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" } });
      } catch (e) {
        return json({ error: (e && e.message ? e.message : String(e)).slice(0, 200) }, 500);
      }
    }
    if (url.pathname === "/card" && request.method === "GET") {
      return handleCard(request, url, env, ctx);
    }

    if (url.pathname === "/v1/models" && request.method === "GET") {
      return handleAuth(request, env) || json({
        object: "list",
        data: SUPPORTED_MODELS.map((id) => ({
          id,
          object: "model",
          created: 1700000000,
          owned_by: "cloudflare",
        })),
      });
    }

    if (
      (url.pathname === "/" || url.pathname === "/v1/images/generations") &&
      request.method === "POST"
    ) {
      const authError = handleAuth(request, env);
      if (authError) return authError;
      return handleImageGeneration(request, env);
    }

    return json({ error: "Not found", hint: "POST /v1/images/generations or GET /statue?u=...&p=..." }, 404);
  },
};

// ---- NEW: reference-image (img2img) endpoint ----------------------------
//
// FLUX.2 klein 9B accepts up to 4 reference images, each smaller than 512x512,
// passed as multipart form fields input_image_0..3. Steps are fixed at 4.

const DEFAULT_STATUE_PROMPT =
  "Turn the person in image 0 into a classical white marble statue, carved in ancient Greek style, " +
  "keeping her exact facial features and likeness recognisable in the stone. Serene expression, " +
  "hair carved in soft flowing waves, draped marble fabric over one shoulder, realistic Carrara marble " +
  "texture with fine veining and subtle translucency, dramatic museum lighting from the upper left, " +
  "soft shadows, muted warm beige background, photorealistic, highly detailed, no text, no watermark";

async function handleReference(url, env) {
  const src = url.searchParams.get("u");
  if (!src) return json({ error: "u (public image url) required" }, 400);
  if (!/^https:\/\//i.test(src)) return json({ error: "u must be an https URL" }, 400);

  const prompt = (url.searchParams.get("p") || DEFAULT_STATUE_PROMPT).slice(0, 1500);
  const width = clampInt(url.searchParams.get("w"), 256, 1920, 1024);
  const height = clampInt(url.searchParams.get("h"), 256, 1920, 1365);
  const seed = url.searchParams.get("seed");

  try {
    // 1) fetch the reference photo
    const upstream = await fetch(src);
    if (!upstream.ok) {
      return json({ error: "could not fetch reference image", status: upstream.status }, 400);
    }
    let refBlob = await streamToBlob(upstream.body, upstream.headers.get("content-type") || "image/jpeg");

    // 2) shrink below 512x512 — required by the model.
    //    Uses the Images binding when it is available; otherwise sends as-is.
    if (env.IMAGES) {
      try {
        const resized = await env.IMAGES
          .input(refBlob.stream())
          .transform({ width: 480, height: 480, fit: "scale-down" })
          .output({ format: "image/jpeg", quality: 90 });
        refBlob = await streamToBlob(resized.image(), "image/jpeg");
      } catch (e) {
        // fall through with the original blob
      }
    }

    // 3) build multipart body
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("width", String(width));
    form.append("height", String(height));
    if (seed) form.append("seed", String(parseInt(seed) || 0));
    form.append("input_image_0", refBlob, "reference.jpg");

    // FormData does not expose its serialized body or boundary. Wrapping it in a
    // Response serializes it and generates the Content-Type header with the boundary.
    const formResponse = new Response(form);
    const formStream = formResponse.body;
    const formContentType = formResponse.headers.get("content-type");

    const result = await env.AI.run(REF_MODEL, {
      multipart: { body: formStream, contentType: formContentType },
    });

    const bytes = base64ToUint8(extractBase64FromAIResult(result));
    return new Response(bytes, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return json(
      { error: "reference generation failed", details: (err?.message || String(err)).slice(0, 400) },
      500
    );
  }
}

async function streamToBlob(stream, contentType) {
  const reader = stream.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return new Blob(chunks, { type: contentType });
}

function clampInt(raw, min, max, fallback) {
  const n = parseInt(raw);
  if (!n || Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

// ---- Word-card endpoint -------------------------------------------------

async function handleCard(request, url, env, ctx) {
  const w = (url.searchParams.get("w") || "").trim();
  const style = (url.searchParams.get("s") || "photo").trim().toLowerCase();
  if (!w) return json({ error: "w (word) required" }, 400);
  if (w.length > 80) return json({ error: "w too long" }, 400);

  const isPhraseKey = w.replace(/\(.*?\)/g, "").trim().split(/\s+/).length > 1;
  const key = (isPhraseKey ? "cardp:v3:" : "cardw:v4:") + style + ":" + w.toLowerCase();

  // 1) serve from KV cache if present
  const force = url.searchParams.get("f") === "1";
  const cache = caches.default;
  const cacheKey = new Request(url.origin + url.pathname + "?v=13&w=" + encodeURIComponent(w) + "&s=" + style, { method: "GET" });
  if (!force) {
    const edge = await cache.match(cacheKey);
    if (edge) return edge;
  }
  if (env.CARDS && !force) {
    try {
      const cached = await env.CARDS.get(key, { type: "arrayBuffer" });
      if (cached) {
        const res = new Response(cached, { headers: imgHeaders("HIT") });
        ctx.waitUntil(cache.put(cacheKey, res.clone()));
        return res;
      }
    } catch (e) { /* fall through to generate */ }
  }

  // 2) generate, cache, serve
  try {
    const prompt = await buildCardPrompt(w, style, env);
    let result;
    try {
      result = await env.AI.run(DEFAULT_MODEL, { prompt });
    } catch (e1) {
      // some model backends reject extra props or need a retry
      result = await env.AI.run(DEFAULT_MODEL, { prompt: prompt.slice(0, 900) });
    }
    const base64 = extractBase64FromAIResult(result);
    const bytes = base64ToUint8(base64);
    if (env.CARDS) {
      ctx.waitUntil(env.CARDS.put(key, bytes, { expirationTtl: 31536000 }));
    }
    const res = new Response(bytes, { headers: imgHeaders("MISS") });
    ctx.waitUntil(cache.put(cacheKey, res.clone()));
    return res;
  } catch (err) {
    return json({ error: "card generation failed", details: err?.message || String(err) }, 500);
  }
}

async function buildCardPrompt(w, style, env) {
  const raw = w.replace(/\(.*?\)/g, "").replace(/[.…?!]+$/g, "").trim() || w;
  const isPhrase = raw.split(/\s+/).length > 1;
  const clean = isPhrase ? raw : (raw.split(/[,\/;]/)[0].trim() || raw);
  {
    let scene = "";
    try {
      const r = await Promise.race([
        new Promise((_, rej) => setTimeout(() => rej(new Error("llm timeout")), 7000)),
        env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
        messages: [
          { role: "system", content: "You turn an English word or phrase into a short visual description of a photograph that a learner would instantly recognise as its meaning. Rules: for a nationality or language, describe a famous landmark of that country; for a container or quantity phrase such as a bottle of or a carton of, describe a close-up of that exact package with its typical contents; for food or an object, describe a close-up of the item itself with no people; otherwise describe people doing the action. Reply with ONE sentence, 12 words max, describing only what is visible. Never repeat the phrase itself. Never mention words, text, letters, signs, books or writing." },
          { role: "user", content: "Word or phrase: " + clean }
        ],
        max_tokens: 60
      })]);
      scene = (r && (r.response || (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content) || "")).toString().trim().replace(/^["']|["']$/g, "").slice(0, 200);
    } catch (e) { scene = ""; }
    const base = scene || (isPhrase ? "two friendly people talking to each other at home" : ("a clear everyday photograph of " + clean));
    return base + ", candid documentary photograph, natural daylight, plain simple background, sharp focus, realistic colours, absolutely no text, no words, no letters, no captions, no signs, no watermark, no logo";
  }
}

function imgHeaders(cache) {
  return {
    "Content-Type": "image/jpeg",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Access-Control-Allow-Origin": "*",
    "X-Card-Cache": cache || "",
  };
}

function base64ToUint8(b64) {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ---- Проверка: что модель видит на картинке --------------------------------
async function handleVerify(url, env) {
  const w = (url.searchParams.get("w") || "").trim();
  if (!w) return json({ error: "w required" }, 400);
  const isPhraseKey = w.replace(/\(.*?\)/g, "").trim().split(/\s+/).length > 1;
  const key = (isPhraseKey ? "cardp:v3:" : "cardw:v4:") + "photo:" + w.toLowerCase();
  try {
    const buf = await env.CARDS.get(key, { type: "arrayBuffer" });
    if (!buf) return json({ word: w, error: "no image" }, 404);
    const r = await env.AI.run("@cf/llava-hf/llava-1.5-7b-hf", {
      image: [...new Uint8Array(buf)],
      prompt: "Describe this photo in at most 8 words. Only what is literally visible.",
      max_tokens: 40
    });
    const desc = ((r && (r.description || r.response)) || "").toString().trim();
    let verdict = "?";
    try {
      const v = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
        messages: [
          { role: "system", content: "You check flashcards. Given an English word or phrase and a description of its picture, answer with one word: YES if a learner could reasonably connect that picture to the word, NO if the picture is unrelated or shows something else. Answer YES or NO only." },
          { role: "user", content: "Word: " + w + "\nPicture shows: " + desc }
        ],
        max_tokens: 5
      });
      const raw = ((v && (v.response || (v.choices && v.choices[0] && v.choices[0].message && v.choices[0].message.content))) || "").toString().toUpperCase();
      verdict = raw.indexOf("NO") >= 0 ? "no" : (raw.indexOf("YES") >= 0 ? "yes" : "?");
    } catch (e) { verdict = "?"; }
    return json({ word: w, desc: desc, ok: verdict });
  } catch (e) {
    return json({ word: w, error: (e && e.message ? e.message : String(e)).slice(0, 160) }, 500);
  }
}

// ---- OpenAI-compatible generation ---------------------------------------

async function handleImageGeneration(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const prompt = body.prompt || body.inputs;
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return json({ error: "prompt is required and must be a non-empty string" }, 400);
  }

  const model = body.model || DEFAULT_MODEL;
  if (!SUPPORTED_MODELS.includes(model)) {
    return json({
      error: `Unsupported model: ${model}`,
      supported_models: SUPPORTED_MODELS,
    }, 400);
  }

  let runtimeModel = model;
  let fallbackReason = null;

  if (MULTIPART_REQUIRED_MODELS.has(model)) {
    runtimeModel = DEFAULT_MODEL;
    fallbackReason = `${model} requires multipart input in Workers AI; auto-fallback applied. Use GET /statue for multipart + reference images.`;
  }

  const n = Math.min(parseInt(body.n) || 1, 4);
  const steps = Math.min(parseInt(body.num_inference_steps) || 4, 20);
  const guidance = parseFloat(body.guidance_scale) || 7.5;
  const negativePrompt = body.negative_prompt || "";

  const aiParams = {
    prompt: prompt.trim(),
    num_steps: steps,
    guidance: guidance,
  };
  if (negativePrompt) aiParams.negative_prompt = negativePrompt;

  try {
    const imageResults = [];

    for (let i = 0; i < n; i++) {
      let result;
      try {
        result = await env.AI.run(runtimeModel, aiParams);
      } catch (runErr) {
        const details = runErr?.message || String(runErr);
        const needsMultipart = /required properties.*multipart|multipart/i.test(details);

        if (!needsMultipart || runtimeModel === DEFAULT_MODEL) {
          throw runErr;
        }

        runtimeModel = DEFAULT_MODEL;
        fallbackReason = `${model} failed with multipart requirement; auto-fallback applied.`;
        result = await env.AI.run(runtimeModel, aiParams);
      }

      let base64;
      try {
        base64 = extractBase64FromAIResult(result);
      } catch (parseErr) {
        if (runtimeModel !== DEFAULT_MODEL) {
          runtimeModel = DEFAULT_MODEL;
          fallbackReason = `${model} returned unsupported output format; auto-fallback applied.`;
          const fallbackResult = await env.AI.run(runtimeModel, aiParams);
          base64 = extractBase64FromAIResult(fallbackResult);
        } else {
          throw parseErr;
        }
      }

      imageResults.push({ b64_json: base64, revised_prompt: prompt });
    }

    return json({
      created: Math.floor(Date.now() / 1000),
      data: imageResults,
      model: runtimeModel,
      requested_model: model,
      ...(fallbackReason
        ? {
            warning: {
              type: "model_fallback",
              message: fallbackReason,
              fallback_model: DEFAULT_MODEL,
            },
          }
        : {}),
      usage: {
        prompt_tokens: Math.ceil(prompt.length / 4),
        total_tokens: Math.ceil(prompt.length / 4),
      },
    });
  } catch (err) {
    const details = err?.message || String(err);
    const unavailable = /not\s*found|unavailable|unsupported|permission|access|invalid\s*model/i.test(details);

    if (unavailable) {
      return json(
        {
          error: {
            message: `Model failed or unavailable: ${model}`,
            type: "model_unavailable",
            details,
            hint: "Try @cf/black-forest-labs/flux-1-schnell or check Workers AI model availability in your account/region.",
          },
        },
        400
      );
    }

    return json(
      {
        error: {
          message: "Image generation failed",
          type: "server_error",
          details,
        },
      },
      500
    );
  }
}

function handleAuth(request, env) {
  if (!env.API_KEY) return null;
  const auth = request.headers.get("Authorization") || "";
  if (auth !== `Bearer ${env.API_KEY}`) {
    return json(
      { error: { message: "Unauthorized", type: "auth_error" } },
      401,
      { "WWW-Authenticate": "Bearer" }
    );
  }
  return null;
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...extraHeaders,
    },
  });
}

function corsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function extractBase64FromAIResult(result) {
  if (!result) {
    throw new Error("Workers AI returned an empty response");
  }

  if (result instanceof ArrayBuffer) {
    return arrayBufferToBase64(result);
  }

  if (result instanceof Uint8Array) {
    return arrayBufferToBase64(result.buffer);
  }

  if (typeof result === "string") {
    return isLikelyBase64(result)
      ? result
      : arrayBufferToBase64(new TextEncoder().encode(result).buffer);
  }

  if (result?.buffer instanceof ArrayBuffer) {
    return arrayBufferToBase64(result.buffer);
  }

  if (result?.image instanceof ArrayBuffer) {
    return arrayBufferToBase64(result.image);
  }

  if (result?.image instanceof Uint8Array) {
    return arrayBufferToBase64(result.image.buffer);
  }

  if (typeof result?.image === "string") {
    return stripDataUrlPrefix(result.image);
  }

  if (result?.output instanceof ArrayBuffer) {
    return arrayBufferToBase64(result.output);
  }

  if (result?.output instanceof Uint8Array) {
    return arrayBufferToBase64(result.output.buffer);
  }

  if (typeof result?.output === "string" && isLikelyBase64(result.output)) {
    return stripDataUrlPrefix(result.output);
  }

  if (typeof result?.b64_json === "string") {
    return stripDataUrlPrefix(result.b64_json);
  }

  if (Array.isArray(result?.data) && typeof result.data?.[0]?.b64_json === "string") {
    return stripDataUrlPrefix(result.data[0].b64_json);
  }

  if (Array.isArray(result?.images) && typeof result.images?.[0] === "string") {
    return stripDataUrlPrefix(result.images[0]);
  }

  if (Array.isArray(result?.data) && typeof result.data?.[0]?.image === "string") {
    return stripDataUrlPrefix(result.data[0].image);
  }

  if (Array.isArray(result?.data) && result.data?.[0]?.image instanceof ArrayBuffer) {
    return arrayBufferToBase64(result.data[0].image);
  }

  if (Array.isArray(result?.data) && result.data?.[0]?.image instanceof Uint8Array) {
    return arrayBufferToBase64(result.data[0].image.buffer);
  }

  throw new Error(`Unexpected Workers AI response format: ${JSON.stringify(result).slice(0, 500)}`);
}

function stripDataUrlPrefix(value) {
  return value.replace(/^data:image\/[^;]+;base64,/, "");
}

function isLikelyBase64(value) {
  return /^[A-Za-z0-9+/=\s]+$/.test(value) && value.length > 100;
}

/* ══════════════════════════════════════════════════════════════════════════
   /video — image-to-video для сцены на главной.
   Ася читает книгу и поднимает взгляд на вошедшего.

   Параметры:
     u      публичный https-адрес стартового кадра (по умолчанию фото с сайта)
     m      модель: vidu | wan | grok | runway      (по умолчанию vidu)
     p      промпт                                   (по умолчанию сценарий ниже)
     d      секунд, 2..15                            (по умолчанию 5)
     res    540p | 720p | 1080p                      (по умолчанию 720p)
     seed   зерно для повторяемости

   Модели сторонние, тарифицируются Cloudflare отдельно и в бесплатные
   нейроны Workers AI не входят. По цене снизу вверх: vidu → wan → grok → runway.
   ══════════════════════════════════════════════════════════════════════ */

const DEFAULT_VIDEO_IMAGE = "https://english-with-asya.com/img/asya-photo.jpg";

const DEFAULT_VIDEO_PROMPT =
  "The same woman in the navy blazer, in the exact same position against the same plain " +
  "crimson background. She is holding an open book, looking down at its pages and reading. " +
  "After about two seconds she lifts her head, looks straight into the camera and gives a warm, " +
  "welcoming smile, as if she just noticed someone walking in. Motion is subtle and natural: " +
  "head lift, eyes meeting the camera, gentle smile, quiet breathing. The camera is completely " +
  "static, no zoom, no pan. The background stays flat crimson and unchanged. Photorealistic, " +
  "same lighting and same face as in the source photo.";

/* У каждой модели свой формат входа — собран в одном месте. */
const VIDEO_MODELS = {
  vidu: {
    id: "vidu/q3-turbo",
    note: "самая дешёвая, для проверки композиции",
    build: (o) => ({ prompt: o.prompt, start_image: o.image, duration: o.duration, resolution: o.res }),
  },
  wan: {
    id: "alibaba/wan-2.7-i2v",
    note: "720P/1080P, умеет отключать водяной знак",
    build: (o) => Object.assign(
      { image: o.image, prompt: o.prompt, resolution: o.res === "1080p" ? "1080P" : "720P",
        duration: o.duration, watermark: false },
      o.seed === null ? {} : { seed: o.seed }
    ),
  },
  grok: {
    id: "xai/grok-imagine-video-1.5-preview",
    note: "быстрая, image передаётся объектом",
    build: (o) => ({ prompt: o.prompt, image: { url: o.image }, duration: o.duration }),
  },
  runway: {
    id: "runwayml/gen-4.5",
    note: "самая дорогая, вертикаль 720:1280",
    build: (o) => Object.assign(
      { prompt: o.prompt, image_input: o.image, ratio: "720:1280", duration: Math.min(o.duration, 10) },
      o.seed === null ? {} : { seed: o.seed }
    ),
  },
};

async function handleVideo(url, env, redirect) {
  const key = (url.searchParams.get("m") || "vidu").toLowerCase();
  const model = VIDEO_MODELS[key];
  if (!model) return json({ error: "unknown model", allowed: Object.keys(VIDEO_MODELS) }, 400);

  const image = url.searchParams.get("u") || DEFAULT_VIDEO_IMAGE;
  if (!/^https:\/\//i.test(image)) return json({ error: "u must be an https URL" }, 400);

  const rawSeed = url.searchParams.get("seed");
  const opts = {
    image,
    prompt: (url.searchParams.get("p") || DEFAULT_VIDEO_PROMPT).slice(0, 2000),
    duration: clampInt(url.searchParams.get("d"), 2, 15, 5),
    res: pickOpt(url.searchParams.get("res"), ["540p", "720p", "1080p"], "720p"),
    seed: rawSeed === null ? null : clampInt(rawSeed, 0, 2147483647, 0),
  };

  const started = Date.now();
  try {
    const result = await env.AI.run(model.id, model.build(opts));
    const video = extractVideoUrl(result);
    if (!video) {
      return json({ error: "model returned no video", model: model.id,
                    raw: JSON.stringify(result).slice(0, 600) }, 502);
    }
    if (redirect) {
      const r = Response.redirect(video, 302);
      const out = new Response(r.body, r);
      out.headers.set("Access-Control-Allow-Origin", "*");
      return out;
    }
    return json({ video, model: model.id, took_ms: Date.now() - started, params: opts });
  } catch (err) {
    return json({ error: "video generation failed", model: model.id,
                  details: (err && err.message ? err.message : String(err)).slice(0, 400) }, 500);
  }
}

/* Разные модели кладут ссылку в разные поля — проверяем известные варианты. */
function extractVideoUrl(r) {
  if (!r) return null;
  if (typeof r === "string" && /^https?:\/\//.test(r)) return r;
  const c = [r.video, r.result && r.result.video, r.output, r.url, r.data && r.data.video];
  for (const v of c) if (typeof v === "string" && /^https?:\/\//.test(v)) return v;
  return null;
}

function pickOpt(v, allowed, dflt) {
  return allowed.indexOf(String(v || "").toLowerCase()) >= 0 ? String(v).toLowerCase() : dflt;
}
