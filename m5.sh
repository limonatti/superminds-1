#!/bin/bash
# Доводим кеш до ума:
#  • статика Jitsi и external_api.js — неделя;
#  • config.js и interface_config.js — пять минут (их иногда правим,
#    неделя кеша означала бы, что правка доедет до ученика через неделю);
#  • убираем задвоенный заголовок Cache-Control из прошлой версии.
#
#   rm m5.sh
#   wget english-with-asya.com/m5.sh
#   bash m5.sh
set -u
OLD=asya-meet.duckdns.org
NEW=meet.english-with-asya.com

say(){ echo ""; echo "=== $* ==="; }

CONF="/etc/nginx/sites-available/$OLD.conf"
[ -f "$CONF" ] || CONF="$(ls /etc/nginx/sites-available/*.conf 2>/dev/null | head -1)"
say "1/3 конфиг: $CONF"
BAK="/root/nginx-backup-$(date +%F-%H%M%S).conf"
cp "$CONF" "$BAK"; echo "копия: $BAK"

python3 - "$CONF" <<'PY'
import re,sys
p=sys.argv[1]; s=open(p).read()

# старый блок убираем целиком, чтобы правила не наслаивались
s=re.sub(r"\n\s*# EWA-CACHE.*?# /EWA-CACHE\n", "\n", s, flags=re.S)

block = '''
    # EWA-CACHE  — что кешировать браузеру ученика
    # expires сам выставляет Cache-Control, отдельный add_header не нужен:
    # из-за него заголовок задваивался.
    location ~* ^/(libs|css|images|sounds|fonts|static)/ {
        expires 7d;
        access_log off;
    }
    location = /external_api.js {
        expires 7d;
    }
    location ~* ^/(config|interface_config)\\.js$ {
        expires 5m;
    }
    # /EWA-CACHE
'''
i = s.find("listen 443")
if i < 0:
    print("!!! не нашёл server-блок с listen 443"); sys.exit(1)
j = s.find("\n", i)
s = s[:j+1] + block + s[j+1:]
open(p,'w').write(s)
print("правила обновлены")
PY

say "2/3 проверка конфига"
if ! nginx -t; then
  echo "!!! nginx не принял конфиг, возвращаю прежний"
  cp "$BAK" "$CONF"; systemctl reload nginx; exit 1
fi
systemctl reload nginx

say "3/3 заголовки снаружи"
sleep 2
for f in /libs/app.bundle.min.js /external_api.js /config.js /css/all.css; do
  line="$(curl -sI "https://$NEW$f" | grep -i '^cache-control' | tr -d '\r')"
  printf '%-28s %s\n' "$f" "${line:-нет заголовка}"
done
echo ""
echo "Ожидаем: libs, external_api.js и css — max-age=604800; config.js — max-age=300."
