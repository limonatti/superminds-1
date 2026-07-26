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
let nm = (u.user_metadata && u.user_metadata.name) || "";
if (!nm) {
try { const r = await c.from("profiles").select("name").eq("user_id", u.id).maybeSingle();
if (r && r.data && r.data.name) nm = r.data.name; } catch (e) {}
}
if (!nm) nm = u.email || "";
if (nm.indexOf("@") > 0) nm = nm.split("@")[0];   /* имя, а не почта */
if (!nm) nm = "Ученик";
return { id: u.id, email: u.email, name: nm };
},

/* Сменить отображаемое имя (метаданные + профиль) */
async setName(name) {
name = (name || "").trim();
if (!name) return { ok: false, error: "Впиши имя" };
if (!useCloud) { const lu = localUser() || { id: "local", email: "" }; lu.name = name; localSetUser(lu); return { ok: true }; }
const c = ensureClient(); if (!c) return { ok: false, error: "Нет подключения" };
const { error } = await c.auth.updateUser({ data: { name: name } });
if (error) return { ok: false, error: error.message };
const { data } = await c.auth.getUser();
const u = data && data.user;
if (u) { try { await c.from("profiles").upsert({ user_id: u.id, name: name }, { onConflict: "user_id" }); } catch (e) {} }
return { ok: true };
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

/* ---------- Умное повторение (ящики Лейтнера) ---------- */
srsQ: [],
srsQueue(wordId, ok) { this.srsQ.push({ id: wordId, ok: !!ok }); if (this.srsQ.length >= 12) this.srsFlush(); },
async srsFlush() {
if (!this.srsQ.length) return { ok: true };
const q = this.srsQ.splice(0, this.srsQ.length);
const p = await this.loadProgress();
const days = [0, 1, 2, 4, 7, 15];
q.forEach(it => {
const e = p[it.id] || { level: 0, correct: 0, seen: 0, status: "learning" };
e.seen = (e.seen || 0) + 1; if (it.ok) e.correct = (e.correct || 0) + 1;
e.b = it.ok ? Math.min((e.b || 0) + 1, 5) : 0;
e.due = Date.now() + days[e.b] * 864e5;
if (!it.ok) e.status = "learning";
p[it.id] = e;
});
return this.saveProgress(p);
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

/* ---------- Конструктор учебников (книги и юниты) ---------- */
async myCourses() {
if (!useCloud) return [];
const c = ensureClient(); if (!c) return [];
const u = await this.getUser(); if (!u) return [];
const { data } = await c.from("courses").select("id,slug,title,subtitle,emoji,color,img,created_at").eq("owner_id", u.id).order("created_at", { ascending: true });
return data || [];
},
async saveCourse(cr) {
if (!useCloud) return { ok: false, error: "нужен Supabase" };
const c = ensureClient(); if (!c) return { ok: false };
const u = await this.getUser(); if (!u) return { ok: false, error: "not signed in" };
const row = { owner_id: u.id, title: cr.title, subtitle: cr.subtitle || null, emoji: cr.emoji || "📘", color: cr.color || "#e4ebf2", img: cr.img || null };
if (cr.id) {
const { data, error } = await c.from("courses").update(row).eq("id", cr.id).select("id,slug");
if (error) return { ok: false, error: error.message };
if (!data || !data.length) return { ok: false, error: "Нет прав на изменение" };
return { ok: true, slug: data[0].slug };
}
row.slug = "c" + Math.random().toString(36).slice(2, 8);
const { data, error } = await c.from("courses").insert(row).select("id,slug").single();
return { ok: !error, id: data && data.id, slug: data && data.slug, error: error && error.message };
},
async deleteCourse(id, slug) {
if (!useCloud) return { ok: false };
const c = ensureClient(); if (!c) return { ok: false };
await c.from("units").delete().eq("course_slug", slug);
await c.from("exercises").delete().eq("course", slug);
const { error } = await c.from("courses").delete().eq("id", id);
return { ok: !error, error: error && error.message };
},
async myUnits(courseSlug) {
if (!useCloud) return [];
const c = ensureClient(); if (!c) return [];
const u = await this.getUser(); if (!u) return [];
const { data } = await c.from("units").select("id,course_slug,slug,unit_label,title,emoji,color,position,words,created_at").eq("owner_id", u.id).eq("course_slug", courseSlug).order("position", { ascending: true }).order("created_at", { ascending: true });
return data || [];
},
async saveUnit(un) {
if (!useCloud) return { ok: false, error: "нужен Supabase" };
const c = ensureClient(); if (!c) return { ok: false };
const u = await this.getUser(); if (!u) return { ok: false, error: "not signed in" };
const row = { owner_id: u.id, course_slug: un.course_slug, unit_label: un.unit_label || null, title: un.title, emoji: un.emoji || "📖", color: un.color || "#f6e2cf", words: un.words || [] };
if (un.id) {
const { data, error } = await c.from("units").update(row).eq("id", un.id).select("id");
if (error) return { ok: false, error: error.message };
if (!data || !data.length) return { ok: false, error: "Нет прав на изменение" };
return { ok: true };
}
row.slug = "u" + Date.now().toString(36);
row.position = Math.floor(Date.now() / 1000);
const { data, error } = await c.from("units").insert(row).select("id").single();
return { ok: !error, id: data && data.id, error: error && error.message };
},
async deleteUnit(id) {
if (!useCloud) return { ok: false };
const c = ensureClient(); if (!c) return { ok: false };
const { error } = await c.from("units").delete().eq("id", id);
return { ok: !error, error: error && error.message };
},
async setUnitPositions(list) {
if (!useCloud) return { ok: false };
const c = ensureClient(); if (!c) return { ok: false };
for (const it of list) {
const { error } = await c.from("units").update({ position: it.position }).eq("id", it.id);
if (error) return { ok: false, error: error.message };
}
return { ok: true };
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

/* ---------- Результаты упражнений (attempts) ---------- */
async saveAttempt(a) {
if (!useCloud) return { ok: false };
const c = ensureClient(); if (!c) return { ok: false };
const u = await this.getUser(); if (!u) return { ok: false };
const row = { student_id: u.id, course: a.course || null, unit_id: a.unit_id || null, exercise_id: a.exercise_id || null, ex_type: a.ex_type || null, correct: !!a.correct };
const { error } = await c.from("attempts").insert(row);
return { ok: !error, error: error && error.message };
},
async myAttempts() {
if (!useCloud) return [];
const c = ensureClient(); if (!c) return [];
const u = await this.getUser(); if (!u) return [];
const { data } = await c.from("attempts").select("unit_id,ex_type,correct,created_at").eq("student_id", u.id).order("created_at", { ascending: false }).limit(500);
return data || [];
},
async classProgress() {
if (!useCloud) return [];
const c = ensureClient(); if (!c) return [];
const { data, error } = await c.rpc("class_progress");
if (error) { console.warn("class_progress:", error.message); return []; }
return data || [];
},

/* Загрузить картинку (data-URL) в хранилище, вернуть публичную ссылку.
   Так картинки не раздувают базу. При ошибке вызывающий оставляет data-URL. */
async uploadImage(dataUrl) {
if (!useCloud) return { ok: false };
const c = ensureClient(); if (!c) return { ok: false };
const u = await this.getUser(); if (!u) return { ok: false };
try {
const resp = await fetch(dataUrl); const blob = await resp.blob();
const ext = (blob.type.indexOf("png") >= 0) ? "png" : "jpg";
const path = u.id + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) + "." + ext;
const { error } = await c.storage.from("word-images").upload(path, blob, { contentType: blob.type || "image/jpeg", upsert: false });
if (error) return { ok: false, error: error.message };
const { data } = c.storage.from("word-images").getPublicUrl(path);
return { ok: true, url: data && data.publicUrl };
} catch (e) { return { ok: false, error: String(e) }; }
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
},
	/* ========== ПЛАТФОРМА MVP: курсы Speakout, ДЗ по юнитам, материалы, детальный прогресс ========== */
	/* Учитель: назначить ученику курс (один активный) */
	async enrolCourse(studentId, course) {
		if (!useCloud) return { ok: false, error: "нужен Supabase" };
		const c = ensureClient(); if (!c) return { ok: false };
		const u = await this.getUser(); if (!u) return { ok: false, error: "not signed in" };
		const { error } = await c.from("enrolments").upsert(
			{ teacher_id: u.id, student_id: studentId, course: course }, { onConflict: "student_id" });
		return { ok: !error, error: error && error.message };
	},
	/* Ученик: свой назначенный курс */
	async myCourse() {
		if (!useCloud) return null;
		const c = ensureClient(); if (!c) return null;
		const u = await this.getUser(); if (!u) return null;
		const { data } = await c.from("enrolments").select("course").eq("student_id", u.id).maybeSingle();
		return data ? data.course : null;
	},
	/* Учитель: курс конкретного ученика */
	async studentCourse(studentId) {
		if (!useCloud) return null;
		const c = ensureClient(); if (!c) return null;
		const { data } = await c.from("enrolments").select("course").eq("student_id", studentId).maybeSingle();
		return data ? data.course : null;
	},
	/* Учитель: выдать ДЗ по юниту Speakout */
	async addHW(studentId, course, unit, note) {
		if (!useCloud) return { ok: false, error: "нужен Supabase" };
		const c = ensureClient(); if (!c) return { ok: false };
		const u = await this.getUser(); if (!u) return { ok: false, error: "not signed in" };
		const { error } = await c.from("hw").insert(
			{ teacher_id: u.id, student_id: studentId, course: course, unit: unit, note: note || null });
		return { ok: !error, error: error && error.message };
	},
	async listHW(studentId) { /* учитель */
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const { data } = await c.from("hw").select("id,course,unit,note,done,created_at").eq("student_id", studentId).order("created_at", { ascending: false });
		return data || [];
	},
	async myHW() { /* ученик */
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const u = await this.getUser(); if (!u) return [];
		const { data } = await c.from("hw").select("id,course,unit,note,done,created_at").eq("student_id", u.id).order("created_at", { ascending: false });
		return data || [];
	},
	async setHWDone(id, done) {
		if (!useCloud) return { ok: false };
		const c = ensureClient(); if (!c) return { ok: false };
		const { error } = await c.from("hw").update({ done: !!done }).eq("id", id);
		return { ok: !error, error: error && error.message };
	},
	async deleteHW(id) {
		if (!useCloud) return { ok: false };
		const c = ensureClient(); if (!c) return { ok: false };
		const { error } = await c.from("hw").delete().eq("id", id);
		return { ok: !error, error: error && error.message };
	},
	/* Материалы (доп. ссылки сверх курса) */
	async addMaterial(studentId, title, url, note) {
		if (!useCloud) return { ok: false, error: "нужен Supabase" };
		const c = ensureClient(); if (!c) return { ok: false };
		const u = await this.getUser(); if (!u) return { ok: false, error: "not signed in" };
		const { error } = await c.from("materials").insert(
			{ teacher_id: u.id, student_id: studentId, title: title, url: url, note: note || null });
		return { ok: !error, error: error && error.message };
	},
	async listMaterials(studentId) { /* учитель */
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const { data } = await c.from("materials").select("id,title,url,note,created_at").eq("student_id", studentId).order("created_at", { ascending: false });
		return data || [];
	},
	async myMaterials() { /* ученик */
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const u = await this.getUser(); if (!u) return [];
		const { data } = await c.from("materials").select("id,title,url,note,created_at").eq("student_id", u.id).order("created_at", { ascending: false });
		return data || [];
	},
	async deleteMaterial(id) {
		if (!useCloud) return { ok: false };
		const c = ensureClient(); if (!c) return { ok: false };
		const { error } = await c.from("materials").delete().eq("id", id);
		return { ok: !error, error: error && error.message };
	},
	/* Ученик: сохранить пачку ответов по юниту (детальный прогресс) */
	async saveHwAttempts(rows) {
		if (!useCloud || !rows || !rows.length) return { ok: false };
		const c = ensureClient(); if (!c) return { ok: false };
		const u = await this.getUser(); if (!u) return { ok: false };
		const payload = rows.map(r => ({
			student_id: u.id, course: r.course, unit: r.unit, ex_index: r.ex_index,
			section: r.section || null, question: (r.question || "").slice(0, 500),
			answer: (r.answer == null ? null : String(r.answer).slice(0, 300)),
			correct: !!r.correct, duration_ms: r.duration_ms || null
		}));
		const { error } = await c.from("hw_attempts").insert(payload);
		return { ok: !error, error: error && error.message };
	},
	/* Учитель: детальные результаты ученика по юниту */
	async studentHwResults(studentId, course, unit) {
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const { data, error } = await c.rpc("student_hw_results", { p_student: studentId, p_course: course, p_unit: unit });
		if (error) { console.warn("student_hw_results:", error.message); return []; }
		return data || [];
	},
	/* ---------- Приглашения ученика (одноразовая ссылка) ---------- */
	/* Учитель: создать одноразовое приглашение → {ok, code} */
	async createInvite(note) {
		if (!useCloud) return { ok: false, error: "нужен Supabase" };
		const c = ensureClient(); if (!c) return { ok: false, error: "no client" };
		const { data, error } = await c.rpc("create_invite", { p_note: note || null });
		return { ok: !error, code: data, error: error && error.message };
	},
	/* Учитель: свои приглашения */
	async myInvites() {
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const { data, error } = await c.rpc("my_invites");
		if (error) { console.warn("my_invites:", error.message); return []; }
		return data || [];
	},
	/* Любой: проверить код ДО создания аккаунта → {ok, teacher} */
	async inviteCheck(code) {
		if (!useCloud) return { ok: false, error: "нужен Supabase" };
		const c = ensureClient(); if (!c) return { ok: false, error: "no client" };
		const { data, error } = await c.rpc("invite_check", { p_code: (code || "").trim() });
		return { ok: !error, teacher: data, error: error && error.message };
	},
	/* Ученик: активировать приглашение (после входа) */
	async redeemInvite(code, name) {
		if (!useCloud) return { ok: false, error: "нужен Supabase" };
		const c = ensureClient(); if (!c) return { ok: false, error: "no client" };
		const { data, error } = await c.rpc("redeem_invite", { p_code: (code || "").trim(), p_name: name || null });
		return { ok: !error, status: data, error: error && error.message };
	},
	/* Регистрация ученика по приглашению: имя + пароль, email необязателен.
	   Если email не указан — генерируем технический адрес, ученик его не видит.
	   Логин потом: тот же экран, имя + пароль. */
	studentLogin(name) {
		return "s." + (name || "").trim().toLowerCase()
			.replace(/[^a-zа-яё0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 24);
	},
	async signUpStudent(name, password, email, code) {
		if (!useCloud) return { ok: false, error: "нужен Supabase" };
		const c = ensureClient(); if (!c) return { ok: false, error: "no client" };
		const login = (email || "").trim() || (this.studentLogin(name) + "." +
			Math.random().toString(36).slice(2, 6) + "@student.asya");
		const { data, error } = await c.auth.signUp({
			email: login, password: password, options: { data: { name: name, login: login } }
		});
		if (error) return { ok: false, error: error.message };
		if (!data.session) return { ok: false, needConfirm: true, login: login, error: "Подтверждение email включено в Supabase. Выключи его: Authentication → Sign In / Providers → Email → Confirm email → off." };
		const r = await this.redeemInvite(code, name);
		if (!r.ok) return { ok: false, error: r.error || "Не удалось привязать к учителю" };
		return { ok: true, login: login };
	},
	/* Учитель: сводка ДЗ ученика (юниты, попытки, верно, время) */
	async studentHwSummary(studentId) {
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const { data, error } = await c.rpc("student_hw_summary", { p_student: studentId });
		if (error) { console.warn("student_hw_summary:", error.message); return []; }
		return data || [];
	},

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
