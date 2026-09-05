#!/bin/bash
# Ускорение загрузки видеозвонка.
# Сервер отдаёт бандл Jitsi (3,4 МБ) без заголовков кеширования — браузер
# ученика качает его заново при каждом входе. Прописываем кеш для статики.
#
#   rm m4.sh
#   wget english-with-asya.com/m4.sh
#   bash m4.sh
set -u
OLD=asya-meet.duckdns.org
NEW=meet.english-with-asya.com

say(){ echo ""; echo "=== $* ==="; }

CONF="/etc/nginx/sites-available/$OLD.conf"
[ -f "$CONF" ] || CONF="$(ls /etc/nginx/sites-available/*.conf 2>/dev/null | head -1)"
say "1/4 конфиг: $CONF"
BAK="/root/nginx-backup-$(date +%F-%H%M%S).conf"
cp "$CONF" "$BAK"; echo "копия: $BAK"

if grep -q "EWA-CACHE" "$CONF"; then
  echo "правило кеширования уже стоит — обновляю"
  python3 - "$CONF" <<'PY'
import re,sys
p=sys.argv[1]; s=open(p).read()
s=re.sub(r"\n    # EWA-CACHE.*?# /EWA-CACHE\n", "\n", s, flags=re.S)
open(p,'w').write(s)
PY
fi

say "2/4 добавляю кеш для статики"
python3 - "$CONF" <<'PY'
import re,sys
p=sys.argv[1]; s=open(p).read()
block = '''
    # EWA-CACHE  — статика Jitsi живёт долго, пусть браузер её хранит
    location ~* ^/(libs|css|images|sounds|fonts|static)/ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        access_log off;
    }
    # /EWA-CACHE
'''
# вставляем в тот server-блок, который слушает 443
i = s.find("listen 443")
if i < 0:
    print("!!! не нашёл server-блок с listen 443"); sys.exit(1)
# после строки с listen 443 находим конец строки и вставляем блок
j = s.find("\n", i)
s = s[:j+1] + block + s[j+1:]
open(p,'w').write(s)
print("вставлено")
PY

say "3/4 проверка конфига"
if ! nginx -t; then
  echo "!!! nginx не принял конфиг, возвращаю прежний"
  cp "$BAK" "$CONF"; nginx -t >/dev/null 2>&1; systemctl reload nginx; exit 1
fi
systemctl reload nginx

say "4/4 проверяю заголовки снаружи"
sleep 2
echo "--- app.bundle.min.js ---"
curl -sI "https://$NEW/libs/app.bundle.min.js" | grep -i "HTTP/\|cache-control\|content-encoding\|expires" || true
echo ""
echo "Если видно Cache-Control: public, max-age=604800 — готово."
echo "Второй и последующие входы ученика будут почти мгновенными."
