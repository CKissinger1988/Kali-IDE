#Requires -RunAsAdministrator
<#
.SYNOPSIS
    AI SUPREME - KALI LIVE USB INSTALLER & BURN PROTOCOL
    MANDATE: Automated ISO Retrieval and USB Flashing to D:\
#>

param(
    [string]$DriveLetter = "D",
    [string]$Repo = "CKissinger1988/Kali-IDE",
    [string]$Tag = "v1.0.0-ai-supreme"
)

$ErrorActionPreference = "Stop"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  AI SUPREME - OMNIPOTENT KALI LIVE USB BURNER" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Ensure TLS 1.2 is enabled for secure downloads (Required for GitHub/Rufus on older endpoints)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# 1. Verify Drive
$Drive = Get-WmiObject Win32_Volume -Filter "DriveLetter = '$DriveLetter:'"
if (-not $Drive) {
    Write-Host "[!] Error: Drive $DriveLetter`: not found on this system." -ForegroundColor Red
    exit
}

if ($Drive.DriveType -ne 2) { 
    Write-Host "[!] WARNING: $DriveLetter`: is not detected as a removable USB drive (Type: $($Drive.DriveType))." -ForegroundColor Yellow
    $confirm = Read-Host ">>> Are you absolutely sure you want to completely erase and flash $DriveLetter`:? (Y/N)"
    if ($confirm -notmatch "^[Yy]$") { 
        Write-Host "Aborted." -ForegroundColor Red
        exit 
    }
}

# 2. Download ISO from Cloud Foundry
$IsoName = "kali-linux-2026.1-ai-supreme.iso"
$IsoPath = "$env:TEMP\$IsoName"

Write-Host "[*] Contacting Cloud ISO Foundry ($Repo)..." -ForegroundColor Yellow
try {
    # Check if gh CLI is installed
    if (Get-Command gh -ErrorAction SilentlyContinue) {
        Write-Host "[*] Downloading AI Supreme ISO from GitHub Releases..." -ForegroundColor Yellow
        gh release download $Tag -R $Repo -p "*.iso" -D "$env:TEMP" --clobber
    }
    else {
        Write-Host "[!] GitHub CLI (gh) not found. Attempting direct download..." -ForegroundColor Yellow
        # Fallback to direct URL if public
        $Url = "https://github.com/$Repo/releases/download/$Tag/$IsoName"
        Invoke-WebRequest -Uri $Url -OutFile $IsoPath
    }
}
catch {
    Write-Host "[!] Failed to download ISO. The Cloud Build may still be compiling." -ForegroundColor Red
    Write-Host "Check status: https://github.com/$Repo/actions" -ForegroundColor Cyan
    exit
}

if (-not (Test-Path $IsoPath) -or (Get-Item $IsoPath).Length -lt 1GB) {
    Write-Host "[!] Downloaded ISO appears corrupted or incomplete." -ForegroundColor Red
    exit
}
Write-Host "[+] ISO Download Complete: $IsoPath" -ForegroundColor Green

# 3. Download Rufus CLI
$RufusUrl = "https://github.com/pbatard/rufus/releases/download/v4.4/rufus-4.4p.exe"
$RufusExe = "$env:TEMP\rufus.exe"
$ExpectedHash = "086B1FA3B7B3B59D060783F999A9983193630A7F59B79B516248380295A2B5E2" # SHA256 for Rufus 4.4p

if (-not (Test-Path $RufusExe)) {
    Write-Host "[*] Fetching Rufus for USB Flashing..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $RufusUrl -OutFile $RufusExe
}

Write-Host "[*] Verifying Rufus integrity..." -ForegroundColor Yellow
$ActualHash = (Get-FileHash $RufusExe -Algorithm SHA256).Hash
if ($ActualHash -ne $ExpectedHash) {
    Write-Host "[!] Error: Rufus hash mismatch! (Security Alert)" -ForegroundColor Red
    exit
}
Write-Host "[+] Rufus integrity verified." -ForegroundColor Green

# 4. Burn to USB
Write-Host "[*] Initiating Burn Protocol to $DriveLetter`:..." -ForegroundColor Yellow
Write-Host "[!] Rufus will prompt for Administrator privileges to format the drive." -ForegroundColor Cyan

# We pass parameters to Rufus to auto-select the drive and ISO
$RufusArgs = "-i `"$IsoPath`" -d $DriveLetter"
Write-Host "[*] Executing: $RufusExe $RufusArgs" -ForegroundColor DarkGray

Start-Process -FilePath $RufusExe -ArgumentList $RufusArgs -Wait

Write-Host "=========================================================" -ForegroundColor Green
Write-Host "[+] Burn Process Complete." -ForegroundColor Green
Write-Host "[*] Boot from $DriveLetter`: to enter the Omnipotent AI Supreme Environment." -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Green
