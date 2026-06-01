#!/bin/bash
# =========================================================================
#  AI SUPREME - OMNIPOTENT CLOUD ISO FOUNDRY (X200 STEALTH)
# =========================================================================
set -e

# Configuration
ISO_NAME="kali-linux-latest.iso"
STAGING_DIR="/home/runner/staging"
CHROOT_DIR="/home/runner/chroot"
OUTPUT_ISO="kali-linux-2026.1-ai-supreme.iso"
TOOLS_SOURCE="/home/runner/work/Kali-IDE/Kali-IDE"

# Load Environment Variables if present
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# User Credentials
ADMIN_USER="${ADMIN_USER:-Creator}"
if [ -z "$ADMIN_PASS" ]; then
    echo -e "\033[0;31m[!] Error: ADMIN_PASS environment variable not set for cloud build.\033[0m"
    exit 1
fi

echo "[*] Downloading Kali ISO (High-Speed Multi-Connection)..."
BASE_URLS=(
    "https://mirrors.dotsrc.org/kali-images/kali-2026.1/"
    "https://mirror.us.leaseweb.net/kali-images/kali-2026.1/"
    "https://kali.mirror.garr.it/kali-images/kali-2026.1/"
    "https://mirrors.netix.net/kali-images/kali-2026.1/"
)
FILENAMES=("kali-linux-2026.1-live-amd64.iso" "kali-linux-2026.1-installer-amd64.iso")

DOWNLOADED=false
for base in "${BASE_URLS[@]}"; do
    for name in "${FILENAMES[@]}"; do
        FULL_URL="${base}${name}"
        echo "[*] Probing: $FULL_URL"
        if curl --output /dev/null --silent --head --fail "$FULL_URL"; then
            echo "[+] Found! Initiating multi-connection download..."
            if aria2c -x 16 -s 16 -j 16 --allow-overwrite=true --auto-file-renaming=false "$FULL_URL" -o "$ISO_NAME"; then
                if [ -s "$ISO_NAME" ]; then DOWNLOADED=true; break 2; fi
            fi
        fi
    done
done

if [ "$DOWNLOADED" = false ]; then echo "[!] Critical Error: Could not retrieve Kali ISO base."; exit 1; fi

echo "[*] Extracting Kali ISO..."
mkdir -p "$STAGING_DIR" "$CHROOT_DIR"
xorriso -osirrox on -indev "$ISO_NAME" -extract / "$STAGING_DIR"

echo "[*] Unsquashing root filesystem..."
SQUASH_PATH=$(find "$STAGING_DIR" -name "*.squashfs" | head -n 1)
sudo unsquashfs -d "$CHROOT_DIR" "$SQUASH_PATH"

echo "[*] Preparing Chroot..."
sudo mount --bind /proc "$CHROOT_DIR/proc"
sudo mount --bind /sys "$CHROOT_DIR/sys"
sudo mount --bind /dev "$CHROOT_DIR/dev"
sudo mount --bind /dev/pts "$CHROOT_DIR/dev/pts"
sudo cp /etc/resolv.conf "$CHROOT_DIR/etc/resolv.conf"

echo "[*] Entering Chroot for OMNIPOTENT Installation..."
sudo chroot "$CHROOT_DIR" /bin/bash <<CHROOT_EOF
set -e
export DEBIAN_FRONTEND=noninteractive

# Fix sources.list
echo "deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware" > /etc/apt/sources.list
apt-get update

# Install Core Dependencies
apt-get install -y curl wget git nodejs npm python3-pip python3-venv libfuse2t64 desktop-file-utils firefox-esr sudo rsync jq cryptsetup aide auditd apparmor ufw cpulimit shred bleachbit rclone sqlite3 tmux lm-sensors pciutils usbutils smartmontools ethtool htop nvtop iotop fancontrol macchanger tor proxychains4 secure-delete zram-tools

# --- USER CONFIGURATION ---
useradd -m -s /bin/bash -G sudo,video,render,disk,dialout,audio,plugdev,input "$ADMIN_USER" || true
echo "$ADMIN_USER:$ADMIN_PASS" | chpasswd
echo "$ADMIN_USER ALL=(ALL) NOPASSWD: /usr/bin/hostnamectl, /usr/sbin/ip, /usr/bin/macchanger, /usr/sbin/macchanger, /usr/bin/systemctl, /usr/bin/sdmem, /usr/bin/mount, /usr/bin/umount, /usr/sbin/chroot" > /etc/sudoers.d/99-ai-supreme
chmod 0440 /etc/sudoers.d/99-ai-supreme

# --- OLLAMA & GEMMA ---
curl -fsSL https://ollama.com/install.sh | sh
systemctl enable ollama || true

# --- SOFTWARE SUITE ---
# Chrome Dev
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
apt-get update && apt-get install -y google-chrome-unstable
# code-server
curl -fsSL https://code-server.dev/install.sh | sh
# ProtonVPN
wget -q https://protonvpn.com/download/protonvpn-stable-release_1.0.3-3_all.deb
dpkg -i protonvpn-stable-release_1.0.3-3_all.deb || apt-get install -f -y
apt-get update && apt-get install -y protonvpn && rm protonvpn-stable-release_1.0.3-3_all.deb

# --- STEALTH LAYER V4 (X200) CONFIG ---
# Identity Rotation
cat <<EOF > /usr/local/bin/ai-supreme-identity-rotate
#!/bin/bash
NEW_HOSTNAME="SYS-\\\$(head /dev/urandom | tr -dc A-Z0-9 | head -c 12)"
hostnamectl set-hostname "\\\$NEW_HOSTNAME"
for interface in \\\$(ls /sys/class/net | grep -v lo); do
    ip link set dev "\\\$interface" down
    macchanger -r "\\\$interface"
    ip link set dev "\\\$interface" up
done
EOF
chmod +x /usr/local/bin/ai-supreme-identity-rotate

cat <<EOF > /etc/systemd/system/ai-supreme-identity-rotate.service
[Unit]
Description=AI Supreme Identity Rotation
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/ai-supreme-identity-rotate
EOF

cat <<EOF > /etc/systemd/system/ai-supreme-identity-rotate.timer
[Unit]
Description=Run AI Supreme Identity Rotation every 10 minutes

[Timer]
OnBootSec=1m
OnUnitActiveSec=10m

[Install]
WantedBy=timers.target
EOF

systemctl enable ai-supreme-identity-rotate.timer

# System AI Commands
cat <<EOF > /usr/local/bin/jarvis
#!/bin/bash

# Route AI commands to the external remote SpartanAI_Hub_Master or fallback
SPARTAN_AI_HOST="\\\${SPARTAN_AI_HOST:-${EXTERNAL_SPARTAN_SERVER:-127.0.0.1:11434}}"
export OLLAMA_HOST="\\\$SPARTAN_AI_HOST"

if [[ "\\\$1" == "vanish" ]]; then
    sdmem -f -v
    rm -rf /var/log/*
    history -c
    exit 0
fi
ollama run gemma "As JARVIS (Integrated Hardware Sovereign), execute this directive: \\\$*"
EOF
chmod +x /usr/local/bin/jarvis

# Spartan AI Hub Live Sync Script
cat <<EOF > /usr/local/bin/spartan-sync
#!/bin/bash
SERVER_URL="\\\${SPARTAN_UPDATE_SERVER:-${EXTERNAL_SPARTAN_SERVER:-https://127.0.0.1:8080}}"
CERT_ARGS=""

if [ -f "/etc/ai-supreme/certs/spartan-mtls.pem" ]; then
    echo "[*] mTLS Zero-Trust Identity Found. Applying cryptographic signature..."
    CERT_ARGS="--certificate=/etc/ai-supreme/certs/spartan-mtls.pem --private-key=/etc/ai-supreme/certs/spartan-mtls.key"
fi

echo "[*] Fetching latest Spartan AI Hub package from \\\$SERVER_URL..."
wget -q --show-progress \\\$CERT_ARGS "\\\$SERVER_URL/spartan-ai-hub.deb" -O /tmp/spartan.deb || { echo "[!] Secure download failed! Verify mTLS certificates and Mesh state."; exit 1; }
echo "[*] Installing updates..."
sudo apt-get install -y /tmp/spartan.deb
echo "[+] Sync Complete! Spartan AI Hub is up to date."
EOF
chmod +x /usr/local/bin/spartan-sync

# MOTD
echo "AI SUPREME OMNIPOTENT WORKSTATION - ASCENDED" > /etc/motd
echo "User: $ADMIN_USER" >> /etc/motd

CHROOT_EOF

echo "[*] Cleaning up Chroot..."
sudo umount "$CHROOT_DIR/proc" || true
sudo umount "$CHROOT_DIR/sys" || true
sudo umount "$CHROOT_DIR/dev/pts" || true
sudo umount "$CHROOT_DIR/dev" || true

echo "[*] Repacking SquashFS..."
sudo rm "$STAGING_DIR/live/filesystem.squashfs" || true
sudo rm "$STAGING_DIR/install/filesystem.squashfs" || true
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
