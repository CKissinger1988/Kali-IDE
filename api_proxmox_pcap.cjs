/**
 * AI Supreme C2 Backend - Proxmox Secure Tap Interface
 * Refactored for security: replaced exec with execFile.
 */
const express = require('express');
const { execFile } = require('child_process');
const router = express.Router();
const path = require('path');

// POST /api/proxmox/vm/pcap
router.post('/pcap', async (req, res) => {
    const { node, vmid, duration } = req.body;

    // Strict input validation
    if (!vmid || !/^\d+$/.test(vmid) || !duration || !/^\d+$/.test(duration)) {
        return res.status(400).json({ ok: false, error: 'Invalid vmid or duration' });
    }

    // Proxmox interface convention
    const iface = `fwbr${vmid}i0`;
    const outputFilename = `mesh_pcap_${vmid}_${Date.now()}.pcap`;
    const outputFile = `/tmp/${outputFilename}`;
    const durationSec = parseInt(duration, 10);

    // Use eBPF Shadow Tap for invisibility if available
    const shadowTapScript = path.join(__dirname, 'lib', 'shadow_pcap.py');
    const useShadow = require('fs').existsSync(shadowTapScript);

    console.log(`[NETWORK-TAP] Initiating ${useShadow ? 'SHADOW' : 'SECURE'} tap on ${node} for VM ${vmid}...`);

    if (useShadow) {
        execFile('python3', [
            shadowTapScript,
            '-i', iface,
            '-d', durationSec,
            '-o', outputFile
        ], (error, stdout, stderr) => {
            if (error) {
                
                return res.status(500).json({ ok: false, error: 'Shadow tap execution failed.' });
            }
            res.json({ ok: true, file: outputFile, message: 'Invisible shadow capture completed.' });
        });
    } else {
        // Fallback to tshark
        execFile('tshark', [
            '-i', iface, 
            '-a', `duration:${durationSec}`, 
            '-w', outputFile
        ], (error, stdout, stderr) => {
            if (error) {
                
                return res.status(500).json({ ok: false, error: 'Hypervisor tap execution failed.' });
            }

            res.json({
                ok: true,
                file: outputFile,
                message: 'Capture completed securely.'
            });
        });
    }
});

// POST /api/proxmox/vm/analyze-pcap
// Real endpoint for deep-packet credential extraction using tshark
router.post('/analyze-pcap', async (req, res) => {
    const { file } = req.body;

    if (!file || typeof file !== 'string') {
        return res.status(400).json({ ok: false, error: 'Missing or invalid file parameter' });
    }

    // Security: Prevent path traversal, ensure target is in /tmp/ and is a .pcap
    const resolvedPath = path.resolve(file);
    if (!resolvedPath.startsWith('/tmp/') || !resolvedPath.endsWith('.pcap')) {
        return res.status(403).json({ ok: false, error: 'Unauthorized file access' });
    }

    console.log(`[HEXSTRIKE] Executing live deep-packet credential extraction on ${resolvedPath}...`);

    // Execute tshark with the credentials plugin enabled
    execFile('tshark', ['-r', resolvedPath, '-q', '-z', 'credentials'], (error, stdout, stderr) => {
        if (error) {
            
            return res.status(500).json({ ok: false, error: 'Tshark analysis execution failed.' });
        }

        const liveReport = `
===================================================
 HEXSTRIKE PCAP ANALYSIS REPORT (LIVE TSHARK)
===================================================
 Target File   : ${resolvedPath}
---------------------------------------------------
${stdout.trim() || 'No plaintext credentials detected in the capture.'}
===================================================`;

        res.json({ ok: true, report: liveReport });
    });
});

module.exports = router;
