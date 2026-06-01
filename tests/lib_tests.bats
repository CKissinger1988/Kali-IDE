#!/usr/bin/env bats

# tests/lib_tests.bats - Unit tests for AI Supreme libraries

setup() {
    # Source the libraries to test
    source "lib/build_utils.sh"
    source "lib/stealth.sh"
    source "lib/configure_user.sh"
    
    # Mock system commands to avoid side effects during testing
    function mount() { echo "mock mount $*"; }
    export -f mount
    function mountpoint() { return 1; }
    export -f mountpoint
    function systemctl() { echo "mock systemctl $*"; }
    export -f systemctl
    function apt-get() { echo "mock apt-get $*"; }
    export -f apt-get
    function mkdir() { echo "mock mkdir $*"; }
    export -f mkdir
    function sysctl() { echo "mock sysctl $*"; }
    export -f sysctl
    function useradd() { echo "mock useradd $*"; }
    export -f useradd
    function chpasswd() { echo "mock chpasswd"; }
    export -f chpasswd
    function id() {
        if [[ "$1" == "-u" ]]; then
            if [ "${SIMULATE_ROOT:-0}" -eq 1 ]; then
                echo "0"
            else
                echo "1000"
            fi
            return 0
        fi
        return 1
    }
    export -f id
    function chmod() { echo "mock chmod $*"; }
    export -f chmod
}

@test "deploy_exodus_workspace creates mount" {
    run deploy_exodus_workspace "2G"
    [ "$status" -eq 0 ]
    [[ "$output" == *"mock mkdir -p /opt/supreme-volatile"* ]]
    [[ "$output" == *"mock mount -t tmpfs -o size=2G,mode=0755 tmpfs /opt/supreme-volatile"* ]]
}

@test "apply_kernel_hardening generates config" {
    # Create a temporary directory for config
    MOCK_SYSCTL_DIR=$(mktemp -d)
    export SYSCTL_DIR="$MOCK_SYSCTL_DIR"

    run apply_kernel_hardening
    [ "$status" -eq 0 ]
    [ -f "$MOCK_SYSCTL_DIR/99-x200-stealth.conf" ]
    grep "net.ipv4.ip_forward = 1" "$MOCK_SYSCTL_DIR/99-x200-stealth.conf"
    
    rm -rf "$MOCK_SYSCTL_DIR"
}

@test "check_root fails when not root" {
    export SIMULATE_ROOT=0
    run check_root
    [ "$status" -eq 1 ]
    [[ "$output" == *"[!] Error: This script must be run as root"* ]]
}

@test "check_root passes when root" {
    export SIMULATE_ROOT=1
    run check_root
    [ "$status" -eq 0 ]
}

@test "configure_user creates user, updates pass, and writes sudoers file" {
    # Set up a mock temp directory for sudoers
    MOCK_SUDO_DIR=$(mktemp -d)
    export SUDOERS_DIR="$MOCK_SUDO_DIR"

    run configure_user "TestAdmin" "TestPass123"
    [ "$status" -eq 0 ]
    [[ "$output" == *"mock useradd -m -s /bin/bash -G sudo,video,render TestAdmin"* ]]
    [[ "$output" == *"mock chpasswd"* ]]
    [[ "$output" == *"mock chmod 0440 $MOCK_SUDO_DIR/99-ai-supreme"* ]]
    [ -f "$MOCK_SUDO_DIR/99-ai-supreme" ]
    
    # Verify the contents of the generated sudoers file
    local expected_rule="TestAdmin ALL=(ALL) NOPASSWD: /usr/bin/hostnamectl, /usr/sbin/ip, /usr/bin/macchanger, /usr/sbin/macchanger, /usr/bin/systemctl, /usr/bin/sdmem, /usr/bin/mount, /usr/bin/umount, /usr/sbin/chroot"
    local actual_rule=$(command cat "$MOCK_SUDO_DIR/99-ai-supreme")
    [[ "$actual_rule" == "$expected_rule" ]]

    rm -rf "$MOCK_SUDO_DIR"
}
