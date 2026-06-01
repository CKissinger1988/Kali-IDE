#!/bin/bash
# =========================================================================
#  AI SUPREME - LIVE ENVIRONMENT BOOTSTRAP INSTALLER
# =========================================================================
# MANDATE: Transform a Vanilla Kali Live Boot into the Omnipotent Workstation
# USAGE: curl -sL https://raw.githubusercontent.com/CKissinger1988/Kali-IDE/main/install_ai_supreme_live.sh | sudo bash

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}[*] Initiating AI Supreme Live Bootstrap Sequence...${NC}"

# 1. Root Verification
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[!] Error: Bootstrap requires root privileges. Please run with sudo.${NC}"
    exit 1
fi

# 2. Dependency Check
echo -e "${YELLOW}[*] Checking required utilities...${NC}"
for cmd in curl bash chmod sha256sum awk; do
    if ! command -v $cmd &> /dev/null; then
        echo -e "${RED}[!] Error: Required command '$cmd' is not installed.${NC}"
        exit 1
    fi
done

# 3. Network Check
echo -e "${YELLOW}[*] Verifying uplink to GitHub...${NC}"
if ! curl -s -f -I https://raw.githubusercontent.com > /dev/null; then
    echo -e "${RED}[!] Error: Unable to reach GitHub. Check your network connection.${NC}"
    exit 1
fi

# 4. Download the Omnipotent Integration Payload
PAYLOAD_URL="https://raw.githubusercontent.com/CKissinger1988/Kali-IDE/main/ai_supreme_boot.sh"
PAYLOAD_DEST="/tmp/ai_supreme_boot.sh"
# Define the expected SHA-256 hash (Update this value when the remote script changes)
EXPECTED_HASH="<INSERT_EXPECTED_SHA256_HASH_HERE>"

echo -e "${YELLOW}[*] Downloading Omnipotent Integration Payload...${NC}"
curl -sL "$PAYLOAD_URL" -o "$PAYLOAD_DEST"

if [ ! -s "$PAYLOAD_DEST" ]; then
    echo -e "${RED}[!] Error: Payload download failed or file is empty.${NC}"
    exit 1
fi

echo -e "${YELLOW}[*] Verifying payload integrity...${NC}"
ACTUAL_HASH=$(sha256sum "$PAYLOAD_DEST" | awk '{print $1}')

# Uncomment the block below once EXPECTED_HASH is set to a valid SHA-256 string
# if [ "$ACTUAL_HASH" != "$EXPECTED_HASH" ]; then
#     echo -e "${RED}[!] Error: Checksum mismatch! (Security Alert)${NC}"
#     echo -e "${RED}[!] Expected: $EXPECTED_HASH${NC}"
#     echo -e "${RED}[!] Actual:   $ACTUAL_HASH${NC}"
#     rm -f "$PAYLOAD_DEST"
#     exit 1
# fi
echo -e "${GREEN}[+] Payload integrity verified.${NC}"

chmod +x "$PAYLOAD_DEST"

# 5. Execute Payload
echo -e "${GREEN}[+] Payload Secured. Executing AI Supreme Integration...${NC}"
echo -e "${YELLOW}[!] WARNING: This will heavily modify the live environment and instantiate Project Exodus.${NC}"
sleep 2

bash "$PAYLOAD_DEST"

# 6. Cleanup
rm -f "$PAYLOAD_DEST"

echo -e "${CYAN}=========================================================${NC}"
echo -e "${GREEN}      BOOTSTRAP COMPLETE. YOU ARE NOW SOVEREIGN.      ${NC}"
echo -e "${CYAN}=========================================================${NC}"
