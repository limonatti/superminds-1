#!/bin/bash
# Переезд видеосервера на meet.english-with-asya.com
# Запускать НА СЕРВЕРЕ от root:
#   rm m.sh
#   wget english-with-asya.com/m.sh
#   bash m.sh
#
# Порядок важен: сначала nginx должен принимать новое имя, и только потом
# выпускается сертификат — иначе проверка Let's Encrypt получает 404.
# Старый адрес asya-meet.duckdns.org продолжает работать.
set -u
OLD=asya-meet.duckdns.org
NEW=meet.english-with-asya.com
WEBROOT=/usr/share/jitsi-meet

say(){ echo ""; echo "=== $* ==="; }

say "1/6 проверяю, что $NEW указывает на этот сервер"
MYIP="$(curl -s https://ipv4.icanhazip.com || true)"
RES="$(getent hosts "$NEW" | awk '{print $1}' | head -1 || true)"
echo "сервер: ${MYIP:-?}   $NEW: ${RES:-нет записи}"
[ -n "$RES" ] || { echo "!!! A-записи ещё нет"; exit 1; }
if [ -n "$MYIP" ] && [ "$MYIP" != "$RES" ]; then
  echo "!!! домен указывает на $RES, а сервер $MYIP"; exit 1
fi

say "2/6 добавляю новое имя в nginx (до выпуска сертификата)"
CONF="/etc/nginx/sites-available/$OLD.conf"
[ -f "$CONF" ] || CONF="$(ls /etc/nginx/sites-available/*.conf 2>/dev/null | head -1)"
echo "конфиг: $CONF"
BAK="/root/nginx-backup-$(date +%F-%H%M%S).conf"
cp "$CONF" "$BAK"
grep -q "$NEW" "$CONF" || sed -i "s/server_name \(.*\);/server_name \1 $NEW;/" "$CONF"
if ! nginx -t; then
  echo "!!! nginx не принял конфиг, возвращаю прежний"; cp "$BAK" "$CONF"; exit 1
fi
systemctl reload nginx

say "3/6 выпускаю сертификат Let's Encrypt (standalone)"
# У Jitsi в nginx нет location для /.well-known/acme-challenge/, поэтому
# webroot-проверка отдаёт 404. Standalone поднимает свой сервер на порту 80,
# для этого nginx останавливается на несколько секунд.
apt-get install -y certbot >/dev/null 2>&1 || true
systemctl stop nginx
certbot certonly --standalone -d "$NEW" \
  --non-interactive --agree-tos --register-unsafely-without-email --keep-until-expiring
RC=$?
systemctl start nginx
CRT=/etc/letsencrypt/live/$NEW/fullchain.pem
KEY=/etc/letsencrypt/live/$NEW/privkey.pem
echo "certbot вернул код $RC"

say "4/6 проверяю, что сертификат на месте"
if [ ! -s "$CRT" ] || [ ! -s "$KEY" ]; then
  echo "!!! сертификат не выпустился — пришли мне последние строки выше"
  exit 1
fi
echo "сертификат: $CRT"

say "5/6 подключаю сертификат и разрешаю встраивание"
sed -i "s#ssl_certificate .*#ssl_certificate $CRT;#" "$CONF"
sed -i "s#ssl_certificate_key .*#ssl_certificate_key $KEY;#" "$CONF"
sed -i '/X-Frame-Options/d' "$CONF"
if ! nginx -t; then
  echo "!!! nginx не принял конфиг, возвращаю прежний"; cp "$BAK" "$CONF"; systemctl reload nginx; exit 1
fi
systemctl reload nginx

say "6/6 перезапуск видеосервиса"
systemctl restart jitsi-videobridge2 prosody jicofo 2>/dev/null || true

sleep 3
CODE="$(curl -s -o /dev/null -w '%{http_code}' -m 20 "https://$NEW/" || true)"
echo ""
if [ "$CODE" = "200" ]; then
  echo "==================== ГОТОВО ===================="
  echo "https://$NEW отвечает 200 и сертификат принят."
else
  echo "Сертификат поставлен, но https отвечает: ${CODE:-нет ответа}"
  echo "Пришли эту строку мне."
fi
