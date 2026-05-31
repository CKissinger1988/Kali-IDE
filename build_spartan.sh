#!/bin/bash
set -xe

# Load configuration
if [ -f .env ]; then
    source .env
    export ADMIN_PASS ISO_PATH OUTPUT_ISO
else
    echo "[!] Error: .env file not found."
    exit 1
fi

# Final check
if [ -z "$ADMIN_PASS" ]; then
    echo -e "[!] Error: ADMIN_PASS environment variable not set for build. Current user: $(whoami)"
    exit 1
fi

# Download ISO if not found
if [ ! -f "$ISO_PATH" ]; then
    echo "[*] Base ISO not found at $ISO_PATH. Downloading..."
    curl -L "https://mirrors.dotsrc.org/kali-images/kali-2026.1/kali-linux-2026.1-live-amd64.iso" -o "$ISO_PATH"
fi

# Paths
STAGING_DIR="/opt/kali_remaster_staging"
CHROOT_DIR="/opt/kali_chroot"

# Build Logic
echo "[*] Initializing build for SpartanAI..."

# Include build utilities
source lib/build_utils.sh
source lib/install_dependencies.sh
source lib/configure_user.sh

check_root
init_staging "$STAGING_DIR" "$CHROOT_DIR" "$ISO_PATH"
setup_mounts "$CHROOT_DIR"

trap 'teardown_mounts "$CHROOT_DIR" || true' EXIT

# Copy files
mkdir -p "$CHROOT_DIR/lib"
cp -r lib/* "$CHROOT_DIR/lib/"
mkdir -p "$CHROOT_DIR/opt/spartanai-command-center"
rsync -a --exclude='node_modules' --exclude='.git' spartanai-command-center/ "$CHROOT_DIR/opt/spartanai-command-center/"

# Chroot integration
cat <<CHROOT_EOF | chroot "$CHROOT_DIR"
set -xe
source /lib/install_dependencies.sh
source /lib/configure_user.sh
install_dependencies
configure_user "$ADMIN_USER" "$ADMIN_PASS"
cd /opt/spartanai-command-center/dashboard
npm install --silent
npm run build --silent
apt-get clean
rm -rf /var/lib/apt/lists/*
CHROOT_EOF

# Finalize
mksquashfs "$CHROOT_DIR" "$STAGING_DIR/live/filesystem.squashfs" -comp xz -e boot
xorriso -as mkisofs -iso-level 3 -full-iso9660-filenames -volid "SPARTANAI_OS" \
    -eltorito-boot isolinux/isolinux.bin -eltorito-catalog isolinux/boot.cat \
    -no-emul-boot -boot-load-size 4 -boot-info-table \
    -output "$OUTPUT_ISO" "$STAGING_DIR"

echo "[+] Build Complete: $OUTPUT_ISO"
