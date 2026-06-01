#!/bin/bash
# lib/configure_user.sh - Configures user and security settings

function configure_user() {
    local admin_user=$1
    local admin_pass=$2
    local sudoers_dir="${SUDOERS_DIR:-/etc/sudoers.d}"
    
    echo "[+] Creating admin user: $admin_user"
    if ! id "$admin_user" &>/dev/null; then
        useradd -m -s /bin/bash -G sudo,video,render "$admin_user"
    fi
    echo "$admin_user:$admin_pass" | chpasswd
    
    # Passwordless sudo (Restricted command set)
    echo "[+] Enabling passwordless sudo for $admin_user in $sudoers_dir"
    local command_set="/usr/bin/hostnamectl, /usr/sbin/ip, /usr/bin/macchanger, /usr/sbin/macchanger, /usr/bin/systemctl, /usr/bin/sdmem, /usr/bin/mount, /usr/bin/umount, /usr/sbin/chroot"
    echo "$admin_user ALL=(ALL) NOPASSWD: $command_set" > "$sudoers_dir/99-ai-supreme"
    chmod 0440 "$sudoers_dir/99-ai-supreme"
}
