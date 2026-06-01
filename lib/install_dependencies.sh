#!/bin/bash
# lib/install_dependencies.sh - Installs core packages

function install_dependencies() {
    echo "[+] Updating and upgrading system packages..."
    apt-get update
    apt-get dist-upgrade -y
    echo "[+] Installing Core Dependencies..."
    apt-get install -y curl wget git nodejs npm python3-pip python3-venv libfuse2t64 desktop-file-utils firefox-esr libnss3 libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2t64 sudo bpfcc-tools clang llvm libbpf-dev python3-bpfcc tor torsocks proxychains4 jq macchanger secure-delete bats
}

function install_ai_tools() {
    echo "[+] Installing AI Tools..."
    # Ollama
    if ! command -v ollama >/dev/null; then
        curl -fsSL https://ollama.com/install.sh | sh
    fi

    # Gemini-CLI
    npm install -g @google/gemini-cli
    
    # Antigravity-CLI
    curl -fsSL https://antigravity.google/cli/install.sh | bash || echo "[!] Official agy install failed."

    # Code-Server
    if ! command -v code-server >/dev/null; then
        curl -fsSL https://code-server.dev/install.sh | sh
    fi

    # LM Studio
    if [ ! -f "/usr/local/bin/lm-studio.AppImage" ]; then
        wget -O /usr/local/bin/lm-studio.AppImage https://releases.lmstudio.ai/linux/x64/latest/LM_Studio-latest.AppImage || echo "[!] LM Studio download failed"
        chmod +x /usr/local/bin/lm-studio.AppImage || true
    fi
}
