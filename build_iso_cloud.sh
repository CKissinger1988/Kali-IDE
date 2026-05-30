#!/bin/bash
# =========================================================================
#  AI SUPREME - KALI ISO REMASTER (CLOUD BUILD VERSION)
# =========================================================================
set -e

# Configuration
ISO_URL="https://cdimage.kali.org/kali-2026.1/kali-linux-2026.1-live-amd64.iso"
ISO_NAME="kali-linux-2026.1-live-amd64.iso"
STAGING_DIR="/home/runner/staging"
CHROOT_DIR="/home/runner/chroot"
OUTPUT_ISO="kali-linux-2026.1-ai-supreme.iso"
TOOLS_SOURCE="/home/runner/work/ai-supreme-iso-builder/ai-supreme-iso-builder"

# User Credentials
ADMIN_USER="Creator"
ADMIN_PASS="@11646"

echo "[*] Downloading Kali ISO..."
curl -L -o "$ISO_NAME" "$ISO_URL"

echo "[*] Preparing staging areas..."
mkdir -p "$STAGING_DIR" "$CHROOT_DIR"

echo "[*] Extracting Kali ISO..."
xorriso -osirrox on -indev "$ISO_NAME" -extract / "$STAGING_DIR"

echo "[*] Unsquashing root filesystem..."
sudo unsquashfs -d "$CHROOT_DIR" "$STAGING_DIR/live/filesystem.squashfs"

echo "[*] Preparing Chroot..."
sudo mount --bind /proc "$CHROOT_DIR/proc"
sudo mount --bind /sys "$CHROOT_DIR/sys"
sudo mount --bind /dev "$CHROOT_DIR/dev"
sudo mount --bind /dev/pts "$CHROOT_DIR/dev/pts"
sudo cp /etc/resolv.conf "$CHROOT_DIR/etc/resolv.conf"

echo "[*] Entering Chroot for Installation..."
sudo chroot "$CHROOT_DIR" /bin/bash <<CHROOT_EOF
set -e
export DEBIAN_FRONTEND=noninteractive

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

# --- OLLAMA ---
echo "[+] Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

# --- GEMINI-CLI ---
echo "[+] Installing Gemini-CLI..."
npm install -g @google/gemini-cli

# --- ANTIGRAVITY-CLI ---
echo "[+] Installing Antigravity-CLI (agy)..."
curl -fsSL https://antigravity.google/cli/install.sh | bash || echo "[!] Official agy install failed."

# --- CODE-SERVER ---
echo "[+] Installing code-server..."
curl -fsSL https://code-server.dev/install.sh | sh

# --- LM STUDIO ---
echo "[+] Integrating LM Studio..."
wget -O /usr/local/bin/lm-studio.AppImage https://releases.lmstudio.ai/linux/x64/latest/LM_Studio-latest.AppImage
chmod +x /usr/local/bin/lm-studio.AppImage

# --- SYSTEM ADMINISTRATOR ---
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

# Jarvis Command
cat <<EOF > /usr/local/bin/jarvis
#!/bin/bash
if [ -z "\\\$1" ]; then
    echo "Jarvis (Gemma): Awaiting orders..."
    exit 0
fi
ollama run gemma "\\\$*"
EOF
chmod +x /usr/local/bin/jarvis

# MOTD
echo "Welcome to AI SUPREME - KALI EDITION" > /etc/motd
echo "User: $ADMIN_USER" >> /etc/motd

CHROOT_EOF

echo "[*] Deploying Local Tools..."
sudo mkdir -p "$CHROOT_DIR/opt/ai-supreme"
sudo cp -r "$TOOLS_SOURCE/hexstrike-ai" "$CHROOT_DIR/opt/ai-supreme/" || true
sudo cp -r "$TOOLS_SOURCE/gemini-cli" "$CHROOT_DIR/opt/ai-supreme/" || true
sudo cp -r "$TOOLS_SOURCE/lms" "$CHROOT_DIR/opt/ai-supreme/" || true
sudo cp -r "$TOOLS_SOURCE/gemini-desktop" "$CHROOT_DIR/opt/ai-supreme/" || true
sudo cp -r "$TOOLS_SOURCE/waveterm" "$CHROOT_DIR/opt/ai-supreme/" || true

echo "[*] Finalizing Tools in Chroot..."
sudo chroot "$CHROOT_DIR" /bin/bash <<CHROOT_EOF
set -e
if [ -d "/opt/ai-supreme/hexstrike-ai" ]; then
    cd /opt/ai-supreme/hexstrike-ai && pip3 install -r requirements.txt --break-system-packages || true
fi
# IDE Entry
mkdir -p /usr/share/applications
cat <<EOF > /usr/share/applications/antigravity-2.0.desktop
[Desktop Entry]
Name=Antigravity 2.0
Exec=/usr/bin/firefox http://localhost:8080
Icon=utilities-terminal
Type=Application
Categories=Development;Security;
EOF
CHROOT_EOF

echo "[*] Cleaning up Chroot..."
sudo umount "$CHROOT_DIR/proc" || true
sudo umount "$CHROOT_DIR/sys" || true
sudo umount "$CHROOT_DIR/dev/pts" || true
sudo umount "$CHROOT_DIR/dev" || true

echo "[*] Repacking SquashFS..."
sudo rm "$STAGING_DIR/live/filesystem.squashfs"
sudo mksquashfs "$CHROOT_DIR" "$STAGING_DIR/live/filesystem.squashfs" -comp xz -e boot

echo "[*] Updating checksums..."
(cd "$STAGING_DIR" && find . -type f -not -name 'md5sum.txt' -not -path './isolinux/*' -print0 | sudo xargs -0 md5sum | sudo tee md5sum.txt > /dev/null)

echo "[*] Compiling final ISO..."
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

echo "[+] Build Complete: $OUTPUT_ISO"
