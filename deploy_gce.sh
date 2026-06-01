#!/bin/bash
# AI Supreme GCE Deployment Script
# This script launches a GCE instance to host the SpartanAI Kali OS testing environment.

PROJECT_ID=$(gcloud config get-value project)
INSTANCE_NAME="spartan-kali-test-$(date +%Y%m%d-%H%M%S)"
ZONE="us-central1-a"

echo "[*] Deploying AI Supreme Kali Testing Instance: $INSTANCE_NAME"

gcloud compute instances create "$INSTANCE_NAME" \
    --project="$PROJECT_ID" \
    --zone="$ZONE" \
    --machine-type="e2-standard-4" \
    --network-interface="network-tier=PREMIUM,stack-type=IPV4_ONLY,subnet=default" \
    --maintenance-policy="TERMINATE" \
    --provisioning-model="SPOT" \
    --service-account="default" \
    --scopes="https://www.googleapis.com/auth/cloud-platform" \
    --tags="http-server,https-server,rdp" \
    --create-disk="auto-delete=yes,boot=yes,device-name=$INSTANCE_NAME,image=projects/debian-cloud/global/images/debian-12-bookworm-v20240312,mode=rw,size=50,type=projects/$PROJECT_ID/zones/$ZONE/diskTypes/pd-balanced" \
    --no-shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring \
    --labels=goog-ec-src=vm_add-gcloud \
    --metadata-from-file=startup-script=startup.sh

echo "[+] Instance creation initiated. XFCE and XRDP will be installed via startup-script."
echo "[+] You can access the dashboard once the script finishes."
