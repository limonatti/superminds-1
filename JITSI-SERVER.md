# Свой сервер видеозвонков (Jitsi) — установка с нуля

Зачем: публичный `meet.jit.si` обрывает **встроенный** звонок через 5 минут.
Это их правило для встраивания в чужие сайты, вход в аккаунт на него не влияет.
На своём сервере такого ограничения нет.

Занимает около часа. Нужны: банковская карта для VPS (~5–10 $/мес) и домен.

---

## Что понадобится

| Что | Зачем | Примерная цена |
|---|---|---|
| VPS с Ubuntu 24.04 | сам сервер | 5–10 $/мес |
| Домен или поддомен | адрес вида `meet.твойдомен.ru` | 1–15 $/год |

**Размер VPS.** Урок один на один идёт напрямую между браузерами (P2P), сервер почти не нагружается.
Хватит **1–2 vCPU и 2 ГБ памяти**. Брать больше нет смысла, пока не появятся групповые занятия от 4 человек.

**Где брать VPS.** Подойдёт любой: Hetzner, DigitalOcean, Vultr, Timeweb, Selectel.
Смотри на два условия: Ubuntu 24.04 и возможность открыть UDP-порт 10000.

---

## Шаг 1. Создай VPS

1. Заведи сервер с образом **Ubuntu 24.04**.
2. Запиши его IP-адрес — он понадобится дальше.
3. Зайди на него в терминале: `ssh root@ТВОЙ_IP`

## Шаг 2. Направь домен на сервер

В панели, где куплен домен, добавь **A-запись**:

```
Имя:     meet
Тип:     A
Значение: ТВОЙ_IP
```

Получится адрес `meet.твойдомен.ru`. Подожди 10–30 минут, пока запись разойдётся.
Проверить: `ping meet.твойдомен.ru` — должен отвечать твой IP.

## Шаг 3. Открой порты

Нужны три: **80/TCP**, **443/TCP** и **10000/UDP**. Последний — самый важный,
без него звук и видео не пойдут.

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw allow 10000/udp
ufw enable
```

Если у провайдера есть свой файрвол в панели — открой те же порты и там.

## Шаг 4. Задай имя сервера

```bash
hostnamectl set-hostname meet.твойдомен.ru
echo "127.0.0.1 meet.твойдомен.ru" >> /etc/hosts
```

## Шаг 5. Установи Jitsi

```bash
apt update && apt upgrade -y
apt install -y gnupg2 curl ca-certificates lsb-release apt-transport-https

curl -sL https://prosody.im/files/prosody-debian-packages.key -o /etc/apt/keyrings/prosody.gpg.key
echo "deb [signed-by=/etc/apt/keyrings/prosody.gpg.key] http://packages.prosody.im/debian $(lsb_release -sc) main" > /etc/apt/sources.list.d/prosody.list

curl -sL https://download.jitsi.org/jitsi-key.gpg.key | gpg --dearmor -o /usr/share/keyrings/jitsi-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/jitsi-keyring.gpg] https://download.jitsi.org stable/" > /etc/apt/sources.list.d/jitsi-stable.list

apt update
apt install -y jitsi-meet
```

Установщик задаст два вопроса:

1. **Hostname** — впиши `meet.твойдомен.ru`
2. **SSL-сертификат** — выбери «Generate a new self-signed certificate», настоящий получим следующим шагом.

## Шаг 6. Получи настоящий сертификат

```bash
/usr/share/jitsi-meet/scripts/install-letsencrypt-cert.sh
```

Скрипт спросит email — впиши свой. После этого открой в браузере
`https://meet.твойдомен.ru` — должна появиться страница Jitsi без предупреждений
о безопасности. Создай тестовую комнату и проверь, что видео и звук работают.

## Шаг 7. Разреши встраивание в платформу

Чтобы сайт мог показывать звонок внутри комнаты урока, открой:

```bash
nano /etc/nginx/sites-available/meet.твойдомен.ru.conf
```

Найди строку с `X-Frame-Options` и удали её (или закомментируй, поставив `#` в начале).
Если её нет — ничего не делай. Затем:

```bash
nginx -t && systemctl reload nginx
```

## Шаг 8. Впиши адрес в платформу

Открой файл `room.html`, найди вверху скрипта строку:

```js
const JITSI_DOMAIN = "meet.jit.si";
```

Замени на свой адрес:

```js
const JITSI_DOMAIN = "meet.твойдомен.ru";
```

Сохрани, залей файл на GitHub. Всё — звонки без ограничения по времени.

---

## Полезное после установки

**Закрыть комнаты от посторонних.** По умолчанию любой, кто угадает адрес комнаты,
может войти. Включается «secure domain» — тогда создавать комнаты сможешь только ты
по логину и паролю, а ученики будут заходить как гости:
<https://jitsi.github.io/handbook/docs/devops-guide/secure-domain>

**Обновления.** Раз в пару месяцев:

```bash
apt update && apt upgrade -y
```

**Если звук есть, а видео нет** — почти всегда закрыт UDP-порт 10000. Проверь файрвол
провайдера в панели управления, не только `ufw`.

**Если сервер за NAT** (частый случай у некоторых провайдеров) — нужна дополнительная
настройка: <https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-quickstart>

---

## Что важно понимать

Свой сервер — это не только отсутствие лимитов, но и ответственность: обновления,
продление сертификата (обычно автоматическое), оплата VPS. Если однажды это надоест,
вернуться на публичный сервер можно за десять секунд — просто впиши обратно
`meet.jit.si` в ту же строку `JITSI_DOMAIN`.
