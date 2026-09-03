#!/bin/bash
# Переезд видеосервера на meet.english-with-asya.com
# Запускать НА СЕРВЕРЕ от root:
#   curl -sLO https://english-with-asya.com/m.sh
#   bash m.sh
#
# Старый адрес asya-meet.duckdns.org продолжает работать: nginx отвечает
# на оба имени. Откат — вернуть старый домен первым в room.html.
set -u
OLD=asya-meet.duckdns.org
NEW=meet.english-with-asya.com

say(){ echo ""; echo "=== $* ==="; }

say "1/5 проверяю, что $NEW указывает на этот сервер"
MYIP="$(curl -s https://ipv4.icanhazip.com || true)"
RES="$(getent hosts "$NEW" | awk '{print $1}' | head -1 || true)"
echo "сервер: ${MYIP:-?}   $NEW: ${RES:-нет записи}"
if [ -z "$RES" ]; then
  echo "!!! A-записи ещё нет — подожди и запусти скрипт снова"
  exit 1
fi
if [ -n "$MYIP" ] && [ "$MYIP" != "$RES" ]; then
  echo "!!! домен указывает на $RES, а сервер $MYIP"
  exit 1
fi

say "2/5 ищу, чем выпускались сертификаты"
ACME=""
for p in /opt/acmesh/acme.sh/acme.sh /opt/acmesh/acme.sh /root/.acme.sh/acme.sh; do
  [ -x "$p" ] && ACME="$p" && break
done
CRT=/etc/jitsi/meet/$NEW.crt
KEY=/etc/jitsi/meet/$NEW.key

if [ -n "$ACME" ]; then
  echo "acme.sh: $ACME"
  say "3/5 сертификат Let's Encrypt для $NEW (acme.sh)"
  "$ACME" --issue -d "$NEW" -w /usr/share/jitsi-meet --server letsencrypt || true
  "$ACME" --install-cert -d "$NEW" \
      --key-file "$KEY" --fullchain-file "$CRT" \
      --reloadcmd "systemctl force-reload nginx.service" || true
else
  echo "acme.sh не найден, беру certbot"
  apt-get update -y >/dev/null 2>&1
  apt-get install -y certbot >/dev/null 2>&1 || true
  say "3/5 сертификат Let's Encrypt для $NEW (certbot)"
  certbot certonly --webroot -w /usr/share/jitsi-meet -d "$NEW" \
    --non-interactive --agree-tos --register-unsafely-without-email --keep-until-expiring || true
  CRT=/etc/letsencrypt/live/$NEW/fullchain.pem
  KEY=/etc/letsencrypt/live/$NEW/privkey.pem
fi

if [ ! -s "$CRT" ] || [ ! -s "$KEY" ]; then
  echo "!!! сертификат не выпустился. Частая причина — закрыт порт 80."
  echo "    Проверь: ufw status   и файрвол в панели Hetzner."
  exit 1
fi
echo "сертификат: $CRT"

say "4/5 настраиваю nginx на оба имени"
CONF="/etc/nginx/sites-available/$OLD.conf"
[ -f "$CONF" ] || CONF="$(ls /etc/nginx/sites-available/*.conf 2>/dev/null | head -1)"
echo "конфиг: $CONF"
cp "$CONF" "/root/nginx-backup-$(date +%F-%H%M).conf"
grep -q "$NEW" "$CONF" || sed -i "s/server_name \(.*\);/server_name \1 $NEW;/" "$CONF"
sed -i "s#ssl_certificate .*#ssl_certificate $CRT;#" "$CONF"
sed -i "s#ssl_certificate_key .*#ssl_certificate_key $KEY;#" "$CONF"
sed -i '/X-Frame-Options/d' "$CONF"

say "5/5 проверка и перезапуск"
if ! nginx -t; then
  echo "!!! nginx не принял конфиг, возвращаю прежний"
  cp "/root/nginx-backup-"*.conf "$CONF"
  exit 1
fi
systemctl reload nginx
systemctl restart jitsi-videobridge2 prosody jicofo 2>/dev/null || true

echo ""
echo "==================== ГОТОВО ===================="
echo "Проверь https://$NEW — страница Jitsi без предупреждений."
