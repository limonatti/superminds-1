# English with Asya — приложение для App Store и Google Play

Обёртка Capacitor над сайтом english-with-asya.com. Приложение открывает живой
сайт, поэтому **всё, что пушится на сайт, сразу появляется в приложении** —
пересобирать и заново отправлять в магазины нужно только при смене иконки,
разрешений или версии Capacitor.

Без интернета показывается `www/offline.html`.

## Что нужно один раз
| | iPhone (App Store) | Android (Google Play) |
|---|---|---|
| Аккаунт | Apple Developer Program — $99 в год | Google Play Console — $25 один раз |
| Программа | Xcode (App Store на маке) | Android Studio |
| Прочее | Node.js (nodejs.org, версия LTS) | то же |

## Сборка без мака — прямо на GitHub
Вкладка **Actions** → слева «Сборка приложения» → кнопка **Run workflow**.
Через несколько минут внизу страницы запуска, в разделе **Artifacts**, лежат:

| Файл | Что с ним делать |
|---|---|
| `app-debug.apk` | скачать на Android-телефон и установить — приложение работает сразу |
| `app-release.aab` | **не подписан**; для Play Console подписать своим ключом (Android Studio → Build → Generate Signed App Bundle) |
| `English-with-Asya-unsigned.ipa` | **не подписан**; на iPhone напрямую не ставится, нужен Apple Developer и подпись на маке |

Те же файлы, но с понятными именами и прямыми ссылками, выкладываются в
[Releases](https://github.com/limonatti/superminds-1/releases) — ссылку на `.apk`
можно открыть прямо на телефоне, вход в GitHub не нужен. Релиз появляется при
сборке из `main` и при ручном запуске.

Этот прогон доказывает, что обе версии собираются. Для магазинов нужна подпись:
у Apple — только на маке с Xcode, у Google — ключом из Android Studio.
Workflow запускается сам при любой правке в `app/`.

## Сборка на маке
```bash
cd ~/"project Asya's platform"/app
npm install
npm run setup:ios        # создаёт папку ios/, иконки, разрешение на микрофон, схему
npm run setup:android    # то же для android/
npm run ios              # откроет Xcode
npm run android          # откроет Android Studio
```
**Xcode:** App → Signing & Capabilities → выбрать свою команду (Team) →
Product → Archive → Distribute App → App Store Connect.

**Android Studio:** Build → Generate Signed App Bundle (.aab) → создать ключ
(файл ключа и пароль хранить отдельно — без них обновить приложение нельзя) →
загрузить .aab в Play Console.

Папки `ios/`, `android/`, `node_modules/` в git не идут (они в `.gitignore`).

## Push-уведомления: что уже сделано и что включить руками
Код готов целиком: приложение спрашивает разрешение у вошедшего ученика,
сохраняет токен устройства в таблицу `device_tokens`, а база сама шлёт
уведомление о новом сообщении, новой домашке, её проверке и новом уроке
(`supabase-push.sql`, Edge Function `push` в Supabase).

Уведомления молчат, пока не появятся ключи. Что для этого нужно:

1. **Firebase.** Завести бесплатный проект на console.firebase.google.com,
   добавить туда приложение Android (ID `com.englishwithasya.app`) и iOS
   (тот же ID). Скачать `google-services.json` → положить в
   `app/android/app/`, `GoogleService-Info.plist` → в `app/ios/App/App/`.
2. **APNs для iPhone.** В Apple Developer создать ключ APNs (.p8) и загрузить
   его в Firebase: Project settings → Cloud Messaging → Apple app configuration.
   Без этого iOS-уведомления не работают, Android — работает.
3. **Ключ сервера.** В Firebase: Project settings → Service accounts →
   Generate new private key. Полученный JSON целиком положить в секрет
   Supabase: Edge Functions → push → Secrets → `FCM_SERVICE_ACCOUNT`.
   Там же придумать и записать `PUSH_HOOK_SECRET` — любую длинную строку.
4. **Связать базу с функцией.** В SQL-редакторе Supabase выполнить, подставив
   свой секрет из пункта 3:
   ```sql
   select vault.create_secret('https://kdzpmbuohfjbtjpqrdfx.supabase.co/functions/v1/push', 'push_endpoint');
   select vault.create_secret('ТОТ_САМЫЙ_PUSH_HOOK_SECRET', 'push_hook_secret');
   ```
5. **Пересобрать приложение** (Actions → «Сборка приложения») и проверить на
   телефоне: написать ученику в чат — уведомление должно прийти.

Пока шаги 1–4 не сделаны, платформа работает как обычно, просто без
уведомлений: и приложение, и база рассчитаны на их отсутствие.

## Данные приложения
- ID: `com.englishwithasya.app` (после публикации менять нельзя)
- Название: English with Asya
- Иконка и заставка: `resources/` (исходники — `img/app/` в корне сайта)

## Что проверить на телефоне перед отправкой
1. Вход, регистрация по коду, выход.
2. Чат, домашка, расписание.
3. Shadowing и произношение — запись с микрофона.
   **Android:** встроенный WebView не умеет распознавание речи
   (SpeechRecognition). Запись и прослушивание работают, а автоматическая
   оценка произношения — нет. Для неё нужен отдельный плагин
   (`@capacitor-community/speech-recognition`) — отдельная задача.
4. Ссылки на Instagram / Telegram открываются во внешнем браузере — это нормально.

## Риск проверки Apple
Apple может отклонить приложение, которое «просто показывает сайт»
(правило 4.2 Minimum Functionality). Что помогает пройти:
- в описании и на скриншотах показать кабинет, тренажёр, запись голоса,
  чат с преподавателем — то, чего нет у обычного сайта-визитки;
- дать проверяющему тестовый аккаунт ученика (App Review Information);
- если всё же отклонят — добавить push-уведомления о новой домашке и
  сообщениях (плагин `@capacitor/push-notifications`).
Google Play такие приложения принимает без проблем.
