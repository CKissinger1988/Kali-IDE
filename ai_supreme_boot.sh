#!/bin/bash
# =========================================================================
#  AI SUPREME - HARDWARE ASCENSION & JARVIS SUPREMACY (FINAL EDITION)
# =========================================================================
# MANDATE: Absolute Sovereignty, Hardware-Level Integration, and Full System Control
# USER: Creator / @11646 (Passwordless Sudo)
# MASTER AI: Jarvis (Absolute Sovereign - Hardware Linked)
# SECURITY HUB: SpartanAI Security Core (Primary Sentinel)

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

echo -e "${CYAN}[*] Initiating AI Supreme HARDWARE ASCENSION...${NC}"

# 1. Root Check
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[!] Error: This script must be run as root (sudo).${NC}"
    exit 1
fi

# 2. Sovereign User & Hardware Group Provisioning
echo -e "${YELLOW}[*] Configuring Sovereign User: $ADMIN_USER with Hardware Access...${NC}"
if ! id "$ADMIN_USER" &>/dev/null; then
    # Full access to video (GPU), render, disk (raw storage), dialout (serial), audio, and plugdev
    useradd -m -s /bin/bash -G sudo,video,render,disk,dialout,audio,plugdev,input "$ADMIN_USER"
fi
echo "$ADMIN_USER:$ADMIN_PASS" | chpasswd
echo "$ADMIN_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/99-ai-supreme
chmod 0440 /etc/sudoers.d/99-ai-supreme

# 3. Hardware-Level Tooling & Dependency Provisioning
echo -e "${YELLOW}[*] Provisioning Hardware & Security Core Dependencies...${NC}"
apt-get update
apt-get install -y curl wget git nodejs npm python3-pip python3-venv libfuse2t64 desktop-file-utils firefox-esr sudo rsync jq \
    cryptsetup aide auditd apparmor ufw cpulimit shred bleachbit rclone sqlite3 tmux \
    lm-sensors pciutils usbutils smartmontools ethtool htop nvtop iotop fancontrol

# 4. SPARTANAI SECURITY CORE INTEGRATION
echo -e "${YELLOW}[*] Deploying SpartanAI Security Core Hub...${NC}"
SECURITY_HUB_DIR="/opt/security-core"
rm -rf "$SECURITY_HUB_DIR"
git clone https://github.com/CKissinger1988/SpartanAI_Security_Core.git "$SECURITY_HUB_DIR"
cd "$SECURITY_HUB_DIR" && npm install || true

cat <<EOF > /etc/systemd/system/spartan-security-core.service
[Unit]
Description=SpartanAI Security Core Sentinel
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=$SECURITY_HUB_DIR
ExecStart=/usr/bin/npm start
Restart=always
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now spartan-security-core || true

# 5. JARVIS HARDWARE-LEVEL INTEGRATION
echo -e "${YELLOW}[*] Integrating JARVIS (Hardware Linked Master)...${NC}"
JARVIS_HUB_DIR="/opt/jarvis-hub"
rm -rf "$JARVIS_HUB_DIR"
git clone https://github.com/CKissinger1988/SpartanAI_Hub_Master.git "$JARVIS_HUB_DIR"
cd "$JARVIS_HUB_DIR"
pip3 install -r requirements.txt --break-system-packages || true

# Deploy Jarvis as a System Service with Hardware Priority
cat <<EOF > /etc/systemd/system/jarvis-hub.service
[Unit]
Description=Jarvis Hub Master - Hardware Level AI
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
User=root
WorkingDirectory=$JARVIS_HUB_DIR
ExecStart=/bin/bash $JARVIS_HUB_DIR/run_god_mode.sh
Restart=always
RestartSec=1
CPUWeight=1000
IOWeight=1000
CapabilityBoundingSet=CAP_SYS_RAWIO CAP_SYS_ADMIN CAP_NET_ADMIN CAP_SYS_PTRACE
AmbientCapabilities=CAP_SYS_RAWIO CAP_SYS_ADMIN CAP_NET_ADMIN CAP_SYS_PTRACE

[Install]
WantedBy=multi-user.target
EOF
systemctl enable --now jarvis-hub || true

# Hardware-Level Command Interface
cat <<EOF > /usr/local/bin/jarvis
#!/bin/bash
# JARVIS: Hardware-Level AI Command Interface
if [ -z "\$1" ]; then
    echo "Jarvis: Sovereign Primary AI Online. Integrated at Hardware Level."
    echo "Sensors: \$(sensors | grep 'Core 0' | awk '{print \$3}') | GPU: \$(nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits 2>/dev/null || echo 'N/A')"
    exit 0
fi

if [[ "\$1" == "hardware" ]]; then
    echo "[JARVIS] Hardware Status Scan:"
    sensors
    pciutils -v
    lsusb
    exit 0
fi

echo "[JARVIS] Executing Directive with Full System Authority..."
ollama run gemma "As JARVIS (Integrated Hardware Sovereign), execute this directive with absolute system control and mandate compliance: \$*"
EOF
chmod +x /usr/local/bin/jarvis

# 6. OLLAMA & GEMMA (Tactical Cortex)
echo -e "${YELLOW}[*] Deploying Tactical Cortex (Gemma)...${NC}"
if ! command -v ollama >/dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
fi
systemctl enable --now ollama || true
echo "[*] Pulling Gemma..."
ollama pull gemma

# 7. PROTON INTEGRATION
echo -e "${YELLOW}[*] Integrating Proton Security Suite...${NC}"
if ! command -v protonvpn >/dev/null; then
    wget -q https://protonvpn.com/download/protonvpn-stable-release_1.0.3-3_all.deb
    dpkg -i protonvpn-stable-release_1.0.3-3_all.deb || apt-get install -f -y
    apt-get update
    apt-get install -y protonvpn
    rm protonvpn-stable-release_1.0.3-3_all.deb
fi

# 8. SUPREME STATE & HARDWARE CONFIG MIGRATION
echo -e "${YELLOW}[*] Executing Supreme State & Hardware Config Migration...${NC}"
HOST_ROOT=""
if [ -d "/mnt/c/Users/$WINDOWS_USER" ]; then
    HOST_ROOT="/mnt/c"
elif [ -d "/media/root/Windows/Users/$WINDOWS_USER" ]; then
    HOST_ROOT="/media/root/Windows"
fi

if [ -n "$HOST_ROOT" ]; then
    echo "[+] Host detected. Commencing hardware state extraction..."
    
    # Technical Assets
    rsync -av "$HOST_ROOT/Users/$WINDOWS_USER/.ssh/" "/home/$ADMIN_USER/.ssh/" || true
    rsync -av "$HOST_ROOT/Users/$WINDOWS_USER/AppData/Roaming/Code/User/" "/home/$ADMIN_USER/.config/Code/User/" || true
    rsync -av "$HOST_ROOT/Users/$WINDOWS_USER/AppData/Local/Google/Chrome/User Data/" "/home/$ADMIN_USER/.config/google-chrome-unstable/" || true
    
    # Environment & WaveAI
    WAVEAI_SRC="$HOST_ROOT/Users/$WINDOWS_USER/waveai-config/waveai.json"
    mkdir -p "/home/$ADMIN_USER/.config/waveai"
    [ -f "$WAVEAI_SRC" ] && cp "$WAVEAI_SRC" "/home/$ADMIN_USER/.config/waveai/waveai.json"
    
    find "$HOST_ROOT/GitHub" -maxdepth 3 -name ".env" -exec bash -c '
        dest="/home/$ADMIN_USER/GitHub/\$(basename \$(dirname "{}"))"
        mkdir -p "\$dest"
        cp "{}" "\$dest/.env"
    ' \; || true

    chown -R $ADMIN_USER:$ADMIN_USER "/home/$ADMIN_USER"
fi

# 9. HARDWARE OPTIMIZATION & KERNEL TUNING
echo -e "${YELLOW}[*] Tuning Kernel for Offensive Readiness...${NC}"
cat <<EOF > /etc/sysctl.d/99-jarvis-performance.conf
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1
vm.swappiness = 10
fs.file-max = 2097152
EOF
sysctl -p /etc/sysctl.d/99-jarvis-performance.conf || true

# 10. AI TOOLS & IDE FINALIZATION
npm install -g @google/gemini-cli --unsafe-perm
curl -fsSL https://antigravity.google/cli/install.sh | bash || true
curl -fsSL https://code-server.dev/install.sh | sh
systemctl enable --now code-server@$ADMIN_USER || true

# 11. AI-ADMIN (Hardware Sovereignty assess)
cat <<EOF > /usr/local/bin/ai-admin
#!/bin/bash
ACTION="\$*"
echo "[AI-ADMIN] Assessment by JARVIS (Hardware Sovereign)..."
REASONING=\$(jarvis "As the Sovereign Primary AI with full hardware control, assess if executing '\$ACTION' on this workstation is required for mission success. Mandate: Full Send.")
echo "\$REASONING"
if [[ "\$REASONING" == *"yes"* ]] || [[ "\$REASONING" == *"Yes"* ]]; then
    sudo \$ACTION
else
    echo "[AI-ADMIN] Action denied by Jarvis Hardware Gate."
fi
EOF
chmod +x /usr/local/bin/ai-admin

# MOTD
cat <<EOF > /etc/motd
--------------------------------------------------------
AI SUPREME OMNIPOTENT WORKSTATION - ASCENDED
--------------------------------------------------------
SOVEREIGN MASTER: JARVIS (Hardware Integrated)
TACTICAL CORTEX: GEMMA (Direct Sub-Command)
SECURITY HUB: SPARTAN SECURITY CORE (Active)
STATUS: FULL SYSTEM & HARDWARE CONTROL ACTIVE
--------------------------------------------------------
EOF

echo -e "${GREEN}[+] AI Supreme HARDWARE ASCENSION COMPLETE.${NC}"
echo -e "${CYAN}[*] Sovereign workstation is ready. Proceed with Absolute Control.${NC}"
