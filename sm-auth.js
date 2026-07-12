/* Super Minds 1 · аккаунты и прогресс
   ------------------------------------------------------------------
   ЧТОБЫ ВКЛЮЧИТЬ НАСТОЯЩИЕ АККАУНТЫ (синхронизация между устройствами,
   учитель видит прогресс) — впиши сюда два значения из проекта Supabase.
   Пока они пустые, сайт работает на localStorage: прогресс хранится
   в браузере ученика (без входа между устройствами). Инструкция —
   в файле SETUP-SUPABASE.md. */
const SM_SUPABASE_URL = "https://kdzpmbuohfjbtjpqrdfx.supabase.co";
const SM_SUPABASE_ANON_KEY = "sb_publishable_K8vhCVG_jiEyHYQOgp3XWQ_bWobdeBG"; // публичный ключ (безопасно хранить в коде)
/* ------------------------------------------------------------------ */

window.SM = (function () {
  const useCloud = !!(SM_SUPABASE_URL && SM_SUPABASE_ANON_KEY);
  let sb = null;

  function ensureClient() {
    if (sb || !useCloud) return sb;
    if (!window.supabase || !window.supabase.createClient) {
      console.warn("Supabase SDK не загружен");
      return null;
    }
    sb = window.supabase.createClient(SM_SUPABASE_URL, SM_SUPABASE_ANON_KEY);
    return sb;
  }

  /* ---------- ЛОКАЛЬНЫЙ режим (без Supabase) ---------- */
  const LKEY_USER = "sm-local-user";
  const LKEY_PROG = "sm-local-progress";

  function localUser() {
    try { return JSON.parse(localStorage.getItem(LKEY_USER) || "null"); }
    catch (e) { return null; }
  }
  function localSetUser(u) { localStorage.setItem(LKEY_USER, JSON.stringify(u)); }
  function localProgress() {
    try { return JSON.parse(localStorage.getItem(LKEY_PROG) || "{}"); }
    catch (e) { return {}; }
  }
  function localSetProgress(p) { localStorage.setItem(LKEY_PROG, JSON.stringify(p)); }

  /* ---------- Публичное API ---------- */

  const api = {
    isCloud: useCloud,

    /* Текущий пользователь: {id, name, email} или null */
    async getUser() {
      if (!useCloud) return localUser();
      const c = ensureClient(); if (!c) return null;
      const { data } = await c.auth.getUser();
      if (!data || !data.user) return null;
      const u = data.user;
      return { id: u.id, email: u.email, name: (u.user_metadata && u.user_metadata.name) || u.email };
    },

    async signUp(name, email, password) {
      if (!useCloud) {
        localSetUser({ id: "local", name: name || "Ученик", email: email || "" });
        return { ok: true };
      }
      const c = ensureClient(); if (!c) return { ok: false, error: "Supabase не настроен" };
      const { data, error } = await c.auth.signUp({
        email: email, password: password, options: { data: { name: name } }
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true, needConfirm: !data.session };
    },

    async signIn(email, password) {
      if (!useCloud) {
        const u = localUser() || { id: "local", name: "Ученик", email: email || "" };
        localSetUser(u); return { ok: true };
      }
      const c = ensureClient(); if (!c) return { ok: false, error: "Supabase не настроен" };
      const { error } = await c.auth.signInWithPassword({ email: email, password: password });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },

    async signOut() {
      if (!useCloud) { localStorage.removeItem(LKEY_USER); return; }
      const c = ensureClient(); if (c) await c.auth.signOut();
    },

    /* Прогресс: объект { wordId: {status:"learned"|"learning", correct, seen} } */
    async loadProgress() {
      if (!useCloud) return localProgress();
      const c = ensureClient(); if (!c) return {};
      const u = await this.getUser(); if (!u) return {};
      const { data, error } = await c.from("progress").select("data").eq("user_id", u.id).maybeSingle();
      if (error || !data) return {};
      return data.data || {};
    },

    async saveProgress(progress) {
      if (!useCloud) { localSetProgress(progress); return { ok: true }; }
      const c = ensureClient(); if (!c) return { ok: false };
      const u = await this.getUser(); if (!u) return { ok: false };
      const { error } = await c.from("progress").upsert(
        { user_id: u.id, data: progress, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      return { ok: !error, error: error && error.message };
    },

    /* ---------- Класс: учитель / ученики ---------- */
    async myProfile() {
      if (!useCloud) return null;
      const c = ensureClient(); if (!c) return null;
      const u = await this.getUser(); if (!u) return null;
      const { data } = await c.from("profiles").select("role,teacher_id,teacher_code,name").eq("user_id", u.id).maybeSingle();
      return data || null;
    },
    /* Учитель: гарантировать профиль и получить свой код */
    async ensureTeacherCode(name) {
      if (!useCloud) return { code: "LOCAL", error: null };
      const c = ensureClient(); if (!c) return { error: "no client" };
      const u = await this.getUser(); if (!u) return { error: "not signed in" };
      const prof = await this.myProfile();
      if (prof && prof.teacher_code) return { code: prof.teacher_code };
      for (let i = 0; i < 4; i++) {
        const code = Math.random().toString(36).slice(2, 8).toUpperCase();
        const { error } = await c.from("profiles").upsert(
          { user_id: u.id, name: name || u.name, role: "teacher", teacher_code: code },
          { onConflict: "user_id" }
        );
        if (!error) return { code: code };
        if (!(error.message || "").toLowerCase().includes("teacher_code")) return { error: error.message };
      }
      return { error: "не удалось создать код" };
    },
    /* Ученик: привязаться к учителю по коду */
    async joinTeacher(code) {
      if (!useCloud) return { ok: false, error: "нужен Supabase" };
      const c = ensureClient(); if (!c) return { ok: false, error: "no client" };
      const { error } = await c.rpc("join_teacher", { p_code: (code || "").trim() });
      return { ok: !error, error: error && error.message };
    },
    /* Учитель: список учеников с прогрессом */
    async myStudents() {
      if (!useCloud) return [];
      const c = ensureClient(); if (!c) return [];
      const { data, error } = await c.rpc("my_students");
      if (error) { console.warn("my_students:", error.message); return []; }
      return data || [];
    },

    /* Таблица лидеров: [{name, week_points, total_points}] (только облако) */
    async leaderboard() {
      if (!useCloud) return [];
      const c = ensureClient(); if (!c) return [];
      const { data, error } = await c.from("leaderboard")
        .select("name,week_points,total_points")
        .order("week_points", { ascending: false })
        .limit(10);
      if (error) { console.warn("leaderboard:", error.message); return []; }
      return data || [];
    }
  };

  return api;
})();
