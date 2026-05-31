#!/bin/bash

VERSION="1.0.0"
PKG_NAME="spartan-ai-hub"
STAGING_DIR="${PKG_NAME}_${VERSION}_amd64"

echo "[*] Setting up Debian package staging..."
mkdir -p "$STAGING_DIR/DEBIAN"
mkdir -p "$STAGING_DIR/opt/spartan-ai-hub"
mkdir -p "$STAGING_DIR/usr/local/bin"

# 1. Create Control File
cat <<EOF > "$STAGING_DIR/DEBIAN/control"
Package: spartan-ai-hub
Version: $VERSION
Section: custom
Priority: optional
Architecture: amd64
Maintainer: Creator <creator@supreme.ai>
Description: Spartan AI Hub Master Server - Core Integration
EOF

# 2. Copy Codebase
echo "[*] Copying core services to package..."
cp -r backend/core/* "$STAGING_DIR/opt/spartan-ai-hub/"

# 3. Create CLI Wrapper
cat <<EOF > "$STAGING_DIR/usr/local/bin/spartan-hub"
#!/bin/bash
cd /opt/spartan-ai-hub && python3 spartan.py "\$@"
EOF
chmod +x "$STAGING_DIR/usr/local/bin/spartan-hub"

# 4. Build .deb
echo "[*] Building Debian package..."
dpkg-deb --build "$STAGING_DIR"
mv "${STAGING_DIR}.deb" "spartan-ai-hub.deb"

echo "[+] Build complete: spartan-ai-hub.deb"