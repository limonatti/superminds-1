#!/bin/bash
# Установка Jitsi Meet для платформы English with Asya.
# Домен зашит внутри, параметров не требует:  bash install-jitsi.sh
set -u
DOM=asya-meet.duckdns.org
LOG=/var/log/jitsi-setup.log
exec > >(tee -a "$LOG") 2>&1
export DEBIAN_FRONTEND=noninteractive

say(){ echo ""; echo "=== $* ==="; }

say "1/8 имя сервера: $DOM"
hostnamectl set-hostname "$DOM"
grep -q " $DOM" /etc/hosts || echo "127.0.0.1 $DOM" >> /etc/hosts

say "2/8 базовые пакеты"
apt-get update -y
apt-get install -y gnupg2 curl ca-certificates lsb-release apt-transport-https ufw debconf-utils

say "3/8 порты"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 10000/udp
ufw --force enable
ufw status

say "4/8 репозиторий Jitsi"
curl -sL https://download.jitsi.org/jitsi-key.gpg.key | gpg --dearmor -o /usr/share/keyrings/jitsi-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/jitsi-keyring.gpg] https://download.jitsi.org stable/" > /etc/apt/sources.list.d/jitsi-stable.list
apt-get update -y

say "5/8 установка jitsi-meet (это дольше всего, 5-10 минут)"
echo "jitsi-videobridge jitsi-videobridge/jvb-hostname string $DOM" | debconf-set-selections
echo "jitsi-meet-web-config jitsi-meet/cert-choice select Generate a new self-signed certificate (You will later get a chance to obtain a Let'\''s Encrypt certificate)" | debconf-set-selections
apt-get install -y jitsi-meet
if ! dpkg -s jitsi-meet >/dev/null 2>&1; then
  echo "!!! jitsi-meet НЕ установился, смотри причину выше"
  exit 1
fi

say "6/8 проверка, что домен указывает на этот сервер"
MYIP="$(curl -s https://ipv4.icanhazip.com || true)"
RES="$(getent hosts "$DOM" | awk '{print $1}' | head -1 || true)"
echo "сервер: $MYIP   домен: $RES"
if [ -n "$MYIP" ] && [ "$MYIP" != "$RES" ]; then
  echo "!!! домен пока указывает не сюда, сертификат не выпустится"
  exit 1
fi

say "7/8 сертификат Let's Encrypt"
echo ""
echo ">>> СЕЙЧАС ПОПРОСИТ EMAIL. Впиши свой адрес и нажми Enter."
echo ""
/usr/share/jitsi-meet/scripts/install-letsencrypt-cert.sh

say "8/8 разрешаем встраивание в комнату урока"
CONF="/etc/nginx/sites-available/$DOM.conf"
[ -f "$CONF" ] && sed -i '/X-Frame-Options/d' "$CONF"
nginx -t && systemctl reload nginx
systemctl restart jitsi-videobridge2 prosody jicofo nginx 2>/dev/null || true

echo ""
echo "==================== ГОТОВО ===================="
echo "Открывай https://$DOM"
