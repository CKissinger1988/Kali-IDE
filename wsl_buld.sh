#!/bin/bash
# build-spartan-os.sh
# Run this script as root inside a Kali Linux environment (or WSL Kali)

echo "[*] Initializing SpartanAI Kali OS Live Build Environment..."

# 1. Install prerequisites
apt-get update
apt-get install -y curl git live-build cdebootstrap devscripts

# 2. Setup Build Directory
BUILD_DIR="/opt/SpartanAI_Kali_OS_Build"
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

# 3. Initialize Live Build Config for Kali
lb config -d kali-rolling \
  --debian-installer live \
  --apt-indices false \
  --apt-recommends false \
  --archive-areas "main contrib non-free non-free-firmware" \
  --updates true \
  --iso-application "SpartanAI Kali OS" \
  --iso-publisher "SpartanAI" \
  --iso-volume "SpartanAI Live"

# 4. Integrate the Dashboard Project into the Live ISO Root File System
# This places your compiled React dashboard into the default user's directory on the live system.
OVERLAY_DIR="$BUILD_DIR/config/includes.chroot/etc/skel/SpartanAI_Dashboard"
mkdir -p "$OVERLAY_DIR"

# Assuming you copy the built dashboard to a staging area accessible by WSL (e.g., /mnt/c/GitHub/Kali IDE)
# Make sure you have run `npm run build` in the Windows project folder first.
if [ -d "/mnt/c/GitHub/Kali IDE/dashboard" ]; then
    echo "[*] Copying project files from Windows mount to Live RootFS..."
    cp -r "/mnt/c/GitHub/Kali IDE/"* "$OVERLAY_DIR/"
else
    echo "[!] Warning: Source directory not found. Please ensure files are mapped correctly."
fi

# 5. Create an autostart hook to serve the dashboard on boot
HOOK_DIR="$BUILD_DIR/config/hooks/live"
mkdir -p "$HOOK_DIR"
cat << 'EOF' > "$HOOK_DIR/99-spartan-dashboard.hook.chroot"
#!/bin/sh
# Install Node.js if not present and start the dashboard service
curl -fsSL <https://deb.nodesource.com/setup_20.x> | bash -
apt-get install -y nodejs
npm install -g serve
# Create a systemd service to start the dashboard on boot
cat << 'SVC' > /etc/systemd/system/spartan-dashboard.service
[Unit]
Description=SpartanAI OS Dashboard
After=network.target

[Service]
Type=simple
User=kali
WorkingDirectory=/etc/skel/SpartanAI_Dashboard/dashboard
ExecStart=/usr/bin/serve -s build -l 3000
Restart=on-failure

[Install]
WantedBy=multi-user.target
SVC

systemctl enable spartan-dashboard.service
EOF
chmod +x "$HOOK_DIR/99-spartan-dashboard.hook.chroot"

# 6. Include required Kali packages
echo "kali-linux-core kali-desktop-xfce nodejs" > "$BUILD_DIR/config/package-lists/spartan.list.chroot"

# 7. Build the ISO
echo "[*] Starting ISO generation. This will take a while..."
lb build

echo "[+] Build complete! Check $BUILD_DIR for the generated .iso file."
