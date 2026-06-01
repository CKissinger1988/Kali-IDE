#!/bin/bash
# =========================================================================
#  AI SUPREME - KALI ISO REMASTER V7 (MODULARIZED)
# =========================================================================

set -xe

# Source libraries
source lib/build_utils.sh
source lib/install_dependencies.sh
source lib/configure_user.sh

ISO_PATH="/mnt/c/GitHub/kali-linux-2026.1-live-amd64.iso"
STAGING_DIR="/opt/kali_remaster_staging"
CHROOT_DIR="/opt/kali_chroot"
OUTPUT_ISO="/mnt/d/kali-linux-2026.1-ai-supreme.iso"
TOOLS_STAGING="/mnt/c/GitHub/ai_tools_staging"

# User Credentials (injected via ENV)
ADMIN_USER="${ADMIN_USER:-Creator}"
if [ -z "$ADMIN_PASS" ]; then
    echo -e "\033[0;31m[!] Error: ADMIN_PASS environment variable not set for build.\033[0m"
    exit 1
fi

check_root

# 2. Resuming/Initializing Staging
if [ -d "$CHROOT_DIR/bin" ]; then
    echo -e "\033[1;33m[*] Staging area exists. Ensuring mounts...\033[0m"
else
    init_staging "$STAGING_DIR" "$CHROOT_DIR" "$ISO_PATH"
fi

setup_mounts "$CHROOT_DIR"

# Ensure mounts are safely torn down if the script fails or exits unexpectedly
trap 'echo -e "\033[1;33m[*] Cleaning up mounts...\033[0m"; teardown_mounts "$CHROOT_DIR" || true' EXIT ERR

# Copy libraries into chroot
mkdir -p "$CHROOT_DIR/lib"
cp -r lib/* "$CHROOT_DIR/lib/"

# Staging SpartanAI Command Center Frontend
echo "[*] Staging SpartanAI Command Center Frontend..."
mkdir -p "$CHROOT_DIR/opt/spartanai-command-center"
rsync -a --exclude='node_modules' --exclude='.git' spartanai-command-center/ "$CHROOT_DIR/opt/spartanai-command-center/"

# 4. Installation Phase
echo -e "\033[1;33m[*] Entering Chroot for AI Tool Integration...\033[0m"

cat <<CHROOT_EOF | chroot "$CHROOT_DIR"
set -xe

# Fix sources.list
echo "deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware" > /etc/apt/sources.list

# Load functions for chroot usage
source /lib/install_dependencies.sh
source /lib/configure_user.sh
source /lib/sovereign_core.sh

install_dependencies
configure_user "$ADMIN_USER" "$ADMIN_PASS"
install_ai_tools

# Building and Deploying SpartanAI Command Center
echo "[*] Building and Deploying SpartanAI Command Center..."
cd /opt/spartanai-command-center/dashboard
npm install --silent
npm run build --silent
# Assuming deploy_sovereign_core or a similar mechanism handles the final setup
# Add specific deployment commands here if needed

# 5. Purify Phase (Cleanup)
echo "[*] Purifying the Sovereign Core environment..."
rm -rf /opt/kali-ide/dashboard/node_modules
rm -rf /opt/kali-ide/dashboard/src
rm -rf /opt/kali-ide/src/**/*.ts # We use tsx but if we wanted to be ultra-clean we'd compile to JS
# For now, let's keep it simple and just remove obvious dev junk
apt-get clean
rm -rf /var/lib/apt/lists/*

CHROOT_EOF

# 8. Repack SquashFS
echo -e "\033[1;33m[*] Repacking SquashFS...\033[0m"
rm "$STAGING_DIR/live/filesystem.squashfs"
mksquashfs "$CHROOT_DIR" "$STAGING_DIR/live/filesystem.squashfs" -comp xz -e boot

# 9. Update MD5/Manifest
echo -e "\033[1;33m[*] Updating ISO manifest and checksums...\033[0m"
(cd "$STAGING_DIR" && find . -type f -not -name 'md5sum.txt' -not -path './isolinux/*' -print0 | xargs -0 md5sum > md5sum.txt)

# 10. Rebuild ISO
echo -e "\033[1;33m[*] Compiling final AI Supreme Live USB ISO...\033[0m"
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

echo -e "\033[0;32m[+] AI Supreme Integration COMPLETE.\033[0m"
echo -e "\033[0;32m[+] Final Live USB ISO created at: $OUTPUT_ISO\033[0m"
