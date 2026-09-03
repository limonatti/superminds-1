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

say "3/6 проверяю, что проверочный файл виден снаружи"
mkdir -p "$WEBROOT/.well-known/acme-challenge"
echo ok-$$ > "$WEBROOT/.well-known/acme-challenge/selftest"
GOT="$(curl -s -m 15 -L "http://$NEW/.well-known/acme-challenge/selftest" || true)"
rm -f "$WEBROOT/.well-known/acme-challenge/selftest"
if [ "$GOT" != "ok-$$" ]; then
  echo "!!! проверочный файл не отдаётся (ответ: ${GOT:-пусто})"
  echo "    Значит nginx не обслуживает $NEW по http. Пришли этот вывод мне."
  exit 1
fi
echo "видно снаружи — хорошо"

say "4/6 выпускаю сертификат Let's Encrypt"
ACME="$(ls /opt/*/.acme.sh/acme.sh /opt/*/acme.sh/acme.sh /root/.acme.sh/acme.sh 2>/dev/null | head -1 || true)"
CRT=/etc/jitsi/meet/$NEW.crt
KEY=/etc/jitsi/meet/$NEW.key
if [ -n "$ACME" ] && [ -x "$ACME" ]; then
  echo "acme.sh: $ACME"
  "$ACME" --issue -d "$NEW" -w "$WEBROOT" --server letsencrypt || true
  "$ACME" --install-cert -d "$NEW" \
      --key-file "$KEY" --fullchain-file "$CRT" \
      --reloadcmd "systemctl force-reload nginx.service" || true
else
  echo "acme.sh не найден, беру certbot"
  apt-get install -y certbot >/dev/null 2>&1 || true
  certbot certonly --webroot -w "$WEBROOT" -d "$NEW" \
    --non-interactive --agree-tos --register-unsafely-without-email --keep-until-expiring || true
  CRT=/etc/letsencrypt/live/$NEW/fullchain.pem
  KEY=/etc/letsencrypt/live/$NEW/privkey.pem
fi
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

echo ""
echo "==================== ГОТОВО ===================="
echo "Проверь https://$NEW — страница Jitsi без предупреждений."
