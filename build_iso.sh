#!/bin/bash
# =========================================================================
#  AI SUPREME - KALI ISO REMASTER V7 (CREDENTIALS EDITION)
# =========================================================================
# MANDATE: Absolute Sovereignty, AI-Driven Administration, and Offensive Readiness
# EXCLUSION: No Spartan Projects
# USER: Creator / @11646 (Passwordless Sudo)

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ISO_PATH="/mnt/c/GitHub/kali-linux-2026.1-live-amd64.iso"
STAGING_DIR="/opt/kali_remaster_staging"
CHROOT_DIR="/opt/kali_chroot"
OUTPUT_ISO="/mnt/c/GitHub/kali-linux-2026.1-ai-supreme.iso"
TOOLS_STAGING="/mnt/c/GitHub/ai_tools_staging"

# User Credentials
ADMIN_USER="Creator"
ADMIN_PASS="@11646"

echo -e "${CYAN}[*] Initiating AI Supreme Integration Protocol v7...${NC}"

# 1. Root Check
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[!] Error: This script must be run as root (sudo).${NC}"
    exit 1
fi

# 2. Resuming/Initializing Staging
if [ -d "$CHROOT_DIR/bin" ]; then
    echo -e "${YELLOW}[*] Staging area exists. Ensuring mounts...${NC}"
else
    echo -e "${YELLOW}[*] Staging area not found. Starting from scratch...${NC}"
    rm -rf "$STAGING_DIR" "$CHROOT_DIR"
    mkdir -p "$STAGING_DIR" "$CHROOT_DIR"
    xorriso -osirrox on -indev "$ISO_PATH" -extract / "$STAGING_DIR"
    unsquashfs -d "$CHROOT_DIR" "$STAGING_DIR/live/filesystem.squashfs"
fi

# 3. Mount virtual filesystems
mount --bind /proc "$CHROOT_DIR/proc" || true
mount --bind /sys "$CHROOT_DIR/sys" || true
mount --bind /dev "$CHROOT_DIR/dev" || true
mount --bind /dev/pts "$CHROOT_DIR/dev/pts" || true
cp /etc/resolv.conf "$CHROOT_DIR/etc/resolv.conf"

# 4. Installation Phase
echo -e "${YELLOW}[*] Entering Chroot for AI Tool Integration...${NC}"

cat <<CHROOT_EOF | chroot "$CHROOT_DIR"
set -e

# Fix sources.list
echo "deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware" > /etc/apt/sources.list
apt-get update

# Install Core Dependencies
apt-get install -y curl wget git nodejs npm python3-pip python3-venv libfuse2t64 desktop-file-utils firefox-esr libnss3 libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2t64 sudo

# --- USER CONFIGURATION ---
echo "[+] Creating admin user: $ADMIN_USER"
if ! id "$ADMIN_USER" &>/dev/null; then
    useradd -m -s /bin/bash -G sudo,video,render "$ADMIN_USER"
fi
echo "$ADMIN_USER:$ADMIN_PASS" | chpasswd

# --- PASSWORDLESS SUDO ---
echo "[+] Enabling passwordless sudo for $ADMIN_USER"
echo "$ADMIN_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/99-ai-supreme
chmod 0440 /etc/sudoers.d/99-ai-supreme

# --- OLLAMA & GEMMA ---
if ! command -v ollama >/dev/null; then
    echo "[+] Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
fi

# --- GEMINI-CLI ---
echo "[+] Installing Gemini-CLI..."
npm install -g @google/gemini-cli

# --- ANTIGRAVITY-CLI ---
echo "[+] Installing Antigravity-CLI (agy)..."
curl -fsSL https://antigravity.google/cli/install.sh | bash || echo "[!] Official agy install failed."

# --- CODE-SERVER (IDE) ---
if ! command -v code-server >/dev/null; then
    echo "[+] Installing code-server..."
    curl -fsSL https://code-server.dev/install.sh | sh
fi

# --- LM STUDIO ---
echo "[+] Integrating LM Studio..."
if [ ! -f "/usr/local/bin/lm-studio.AppImage" ]; then
    wget -O /usr/local/bin/lm-studio.AppImage https://releases.lmstudio.ai/linux/x64/latest/LM_Studio-latest.AppImage || echo "[!] LM Studio download failed"
    chmod +x /usr/local/bin/lm-studio.AppImage || true
fi

# --- SYSTEM ADMINISTRATOR CONFIGURATION ---
echo "[+] Configuring Gemma as System-Wide AI Administrator..."

# Service for Ollama
cat <<EOF > /etc/systemd/system/ollama.service
[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=root
Group=root
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
systemctl enable ollama || true

# Jarvis Command (Routes to Gemma)
cat <<EOF > /usr/local/bin/jarvis
#!/bin/bash
if [ -z "\\\$1" ]; then
    echo "Jarvis (Gemma): Awaiting orders..."
    exit 0
fi
ollama run gemma "\\\$*"
EOF
chmod +x /usr/local/bin/jarvis

# AI-Admin Command (Sudo with AI guidance)
cat <<EOF > /usr/local/bin/ai-admin
#!/bin/bash
ACTION="\\\$*"
echo "[AI-ADMIN] Consultative Action: \\\$ACTION"
REASONING=\\\$(jarvis "Should I execute '\\\$ACTION' on this Kali system? Provide a yes/no and brief risk assessment.")
echo "\\\$REASONING"
if [[ "\\\$REASONING" == *"yes"* ]] || [[ "\\\$REASONING" == *"Yes"* ]]; then
    sudo \\\$ACTION
else
    echo "[AI-ADMIN] Action aborted based on Gemma risk assessment."
fi
EOF
chmod +x /usr/local/bin/ai-admin

# MOTD
echo "--------------------------------------------------------" > /etc/motd
echo "Welcome to AI SUPREME - KALI EDITION" >> /etc/motd
echo "Status: OMNIPOTENT AI CORE ONLINE" >> /etc/motd
echo "User: $ADMIN_USER (Sovereign Administrator)" >> /etc/motd
echo "Administrator: Gemma (via 'jarvis')" >> /etc/motd
echo "--------------------------------------------------------" >> /etc/motd

CHROOT_EOF

# 5. Copy Local Tools (Cloned Repos)
echo -e "${YELLOW}[*] Deploying Local AI Tool Sources...${NC}"
mkdir -p "$CHROOT_DIR/opt/ai-supreme"
cp -r "$TOOLS_STAGING/hexstrike-ai" "$CHROOT_DIR/opt/ai-supreme/" || true
cp -r "$TOOLS_STAGING/gemini-cli" "$CHROOT_DIR/opt/ai-supreme/" || true
cp -r "$TOOLS_STAGING/lms" "$CHROOT_DIR/opt/ai-supreme/" || true
cp -r "$TOOLS_STAGING/gemini-desktop" "$CHROOT_DIR/opt/ai-supreme/" || true
cp -r "$TOOLS_STAGING/waveterm" "$CHROOT_DIR/opt/ai-supreme/" || true

# 6. Final Tool Setups (Python/NPM installs for local tools)
cat <<CHROOT_EOF | chroot "$CHROOT_DIR"
set -e
echo "[+] Installing HexStrike-AI dependencies..."
if [ -d "/opt/ai-supreme/hexstrike-ai" ]; then
    cd /opt/ai-supreme/hexstrike-ai && pip3 install -r requirements.txt --break-system-packages || true
fi

echo "[+] Setting up Antigravity Desktop Entry..."
mkdir -p /usr/share/applications
cat <<EOF > /usr/share/applications/antigravity-2.0.desktop
[Desktop Entry]
Name=Antigravity 2.0
Exec=/usr/bin/firefox http://localhost:8080
Icon=utilities-terminal
Type=Application
Categories=Development;Security;
EOF

echo "[+] Setting up IDE service..."
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
systemctl enable antigravity-ide || true

CHROOT_EOF

# 7. Cleanup Chroot
echo -e "${YELLOW}[*] Cleaning up chroot environment...${NC}"
umount "$CHROOT_DIR/proc" || true
umount "$CHROOT_DIR/sys" || true
umount "$CHROOT_DIR/dev/pts" || true
umount "$CHROOT_DIR/dev" || true
rm "$CHROOT_DIR/etc/resolv.conf" || true

# 8. Repack SquashFS
echo -e "${YELLOW}[*] Repacking SquashFS... (This may take a while)${NC}"
rm "$STAGING_DIR/live/filesystem.squashfs"
mksquashfs "$CHROOT_DIR" "$STAGING_DIR/live/filesystem.squashfs" -comp xz -e boot

# 9. Update MD5/Manifest
echo -e "${YELLOW}[*] Updating ISO manifest and checksums...${NC}"
(cd "$STAGING_DIR" && find . -type f -not -name 'md5sum.txt' -not -path './isolinux/*' -print0 | xargs -0 md5sum > md5sum.txt)

# 10. Rebuild ISO
echo -e "${YELLOW}[*] Compiling final AI Supreme Live USB ISO...${NC}"
xorriso -as mkisofs \
    -iso-level 3 \
    -full-iso9660-filenames \
    -volid "KALI_AI_SUPREME" \
    -eltorito-boot isolinux/isolinux.bin \
    -eltorito-catalog isolinux/boot.cat \
    -no-emul-boot -boot-load-size 4 -boot-info-table \
    -isohybrid-mbr /usr/lib/ISOLINUX/isohdpfx.bin \
    -output "$OUTPUT_ISO" \
    "$STAGING_DIR"

echo -e "${GREEN}[+] AI Supreme Integration COMPLETE.${NC}"
echo -e "${GREEN}[+] Final Live USB ISO created at: $OUTPUT_ISO${NC}"
echo -e "${CYAN}[*] Admin User: $ADMIN_USER / $ADMIN_PASS (NOPASSWD SUDO)${NC}"
