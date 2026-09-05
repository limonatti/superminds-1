#!/bin/bash
# Кеш, версия без конфликта.
# Прошлая попытка добавляла свой location для /external_api.js, а он у Jitsi
# уже есть — nginx ругался «duplicate location». Теперь дописываем expires
# внутрь существующих правил, а свой блок оставляем только для папок.
#
#   rm m6.sh
#   wget english-with-asya.com/m6.sh
#   bash m6.sh
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

# 1. свой блок пересобираем: только папки, без add_header (он задваивал заголовок)
s=re.sub(r"\n\s*# EWA-CACHE.*?# /EWA-CACHE\n", "\n", s, flags=re.S)
block = '''
    # EWA-CACHE — статику Jitsi браузер может хранить неделю
    location ~* ^/(libs|css|images|sounds|fonts|static)/ {
        expires 7d;
        access_log off;
    }
    # /EWA-CACHE
'''
i = s.find("listen 443")
if i < 0:
    print("!!! не нашёл server-блок с listen 443"); sys.exit(1)
j = s.find("\n", i)
s = s[:j+1] + block + s[j+1:]

# 2. в уже существующие правила Jitsi дописываем срок жизни
def add_expires(text, loc_re, value, label):
    m = re.search(loc_re, text)
    if not m:
        print("  · %s — правила нет, пропускаю" % label); return text
    start = m.end()                      # сразу после открывающей скобки
    end = text.find("}", start)
    body = text[start:end]
    if "expires" in body:
        body_new = re.sub(r"expires[^;]*;", "expires %s;" % value, body)
        print("  · %s — срок обновлён на %s" % (label, value))
    else:
        body_new = "\n        expires %s;" % value + body
        print("  · %s — добавлен срок %s" % (label, value))
    return text[:start] + body_new + text[end:]

s = add_expires(s, r"location\s*=\s*/external_api\.js\s*\{", "7d",  "external_api.js")
s = add_expires(s, r"location\s*=\s*/config\.js\s*\{",       "5m",  "config.js")
s = add_expires(s, r"location\s*=\s*/interface_config\.js\s*\{", "5m", "interface_config.js")

open(p,'w').write(s)
print("готово")
PY

say "2/3 проверка конфига"
if ! nginx -t; then
  echo "!!! nginx не принял конфиг — возвращаю прежний, сайт продолжает работать"
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
echo "Ждём: libs, external_api.js, css — max-age=604800; config.js — max-age=300."
