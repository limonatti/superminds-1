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

## Сборка (Терминал на маке)
```bash
cd ~/"project Asya's platform"/app
npm install
npm run setup:ios        # создаёт папку ios/, иконки, разрешение на микрофон
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
