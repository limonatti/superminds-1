#!/bin/bash
# Пункт 1: сделать обновление сертификата надёжным.
#
# Сейчас сертификат выпущен способом standalone — ему нужен свободный порт 80,
# который занят nginx. Плановое обновление в декабре упало бы, и звонки
# перестали бы работать с ошибкой безопасности.
#
# Чиним правильно: учим nginx отдавать проверочные файлы Let's Encrypt
# (у Jitsi такого правила нет — из-за этого мы и ушли в standalone),
# переключаем обновление на этот способ и проверяем вхолостую.
#
#   rm m7.sh
#   wget english-with-asya.com/m7.sh
#   bash m7.sh
set -u
OLD=asya-meet.duckdns.org
NEW=meet.english-with-asya.com
WEBROOT=/usr/share/jitsi-meet

say(){ echo ""; echo "=== $* ==="; }

CONF="/etc/nginx/sites-available/$OLD.conf"
[ -f "$CONF" ] || CONF="$(ls /etc/nginx/sites-available/*.conf 2>/dev/null | head -1)"
say "1/5 конфиг nginx: $CONF"
BAK="/root/nginx-backup-$(date +%F-%H%M%S).conf"
cp "$CONF" "$BAK"; echo "копия: $BAK"

say "2/5 учу nginx отдавать проверочные файлы Let's Encrypt"
python3 - "$CONF" <<'PY'
import re,sys
p=sys.argv[1]; s=open(p).read()
if "EWA-ACME" in s:
    print("правило уже есть"); sys.exit(0)
block = '''
    # EWA-ACME — проверочные файлы Let's Encrypt; без них обновление
    # сертификата возможно только с остановкой nginx
    location ^~ /.well-known/acme-challenge/ {
        default_type "text/plain";
        root /usr/share/jitsi-meet;
        allow all;
    }
    # /EWA-ACME
'''
# вставляем во ВСЕ server-блоки (и :80, и :443) — правило безвредно
out=[]; idx=0
for m in re.finditer(r"listen [^;]*;", s):
    out.append(s[idx:m.end()]); out.append(block); idx=m.end()
out.append(s[idx:])
open(p,'w').write("".join(out))
print("правило добавлено")
PY

if ! nginx -t; then
  echo "!!! nginx не принял конфиг — возвращаю прежний"
  cp "$BAK" "$CONF"; systemctl reload nginx; exit 1
fi
systemctl reload nginx

say "3/5 проверяю, что проверочный файл виден снаружи"
mkdir -p "$WEBROOT/.well-known/acme-challenge"
echo probe-$$ > "$WEBROOT/.well-known/acme-challenge/probe"
GOT="$(curl -s -m 15 "http://$NEW/.well-known/acme-challenge/probe" || true)"
rm -f "$WEBROOT/.well-known/acme-challenge/probe"
if [ "$GOT" != "probe-$$" ]; then
  echo "!!! файл не отдаётся (ответ: ${GOT:0:80})"
  echo "    Возвращаю прежний конфиг, сертификат пока остаётся как есть."
  cp "$BAK" "$CONF"; systemctl reload nginx; exit 1
fi
echo "виден — хорошо"

say "4/5 переключаю обновление сертификата на этот способ"
REN="/etc/letsencrypt/renewal/$NEW.conf"
if [ ! -f "$REN" ]; then echo "!!! не найден $REN"; exit 1; fi
cp "$REN" "/root/renewal-backup-$(date +%F-%H%M%S).conf"
python3 - "$REN" "$WEBROOT" "$NEW" <<'PY'
import re, sys
path, web, dom = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(path).read()

# всё, что относится к прежнему способу, убираем
s = re.sub(r"^\s*authenticator\s*=.*\n", "", s, flags=re.M)
s = re.sub(r"^\s*webroot_path\s*=.*\n", "", s, flags=re.M)
s = re.sub(r"^\s*renew_hook\s*=.*\n", "", s, flags=re.M)
s = re.sub(r"\n\[\[webroot_map\]\][\s\S]*?(?=\n\[|\Z)", "", s)

if "[renewalparams]" not in s:
    s = s.rstrip() + "\n\n[renewalparams]\n"

# новые параметры сразу после [renewalparams]
s = s.replace("[renewalparams]",
    "[renewalparams]\n"
    "authenticator = webroot\n"
    "webroot_path = %s,\n"
    "renew_hook = systemctl reload nginx" % web, 1)

# карта «домен → папка» идёт последней секцией файла
s = s.rstrip() + "\n\n[[webroot_map]]\n%s = %s\n" % (dom, web)

open(path, "w").write(s)
print("параметры обновления переписаны")
PY

say "5/5 проверка обновления вхолостую (ничего не меняет)"
if certbot renew --cert-name "$NEW" --dry-run; then
  echo ""
  echo "==================== ГОТОВО ===================="
  echo "Обновление проходит без остановки сервера."
  certbot certificates 2>/dev/null | grep -A3 "$NEW" | sed 's/^/  /'
else
  echo ""
  echo "!!! Холостая проверка не прошла — пришли вывод выше."
  echo "    Сертификат сейчас действует, срочности нет."
fi
