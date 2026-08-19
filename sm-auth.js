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

/* Поля домашки. status: new (выдано) → submitted (сдано) → done (принято) | rework (на доработку).
   Колонка done оставлена для старого кода — база держит её в согласии со status. */
const HW_COLS = "id,course,unit,note,done,status,feedback,submitted_at,reviewed_at,created_at";

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

/* Забыли пароль: письмо со ссылкой на ту почту, с которой регистрировались */
async resetPassword(email) {
if (!useCloud) return { ok: false, error: "нужен Supabase" };
const mail = (email || "").trim();
if (!mail || mail.indexOf("@") < 1) return { ok: false, error: "впиши почту, с которой регистрировался" };
const c = ensureClient(); if (!c) return { ok: false, error: "no client" };
const back = location.origin + location.pathname.replace(/[^\/]*$/, "new-password.html");
const { error } = await c.auth.resetPasswordForEmail(mail, { redirectTo: back });
/* Не подсказываем, есть ли такой ящик в базе — это чужая тайна */
return { ok: !error, error: error && error.message };
},

/* Задать новый пароль — работает по ссылке из письма */
async setNewPassword(password) {
if (!useCloud) return { ok: false, error: "нужен Supabase" };
if (!password || password.length < 6) return { ok: false, error: "пароль от 6 символов" };
const c = ensureClient(); if (!c) return { ok: false, error: "no client" };
const { error } = await c.auth.updateUser({ password: password });
return { ok: !error, error: error && error.message };
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
const { data } = await c.from("profiles").select("role,teacher_id,teacher_code,name,course").eq("user_id", u.id).maybeSingle();
return data || null;
},
/* Запомнить выбранный учеником учебник — чтобы он пережил смену браузера */
async setMyCourse(slug) {
if (!useCloud) return { ok: true };
const c = ensureClient(); if (!c) return { ok: false };
const u = await this.getUser(); if (!u) return { ok: false };
const { error } = await c.from("profiles").upsert(
{ user_id: u.id, course: slug }, { onConflict: "user_id" });
return { ok: !error, error: error && error.message };
},
/* Учитель: гарантировать профиль и получить свой код */
/* Код класса выдаёт база, а не браузер: колонки role и teacher_code закрыты
   на запись, иначе любой ученик мог назначить себя учителем. */
async ensureTeacherCode(name) {
if (!useCloud) return { code: "LOCAL", error: null };
const c = ensureClient(); if (!c) return { error: "no client" };
const u = await this.getUser(); if (!u) return { error: "not signed in" };
const prof = await this.myProfile();
if (prof && prof.teacher_code) return { code: prof.teacher_code };
const { data, error } = await c.rpc("ensure_teacher_code", { p_name: name || null });
if (error) return { error: error.message };
return { code: data };
},

/* Курсы, доступные вошедшему: свои, курсы своего учителя, опубликованные.
   Что именно отдать — решает база, здесь фильтров нет. */
async listCourses() {
if (!useCloud) return { courses: [], units: [] };
const c = ensureClient(); if (!c) return { courses: [], units: [] };
const [co, un] = await Promise.all([
c.from("courses").select("slug,title,subtitle,emoji,color,img,owner_id,published").order("created_at", { ascending: true }),
c.from("units").select("course_slug,slug,unit_label,title,emoji,color,position,words").order("position", { ascending: true }).order("created_at", { ascending: true })
]);
if (co.error) console.warn("listCourses:", co.error.message);
return { courses: co.data || [], units: un.data || [] };
},

/* Библиотека: чужие учебники, открытые для всех учителей.
   Свои сюда не попадают — они и так в «Моих учебниках». */
async libraryCourses() {
if (!useCloud) return [];
const c = ensureClient(); if (!c) return [];
const u = await this.getUser(); if (!u) return [];
const { data, error } = await c.from("courses")
.select("id,slug,title,subtitle,emoji,color,img,kind,owner_id")
.eq("published", true).neq("owner_id", u.id)
.order("title", { ascending: true });
if (error) { console.warn("libraryCourses:", error.message); return []; }
return data || [];
},

/* Взять учебник из библиотеки себе. Делается копия: оригинал остаётся
   нетронутым у автора, дальше учитель правит только свою версию.
   Слова берём из того, что уже загружено в браузер (SM_COURSE_DATA). */
async copyCourseFrom(slug, opts) {
if (!useCloud) return { ok: false, error: "нужен Supabase" };
opts = opts || {};
const src = (window.SM_COURSE_DATA || {})[slug];
if (!src || !src.length) return { ok: false, error: "у этого учебника нет юнитов для копирования" };
const meta = ((window.SM_COURSES || []).filter(function (c) { return c.id === slug; })[0]) || {};
const made = await this.saveCourse({
title: opts.title || ((meta.title || slug) + " — моя версия"),
subtitle: opts.subtitle || meta.subtitle || "копия из библиотеки",
emoji: meta.emoji || "📘", color: meta.color || "#e4ebf2", img: meta.img || null
});
if (!made.ok) return made;
let done = 0;
for (let i = 0; i < src.length; i++) {
const u = src[i];
const r = await this.saveUnit({
course_slug: made.slug, unit_label: u.unit || null, title: u.title,
emoji: u.emoji || "📖", color: u.color || "#f6e2cf", words: u.words || []
});
if (r.ok) done++;
}
return { ok: true, slug: made.slug, id: made.id, units: done, total: src.length };
},

/* Владелец платформы выдаёт или снимает роль учителя */
async setRole(userId, role) {
if (!useCloud) return { ok: false, error: "нужен Supabase" };
const c = ensureClient(); if (!c) return { ok: false };
const { error } = await c.rpc("set_role", { p_user: userId, p_role: role });
return { ok: !error, error: error && error.message };
},

/* Я владелец платформы? От этого зависят разделы модерации */
async isOwner() {
if (!useCloud) return false;
const c = ensureClient(); if (!c) return false;
const { data, error } = await c.rpc("is_platform_owner");
return !error && !!data;
},
/* Ученик: привязаться к учителю по коду */
async joinTeacher(code) {
if (!useCloud) return { ok: false, error: "нужен Supabase" };
const c = ensureClient(); if (!c) return { ok: false, error: "no client" };
const { error } = await c.rpc("join_teacher", { p_code: (code || "").trim() });
return { ok: !error, error: error && error.message };
},
/* ---------- Приглашения учеников ----------
   Эти методы пропали из файла в июле, при добавлении чата,
   и с тех пор кнопка «Создать ссылку-приглашение» молча не работала:
   ученики регистрировались сами и оставались непривязанными.
   Восстановлены из коммита d3d08b8. */
	async createInvite(note) {
		if (!useCloud) return { ok: false, error: "нужен Supabase" };
		const c = ensureClient(); if (!c) return { ok: false, error: "no client" };
		const { data, error } = await c.rpc("create_invite", { p_note: note || null });
		return { ok: !error, code: data, error: error && error.message };
	},
	async myInvites() {
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const { data, error } = await c.rpc("my_invites");
		if (error) { console.warn("my_invites:", error.message); return []; }
		return data || [];
	},
	async inviteCheck(code) {
		if (!useCloud) return { ok: false, error: "нужен Supabase" };
		const c = ensureClient(); if (!c) return { ok: false, error: "no client" };
		const { data, error } = await c.rpc("invite_check", { p_code: (code || "").trim() });
		return { ok: !error, teacher: data, error: error && error.message };
	},
	async redeemInvite(code, name) {
		if (!useCloud) return { ok: false, error: "нужен Supabase" };
		const c = ensureClient(); if (!c) return { ok: false, error: "no client" };
		const { data, error } = await c.rpc("redeem_invite", { p_code: (code || "").trim(), p_name: name || null });
		return { ok: !error, status: data, error: error && error.message };
	},
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
/* Кто зарегистрировался, но не привязан ни к одному учителю.
   Раньше такие люди были не видны никому: список класса строится по
   profiles.teacher_id, а он заполняется только при входе по коду или ссылке. */
async unassignedStudents() {
if (!useCloud) return [];
const c = ensureClient(); if (!c) return [];
const { data, error } = await c.rpc("unassigned_students");
if (error) { console.warn("unassigned_students:", error.message); return []; }
return data || [];
},
/* Убрать аккаунт из списка новых регистраций (свои тестовые, дубли).
   Аккаунт не удаляется — просто перестаёт показываться. */
async hideAccount(userId, hidden) {
if (!useCloud) return { ok: false, error: "нужен Supabase" };
const c = ensureClient(); if (!c) return { ok: false };
const { error } = await c.rpc("hide_account", { p_user: userId, p_hidden: hidden !== false });
return { ok: !error, error: error && error.message };
},
/* Добавить такого человека к себе в класс */
async attachStudent(userId, name) {
if (!useCloud) return { ok: false, error: "нужен Supabase" };
const c = ensureClient(); if (!c) return { ok: false };
const { error } = await c.rpc("attach_student", { p_student: userId, p_name: name || null });
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
const { data } = await c.from("courses").select("id,slug,title,subtitle,emoji,color,img,kind,published,created_at").eq("owner_id", u.id).order("kind", { ascending: true }).order("created_at", { ascending: true });
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
const row = { author_id: u.id, course: ex.course, unit_id: ex.unit_id, book: ex.book || "sb", type: ex.type, title: ex.title || null, section: ex.section || null, data: ex.data || {} };
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
let q = c.from("exercises").select("id,course,unit_id,book,type,title,section,position,data,created_at").eq("author_id", u.id).order("created_at", { ascending: false });
if (course) q = q.eq("course", course);
const { data } = await q; return data || [];
},
async exercisesFor(course, unit) {
if (!useCloud) return [];
const c = ensureClient(); if (!c) return [];
const { data, error } = await c.from("exercises").select("id,type,title,section,book,position,data,created_at").eq("course", course).eq("unit_id", unit).order("position", { ascending: true }).order("created_at", { ascending: true });
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

/* Загрузить любой файл упражнения (картинку, аудио, видео) в хранилище ex-media.
   Принимает File или Blob. Возвращает {ok, url}. Максимум 25 МБ — ограничение бакета. */
async uploadMedia(file, kind) {
if (!useCloud) return { ok: false, error: "нужен Supabase" };
if (!file) return { ok: false, error: "нет файла" };
const c = ensureClient(); if (!c) return { ok: false };
const u = await this.getUser(); if (!u) return { ok: false, error: "войди в кабинет" };
if (file.size > 25 * 1024 * 1024) return { ok: false, error: "файл больше 25 МБ — сожми или залей ссылкой" };
try {
const mime = file.type || "application/octet-stream";
const named = (file.name || "").match(/\.([a-z0-9]{2,5})$/i);
const byMime = { "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/wav": "wav", "audio/ogg": "ogg",
"audio/webm": "webm", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/aac": "aac",
"video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov",
"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };
const ext = (named ? named[1].toLowerCase() : null) || byMime[mime] || "bin";
const folder = kind || (mime.indexOf("audio") === 0 ? "audio" : mime.indexOf("video") === 0 ? "video" : "img");
const path = u.id + "/" + folder + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) + "." + ext;
const { error } = await c.storage.from("ex-media").upload(path, file, { contentType: mime, upsert: false });
if (error) return { ok: false, error: error.message };
const { data } = c.storage.from("ex-media").getPublicUrl(path);
return { ok: true, url: data && data.publicUrl, path: path };
} catch (e) { return { ok: false, error: String(e) }; }
},

/* ---------- Личный словарь ученика ----------
   Ученик сам добавляет слова и словосочетания, которые встретил; учитель может
   докинуть незнакомое слово прямо во время урока. Слова живут отдельным
   юнитом «Мои слова» — и в словаре, и в тренажёре. */

async myWords(studentId) {
if (!useCloud) return [];
const c = ensureClient(); if (!c) return [];
const u = await this.getUser(); if (!u) return [];
const { data, error } = await c.from("my_words")
.select("id,student_id,en,ru,note,ipa,meaning,img,audio,source,created_at")
.eq("student_id", studentId || u.id)
.order("created_at", { ascending: false });
if (error) { console.warn("myWords:", error.message); return []; }
return data || [];
},

/* w: {en, ru, note, ipa, meaning, img, audio, source}. studentId — если добавляет учитель. */
async addWord(w, studentId) {
if (!useCloud) return { ok: false, error: "нужен Supabase" };
const en = (w && w.en || "").trim();
if (!en) return { ok: false, error: "впиши слово или фразу" };
const c = ensureClient(); if (!c) return { ok: false };
const u = await this.getUser(); if (!u) return { ok: false, error: "войди в кабинет" };
const row = {
student_id: studentId || u.id, added_by: u.id, en: en,
ru: (w.ru || "").trim(), note: w.note || null, ipa: w.ipa || null,
meaning: w.meaning || null, img: w.img || null, audio: w.audio || null,
source: w.source || "search"
};
const { data, error } = await c.from("my_words").insert(row).select("id").single();
if (error) {
if ((error.message || "").indexOf("my_words_uniq") >= 0)
return { ok: false, error: "«" + en + "» уже есть в словаре", dup: true };
return { ok: false, error: error.message };
}
return { ok: true, id: data && data.id };
},

async updateWord(id, patch) {
if (!useCloud) return { ok: false };
const c = ensureClient(); if (!c) return { ok: false };
const row = {};
["en", "ru", "note", "ipa", "meaning", "img", "audio"].forEach(function (k) {
if (patch && k in patch) row[k] = patch[k];
});
if (!Object.keys(row).length) return { ok: false, error: "нечего менять" };
const { error } = await c.from("my_words").update(row).eq("id", id);
return { ok: !error, error: error && error.message };
},

async removeWord(id) {
if (!useCloud) return { ok: false };
const c = ensureClient(); if (!c) return { ok: false };
const { error } = await c.from("my_words").delete().eq("id", id);
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
		const { data } = await c.from("hw").select(HW_COLS).eq("student_id", studentId).order("created_at", { ascending: false });
		return data || [];
	},
	async myHW() { /* ученик */
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const u = await this.getUser(); if (!u) return [];
		const { data } = await c.from("hw").select(HW_COLS).eq("student_id", u.id).order("created_at", { ascending: false });
		return data || [];
	},
	async setHWDone(id, done) {
		if (!useCloud) return { ok: false };
		const c = ensureClient(); if (!c) return { ok: false };
		const { error } = await c.from("hw").update({ done: !!done }).eq("id", id);
		return { ok: !error, error: error && error.message };
	},

	/* --- Цикл проверки: new → submitted → done | rework → submitted --- */

	/* Ученик отправляет работу учителю. Больше он ничего изменить не может — это стережёт база. */
	async hwSubmit(id) {
		if (!useCloud) return { ok: false };
		const c = ensureClient(); if (!c) return { ok: false };
		const { error } = await c.from("hw").update({ status: "submitted" }).eq("id", id);
		return { ok: !error, error: error && error.message };
	},

	/* Учитель принимает работу */
	async hwAccept(id, feedback) {
		if (!useCloud) return { ok: false };
		const c = ensureClient(); if (!c) return { ok: false };
		const patch = { status: "done" };
		if (feedback !== undefined) patch.feedback = feedback || null;
		const { error } = await c.from("hw").update(patch).eq("id", id);
		return { ok: !error, error: error && error.message };
	},

	/* Учитель возвращает на доработку — комментарий обязателен, иначе ученик не поймёт, что чинить */
	async hwRework(id, feedback) {
		if (!useCloud) return { ok: false };
		const text = String(feedback || "").trim();
		if (!text) return { ok: false, error: "напиши, что нужно доработать" };
		const c = ensureClient(); if (!c) return { ok: false };
		const { error } = await c.from("hw").update({ status: "rework", feedback: text }).eq("id", id);
		return { ok: !error, error: error && error.message };
	},

	/* ---------- Расписание ----------
	   Постоянные уроки по дням недели. Время хранится московское:
	   учитель ставит его в своём поясе, ученику страница пересчитает. */

	async myLessons() {              /* учитель: всё своё расписание */
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const u = await this.getUser(); if (!u) return [];
		const { data, error } = await c.from("lessons")
			.select("id,student_id,weekday,at_msk,minutes,note,active")
			.eq("teacher_id", u.id).eq("active", true)
			.order("weekday", { ascending: true }).order("at_msk", { ascending: true });
		if (error) { console.warn("myLessons:", error.message); return []; }
		return data || [];
	},

	async myLessonsAsStudent() {     /* ученик: свои уроки */
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const u = await this.getUser(); if (!u) return [];
		const { data, error } = await c.from("lessons")
			.select("id,teacher_id,weekday,at_msk,minutes,note")
			.eq("student_id", u.id).eq("active", true)
			.order("weekday", { ascending: true }).order("at_msk", { ascending: true });
		if (error) { console.warn("myLessonsAsStudent:", error.message); return []; }
		return data || [];
	},

	/* Поставить урок. days — массив номеров дней (1 = понедельник). */
	async addLessons(studentId, days, atMsk, minutes, note) {
		if (!useCloud) return { ok: false, error: "нужен Supabase" };
		if (!days || !days.length) return { ok: false, error: "выбери хотя бы один день" };
		if (!atMsk) return { ok: false, error: "укажи время" };
		const c = ensureClient(); if (!c) return { ok: false };
		const u = await this.getUser(); if (!u) return { ok: false, error: "not signed in" };
		const rows = days.map(d => ({
			teacher_id: u.id, student_id: studentId, weekday: +d,
			at_msk: atMsk, minutes: minutes || 50, note: note || null
		}));
		const { error } = await c.from("lessons").insert(rows);
		return { ok: !error, error: error && error.message, added: rows.length };
	},

	async removeLesson(id) {
		if (!useCloud) return { ok: false };
		const c = ensureClient(); if (!c) return { ok: false };
		const { error } = await c.from("lessons").delete().eq("id", id);
		return { ok: !error, error: error && error.message };
	},

	/* Изменить постоянный урок: день, время, длительность, заметку.
	   Передавай только те поля, которые меняешь. */
	async updateLesson(id, patch) {
		if (!useCloud) return { ok: false, error: "нужен Supabase" };
		if (!id || !patch) return { ok: false, error: "нечего менять" };
		const c = ensureClient(); if (!c) return { ok: false };
		const row = {};
		if (patch.weekday != null) row.weekday = +patch.weekday;
		if (patch.at_msk)          row.at_msk  = patch.at_msk;
		if (patch.minutes != null) row.minutes = +patch.minutes;
		if ("note" in patch)       row.note    = patch.note || null;
		if (!Object.keys(row).length) return { ok: false, error: "нечего менять" };
		const { error } = await c.from("lessons").update(row).eq("id", id);
		return { ok: !error, error: error && error.message };
	},

	/* Отмены и переносы отдельных занятий */
	async lessonChanges(fromDate, toDate) {
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		let q = c.from("lesson_changes").select("id,lesson_id,on_date,status,new_date,new_at_msk,reason");
		if (fromDate) q = q.gte("on_date", fromDate);
		if (toDate)   q = q.lte("on_date", toDate);
		const { data, error } = await q;
		if (error) { console.warn("lessonChanges:", error.message); return []; }
		return data || [];
	},

	async cancelLesson(lessonId, onDate, reason) {
		if (!useCloud) return { ok: false };
		const c = ensureClient(); if (!c) return { ok: false };
		const { error } = await c.from("lesson_changes").upsert(
			{ lesson_id: lessonId, on_date: onDate, status: "cancelled", reason: reason || null },
			{ onConflict: "lesson_id,on_date" });
		return { ok: !error, error: error && error.message };
	},

	async moveLesson(lessonId, onDate, newDate, newAtMsk, reason) {
		if (!useCloud) return { ok: false };
		const c = ensureClient(); if (!c) return { ok: false };
		const { error } = await c.from("lesson_changes").upsert(
			{ lesson_id: lessonId, on_date: onDate, status: "moved",
			  new_date: newDate || onDate, new_at_msk: newAtMsk || null, reason: reason || null },
			{ onConflict: "lesson_id,on_date" });
		return { ok: !error, error: error && error.message };
	},

	async undoLessonChange(lessonId, onDate) {
		if (!useCloud) return { ok: false };
		const c = ensureClient(); if (!c) return { ok: false };
		const { error } = await c.from("lesson_changes").delete()
			.eq("lesson_id", lessonId).eq("on_date", onDate);
		return { ok: !error, error: error && error.message };
	},

	/* ---------- Shadowing: библиотека звуков и попытки ---------- */

	async shSounds() {
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const { data, error } = await c.from("sh_sounds")
			.select("id,ipa,title,hint,examples,position").order("position", { ascending: true });
		if (error) { console.warn("shSounds:", error.message); return []; }
		return data || [];
	},

	async shPhrases(soundId) {
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const { data, error } = await c.from("sh_phrases")
			.select("id,sound_id,text,ipa,translation,level,audio_url,audio_credit,yt_id,yt_start,yt_end,position")
			.eq("sound_id", soundId).order("position", { ascending: true });
		if (error) { console.warn("shPhrases:", error.message); return []; }
		return data || [];
	},

	/* Учитель добавляет фразу в библиотеку */
	async shAddPhrase(p) {
		if (!useCloud) return { ok: false, error: "нужен Supabase" };
		const c = ensureClient(); if (!c) return { ok: false };
		const u = await this.getUser(); if (!u) return { ok: false, error: "not signed in" };
		const { error } = await c.from("sh_phrases").insert({
			author_id: u.id, sound_id: p.sound_id, text: p.text, ipa: p.ipa || null,
			translation: p.translation || null, level: p.level || "A2",
			audio_url: p.audio_url || null, audio_credit: p.audio_credit || null,
			yt_id: p.yt_id || null, yt_start: p.yt_start || null, yt_end: p.yt_end || null,
			position: p.position || 100
		});
		return { ok: !error, error: error && error.message };
	},

	async shSaveTake(t) {
		if (!useCloud) return { ok: false };
		const c = ensureClient(); if (!c) return { ok: false };
		const u = await this.getUser(); if (!u) return { ok: false };
		const { error } = await c.from("sh_takes").insert({
			student_id: u.id, phrase_id: t.phrase_id, score: t.score,
			words_score: t.words_score, pitch_score: t.pitch_score, tempo_score: t.tempo_score,
			heard: t.heard || null, metrics: t.metrics || null
		});
		return { ok: !error, error: error && error.message };
	},

	/* Лучшие попытки ученика по списку фраз */
	async shMyBest(phraseIds) {
		if (!useCloud || !phraseIds || !phraseIds.length) return [];
		const c = ensureClient(); if (!c) return [];
		const u = await this.getUser(); if (!u) return [];
		const { data, error } = await c.from("sh_takes")
			.select("phrase_id,score,created_at")
			.eq("student_id", u.id).in("phrase_id", phraseIds)
			.order("score", { ascending: false });
		if (error) { console.warn("shMyBest:", error.message); return []; }
		return data || [];
	},

	/* Прогресс ученика по shadowing — для учителя */
	async shStudentProgress(studentId) {
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const { data, error } = await c.from("sh_takes")
			.select("phrase_id,score,pitch_score,tempo_score,created_at")
			.eq("student_id", studentId).order("created_at", { ascending: false }).limit(200);
		if (error) { console.warn("shStudentProgress:", error.message); return []; }
		return data || [];
	},

	/* Результаты ученика по конкретным упражнениям урока (для блочной домашки) */
	async attemptsFor(studentId, exerciseIds) {
		if (!useCloud || !exerciseIds || !exerciseIds.length) return [];
		const c = ensureClient(); if (!c) return [];
		const { data, error } = await c.from("attempts")
			.select("exercise_id,ex_type,correct,created_at")
			.eq("student_id", studentId).in("exercise_id", exerciseIds)
			.order("created_at", { ascending: false });
		if (error) { console.warn("attemptsFor:", error.message); return []; }
		return data || [];
	},

	/* Названия упражнений по списку id — чтобы учитель видел, что именно задал */
	async exercisesByIds(ids) {
		if (!useCloud || !ids || !ids.length) return [];
		const c = ensureClient(); if (!c) return [];
		const { data, error } = await c.from("exercises")
			.select("id,type,title,section,position").in("id", ids)
			.order("position", { ascending: true });
		if (error) { console.warn("exercisesByIds:", error.message); return []; }
		return data || [];
	},

	/* Работы всего класса, ждущие проверки */
	async hwToReview() {
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const u = await this.getUser(); if (!u) return [];
		const { data } = await c.from("hw").select(HW_COLS)
			.eq("teacher_id", u.id).eq("status", "submitted")
			.order("submitted_at", { ascending: true });
		return data || [];
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
	/* Ученик: своя сводка по курсу — сколько верных ответов в каждой части юнита.
	   Возвращает { "<unit>|<part>": {attempts, correct} }, например {"0|workbook":{...}}.
	   Часть берётся из префикса section ("workbook:gap"); строки без префикса
	   считаются уроком. Читает свои строки по политике ha_student_read. */
	async myHwSummary(course) {
		if (!useCloud) return {};
		const c = ensureClient(); if (!c) return {};
		const u = await this.getUser(); if (!u) return {};
		let q = c.from("hw_attempts").select("unit,section,correct").eq("student_id", u.id).limit(5000);
		if (course) q = q.eq("course", course);
		const { data, error } = await q;
		if (error || !data) { if (error) console.warn("myHwSummary:", error.message); return {}; }
		const out = {};
		data.forEach(r => {
			const raw = String(r.section || "");
			const i = raw.indexOf(":");
			const part = i > 0 ? raw.slice(0, i) : "lesson";
			const k = r.unit + "|" + part;
			if (!out[k]) out[k] = { attempts: 0, correct: 0 };
			out[k].attempts++;
			if (r.correct) out[k].correct++;
		});
		return out;
	},
	/* ---------- Чат: учитель ↔ ученик ---------- */
	/* Сообщения одной пары (учитель, ученик), по возрастанию времени.
	   sinceIso — необязательно: только новее указанного времени (для опроса). */
	async chatMessages(teacherId, studentId, sinceIso) {
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		let q = c.from("messages")
			.select("id,sender_id,teacher_id,student_id,body,read_at,created_at")
			.eq("teacher_id", teacherId).eq("student_id", studentId)
			.order("created_at", { ascending: true });
		if (sinceIso) q = q.gt("created_at", sinceIso);
		const { data, error } = await q;
		if (error) { console.warn("chatMessages:", error.message); return []; }
		return data || [];
	},
	async chatSend(teacherId, studentId, body) {
		if (!useCloud) return { ok: false, error: "нужен Supabase" };
		const c = ensureClient(); if (!c) return { ok: false };
		const u = await this.getUser(); if (!u) return { ok: false, error: "not signed in" };
		const text = (body || "").trim(); if (!text) return { ok: false, error: "пусто" };
		const { data, error } = await c.from("messages")
			.insert({ teacher_id: teacherId, student_id: studentId, sender_id: u.id, body: text.slice(0, 2000) })
			.select("id,sender_id,teacher_id,student_id,body,read_at,created_at").single();
		return { ok: !error, msg: data, error: error && error.message };
	},
	/* Получатель отмечает входящие сообщения пары прочитанными */
	async chatMarkRead(teacherId, studentId) {
		if (!useCloud) return { ok: false };
		const c = ensureClient(); if (!c) return { ok: false };
		const u = await this.getUser(); if (!u) return { ok: false };
		const { error } = await c.from("messages")
			.update({ read_at: new Date().toISOString() })
			.eq("teacher_id", teacherId).eq("student_id", studentId)
			.neq("sender_id", u.id).is("read_at", null);
		return { ok: !error, error: error && error.message };
	},
	/* Ученик: его учитель {teacher_id, name} или null */
	async myTeacher() {
		if (!useCloud) return null;
		const c = ensureClient(); if (!c) return null;
		const { data, error } = await c.rpc("my_teacher");
		if (error) { console.warn("my_teacher:", error.message); return null; }
		return (data && data[0]) || null;
	},
	/* Учитель: непрочитанные по ученикам { student_id: count } */
	async teacherUnread() {
		if (!useCloud) return {};
		const c = ensureClient(); if (!c) return {};
		const { data, error } = await c.rpc("teacher_unread");
		if (error) { console.warn("teacher_unread:", error.message); return {}; }
		const map = {}; (data || []).forEach(r => { map[r.student_id] = r.unread; });
		return map;
	},
	/* Ученик: сколько непрочитанных сообщений от учителя */
	async myUnread() {
		if (!useCloud) return 0;
		const c = ensureClient(); if (!c) return 0;
		const u = await this.getUser(); if (!u) return 0;
		const { count, error } = await c.from("messages")
			.select("id", { count: "exact", head: true })
			.eq("student_id", u.id).neq("sender_id", u.id).is("read_at", null);
		return error ? 0 : (count || 0);
	},

	/* Учитель: детальные результаты ученика по юниту */
	async studentHwResults(studentId, course, unit) {
		if (!useCloud) return [];
		const c = ensureClient(); if (!c) return [];
		const { data, error } = await c.rpc("student_hw_results", { p_student: studentId, p_course: course, p_unit: unit });
		if (error) { console.warn("student_hw_results:", error.message); return []; }
		return data || [];
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

/* ===========================================================================
   Курс ученика — из базы, а не из настроек браузера.
   Раньше активный учебник хранился только в localStorage и записывался лишь
   в админке. Поэтому ученик, которому назначен, скажем, Speakout B1, всюду
   видел Super Minds: его курс просто негде было взять.
   Теперь порядок такой: назначенный учителем курс → выбор, сохранённый
   учеником ранее → то, что осталось в браузере. Результат кладём и в
   localStorage, чтобы страницы без сети открывались сразу правильными.
   =========================================================================== */
(function () {
  if (!window.SM_useCourse) return;   // words.js не подключён — нечего настраивать

  function apply(slug) {
    if (!slug || !window.SM_COURSE_DATA[slug]) return false;
    window.SM_useCourse(slug);
    try { localStorage.setItem("sm-course", slug); } catch (e) {}
    return true;
  }

  /* Ученик сам переключил учебник — запоминаем выбор на сервере,
     чтобы он пережил другой браузер и очистку кэша. */
  window.SM.pickCourse = async function (slug) {
    if (!apply(slug)) return { ok: false, error: "неизвестный курс" };
    try { await window.SM.setMyCourse(slug); } catch (e) {}
    return { ok: true };
  };

  window.SM_ready = Promise.resolve(window.SM_ready).then(async function () {
    /* Speakout мог подключиться позже words.js */
    if (window.SM_absorbSpeakout) window.SM_absorbSpeakout();
    if (window.SM_absorbCourseWords) window.SM_absorbCourseWords();

    let picked = null, assigned = null, signedIn = false;
    try { signedIn = !!(await window.SM.getUser()); } catch (e) {}
    if (signedIn) {
      try { assigned = await window.SM.myCourse(); } catch (e) {}
      try {
        const prof = await window.SM.myProfile();
        if (prof && prof.course) picked = prof.course;
      } catch (e) {}
    }

    /* Главный — курс, назначенный учителем в разделе «Мой класс».
       Свой выбор ученика работает только там, где учитель ничего не назначил. */
    const before = window.SM_COURSE && window.SM_COURSE.id;
    const ok = apply(assigned) || apply(picked);
    if (!ok) window.SM_useCourse(window.SM_wantedCourse);
    const after = window.SM_COURSE && window.SM_COURSE.id;

    /* Курс уточнился уже после отрисовки страницы. Страницы, которые ждут
       SM_ready, разберутся сами (они ставят SM_HANDLES_COURSE). Остальные
       успели нарисоваться на курсе по умолчанию и показали бы чужие слова —
       их обновляем один раз. */
    if (after !== before && !window.SM_HANDLES_COURSE){
      let key = "sm-reload-" + location.pathname + "-" + after;
      let already = false;
      try { already = sessionStorage.getItem(key) === "1"; sessionStorage.setItem(key, "1"); } catch (e) {}
      if (!already) { location.reload(); return { course: window.SM_COURSE, units: window.SM_UNITS }; }
    }

    return {
      course: window.SM_COURSE,
      units: window.SM_UNITS,
      assigned: assigned || null,                  /* что назначил учитель */
      picked: !!picked,                            /* ученик выбирал сам */
      needsChoice: signedIn && !assigned && !picked /* назначения нет — пусть выберет сам */
    };
  }).catch(function () {
    return { course: window.SM_COURSE, units: window.SM_UNITS, picked: false, needsChoice: false };
  });
})();

/* ---------------------------------------------------------------------------
   Подстраховка для loading="lazy".
   Часть браузеров и расширений не запускает нативную ленивую загрузку для
   картинок, вставленных скриптом: запрос не уходит вовсе, и на месте фото
   остаётся пустота. Догружаем вручную только то, что уже близко к экрану, —
   ленивость сохраняется, дальние картинки по-прежнему ждут прокрутки.
--------------------------------------------------------------------------- */
(function () {
  var t;
  function fix(img) {
    if (img.complete && img.naturalWidth > 0) return;
    img.loading = "eager";
    img.src = img.src;
  }
  function sweep() {
    var list = document.querySelectorAll('img[loading="lazy"]');
    for (var i = 0; i < list.length; i++) {
      var img = list[i], r = img.getBoundingClientRect();
      if (r.top > innerHeight * 1.5 || r.bottom < -innerHeight * 0.5) continue;
      fix(img);
    }
  }
  function schedule() { clearTimeout(t); t = setTimeout(sweep, 250); }
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  addEventListener("load", function () { setTimeout(sweep, 1200); setTimeout(sweep, 3000); });

  /* Основной механизм: следим за появлением картинки в поле зрения сами.
     Карточки вставляются скриптом уже после загрузки страницы, поэтому за
     новыми узлами тоже наблюдаем. */
  if (window.IntersectionObserver && window.MutationObserver) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        fix(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: "300px" });

    function watch(root) {
      if (!root || !root.querySelectorAll) return;
      var l = root.querySelectorAll('img[loading="lazy"]');
      for (var i = 0; i < l.length; i++) io.observe(l[i]);
    }
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        for (var i = 0; i < m.addedNodes.length; i++) {
          var n = m.addedNodes[i];
          if (n.nodeType !== 1) continue;
          if (n.matches && n.matches('img[loading="lazy"]')) io.observe(n); else watch(n);
        }
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
    if (document.readyState === "loading") addEventListener("DOMContentLoaded", function () { watch(document); });
    else watch(document);
  }
})();
