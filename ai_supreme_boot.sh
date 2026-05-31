#!/bin/bash
# =========================================================================
#  AI SUPREME - OMNIPOTENT BOOT SEQUENCE
# =========================================================================
# MANDATE: Absolute Offensive Synchronization & Perimeter Defense

CYAN='\033[96m'
GREEN='\033[92m'
RED='\033[91m'
YELLOW='\033[93m'
NC='\033[0m'

echo -e "${RED}[!] INITIATING AI SUPREME BOOT SEQUENCE...${NC}"

# 1. Perimeter Defense Activation
echo -e "${CYAN}[*] Engaging Perimeter Defenses (UFW / Fail2ban)...${NC}"
sudo systemctl enable --now ufw
sudo systemctl enable --now fail2ban

# 2. Tor Stealth Network Initialization
echo -e "${CYAN}[*] Establishing Tor Stealth Hidden Services...${NC}"
sudo systemctl restart tor
sleep 2
if [ -f /var/lib/tor/ai_supreme_c2/hostname ]; then
    ONION_URL=$(sudo cat /var/lib/tor/ai_supreme_c2/hostname)
    echo -e "${GREEN}[+] C2 Endpoint Online: $ONION_URL${NC}"
else
    echo -e "${RED}[-] Tor Hidden Service failed to initialize or requires ClientAuth parameters.${NC}"
fi

# 3. SpartanAI Autonomous SOC
echo -e "${CYAN}[*] Awakening SpartanAI Autonomous SOC Core...${NC}"
sudo systemctl restart spartan-soc
sudo systemctl restart spartan-soc-dashboard
echo -e "${GREEN}[+] Offensive and Defensive Matrices Active.${NC}"

# 4. Orchestrator & Sentinel Bridge Launch
echo -e "${CYAN}[*] Launching Node Orchestrator (Sentinel Bridge)...${NC}"
if [ -f "package.json" ]; then
    # Ensure backend dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo -e "${CYAN}[*] Installing Orchestrator dependencies...${NC}"
        npm install
    fi
    
    # Ensure frontend dashboard is built
    if [ -d "dashboard" ] && [ ! -d "dashboard/node_modules" ]; then
        echo -e "${CYAN}[*] Building React Dashboard...${NC}"
        cd dashboard && npm install && npm run build && cd ..
    fi

    # Run the TSX backend defined in package.json
    echo -e "${GREEN}[+] Dashboard and API backend coming online...${NC}"
    npm start
else
    echo -e "${YELLOW}[!] package.json not found in current directory! Please run from repository root to launch the TSX server.${NC}"
fi

echo -e "${GREEN}=========================================================${NC}"
echo -e "${GREEN}      ALL SYSTEMS NOMINAL. READY FOR OPERATION.${NC}"
echo -e "${GREEN}=========================================================${NC}"
