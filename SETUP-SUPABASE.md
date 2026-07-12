# Как включить настоящие аккаунты (Supabase)

Пока файл `sm-auth.js` не заполнен, сайт работает в **локальном режиме**:
ученик вводит имя, а прогресс хранится в его браузере. Это работает сразу,
без всякой настройки. Минус — прогресс не переносится между устройствами и
ты как учитель его не видишь.

Чтобы включить **настоящие аккаунты** (вход по email/паролю с любого
устройства, синхронизация прогресса), сделай 4 шага. Это бесплатно и занимает
около 10 минут.

## Шаг 1. Создай проект Supabase
1. Зайди на https://supabase.com → **Start your project** → зарегистрируйся.
2. Нажми **New project**. Придумай имя (например `superminds`) и пароль базы.
3. Дождись, пока проект создастся (1–2 минуты).

## Шаг 2. Возьми два ключа
1. В проекте открой **Project Settings** (шестерёнка) → **API**.
2. Скопируй **Project URL** (вида `https://xxxx.supabase.co`).
3. Скопируй **anon public** ключ (длинная строка). ⚠️ НЕ бери `service_role` —
   он секретный, на сайт его вставлять нельзя.

## Шаг 3. Вставь ключи в сайт
Открой файл `sm-auth.js` и впиши значения в самом верху:

```js
const SM_SUPABASE_URL = "https://xxxx.supabase.co";
const SM_SUPABASE_ANON_KEY = "ВСТАВЬ_СЮДА_anon_public_ключ";
```

Сохрани и залей файл на GitHub. Всё — вход и регистрация заработают.

## Шаг 4. Создай таблицу прогресса
1. В Supabase открой **SQL Editor** → **New query**.
2. Вставь этот код и нажми **Run**:

```sql
create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "own read"   on public.progress for select using (auth.uid() = user_id);
create policy "own insert" on public.progress for insert with check (auth.uid() = user_id);
create policy "own update" on public.progress for update using (auth.uid() = user_id);
```

## (Рекомендуется) Отключить подтверждение email
Детям сложно подтверждать почту. Чтобы вход работал сразу после регистрации:
**Authentication → Sign In / Providers → Email → выключи "Confirm email" → Save.**

---

### Как ты будешь видеть прогресс учеников
В Supabase открой **Table Editor → progress** — там строка на каждого ученика
с полем `data` (какие слова выучены). Имена учеников видно в
**Authentication → Users**.
