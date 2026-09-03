#!/bin/bash
# Третий шаг переезда: prosody знает только старое имя asya-meet.duckdns.org,
# поэтому соединение с нового домена он отклонял (Websocket error).
# Заставляем nginx представляться прокси-запросами старым именем —
# снаружи домен новый, внутри всё как было.
#
#   rm m3.sh
#   wget english-with-asya.com/m3.sh
#   bash m3.sh
set -u
OLD=asya-meet.duckdns.org
NEW=meet.english-with-asya.com

say(){ echo ""; echo "=== $* ==="; }

CONF="/etc/nginx/sites-available/$OLD.conf"
[ -f "$CONF" ] || CONF="$(ls /etc/nginx/sites-available/*.conf 2>/dev/null | head -1)"
say "1/3 правлю $CONF"
BAK="/root/nginx-backup-$(date +%F-%H%M%S).conf"
cp "$CONF" "$BAK"
echo "копия: $BAK"

before="$(grep -c 'proxy_set_header Host' "$CONF" || true)"
sed -i "s/proxy_set_header Host \$http_host;/proxy_set_header Host $OLD;/g" "$CONF"
sed -i "s/proxy_set_header Host \$host;/proxy_set_header Host $OLD;/g" "$CONF"
echo "строк proxy_set_header Host: $before"
grep -n "proxy_set_header Host" "$CONF" | head -6

say "2/3 проверка конфига"
if ! nginx -t; then
  echo "!!! nginx не принял конфиг, возвращаю прежний"
  cp "$BAK" "$CONF"; systemctl reload nginx; exit 1
fi
systemctl reload nginx

say "3/3 проверка снаружи"
sleep 2
CODE="$(curl -s -o /dev/null -w '%{http_code}' -m 20 "https://$NEW/" || true)"
BOSH="$(curl -s -o /dev/null -w '%{http_code}' -m 20 "https://$NEW/http-bind" || true)"
echo "главная: $CODE    http-bind: $BOSH"
echo ""
if [ "$CODE" = "200" ] && [ "$BOSH" != "502" ] && [ "$BOSH" != "000" ]; then
  echo "==================== ГОТОВО ===================="
  echo "Теперь открой https://$NEW и проверь, что комната запускается."
else
  echo "Что-то не так — пришли мне строку выше про главная/http-bind."
fi
