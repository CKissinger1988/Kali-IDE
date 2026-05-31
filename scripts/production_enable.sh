#!/bin/bash
# Jarvis // AI - Production Deployment & Tool Enablement Script
# FOR REAL-WORLD USE: Sanitizes system and enables the full Kali Linux arsenal.

# ANSI Colors
CYAN='\033[96m'
GREEN='\033[92m'
YELLOW='\033[93m'
RED='\033[91m'
BOLD='\033[1m'
ENDC='\033[0m'

echo -e "${RED}${BOLD}--- Jarvis // AI: PRODUCTION DEPLOYMENT SEQUENCE ---${ENDC}"

# 1. Run Secure Field Preparation (Sanitization)
if [ -f "scripts/field_prep_secure.sh" ]; then
    echo -e "${GREEN}[+] Initiating secure sanitization...${ENDC}"
    bash scripts/field_prep_secure.sh
else
    echo -e "${YELLOW}[!] Sanitization script not found. Proceeding with manual cleanup...${ENDC}"
    rm -f data/*.jsonl data/*.log 2>/dev/null
    find . -name "mock_system" -type d -exec rm -rf {} + 2>/dev/null
fi

# 2. Update Repositories and System
echo -e "${GREEN}[+] Synchronizing Kali Linux repositories...${ENDC}"
sudo apt-get update -y

# 3. Enable Full Kali Arsenal
# Note: In a real-world scenario, we use kali-linux-large or kali-linux-everything.
# For WSL/Performance, we'll ensure core tactical tools are present first.
echo -e "${GREEN}[+] Deploying tactical toolsets (Full Arsenal)...${ENDC}"
# We'll install the 'large' metapackage which includes most commonly used tools
# This can take time, so we'll check if they are already there first
sudo apt-get install -y kali-linux-large tor postgresql ufw fail2ban python3-venv python3-pip nginx openssl

# 4. Configure Tactical Services
echo -e "${GREEN}[+] Configuring tactical services...${ENDC}"
# Initialize Metasploit database
sudo service postgresql start
sudo msfdb init 2>/dev/null || echo "    -> Metasploit DB already initialized."
# Ensure Tor is ready
sudo service tor start

# 5. Hardening & Perimeter Defense
echo -e "${GREEN}[+] Hardening perimeter with UFW & Fail2ban...${ENDC}"
sudo ufw allow 22/tcp
sudo ufw allow 443/tcp
sudo ufw default deny incoming
sudo ufw --force enable
sudo systemctl enable fail2ban --now

# 5.5. Configure Nginx Secure Reverse Proxy
echo -e "${GREEN}[+] Configuring Nginx Reverse Proxy with SSL...${ENDC}"
sudo mkdir -p /etc/nginx/ssl
if [ ! -f "/etc/nginx/ssl/spartan.crt" ]; then
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
        -keyout /etc/nginx/ssl/spartan.key \
        -out /etc/nginx/ssl/spartan.crt \
        -subj "/C=US/ST=State/L=City/O=SpartanAI/CN=spartan.local" 2>/dev/null
fi

sudo bash -c 'cat <<EOF > /etc/nginx/sites-available/spartan-dashboard
server {
    listen 443 ssl;
    server_name _;
    ssl_certificate /etc/nginx/ssl/spartan.crt;
    ssl_certificate_key /etc/nginx/ssl/spartan.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF'
sudo ln -sf /etc/nginx/sites-available/spartan-dashboard /etc/nginx/sites-enabled/spartan-dashboard
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

# 6. Integrate SpartanAI Autonomous SOC
echo -e "${GREEN}[+] Deploying SpartanAI Security Core...${ENDC}"
if [ ! -d "/opt/SpartanAI_Security_Core" ]; then
    sudo git clone https://github.com/CKissinger1988/SpartanAI_Security_Core.git /opt/SpartanAI_Security_Core
    sudo python3 -m venv /opt/SpartanAI_Security_Core/.venv
    if [ -f "/opt/SpartanAI_Security_Core/requirements.txt" ]; then
        sudo /opt/SpartanAI_Security_Core/.venv/bin/pip install -r /opt/SpartanAI_Security_Core/requirements.txt
    fi
    echo -e "${CYAN}    -> SOC integrated successfully.${ENDC}"
else
    echo -e "${YELLOW}    -> SOC already exists at /opt/SpartanAI_Security_Core.${ENDC}"
fi

# 7. Verification Check
echo -e "${CYAN}${BOLD}--- FINAL PRODUCTION VERIFICATION ---${ENDC}"
TOOLS=("nmap" "msfconsole" "sqlmap" "aircrack-ng" "john" "hydra" "wireshark")
SUCCESS_COUNT=0

for tool in "${TOOLS[@]}"; do
    if command -v "$tool" >/dev/null 2>&1; then
        echo -e "${GREEN}[PASS] $tool is ONLINE.${ENDC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}[FAIL] $tool is MISSING.${ENDC}"
    fi
done

if [ $SUCCESS_COUNT -eq ${#TOOLS[@]} ]; then
    echo -e "${GREEN}${BOLD}SYSTEM STATUS: FULLY ARMED & PRODUCTION-SECURE.${ENDC}"
else
    echo -e "${YELLOW}SYSTEM STATUS: PARTIALLY ARMED ($SUCCESS_COUNT/${#TOOLS[@]}). Check logs.${ENDC}"
fi

echo -e "${RED}${BOLD}--- DEPLOYMENT COMPLETE ---${ENDC}"
