#!/bin/bash
# Пункт 2: резервный канал связи (TURN) на своём домене.
#
# TURN включается, когда прямое соединение не проходит — строгий вайфай в
# офисе, гостинице, у части мобильных операторов. Сейчас он представляется
# адресом asya-meet.duckdns.org: если у ученика этот домен режется, урок
# в такой сети не состоится вовсе.
#
# Переводим его на meet.english-with-asya.com и даём ему настоящий
# сертификат, а обновление сертификата учим обновлять и его копию.
#
#   rm m9.sh
#   wget english-with-asya.com/m9.sh
#   bash m9.sh
set -u
OLD=asya-meet.duckdns.org
NEW=meet.english-with-asya.com
LIVE=/etc/letsencrypt/live/$NEW

say(){ echo ""; echo "=== $* ==="; }

say "1/6 что сейчас настроено"
TS=/etc/turnserver.conf
[ -f "$TS" ] || { echo "!!! нет $TS — coturn не установлен, пункт не нужен"; exit 1; }
grep -E "^(realm|cert|pkey|listening-port|tls-listening-port)" "$TS" | sed 's/^/  /'
PROS="$(ls /etc/prosody/conf.avail/*.cfg.lua 2>/dev/null | head -5)"
echo "  конфиги prosody: $PROS"
grep -l "external_services\|turncredentials" $PROS 2>/dev/null | sed 's/^/  с турном: /'

say "2/6 кладу сертификат туда, где его увидит coturn"
mkdir -p /etc/coturn
cp "$LIVE/fullchain.pem" /etc/coturn/turn.crt
cp "$LIVE/privkey.pem"  /etc/coturn/turn.key
chown turnserver:turnserver /etc/coturn/turn.crt /etc/coturn/turn.key 2>/dev/null || true
chmod 640 /etc/coturn/turn.crt /etc/coturn/turn.key
ls -l /etc/coturn/turn.* | sed 's/^/  /'

say "3/6 переписываю turnserver.conf"
cp "$TS" "/root/turnserver-backup-$(date +%F-%H%M%S).conf"
sed -i "s#^realm=.*#realm=$NEW#" "$TS"
sed -i "s#^cert=.*#cert=/etc/coturn/turn.crt#" "$TS"
sed -i "s#^pkey=.*#pkey=/etc/coturn/turn.key#" "$TS"
grep -q "^realm=" "$TS" || echo "realm=$NEW" >> "$TS"
grep -E "^(realm|cert|pkey)" "$TS" | sed 's/^/  /'

say "4/6 говорю Jitsi объявлять новый адрес"
CH=0
for f in $PROS; do
  if grep -q "$OLD" "$f" && grep -qE "external_services|turncredentials" "$f"; then
    cp "$f" "/root/prosody-backup-$(basename "$f")-$(date +%F-%H%M%S)"
    # меняем адрес только в строках про stun/turn, остальное не трогаем
    python3 - "$f" "$OLD" "$NEW" <<'PY'
import re,sys
p,old,new=sys.argv[1],sys.argv[2],sys.argv[3]
s=open(p).read(); out=[]
for line in s.split("\n"):
    if re.search(r'type\s*=\s*"(stun|turn|turns)"', line) or re.search(r'turncredentials_host', line):
        line=line.replace(old,new)
    out.append(line)
open(p,"w").write("\n".join(out))
PY
    echo "  поправлен: $f"; CH=1
  fi
done
[ "$CH" = "1" ] || echo "  строк про turn с прежним адресом не нашлось — возможно, они в другом файле"

say "5/6 обновление сертификата будет обновлять и копию для coturn"
HOOK=/usr/local/bin/ewa-cert-hook.sh
cat > "$HOOK" <<EOF
#!/bin/bash
# обновляет копию сертификата для coturn и перезапускает службы
cp $LIVE/fullchain.pem /etc/coturn/turn.crt
cp $LIVE/privkey.pem  /etc/coturn/turn.key
chown turnserver:turnserver /etc/coturn/turn.crt /etc/coturn/turn.key 2>/dev/null || true
chmod 640 /etc/coturn/turn.crt /etc/coturn/turn.key
systemctl reload nginx
systemctl restart coturn 2>/dev/null || systemctl restart turnserver 2>/dev/null || true
EOF
chmod +x "$HOOK"
REN="/etc/letsencrypt/renewal/$NEW.conf"
sed -i "s#^renew_hook = .*#renew_hook = $HOOK#" "$REN"
grep -q "^renew_hook" "$REN" || sed -i "s#^\[renewalparams\]#[renewalparams]\nrenew_hook = $HOOK#" "$REN"
grep "renew_hook" "$REN" | sed 's/^/  /'

say "6/6 перезапуск"
systemctl restart coturn 2>/dev/null || systemctl restart turnserver 2>/dev/null || true
systemctl restart prosody jicofo jitsi-videobridge2 2>/dev/null || true
sleep 4
systemctl is-active coturn turnserver prosody jicofo jitsi-videobridge2 2>/dev/null | sed 's/^/  /'
CODE="$(curl -s -o /dev/null -w '%{http_code}' -m 20 "https://$NEW/" || true)"
echo ""
if [ "$CODE" = "200" ]; then
  echo "==================== ГОТОВО ===================="
  echo "Сайт отвечает. Теперь зайди в комнату урока и включи видео —"
  echo "я проверю снаружи, что резервный канал объявляется новым адресом."
else
  echo "!!! сайт отвечает $CODE — пришли мне вывод выше"
fi
