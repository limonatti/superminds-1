// Edge Function: ai-assist
// Посредник между сайтом и Claude API. Ключ живёт только здесь, в коде сайта его нет.
// Вызывать может только залогиненный учитель — чтобы никто не тратил баланс.

// .trim() убирает случайные пробелы/переносы строки, попавшие при вставке ключа
const ANTHROPIC_KEY = (Deno.env.get("ANTHROPIC_API_KEY") || "").trim();
const OPENAI_KEY = (Deno.env.get("OPENAI_API_KEY") || "").trim();
// URL и публичный ключ — не секреты, можно держать в коде (fallback на случай,
// если окружение не отдаёт стандартные переменные).
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://kdzpmbuohfjbtjpqrdfx.supabase.co";
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY") || "sb_publishable_K8vhCVG_jiEyHYQOgp3XWQ_bWobdeBG";

const MODEL_SMART = "claude-sonnet-5";
const MODEL_FAST = "claude-haiku-4-5-20251001";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

const SYSTEM =
  "Ты помогаешь русскоязычному преподавателю английского языка готовить материалы " +
  "для детей 6–10 лет (уровень Super Minds / Pre-A1–A1). " +
  "Пиши простым языком, только знакомую детям лексику, короткие предложения. " +
  "Отвечай ВСЕГДА строго валидным JSON без пояснений, без markdown, без ``` — только JSON.";

type Task = { model: string; max: number; prompt: (p: any) => string };

const TASKS: Record<string, Task> = {
  // 3 правдоподобных неправильных варианта к слову
  distractors: {
    model: MODEL_FAST,
    max: 400,
    prompt: (p) =>
      `Слово: "${p.en}" (перевод: "${p.ru}").\n` +
      `Другие слова урока: ${(p.pool || []).join(", ")}.\n` +
      `Придумай 3 неправильных варианта ответа для задания «выбери перевод». ` +
      `Они должны быть правдоподобными, но однозначно неверными, из той же тематики и того же уровня.\n` +
      `Формат: {"wrong":["…","…","…"]}`,
  },

  // слова по теме урока (для «собрать урок»)
  topic_words: {
    model: MODEL_SMART,
    max: 1200,
    prompt: (p) =>
      `Тема урока: "${p.topic}". Уровень: дети 6–10 лет, Pre-A1/A1.\n` +
      `Подбери ${p.count || 10} самых нужных английских слов по теме. ` +
      `Только знакомая детям лексика, существительные и простые глаголы/прилагательные.\n` +
      `Придумай короткое название юнита и эмодзи.\n` +
      `Формат: {"title":"At the zoo","emoji":"🦁","words":[{"en":"lion","ru":"лев","emoji":"🦁"}]}`,
  },

  // перевод списка слов
  translate: {
    model: MODEL_FAST,
    max: 1000,
    prompt: (p) =>
      `Переведи английские слова на русский для детского учебника. ` +
      `Один перевод на слово, самый частотный и понятный ребёнку, без вариантов через запятую.\n` +
      `Слова: ${(p.words || []).join(", ")}\n` +
      `Формат: {"items":[{"en":"cat","ru":"кошка","emoji":"🐱"}]}. ` +
      `Эмодзи подбери подходящее, если не подходит ни одно — поставь "⭐".`,
  },

  // примеры предложений с лексикой юнита
  sentences: {
    model: MODEL_FAST,
    max: 900,
    prompt: (p) =>
      `Слова урока: ${(p.words || []).join(", ")}.\n` +
      `Составь по одному короткому предложению (4–7 слов) на каждое слово. ` +
      `Present Simple или Present Continuous, лексика только знакомая детям.\n` +
      `Формат: {"items":[{"en":"The cat is black.","ru":"Кошка чёрная."}]}`,
  },

  // готовые задания под конкретный тип упражнения
  exercise: {
    model: MODEL_SMART,
    max: 2000,
    prompt: (p) => {
      const words = (p.words || []).join(", ");
      const n = p.count || 5;
      const shapes: Record<string, string> = {
        choice:
          `{"items":[{"q":"вопрос","opts":["a","b","c"],"correct":0}]}`,
        gap:
          `{"items":[{"q":"The cat ___ black.","answer":"is"}]}`,
        tf:
          `{"items":[{"q":"утверждение","answer":true}]}`,
        order:
          `{"items":[{"answer":"The cat is black"}]}`,
        match:
          `{"pairs":[{"l":"cat","r":"кошка"}]}`,
      };
      const shape = shapes[p.type] || shapes.choice;
      return (
        `Слова урока: ${words}.\n` +
        `Тема урока: ${p.title || "—"}.\n` +
        `Составь ${n} заданий типа "${p.type}" на основе этих слов.\n` +
        `Формат ответа: ${shape}`
      );
    },
  },

  // связный план урока
  lesson: {
    model: MODEL_SMART,
    max: 2500,
    prompt: (p) =>
      `Тема урока: "${p.title}". Слова: ${(p.words || []).join(", ")}.\n` +
      `Предложи план урока на 45 минут для группы детей 6–10 лет: ` +
      `разминка, подача новой лексики, отработка, игра, закрепление, домашнее задание. ` +
      `Коротко и по делу, без воды.\n` +
      `Формат: {"steps":[{"name":"Разминка","minutes":5,"what":"что делает учитель","why":"зачем"}],"homework":"…"}`,
  },
};

Deno.serve(async (req) => {
  try {
    return await handle(req);
  } catch (e) {
    // что бы ни случилось — отвечаем с CORS, иначе браузер видит «Failed to fetch»
    return json({ error: "Внутренняя ошибка: " + (e?.message || String(e)) }, 500);
  }
});

async function handle(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!ANTHROPIC_KEY) return json({ error: "ANTHROPIC_API_KEY не задан в Secrets" }, 500);

  // --- кто зовёт ---
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return json({ error: "Нужно войти в кабинет учителя" }, 401);

  const who = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: auth, apikey: SUPABASE_ANON! },
  });
  if (!who.ok) return json({ error: "Сессия истекла — войди заново" }, 401);
  const user = await who.json();

  // --- только учитель ---
  const prof = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${user.id}&select=role`,
    { headers: { Authorization: auth, apikey: SUPABASE_ANON! } },
  );
  const rows = prof.ok ? await prof.json() : [];
  if (!rows.length || rows[0].role !== "teacher") {
    return json({ error: "Ассистент доступен только учителю" }, 403);
  }

  // --- задача ---
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Плохой запрос" }, 400); }

  // --- генерация картинки (OpenAI) ---
  if (body.task === "image") {
    if (!OPENAI_KEY) return json({ error: "OPENAI_API_KEY не задан в Secrets" }, 500);
    const p = body.payload || {};
    const word = (p.en || "").toString().slice(0, 60);
    const ru = (p.ru || "").toString().slice(0, 60);
    if (!word) return json({ error: "нет слова для картинки" }, 400);
    const prompt =
      "A simple, friendly, colorful flat vector illustration of \"" + word + "\"" +
      (ru ? " (" + ru + ")" : "") +
      " for a children's English flashcard. Single clear object, centered, plain white background, " +
      "no text, no letters, soft rounded shapes, bright cheerful colors, suitable for kids aged 6-10.";
    const ir = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": "Bearer " + OPENAI_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-1", prompt: prompt, size: "1024x1024", quality: "low", n: 1 }),
    });
    if (!ir.ok) {
      const t = await ir.text();
      if (ir.status === 401) return json({ error: "OpenAI: ключ неверный или отозван" }, 502);
      if (ir.status === 429 || t.includes("billing") || t.includes("quota")) return json({ error: "OpenAI: закончились средства или лимит" }, 402);
      return json({ error: "OpenAI ответил ошибкой (" + ir.status + ")" }, 502);
    }
    const idata = await ir.json();
    const b64 = idata.data && idata.data[0] && idata.data[0].b64_json;
    if (!b64) return json({ error: "OpenAI не вернул картинку" }, 502);
    return json({ ok: true, image: "data:image/png;base64," + b64 });
  }

  const task = TASKS[body.task];
  if (!task) return json({ error: "Неизвестная задача: " + body.task }, 400);

  // --- Claude ---
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: task.model,
      max_tokens: task.max,
      system: SYSTEM,
      messages: [{ role: "user", content: task.prompt(body.payload || {}) }],
    }),
  });

  if (!r.ok) {
    const t = await r.text();
    if (r.status === 400 && t.includes("credit")) {
      return json({ error: "Закончились кредиты Claude — пополни баланс" }, 402);
    }
    return json({ error: "Claude ответил ошибкой (" + r.status + ")" }, 502);
  }

  const data = await r.json();
  const text = (data.content || []).map((c: any) => c.text || "").join("").trim();

  // модель иногда оборачивает JSON в ```
  const clean = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  let parsed: any = null;
  try { parsed = JSON.parse(clean); } catch { /* вернём как есть */ }

  return json({
    ok: true,
    data: parsed,
    raw: parsed ? undefined : clean,
    usage: data.usage,
  });
}
