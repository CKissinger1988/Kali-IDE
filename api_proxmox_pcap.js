/**
 * AI Supreme C2 Backend - Proxmox Invisible PCAP Tap
 * Mount this file in your Express Router setup.
 */
const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

// POST /api/proxmox/vm/pcap
router.post('/pcap', async (req, res) => {
    const { node, vmid, duration } = req.body;
    
    if (!vmid || !duration) {
        return res.status(400).json({ ok: false, error: 'Missing vmid or duration parameters' });
    }

    // Proxmox interface convention: fwbr<vmid>i0 (Firewall Bridge) or tap<vmid>i0
    // Tapping here is mathematically invisible to the guest VM.
    const iface = `fwbr${vmid}i0`;
    const outputFile = `/tmp/mesh_pcap_${vmid}_${Date.now()}.pcap`;
    const durationSec = parseInt(duration, 10);

    // If your backend runs remotely from the hypervisor, we pipe via SSH.
    // If it runs ON the hypervisor, remove the 'ssh root@${node}' prefix.
    const cmd = `ssh root@${node} "tshark -i ${iface} -a duration:${durationSec} -w ${outputFile} > /dev/null 2>&1 && ls -s ${outputFile} | awk '{print \\$1}'"`;

    console.log(`[NETWORK-TAP] Initiating hypervisor tap on ${node} for VM ${vmid}...`);
    
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`[NETWORK-TAP] Error tapping VM ${vmid}: ${error.message}`);
            return res.status(500).json({ ok: false, error: 'Hypervisor tap execution failed.' });
        }
        
        // Parse the returned file size (in KB) to confirm data capture
        const sizeKb = parseInt(stdout.trim(), 10) || 0;
        
        if (sizeKb === 0) {
            return res.json({ ok: false, error: 'Capture completed but zero packets were logged.' });
        }

        console.log(`[NETWORK-TAP] Success: Captured ${sizeKb}KB to ${outputFile}`);
        res.json({
            ok: true,
            file: outputFile,
            size: sizeKb * 1024 // Approximation to bytes for frontend display
        });
    });
});

module.exports = router;