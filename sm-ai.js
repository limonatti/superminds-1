/* sm-ai.js — тонкий клиент к ассистенту (Edge Function ai-assist).
   Ключ Claude живёт на сервере, здесь его нет. Доступно только учителю. */
window.SM_AI = (function () {
  const URL = "https://kdzpmbuohfjbtjpqrdfx.supabase.co/functions/v1/ai-assist";
  const ANON = "sb_publishable_K8vhCVG_jiEyHYQOgp3XWQ_bWobdeBG";

  function token() {
    try { return JSON.parse(localStorage.getItem("sb-kdzpmbuohfjbtjpqrdfx-auth-token")).access_token; }
    catch (e) { return null; }
  }

  async function call(task, payload) {
    const t = token();
    if (!t) return { ok: false, error: "Войди в кабинет учителя" };
    let r;
    try {
      r = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + t, "apikey": ANON },
        body: JSON.stringify({ task, payload }),
      });
    } catch (e) { return { ok: false, error: "Нет связи с ассистентом" }; }
    let j; try { j = await r.json(); } catch (e) { return { ok: false, error: "Пустой ответ сервера" }; }
    if (!r.ok || j.error) return { ok: false, error: j.error || ("Ошибка " + r.status) };
    return { ok: true, data: j.data, raw: j.raw };
  }

  return { call };
})();
