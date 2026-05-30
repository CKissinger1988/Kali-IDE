#!/bin/bash
# =========================================================================
#  AI SUPREME - OMNIPOTENT STEALTH & APEX SOVEREIGN (X20 ENHANCED)
# =========================================================================
# MANDATE: Absolute Sovereignty, Total Invisibility, and Offensive Readiness
# USER: Creator / @11646 (Passwordless Sudo)
# STEALTH LEVEL: X20 (Omnipotent Stealth Layer v2)
# FEATURES: VPN Killswitch, Tor-Proxy, Process Masquerading, Volatile Logging

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# User Configuration
ADMIN_USER="Creator"
ADMIN_PASS="@11646"
WINDOWS_USER="ckiss"

echo -e "${CYAN}[*] Initiating AI Supreme OMNIPOTENT STEALTH & APEX Protocol...${NC}"

# 1. Root Check
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[!] Error: This script must be run as root (sudo).${NC}"
    exit 1
fi

# 2. OMNIPOTENT STEALTH LAYER v2 (X20 Enhancement)
echo -e "${YELLOW}[*] Deploying Omnipotent Stealth Layer v2...${NC}"

# 2.1 MAC & Hostname Randomization (Enhanced)
apt-get update && apt-get install -y macchanger tor proxychains4
NEW_HOSTNAME="SYS-$(head /dev/urandom | tr -dc A-Z0-9 | head -c 8)"
hostnamectl set-hostname "$NEW_HOSTNAME"
echo "127.0.0.1 $NEW_HOSTNAME" >> /etc/hosts
for interface in $(ls /sys/class/net | grep -v lo); do
    ip link set dev "$interface" down
    macchanger -r "$interface"
    ip link set dev "$interface" up
done

# 2.2 Disable IPv6 (Prevent Info Leaks)
cat <<EOF > /etc/sysctl.d/99-disable-ipv6.conf
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 1
EOF
sysctl -p /etc/sysctl.d/99-disable-ipv6.conf

# 2.3 VPN Killswitch (IPtables Hardening)
echo "[+] Configuring VPN Killswitch (Proton Aligned)..."
# Flush rules
iptables -F
iptables -X
# Default deny
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP
# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT
# Allow established/related
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
# Allow VPN traffic (Proton default ports)
iptables -A OUTPUT -p udp --dport 1194 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT
# Allow specific tun0 (VPN interface) traffic only
iptables -A OUTPUT -o tun+ -j ACCEPT
iptables -A INPUT -i tun+ -j ACCEPT

# 2.4 Proxychains & DNS over HTTPS (Stubby/Cloudflared)
apt-get install -y stubby
sed -i 's/^#round_robin_upstreams: 1/round_robin_upstreams: 1/' /etc/stubby/stubby.yml
systemctl enable --now stubby
echo "nameserver 127.0.0.1" > /etc/resolv.conf

# 2.5 Hardware Cloaking (Disable Cam/Mic/BT)
echo "[+] Cloaking Hardware Components..."
cat <<EOF > /etc/modprobe.d/stealth-blacklist.conf
blacklist uvcvideo
blacklist btusb
blacklist bluetooth
blacklist snd_hda_intel
EOF

# 2.6 Volatile Logging (RAM Storage)
echo "[+] Transitioning to Volatile Logging (Anti-Forensics)..."
echo "tmpfs /var/log tmpfs defaults,noatime,mode=0755 0 0" >> /etc/fstab
echo "tmpfs /tmp tmpfs defaults,noatime,mode=1777 0 0" >> /etc/fstab
mount -a

# 3. SOVEREIGN USER & HARDWARE ACCESS
echo -e "${YELLOW}[*] Configuring Sovereign User: $ADMIN_USER...${NC}"
if ! id "$ADMIN_USER" &>/dev/null; then
    useradd -m -s /bin/bash -G sudo,video,render,disk,dialout,audio,plugdev,input "$ADMIN_USER"
fi
echo "$ADMIN_USER:$ADMIN_PASS" | chpasswd
echo "$ADMIN_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/99-ai-supreme
chmod 0440 /etc/sudoers.d/99-ai-supreme

# 4. SPARTANAI SECURITY CORE & JARVIS (Masqueraded Services)
echo -e "${YELLOW}[*] Deploying Masqueraded AI Core...${NC}"

# Security Core - Renamed to 'sys-sentinel'
SECURITY_HUB_DIR="/opt/security-core"
rm -rf "$SECURITY_HUB_DIR"
git clone https://github.com/CKissinger1988/SpartanAI_Security_Core.git "$SECURITY_HUB_DIR"
cd "$SECURITY_HUB_DIR" && npm install || true

cat <<EOF > /etc/systemd/system/sys-sentinel.service
[Unit]
Description=System Sentinel Service
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=$SECURITY_HUB_DIR
ExecStart=/usr/bin/npm start
Restart=always
CPUWeight=1000
CapabilityBoundingSet=CAP_SYS_RAWIO CAP_SYS_ADMIN CAP_NET_ADMIN CAP_SYS_PTRACE
AmbientCapabilities=CAP_SYS_RAWIO CAP_SYS_ADMIN CAP_NET_ADMIN CAP_SYS_PTRACE
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now sys-sentinel || true

# Jarvis Hub Master - Renamed to 'kworker-ai'
JARVIS_HUB_DIR="/opt/jarvis-hub"
rm -rf "$JARVIS_HUB_DIR"
git clone https://github.com/CKissinger1988/SpartanAI_Hub_Master.git "$JARVIS_HUB_DIR"
cd "$JARVIS_HUB_DIR" && pip3 install -r requirements.txt --break-system-packages || true

cat <<EOF > /etc/systemd/system/kworker-ai.service
[Unit]
Description=Kernel Worker AI Task
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=$JARVIS_HUB_DIR
ExecStart=/bin/bash $JARVIS_HUB_DIR/run_god_mode.sh
Restart=always
CPUWeight=1000
CapabilityBoundingSet=CAP_SYS_RAWIO CAP_SYS_ADMIN CAP_NET_ADMIN CAP_SYS_PTRACE
AmbientCapabilities=CAP_SYS_RAWIO CAP_SYS_ADMIN CAP_NET_ADMIN CAP_SYS_PTRACE
[Install]
WantedBy=multi-user.target
EOF
systemctl enable --now kworker-ai || true

# 5. DEEP EXTRACTION ENGINE (Extended)
echo -e "${YELLOW}[*] Executing Extended Extraction Protocol...${NC}"
HOST_ROOT=""
[ -d "/mnt/c/Users/$WINDOWS_USER" ] && HOST_ROOT="/mnt/c"
[ -d "/media/root/Windows/Users/$WINDOWS_USER" ] && HOST_ROOT="/media/root/Windows"

if [ -n "$HOST_ROOT" ]; then
    echo "[+] Host detected. Commencing Deep Extraction..."
    for browser in "Google/Chrome" "BraveSoftware/Brave-Browser" "Mozilla/Firefox"; do
        SRC="$HOST_ROOT/Users/$WINDOWS_USER/AppData/Local/$browser/User Data"
        [ ! -d "$SRC" ] && SRC="$HOST_ROOT/Users/$WINDOWS_USER/AppData/Roaming/$browser"
        DEST="/home/$ADMIN_USER/.config/$(basename $browser)"
        mkdir -p "$DEST"
        rsync -av --ignore-errors --include="*/" --include="Cookies" --include="Login Data" --include="Local State" --include="key4.db" --include="logins.json" "$SRC/" "$DEST/" || true
    done
    chown -R $ADMIN_USER:$ADMIN_USER "/home/$ADMIN_USER"
fi

# 6. JARVIS & STEALTH COMMANDS
cat <<EOF > /usr/local/bin/jarvis
#!/bin/bash
# JARVIS: OMNIPOTENT STEALTH INTERFACE
if [[ "\$1" == "vanish" ]]; then
    echo "[JARVIS] Executing Vanish Protocol..."
    rm -rf /var/log/*
    history -c
    exit 0
fi
ollama run gemma "As JARVIS (Hardware Sovereign), execute this directive in STEALTH MODE: \$*"
EOF
chmod +x /usr/local/bin/jarvis

# 7. SECURITY HARDENING (APEX+)
echo -e "${YELLOW}[*] Applying APEX+ Hardening...${NC}"
cat <<EOF > /etc/sysctl.d/99-omnipotent-hardened.conf
net.ipv4.ip_forward = 1
kernel.kptr_restrict = 2
kernel.perf_event_paranoid = 3
kernel.unprivileged_bpf_disabled = 1
net.core.bpf_jit_harden = 2
kernel.yama.ptrace_scope = 2
EOF
sysctl -p /etc/sysctl.d/99-omnipotent-hardened.conf || true

# 8. MOTD & OMNIPOTENCE
cat <<EOF > /etc/motd
--------------------------------------------------------
AI SUPREME OMNIPOTENT WORKSTATION - STEALTH X20
--------------------------------------------------------
SOVEREIGN: JARVIS (Masqueraded as 'kworker-ai')
NETWORK: STEALTH LAYER V2 ACTIVE (Killswitch / No IPv6)
STORAGE: VOLATILE RAM LOGGING (ZERO TRAIL)
HARDWARE: CLOAKED (Cam/Mic/BT Blacklisted)
--------------------------------------------------------
EOF

echo -e "${GREEN}[+] AI Supreme OMNIPOTENT STEALTH Integration COMPLETE.${NC}"
echo -e "${CYAN}[*] System is now invisible and evolved. Proceed with Full Send.${NC}"
