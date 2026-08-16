/**
 * Cloudflare Worker "statue" — боевой код, снятый с задеплоенной версии
 * плюс новый маршрут /video (image-to-video).
 *
 * Это тот файл, который надо деплоить в воркер `statue`.
 * worker-img-gen-statue.js — исходник ДРУГОГО воркера (`img-gen`), не путать.
 *
 * Привязки: AI (Workers AI), REFS (KV для референсов), IMAGES (необязательно).
 *
 * Маршруты:
 *   GET  /health
 *   POST /put?k=name            — положить картинку-референс в KV
 *   GET  /f/<name>              — отдать её публично
 *   GET  /statue?u=...&u2=...   — картинка по двум референсам (FLUX.2 klein)
 *   GET  /video?...             — НОВОЕ: оживить кадр, вернуть JSON со ссылкой
 *   GET  /video.mp4?...         — то же, но редиректом на файл
 */

const DEFAULT_PROMPT = "Take the exact face of the woman in image 1 and give it to the marble statue in image 0. Keep image 0 completely unchanged otherwise: same seated pose, same sculpted hair bun, same draped marble robe, same laptop, same office chair, same lighting, same plain background. The face must be carved from the same grey marble as the rest of the statue, with stone texture and blank sculpted eyes, but the facial features, proportions and likeness must clearly be those of the woman in image 1. Photorealistic sculpture, high detail, no text, no watermark";

/* ---------- /video ---------------------------------------------------------
   Сценарий: Ася читает книгу и поднимает взгляд на вошедшего.

   Параметры: u (кадр: https или kv:имя), m (модель), p (промпт),
              d (секунды 2..15), res (540p|720p|1080p), seed.

   Модели сторонние, тарифицируются Cloudflare отдельно и в бесплатные
   нейроны Workers AI не входят. По цене снизу вверх: vidu → wan → grok → runway.
   -------------------------------------------------------------------------- */

const DEFAULT_VIDEO_IMAGE = "https://english-with-asya.com/img/asya-photo.jpg";

const DEFAULT_VIDEO_PROMPT =
  "The same woman in the navy blazer, in the exact same position against the same plain " +
  "crimson background. She is holding an open book, looking down at its pages and reading. " +
  "After about two seconds she lifts her head, looks straight into the camera and gives a warm, " +
  "welcoming smile, as if she just noticed someone walking in. Motion is subtle and natural: " +
  "head lift, eyes meeting the camera, gentle smile, quiet breathing. The camera is completely " +
  "static, no zoom, no pan. The background stays flat crimson and unchanged. Photorealistic, " +
  "same lighting and same face as in the source photo.";

const VIDEO_MODELS = {
  vidu: {
    id: "vidu/q3-turbo",
    note: "самая дешёвая, для проверки композиции",
    build: (o) => ({ prompt: o.prompt, start_image: o.image, duration: o.duration, resolution: o.res }),
  },
  wan: {
    id: "alibaba/wan-2.7-i2v",
    note: "720P/1080P, водяной знак выключается",
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

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: { "content-type": "application/json", "access-control-allow-origin": "*" } });
}

function b64ToBytes(b64) {
  const clean = b64.replace(/^data:image\/[^;]+;base64,/, "");
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function toBytes(result) {
  if (result instanceof ReadableStream) return new Uint8Array(await new Response(result).arrayBuffer());
  if (result instanceof ArrayBuffer) return new Uint8Array(result);
  if (result instanceof Uint8Array) return result;
  if (result && typeof result.image === "string") return b64ToBytes(result.image);
  if (result && result.image instanceof ArrayBuffer) return new Uint8Array(result.image);
  if (typeof result === "string") return b64ToBytes(result);
  throw new Error("unexpected model output");
}

async function grab(env, src, box) {
  let blob;
  if (src.indexOf("kv:") === 0) {
    const k = src.slice(3).replace(/[^a-z0-9_-]/gi, "");
    const got = await env.REFS.getWithMetadata("img:" + k, { type: "arrayBuffer" });
    if (!got || !got.value) throw new Error("kv key not found: " + k);
    blob = new Blob([got.value], { type: (got.metadata && got.metadata.ct) || "image/jpeg" });
  } else {
    const up = await fetch(src);
    if (!up.ok) throw new Error("reference fetch failed, status " + up.status);
    blob = await up.blob();
  }
  if (env.IMAGES) {
    try {
      const out = await env.IMAGES.input(blob.stream()).transform({ width: box, height: box, fit: "scale-down" }).output({ format: "image/jpeg", quality: 90 });
      blob = await new Response(out.image()).blob();
    } catch (e) { }
  }
  return blob;
}

/* Видеомодели принимают только публичный адрес. Ссылку вида kv:имя
   разворачиваем в /f/имя — этот маршрут уже отдаёт файл наружу. */
function publicUrl(origin, src) {
  if (!src) return DEFAULT_VIDEO_IMAGE;
  if (src.indexOf("kv:") === 0) {
    return origin + "/f/" + src.slice(3).replace(/[^a-z0-9_-]/gi, "");
  }
  return src;
}

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

function clampInt(raw, min, max, fallback) {
  const n = parseInt(raw);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

async function handleVideo(url, env, redirect) {
  const key = (url.searchParams.get("m") || "vidu").toLowerCase();
  const model = VIDEO_MODELS[key];
  if (!model) return json({ error: "unknown model", allowed: Object.keys(VIDEO_MODELS) }, 400);

  const image = publicUrl(url.origin, url.searchParams.get("u"));
  if (!/^https:\/\//i.test(image)) return json({ error: "u must be an https url or kv:name" }, 400);

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
      return json({ error: "model returned no video", model: model.id, raw: JSON.stringify(result).slice(0, 600) }, 502);
    }
    if (redirect) {
      return new Response(null, { status: 302, headers: { location: video, "access-control-allow-origin": "*" } });
    }
    return json({ video, model: model.id, took_ms: Date.now() - started, params: opts });
  } catch (err) {
    return json({ error: "video generation failed", model: model.id, details: String((err && err.message) || err).slice(0, 400) }, 500);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type" } });
    }
    if (url.pathname === "/health") {
      return json({ status: "ok", images: !!env.IMAGES, ai: !!env.AI, refs: !!env.REFS,
                    video_models: Object.fromEntries(Object.entries(VIDEO_MODELS).map(([k, v]) => [k, v.id])) });
    }
    if (url.pathname === "/put" && request.method === "POST") {
      const k = (url.searchParams.get("k") || "").replace(/[^a-z0-9_-]/gi, "");
      if (!k) return json({ error: "k required" }, 400);
      const body = await request.arrayBuffer();
      if (!body.byteLength) return json({ error: "empty body" }, 400);
      await env.REFS.put("img:" + k, body, { metadata: { ct: request.headers.get("content-type") || "image/jpeg" }, expirationTtl: 2592000 });
      return json({ key: k, size: body.byteLength, ref: "kv:" + k });
    }
    if (url.pathname.indexOf("/f/") === 0) {
      const k = url.pathname.slice(3).replace(/[^a-z0-9_-]/gi, "");
      const got = await env.REFS.getWithMetadata("img:" + k, { type: "arrayBuffer" });
      if (!got || !got.value) return json({ error: "not found" }, 404);
      const ct = (got.metadata && got.metadata.ct) || "image/jpeg";
      return new Response(got.value, { headers: { "content-type": ct, "cache-control": "public, max-age=3600", "access-control-allow-origin": "*" } });
    }

    /* НОВОЕ: оживление кадра */
    if ((url.pathname === "/video" || url.pathname === "/video.mp4") && request.method === "GET") {
      return handleVideo(url, env, url.pathname.endsWith(".mp4"));
    }

    if (url.pathname !== "/statue") {
      return json({ error: "not found", hint: "POST /put?k=name, GET /statue?u=kv:name&u2=<url or kv:name>&seed=n, GET /video?m=vidu&d=3" }, 404);
    }

    const src = url.searchParams.get("u");
    const src2 = url.searchParams.get("u2");
    if (!src) return json({ error: "u required (https url or kv:key)" }, 400);
    const prompt = (url.searchParams.get("p") || DEFAULT_PROMPT).slice(0, 1500);
    const width = Math.min(Math.max(parseInt(url.searchParams.get("w")) || 768, 256), 1920);
    const height = Math.min(Math.max(parseInt(url.searchParams.get("h")) || 1152, 256), 1920);
    const seed = parseInt(url.searchParams.get("seed")) || 0;

    const cache = caches.default;
    const key = url.origin + "/c?u=" + encodeURIComponent(src) + "&u2=" + encodeURIComponent(src2 || "") + "&p=" + encodeURIComponent(prompt) + "&w=" + width + "&h=" + height + "&seed=" + seed;

    try {
      const hit = await cache.match(new Request(key));
      if (hit) return new Response(await hit.arrayBuffer(), { headers: { "content-type": "image/jpeg", "access-control-allow-origin": "*" } });

      const form = new FormData();
      form.append("prompt", prompt);
      form.append("width", String(width));
      form.append("height", String(height));
      if (seed) form.append("seed", String(seed));
      form.append("input_image_0", await grab(env, src, 480), "scene.jpg");
      if (src2) form.append("input_image_1", await grab(env, src2, 480), "face.jpg");

      const fr = new Response(form);
      const result = await env.AI.run("@cf/black-forest-labs/flux-2-klein-9b", { multipart: { body: fr.body, contentType: fr.headers.get("content-type") } });
      const bytes = await toBytes(result);

      if (seed) ctx.waitUntil(cache.put(new Request(key), new Response(bytes, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=86400" } })));
      return new Response(bytes, { headers: { "content-type": "image/jpeg", "access-control-allow-origin": "*" } });
    } catch (err) {
      return json({ error: "generation failed", details: String((err && err.message) || err).slice(0, 400) }, 500);
    }
  }
};
