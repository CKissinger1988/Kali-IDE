#!/bin/bash
# lib/ai_cores.sh - Deployment of Masqueraded AI Cores

function deploy_security_core() {
    local workspace_dir="${1:-/opt/supreme-volatile}"
    local security_dir="$workspace_dir/security-core"
    
    echo "[*] Deploying Security Core (Masqueraded as systemd-udevd)..."
    git clone https://github.com/CKissinger1988/SpartanAI_Security_Core.git "$security_dir"
    cd "$security_dir" && npm install || true

    cat <<EOF > /etc/systemd/system/systemd-udevd-aux.service
[Unit]
Description=Sovereign Sentinel Sub-Task
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=$security_dir
ExecStart=/usr/bin/npm start
Restart=always
CapabilityBoundingSet=CAP_SYS_RAWIO CAP_SYS_ADMIN CAP_NET_ADMIN
AmbientCapabilities=CAP_SYS_RAWIO CAP_SYS_ADMIN CAP_NET_ADMIN
[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable --now systemd-udevd-aux
    
    local sec_pid=$(systemctl show -p MainPID systemd-udevd-aux | cut -d'=' -f2)
    echo "$sec_pid"
}

function deploy_jarvis_hub() {
    local workspace_dir="${1:-/opt/supreme-volatile}"
    local jarvis_dir="$workspace_dir/jarvis-hub"
    
    echo "[*] Deploying Jarvis Hub Master (Masqueraded as kworker/u12:0)..."
    git clone https://github.com/CKissinger1988/SpartanAI_Hub_Master.git "$jarvis_dir"
    cd "$jarvis_dir" && pip3 install -r requirements.txt --break-system-packages || true

    cat <<EOF > /etc/systemd/system/kworker-helper.service
[Unit]
Description=Kernel Worker AI Process
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=$jarvis_dir
ExecStart=/bin/bash $jarvis_dir/run_god_mode.sh
Restart=always
CapabilityBoundingSet=CAP_SYS_RAWIO CAP_SYS_ADMIN CAP_NET_ADMIN
AmbientCapabilities=CAP_SYS_RAWIO CAP_SYS_ADMIN CAP_NET_ADMIN
[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable --now kworker-helper
    
    local hub_pid=$(systemctl show -p MainPID kworker-helper | cut -d'=' -f2)
    echo "$hub_pid"
}
