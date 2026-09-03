#!/bin/bash
# Второй шаг переезда: внутри config.js адрес соединения жёстко прописан
# на старый домен, поэтому браузер всё равно шёл на duckdns. Делаем его
# относительным — тогда Jitsi работает с любого имени, на котором открыт.
#
#   rm m2.sh
#   wget english-with-asya.com/m2.sh
#   bash m2.sh
set -u
OLD=asya-meet.duckdns.org
NEW=meet.english-with-asya.com

say(){ echo ""; echo "=== $* ==="; }

CFG="/etc/jitsi/meet/$OLD-config.js"
[ -f "$CFG" ] || CFG="$(ls /etc/jitsi/meet/*-config.js 2>/dev/null | head -1)"
say "1/3 правлю $CFG"
[ -f "$CFG" ] || { echo "!!! config.js не найден"; exit 1; }
cp "$CFG" "/root/config-backup-$(date +%F-%H%M%S).js"

python3 - "$CFG" "$OLD" <<'PY'
import re, sys
path, old = sys.argv[1], sys.argv[2]
s = open(path, encoding='utf-8').read()
before = s
# адрес соединения — по текущему хосту, а не по зашитому домену
s = s.replace("bosh: 'https://%s/'" % old, "bosh: '//' + window.location.hostname + '/'")
s = s.replace("websocket: 'wss://%s/'" % old, "websocket: 'wss://' + window.location.hostname + '/'")
open(path, 'w', encoding='utf-8').write(s)
print("изменено" if s != before else "уже было поправлено")
PY

say "2/3 проверяю, что получилось"
grep -n "bosh:\|websocket:" "$CFG" | head -4

say "3/3 перезагружаю nginx"
nginx -t >/dev/null 2>&1 && systemctl reload nginx
sleep 2
CODE="$(curl -s -o /dev/null -w '%{http_code}' -m 20 "https://$NEW/" || true)"
echo ""
if [ "$CODE" = "200" ]; then
  echo "==================== ГОТОВО ===================="
  echo "https://$NEW отвечает 200."
  echo "Старый адрес тоже продолжает работать."
else
  echo "https отвечает: ${CODE:-нет ответа} — пришли мне эту строку"
fi
