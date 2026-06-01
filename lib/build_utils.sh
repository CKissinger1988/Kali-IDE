#!/bin/bash
# lib/build_utils.sh - ISO build utility functions

function check_root() {
    if [ "$(id -u)" -ne 0 ]; then
        echo -e "\033[0;31m[!] Error: This script must be run as root (sudo).\033[0m"
        exit 1
    fi
}

function init_staging() {
    local staging_dir=$1
    local chroot_dir=$2
    local iso_path=$3
    echo -e "\033[1;33m[*] Starting from scratch...\033[0m"
    rm -rf "$staging_dir" "$chroot_dir"
    mkdir -p "$staging_dir" "$chroot_dir"
    xorriso -osirrox on -indev "$iso_path" -extract / "$staging_dir"
    unsquashfs -d "$chroot_dir" "$staging_dir/live/filesystem.squashfs"
}

function setup_mounts() {
    local chroot_dir=$1
    mount --bind /proc "$chroot_dir/proc" || true
    mount --bind /sys "$chroot_dir/sys" || true
    mount --bind /dev "$chroot_dir/dev" || true
    mount --bind /dev/pts "$chroot_dir/dev/pts" || true
    cp /etc/resolv.conf "$chroot_dir/etc/resolv.conf"
}

function teardown_mounts() {
    local chroot_dir=$1
    echo -e "\033[1;33m[*] Cleaning up chroot environment...\033[0m"
    umount "$chroot_dir/proc" || true
    umount "$chroot_dir/sys" || true
    umount "$chroot_dir/dev/pts" || true
    umount "$chroot_dir/dev" || true
    rm "$chroot_dir/etc/resolv.conf" || true
}
