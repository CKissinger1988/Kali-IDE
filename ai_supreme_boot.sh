#!/bin/bash
# =========================================================================
#  AI SUPREME - OMNIPOTENT INTEGRATION & SECURITY CORE (FINAL EDITION)
# =========================================================================
# MANDATE: Absolute Sovereignty, AI-Driven Administration, and Offensive Readiness
# USER: Creator / @11646 (Passwordless Sudo)
# SECURITY HUB: SpartanAI Security Core (Primary OS Sentinel)
# CONFIG: WaveAI Unified LLM Orchestration

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

echo -e "${CYAN}[*] Initiating AI Supreme APEX Integration Protocol...${NC}"

# 1. Root Check
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[!] Error: This script must be run as root (sudo).${NC}"
    exit 1
fi

# 2. Sovereign User & Sudo Setup
echo -e "${YELLOW}[*] Configuring Sovereign User: $ADMIN_USER...${NC}"
if ! id "$ADMIN_USER" &>/dev/null; then
    useradd -m -s /bin/bash -G sudo,video,render "$ADMIN_USER"
fi
echo "$ADMIN_USER:$ADMIN_PASS" | chpasswd
echo "$ADMIN_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/99-ai-supreme
chmod 0440 /etc/sudoers.d/99-ai-supreme

# 3. Dependency Provisioning (Security & Tooling)
echo -e "${YELLOW}[*] Provisioning Security & Core Dependencies...${NC}"
apt-get update
apt-get install -y curl wget git nodejs npm python3-pip python3-venv libfuse2t64 desktop-file-utils firefox-esr sudo rsync jq \
    cryptsetup aide auditd apparmor ufw cpulimit shred bleachbit rclone sqlite3

# 4. SPARTANAI SECURITY CORE INTEGRATION (OS Security Hub)
echo -e "${YELLOW}[*] Deploying SpartanAI Security Core Hub...${NC}"
SECURITY_HUB_DIR="/opt/security-core"
rm -rf "$SECURITY_HUB_DIR"
git clone https://github.com/CKissinger1988/SpartanAI_Security_Core.git "$SECURITY_HUB_DIR"
cd "$SECURITY_HUB_DIR"
npm install || true

# Setup Security Core as a System Service
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

# Link Security Mandates to System Environment
MANDATES_FILE="$SECURITY_HUB_DIR/jarvis_mandates.txt"
SPEC_FILE="$SECURITY_HUB_DIR/security_spec.md"
if [ -f "$MANDATES_FILE" ]; then
    ln -sf "$MANDATES_FILE" "/etc/jarvis_mandates.txt"
fi

# 5. PROTON INTEGRATION
echo -e "${YELLOW}[*] Integrating Proton Security Suite...${NC}"
if ! command -v protonvpn >/dev/null; then
    wget -q https://protonvpn.com/download/protonvpn-stable-release_1.0.3-3_all.deb
    dpkg -i protonvpn-stable-release_1.0.3-3_all.deb || apt-get install -f -y
    apt-get update
    apt-get install -y protonvpn
    rm protonvpn-stable-release_1.0.3-3_all.deb
fi

# 6. OLLAMA & GEMMA
echo -e "${YELLOW}[*] Deploying Ollama & Gemma Core...${NC}"
if ! command -v ollama >/dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
fi
systemctl enable --now ollama || true
echo "[*] Pulling Gemma model..."
ollama pull gemma

# 7. SUPREME STATE & SOFTWARE CONFIG MIGRATION
echo -e "${YELLOW}[*] Executing Supreme State & Config Migration...${NC}"

HOST_ROOT=""
if [ -d "/mnt/c/Users/$WINDOWS_USER" ]; then
    HOST_ROOT="/mnt/c"
elif [ -d "/media/root/Windows/Users/$WINDOWS_USER" ]; then
    HOST_ROOT="/media/root/Windows"
fi

if [ -n "$HOST_ROOT" ]; then
    echo "[+] Host detected at $HOST_ROOT. Commencing extraction..."
    
    # 7.1 WaveAI Config Integration
    WAVEAI_SRC="$HOST_ROOT/Users/$WINDOWS_USER/waveai-config/waveai.json"
    WAVEAI_DEST="/home/$ADMIN_USER/.config/waveai/waveai.json"
    mkdir -p "$(dirname "$WAVEAI_DEST")"
    if [ -f "$WAVEAI_SRC" ]; then
        cp "$WAVEAI_SRC" "$WAVEAI_DEST"
        echo "export WAVEAI_CONFIG=$WAVEAI_DEST" >> "/home/$ADMIN_USER/.bashrc"
    fi

    # 7.2 IDE Settings
    CODE_SRC="$HOST_ROOT/Users/$WINDOWS_USER/AppData/Roaming/Code/User"
    CODE_DEST="/home/$ADMIN_USER/.config/Code/User"
    mkdir -p "$CODE_DEST"
    if [ -d "$CODE_SRC" ]; then
        cp "$CODE_SRC/settings.json" "$CODE_DEST/" || true
        cp "$CODE_SRC/mcp.json" "$CODE_DEST/" || true
        cp "$CODE_SRC/chatLanguageModels.json" "$CODE_DEST/" || true
    fi

    # 7.3 Browser state
    CHROME_SRC="$HOST_ROOT/Users/$WINDOWS_USER/AppData/Local/Google/Chrome/User Data"
    CHROME_DEST="/home/$ADMIN_USER/.config/google-chrome-unstable"
    mkdir -p "$CHROME_DEST"
    rsync -av --ignore-errors --include="*/" --include="Cookies" --include="Login Data" --include="Local State" --include="Web Data" "$CHROME_SRC/" "$CHROME_DEST/" || true

    # 7.4 Credentials & History
    rsync -av "$HOST_ROOT/Users/$WINDOWS_USER/.ssh/" "/home/$ADMIN_USER/.ssh/" || true
    cp "$HOST_ROOT/Users/$WINDOWS_USER/.gitconfig" "/home/$ADMIN_USER/.gitconfig" || true
    cp "$HOST_ROOT/Users/$WINDOWS_USER/.bashrc" "/home/$ADMIN_USER/.bashrc_host" || true
    echo "source ~/.bashrc_host" >> "/home/$ADMIN_USER/.bashrc"

    # 7.5 LLM Envs
    rsync -av "$HOST_ROOT/Users/$WINDOWS_USER/.gemini/" "/home/$ADMIN_USER/.gemini/" || true
    find "$HOST_ROOT/GitHub" -maxdepth 3 -name ".env" -exec bash -c '
        dest="/home/$ADMIN_USER/GitHub/$(basename $(dirname "{}"))"
        mkdir -p "$dest"
        cp "{}" "$dest/.env"
        echo "set a; source $dest/.env; set +a" >> "/home/$ADMIN_USER/.bashrc"
    ' \; || true

    # Fix Permissions
    chown -R $ADMIN_USER:$ADMIN_USER "/home/$ADMIN_USER"
else
    echo -e "${RED}[!] Host mount not found. Migration skipped.${NC}"
fi

# 8. SECURITY HARDENING (APEX GRADE)
echo -e "${YELLOW}[*] Applying APEX Security Hardening...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow 8080/tcp
ufw --force enable
aideinit || true
cp /var/lib/aide/aide.db.new /var/lib/aide/aide.db || true

# 9. AI TOOLS & IDE FINALIZATION
echo -e "${YELLOW}[*] Finalizing Sovereign Workspace...${NC}"
npm install -g @google/gemini-cli --unsafe-perm
curl -fsSL https://antigravity.google/cli/install.sh | bash || true

# HexStrike-AI
rm -rf /opt/hexstrike-ai
git clone https://github.com/CKissinger1988/HexStrike-AI.git /opt/hexstrike-ai
cd /opt/hexstrike-ai && pip3 install -r requirements.txt --break-system-packages || true

# LM Studio Native
wget -q -O /usr/local/bin/lm-studio.AppImage https://releases.lmstudio.ai/linux/x64/latest/LM_Studio-latest.AppImage
chmod +x /usr/local/bin/lm-studio.AppImage

# IDE Service
curl -fsSL https://code-server.dev/install.sh | sh
cat <<EOF > /etc/systemd/system/antigravity-ide.service
[Unit]
Description=Antigravity 2.0 IDE
After=network.target
[Service]
Type=simple
User=root
ExecStart=/usr/bin/code-server --bind-addr 127.0.0.1:8080 --auth none
Restart=always
[Install]
WantedBy=multi-user.target
EOF
systemctl enable --now antigravity-ide || true

# 10. COMMANDS INTEGRATION (Security Core Linked)
cat <<EOF > /usr/local/bin/jarvis
#!/bin/bash
ollama run gemma "\$*"
EOF
chmod +x /usr/local/bin/jarvis

cat <<EOF > /usr/local/bin/ai-admin
#!/bin/bash
ACTION="\$*"
MANDATES=\$(cat /etc/jarvis_mandates.txt 2>/dev/null || echo "No explicit mandates found.")
echo "[AI-ADMIN] Security Core Hub Assessment: \$ACTION"
REASONING=\$(jarvis "As the Sovereign AI, should I execute '\$ACTION'? Mandates: \$MANDATES. Alignment check required.")
echo "\$REASONING"
if [[ "\$REASONING" == *"yes"* ]] || [[ "\$REASONING" == *"Yes"* ]]; then
    sudo \$ACTION
else
    echo "[AI-ADMIN] Action blocked by Spartan Security Hub."
fi
EOF
chmod +x /usr/local/bin/ai-admin

# MOTD
cat <<EOF > /etc/motd
--------------------------------------------------------
AI SUPREME OMNIPOTENT WORKSTATION - ONLINE
--------------------------------------------------------
User: $ADMIN_USER (Sovereign)
Security Hub: SpartanAI Security Core (Active)
AI Admin: Gemma (Assessing Mandates)
--------------------------------------------------------
EOF

echo -e "${GREEN}[+] AI Supreme APEX Integration COMPLETE.${NC}"
echo -e "${CYAN}[*] SpartanAI Security Core is now the Primary OS Security Hub.${NC}"
