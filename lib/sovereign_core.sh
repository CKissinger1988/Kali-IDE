#!/bin/bash
# lib/sovereign_core.sh - Deployment of the AI Supreme Sovereign Core

function deploy_sovereign_core() {
    local install_dir="/opt/kali-ide"
    echo "[*] Deploying AI Supreme Sovereign Core to $install_dir..."
    
    mkdir -p "$install_dir"
    
    # We copy the codebase from the current working directory (assuming this runs in chroot with tools mapped)
    # Or in the build script, we copy it BEFORE entering chroot.
    # For this function, let's assume it's already there.
    
    cd "$install_dir"
    
    echo "[*] Installing Orchestrator Dependencies..."
    npm install --silent
    npm run build --silent
    
    # We might need to copy the compiled dashboard dist if not already there
    # mkdir -p dashboard/dist
    # ...
    
    echo "[*] Configuring Sovereign Orchestrator Service..."
    cat <<EOF > /etc/systemd/system/kali-ide-orchestrator.service
[Unit]
Description=AI Supreme Sovereign Orchestrator
After=network.target tor.service
[Service]
Type=simple
User=root
WorkingDirectory=$install_dir
ExecStart=/usr/bin/env node dist/server.js
Restart=always
Environment=PORT=3002
Environment=MSF_RPC_URL=http://127.0.0.1:55553/api
Environment=MSF_USER=msf
Environment=MSF_PASS=msf
[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable kali-ide-orchestrator.service
    
    # Configure auto-start of the Sovereign Shell (Electron/Firefox)
    echo "[*] Configuring Sovereign Shell Autostart..."
    mkdir -p /etc/skel/.config/autostart
    cat <<EOF > /etc/skel/.config/autostart/sovereign-shell.desktop
[Desktop Entry]
Type=Application
Exec=firefox-esr --kiosk http://127.0.0.1:3002
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=Sovereign Shell
Comment=AI Supreme Offensive Dashboard
EOF

    # Apply to existing Creator user if exists
    if [ -d "/home/Creator" ]; then
        mkdir -p /home/Creator/.config/autostart
        cp /etc/skel/.config/autostart/sovereign-shell.desktop /home/Creator/.config/autostart/
        chown -R Creator:Creator /home/Creator/.config
    fi
}
