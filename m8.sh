#!/bin/bash
# Пункт 1, попытка вторая.
# Оказалось, правило для проверочных файлов Let's Encrypt у Jitsi уже есть —
# просто смотрит в свою папку. Ничего не добавляем: находим эту папку,
# проверяем её и переключаем обновление сертификата на неё.
#
#   rm m8.sh
#   wget english-with-asya.com/m8.sh
#   bash m8.sh
set -u
OLD=asya-meet.duckdns.org
NEW=meet.english-with-asya.com

say(){ echo ""; echo "=== $* ==="; }

CONF="/etc/nginx/sites-available/$OLD.conf"
[ -f "$CONF" ] || CONF="$(ls /etc/nginx/sites-available/*.conf 2>/dev/null | head -1)"
say "1/4 ищу, куда nginx кладёт проверочные файлы"
echo "конфиг: $CONF"
grep -n -A4 "acme-challenge" "$CONF" | sed 's/^/  /'

WEB="$(python3 - "$CONF" <<'PY'
import re,sys
s=open(sys.argv[1]).read()
m=re.search(r"location[^{]*acme-challenge[^{]*\{([^}]*)\}", s, re.S)
if not m: print(""); raise SystemExit
body=m.group(1)
r=re.search(r"\b(root|alias)\s+([^;]+);", body)
if not r: print(""); raise SystemExit
p=r.group(2).strip()
# при alias путь указывает прямо в папку challenge, при root — в корень сайта
if r.group(1)=="alias":
    p=re.sub(r"/\.well-known/acme-challenge/?$","",p)
print(p)
PY
)"

if [ -z "$WEB" ]; then
  echo "!!! не смог разобрать правило. Пришли мне вывод выше — подберу путь руками."
  exit 1
fi
echo "папка проверки: $WEB"

say "2/4 кладу пробный файл и смотрю снаружи"
mkdir -p "$WEB/.well-known/acme-challenge"
echo probe-$$ > "$WEB/.well-known/acme-challenge/probe"
GOT="$(curl -s -m 15 "http://$NEW/.well-known/acme-challenge/probe" || true)"
rm -f "$WEB/.well-known/acme-challenge/probe"
if [ "$GOT" != "probe-$$" ]; then
  echo "!!! файл не отдаётся (ответ: ${GOT:0:100})"
  echo "    Ничего не меняю. Сертификат действует, срочности нет."
  exit 1
fi
echo "виден снаружи — то, что нужно"

say "3/4 переключаю обновление сертификата на эту папку"
REN="/etc/letsencrypt/renewal/$NEW.conf"
[ -f "$REN" ] || { echo "!!! нет $REN"; exit 1; }
cp "$REN" "/root/renewal-backup-$(date +%F-%H%M%S).conf"
python3 - "$REN" "$WEB" "$NEW" <<'PY'
import re, sys
path, web, dom = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(path).read()
s = re.sub(r"^\s*authenticator\s*=.*\n", "", s, flags=re.M)
s = re.sub(r"^\s*webroot_path\s*=.*\n", "", s, flags=re.M)
s = re.sub(r"^\s*renew_hook\s*=.*\n", "", s, flags=re.M)
s = re.sub(r"\n\[\[webroot_map\]\][\s\S]*?(?=\n\[|\Z)", "", s)
if "[renewalparams]" not in s:
    s = s.rstrip() + "\n\n[renewalparams]\n"
s = s.replace("[renewalparams]",
    "[renewalparams]\n"
    "authenticator = webroot\n"
    "webroot_path = %s,\n"
    "renew_hook = systemctl reload nginx" % web, 1)
s = s.rstrip() + "\n\n[[webroot_map]]\n%s = %s\n" % (dom, web)
open(path, "w").write(s)
print("параметры переписаны")
PY

say "4/4 холостая проверка обновления"
if certbot renew --cert-name "$NEW" --dry-run; then
  echo ""
  echo "==================== ГОТОВО ===================="
  echo "Сертификат будет обновляться сам, без остановки сервера."
else
  echo ""
  echo "!!! холостая проверка не прошла — возвращаю прежние параметры"
  cp "$(ls -t /root/renewal-backup-*.conf | head -1)" "$REN"
  echo "Сертификат действует до декабря, время разобраться есть."
fi
