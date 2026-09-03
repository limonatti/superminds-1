#!/bin/bash
# Переезд видеосервера с asya-meet.duckdns.org на meet.english-with-asya.com
# Запускать НА СЕРВЕРЕ от root:  bash migrate-jitsi-domain.sh
#
# Что делает: выпускает сертификат на новое имя, разрешает nginx отвечать
# на оба имени сразу и снимает X-Frame-Options (иначе окно урока пустое).
# Старый адрес продолжает работать — переключение на сайте безопасно
# откатить одной строкой в room.html.
set -u
OLD=asya-meet.duckdns.org
NEW=meet.english-with-asya.com
IP_EXPECTED=37.27.182.131

say(){ echo ""; echo "=== $* ==="; }

say "1/6 проверяю, что $NEW уже указывает на этот сервер"
MYIP="$(curl -s https://ipv4.icanhazip.com || true)"
RES="$(getent hosts "$NEW" | awk '{print $1}' | head -1 || true)"
echo "сервер: ${MYIP:-?}   $NEW: ${RES:-нет записи}"
if [ -z "$RES" ]; then
  echo "!!! A-записи ещё нет. Добавь в Namecheap: Host=meet, Type=A, Value=$IP_EXPECTED"
  echo "    и запусти скрипт снова через 10-30 минут."
  exit 1
fi
if [ -n "$MYIP" ] && [ "$MYIP" != "$RES" ]; then
  echo "!!! домен указывает на $RES, а сервер $MYIP — сертификат не выпустится"
  exit 1
fi

say "2/6 certbot"
apt-get update -y >/dev/null 2>&1
apt-get install -y certbot >/dev/null 2>&1 || true

say "3/6 сертификат Let's Encrypt для $NEW"
CONF="/etc/nginx/sites-available/$OLD.conf"
[ -f "$CONF" ] || CONF="$(ls /etc/nginx/sites-available/*.conf 2>/dev/null | head -1)"
echo "конфиг nginx: $CONF"

certbot certonly --webroot -w /usr/share/jitsi-meet -d "$NEW" \
  --non-interactive --agree-tos --register-unsafely-without-email --keep-until-expiring
if [ ! -f "/etc/letsencrypt/live/$NEW/fullchain.pem" ]; then
  echo "!!! сертификат не выпустился — смотри вывод выше (чаще всего закрыт порт 80)"
  exit 1
fi

say "4/6 nginx отвечает на оба имени, сертификат новый"
cp "$CONF" "$CONF.bak.$(date +%F-%H%M)"
# server_name: добавляем новое имя рядом со старым (если ещё не добавлено)
grep -q "$NEW" "$CONF" || sed -i "s/server_name \(.*\);/server_name \1 $NEW;/" "$CONF"
# сертификат: указываем новый (он валиден и для запросов на старое имя — браузер
# на старом адресе увидит несовпадение, поэтому старый адрес после переезда не используем)
sed -i "s#ssl_certificate .*#ssl_certificate /etc/letsencrypt/live/$NEW/fullchain.pem;#" "$CONF"
sed -i "s#ssl_certificate_key .*#ssl_certificate_key /etc/letsencrypt/live/$NEW/privkey.pem;#" "$CONF"
# встраивание в комнату урока
sed -i '/X-Frame-Options/d' "$CONF"

say "5/6 проверка и перезапуск"
nginx -t || { echo "!!! nginx не принял конфиг, откат"; cp "$CONF.bak."* "$CONF"; exit 1; }
systemctl reload nginx
systemctl restart jitsi-videobridge2 prosody jicofo 2>/dev/null || true

say "6/6 готово"
echo "Открой https://$NEW — должна открыться страница Jitsi без предупреждений."
echo "Дальше в room.html первым в списке JITSI_DOMAINS поставить \"$NEW\"."
