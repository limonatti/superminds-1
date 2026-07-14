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

    /* ---------- Конструктор упражнений ---------- */
    async saveExercise(ex) {
      if (!useCloud) return { ok: false, error: "нужен Supabase" };
      const c = ensureClient(); if (!c) return { ok: false };
      const u = await this.getUser(); if (!u) return { ok: false, error: "not signed in" };
      const row = { author_id: u.id, course: ex.course, unit_id: ex.unit_id, type: ex.type, title: ex.title || null, section: ex.section || null, data: ex.data || {} };
      if (ex.id) {
        const { data, error } = await c.from("exercises").update(row).eq("id", ex.id).select("id");
        if (error) return { ok: false, error: error.message };
        if (!data || !data.length) return { ok: false, error: "Изменение не применилось: нет прав или упражнение не найдено. Выйди и войди заново." };
        return { ok: true };
      }
      row.position = Math.floor(Date.now() / 1000); // новые — в конец урока
      const { data, error } = await c.from("exercises").insert(row).select("id").single();
      return { ok: !error, id: data && data.id, error: error && error.message };
    },
    async myExercises(course) {
      if (!useCloud) return [];
      const c = ensureClient(); if (!c) return [];
      const u = await this.getUser(); if (!u) return [];
      let q = c.from("exercises").select("id,course,unit_id,type,title,section,position,data,created_at").eq("author_id", u.id).order("created_at", { ascending: false });
      if (course) q = q.eq("course", course);
      const { data } = await q; return data || [];
    },
    async exercisesFor(course, unit) {
      if (!useCloud) return [];
      const c = ensureClient(); if (!c) return [];
      const { data, error } = await c.from("exercises").select("id,type,title,section,position,data,created_at").eq("course", course).eq("unit_id", unit).order("position", { ascending: true }).order("created_at", { ascending: true });
      if (error) { console.warn("exercisesFor:", error.message); return []; }
      return data || [];
    },
    /* Сохранить порядок упражнений в уроке: [{id, position}, …] */
    async setPositions(list) {
      if (!useCloud) return { ok: false };
      const c = ensureClient(); if (!c) return { ok: false };
      for (const it of list) {
        const { error } = await c.from("exercises").update({ position: it.position }).eq("id", it.id);
        if (error) return { ok: false, error: error.message };
      }
      return { ok: true };
    },
    async deleteExercise(id) {
      if (!useCloud) return { ok: false };
      const c = ensureClient(); if (!c) return { ok: false };
      const { error } = await c.from("exercises").delete().eq("id", id);
      return { ok: !error, error: error && error.message };
    },

    /* ---------- Домашки ---------- */
    async assignTo(studentId, unitId, kind) {
      if (!useCloud) return { ok: false, error: "нужен Supabase" };
      const c = ensureClient(); if (!c) return { ok: false };
      const u = await this.getUser(); if (!u) return { ok: false, error: "not signed in" };
      const { error } = await c.from("assignments").insert({ teacher_id: u.id, student_id: studentId, unit_id: unitId, kind: kind });
      return { ok: !error, error: error && error.message };
    },
    async classAssignments() {
      if (!useCloud) return [];
      const c = ensureClient(); if (!c) return [];
      const { data, error } = await c.rpc("class_assignments");
      if (error) { console.warn("class_assignments:", error.message); return []; }
      return data || [];
    },
    async deleteAssignment(id) {
      if (!useCloud) return { ok: false };
      const c = ensureClient(); if (!c) return { ok: false };
      const { error } = await c.from("assignments").delete().eq("id", id);
      return { ok: !error, error: error && error.message };
    },
    async myAssignments() {
      if (!useCloud) return [];
      const c = ensureClient(); if (!c) return [];
      const u = await this.getUser(); if (!u) return [];
      const { data } = await c.from("assignments").select("id,unit_id,kind,done,created_at").eq("student_id", u.id).order("created_at", { ascending: false });
      return data || [];
    },
    async markAssignment(id, done) {
      if (!useCloud) return { ok: false };
      const c = ensureClient(); if (!c) return { ok: false };
      const { error } = await c.rpc("mark_assignment_done", { p_id: id, p_done: done });
      return { ok: !error, error: error && error.message };
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

/* Превратить ссылку внешней платформы в адрес для встраивания (iframe).
   Поддержка: YouTube, Vimeo, Wordwall, LearningApps, LiveWorksheets, Quizlet,
   Genially, Miro, Google Drive/Docs. Прочие ссылки — как есть. */
window.SM_embed = function (url) {
  url = (url || "").trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  var m;
  if ((m = url.match(/(?:youtube\.com\/(?:watch\?[^#]*v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/i)))
    return { src: "https://www.youtube-nocookie.com/embed/" + m[1], ratio: 56.25, name: "YouTube" };
  if ((m = url.match(/vimeo\.com\/(\d+)/i)))
    return { src: "https://player.vimeo.com/video/" + m[1], ratio: 56.25, name: "Vimeo" };
  if ((m = url.match(/wordwall\.net\/(?:[a-z]{2,3}\/)?(?:resource|play|embed)\/(\d+)/i)))
    return { src: "https://wordwall.net/embed/" + m[1], h: 500, name: "Wordwall" };
  if ((m = url.match(/learningapps\.org\/(?:watch\?v=|display\?v=|view)(\w+)/i)))
    return { src: "https://learningapps.org/watch?v=" + m[1], h: 540, name: "LearningApps" };
  if ((m = url.match(/learningapps\.org\/(\d+)/i)))
    return { src: "https://learningapps.org/watch?app=" + m[1], h: 540, name: "LearningApps" };
  if (/liveworksheets\.com/i.test(url))
    return { src: url, h: 900, name: "LiveWorksheets" };
  if ((m = url.match(/quizlet\.com\/(\d+)/i)))
    return { src: "https://quizlet.com/" + m[1] + "/flashcards/embed?x=1jj1", h: 500, name: "Quizlet" };
  if ((m = url.match(/view\.geniall?y?\.?(?:ly|com)?\/(\w+)/i)))
    return { src: url, h: 620, name: "Genially" };
  if ((m = url.match(/miro\.com\/app\/board\/([\w=~-]+)\//i)))
    return { src: "https://miro.com/app/live-embed/" + m[1] + "/", h: 620, name: "Miro" };
  if ((m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/i)))
    return { src: "https://drive.google.com/file/d/" + m[1] + "/preview", h: 620, name: "Google Drive" };
  if (/docs\.google\.com/i.test(url))
    return { src: url.replace(/\/edit[^\/]*$/, "/preview"), h: 620, name: "Google Docs" };
  return { src: url, h: 620, name: "сайт" };
};
