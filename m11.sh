#!/bin/bash
# Пункт 2, по-настоящему: ставим TURN-сервер.
#
# Выяснилось, что coturn на сервере нет совсем, но Jitsi объявляет ученикам
# его адрес. Браузер ученика ломится в пустоту и ждёт таймаута — лишние
# секунды при входе, а в строгих сетях связь не встаёт вовсе.
#
# Ставим coturn, привязываем к нашему домену и сертификату, включаем в Jitsi.
#
#   rm m11.sh
#   wget english-with-asya.com/m11.sh
#   bash m11.sh
set -u
OLD=asya-meet.duckdns.org
NEW=meet.english-with-asya.com
LIVE=/etc/letsencrypt/live/$NEW

say(){ echo ""; echo "=== $* ==="; }

say "1/7 беру секрет, которым Jitsi подписывает доступ к TURN"
PROS_FILES="$(ls /etc/prosody/conf.avail/*.cfg.lua /etc/prosody/conf.d/*.cfg.lua 2>/dev/null)"
SECRET="$(grep -rhoP '(external_service_secret|turncredentials_secret)\s*=\s*"\K[^"]+' $PROS_FILES 2>/dev/null | head -1 || true)"
if [ -z "$SECRET" ]; then
  SECRET="$(openssl rand -hex 24)"
  echo "секрета не было — сгенерировал новый, пропишу его и в prosody"
  NEED_SECRET=1
else
  echo "секрет найден в настройках Jitsi (показывать не буду)"
  NEED_SECRET=0
fi

say "2/7 ставлю coturn"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y >/dev/null 2>&1
apt-get install -y coturn >/dev/null 2>&1
dpkg -s coturn >/dev/null 2>&1 || { echo "!!! coturn не установился"; exit 1; }
echo "установлен"

say "3/7 сертификат для TURN"
mkdir -p /etc/coturn
cp "$LIVE/fullchain.pem" /etc/coturn/turn.crt
cp "$LIVE/privkey.pem"  /etc/coturn/turn.key
chown turnserver:turnserver /etc/coturn/turn.crt /etc/coturn/turn.key 2>/dev/null || true
chmod 640 /etc/coturn/turn.crt /etc/coturn/turn.key

say "4/7 настройки coturn"
[ -f /etc/turnserver.conf ] && cp /etc/turnserver.conf "/root/turnserver-backup-$(date +%F-%H%M%S).conf"
cat > /etc/turnserver.conf <<EOF
# TURN для уроков English with Asya. Пускает только по подписи от Jitsi.
listening-port=3478
tls-listening-port=5349
fingerprint
use-auth-secret
static-auth-secret=$SECRET
realm=$NEW
cert=/etc/coturn/turn.crt
pkey=/etc/coturn/turn.key
# запрет ходить во внутреннюю сеть — чтобы сервер нельзя было использовать
# как дырку в чужие ресурсы
no-multicast-peers
denied-peer-ip=0.0.0.0-0.255.255.255
denied-peer-ip=10.0.0.0-10.255.255.255
denied-peer-ip=127.0.0.0-127.255.255.255
denied-peer-ip=169.254.0.0-169.254.255.255
denied-peer-ip=172.16.0.0-172.31.255.255
denied-peer-ip=192.168.0.0-192.168.255.255
no-cli
no-tlsv1
no-tlsv1_1
syslog
EOF
sed -i 's/^#\?TURNSERVER_ENABLED=.*/TURNSERVER_ENABLED=1/' /etc/default/coturn 2>/dev/null || echo "TURNSERVER_ENABLED=1" > /etc/default/coturn
echo "готово"

say "5/7 порты"
ufw allow 3478/udp >/dev/null 2>&1; ufw allow 3478/tcp >/dev/null 2>&1
ufw allow 5349/udp >/dev/null 2>&1; ufw allow 5349/tcp >/dev/null 2>&1
ufw status 2>/dev/null | grep -E "3478|5349|10000" | sed 's/^/  /'

say "6/7 говорю Jitsi объявлять новый адрес"
for f in $PROS_FILES; do
  if grep -qE "external_services|turncredentials" "$f"; then
    cp "$f" "/root/prosody-backup-$(basename "$f")-$(date +%F-%H%M%S)"
    python3 - "$f" "$OLD" "$NEW" <<'PY'
import re,sys
p,old,new=sys.argv[1],sys.argv[2],sys.argv[3]
out=[]
for line in open(p).read().split("\n"):
    if re.search(r'type\s*=\s*"(stun|turn|turns)"', line) or "turncredentials_host" in line:
        line=line.replace(old,new)
    out.append(line)
open(p,"w").write("\n".join(out))
PY
    echo "  поправлен: $f"
  fi
done
if [ "$NEED_SECRET" = "1" ]; then
  MAIN="$(grep -l "external_services\|VirtualHost \"$OLD\"" $PROS_FILES | head -1)"
  grep -q "external_service_secret" "$MAIN" || \
    sed -i "0,/VirtualHost/s//external_service_secret = \"$SECRET\";\nVirtualHost/" "$MAIN"
  echo "  секрет прописан в $MAIN"
fi

say "7/7 обновление сертификата будет обновлять и копию для TURN"
HOOK=/usr/local/bin/ewa-cert-hook.sh
cat > "$HOOK" <<EOF
#!/bin/bash
cp $LIVE/fullchain.pem /etc/coturn/turn.crt
cp $LIVE/privkey.pem  /etc/coturn/turn.key
chown turnserver:turnserver /etc/coturn/turn.crt /etc/coturn/turn.key 2>/dev/null || true
chmod 640 /etc/coturn/turn.crt /etc/coturn/turn.key
systemctl reload nginx
systemctl restart coturn 2>/dev/null || true
EOF
chmod +x "$HOOK"
REN="/etc/letsencrypt/renewal/$NEW.conf"
sed -i "s#^renew_hook = .*#renew_hook = $HOOK#" "$REN" 2>/dev/null || true

systemctl enable coturn >/dev/null 2>&1
systemctl restart coturn
systemctl restart prosody jicofo jitsi-videobridge2 2>/dev/null || true
sleep 4

echo ""
echo "--- состояние служб ---"
systemctl is-active coturn prosody jicofo jitsi-videobridge2 | sed 's/^/  /'
echo "--- слушает порты ---"
ss -lnup 2>/dev/null | grep -E "3478|5349" | sed 's/^/  /'
ss -lntp 2>/dev/null | grep -E "3478|5349" | sed 's/^/  /'
CODE="$(curl -s -o /dev/null -w '%{http_code}' -m 20 "https://$NEW/" || true)"
echo ""
if [ "$CODE" = "200" ] && systemctl is-active --quiet coturn; then
  echo "==================== ГОТОВО ===================="
  echo "TURN работает на $NEW. Открой комнату и включи видео —"
  echo "я проверю снаружи, что он объявляется и отвечает."
else
  echo "!!! сайт: $CODE, coturn: $(systemctl is-active coturn) — пришли вывод выше"
fi
