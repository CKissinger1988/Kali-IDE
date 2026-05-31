/**
 * AI Supreme C2 Backend - Network Overlay Manager
 * Handles Ghost Routing, Identity Cycling, and Tor controls.
 */
const express = require('express');
const { execFile } = require('child_process');
const net = require('net');
const router = express.Router();

// --- Configuration ---
const TOR_CONTROL_PORT = 9051;
const DEFAULT_INTERVAL_MS = 300000; // 5 minutes

let currentInterval = DEFAULT_INTERVAL_MS;
let intervalTimer = null;

// Core function to handle Tor identity rotation
function cycleTorIdentity() {
    return new Promise((resolve, reject) => {
        console.log(`[NETWORK] Requesting immediate Tor circuit rotation...`);
        let responseSent = false;

        const client = net.createConnection({ port: 9051, host: '127.0.0.1' }, () => {
            client.write('AUTHENTICATE ""\r\n');
            client.write('SIGNAL NEWNYM\r\n');
            client.write('QUIT\r\n');
        });

        client.on('end', () => {
            if (responseSent) return;
            responseSent = true;
            console.log(`[NETWORK] Tor identity successfully cycled via TCP ControlPort.`);
            resolve({ ok: true, message: 'Ghost Identity rotated instantly.' });
        });

        client.on('error', (err) => {
            if (responseSent) return;
            responseSent = true;
            
            
            execFile('systemctl', ['reload', 'tor'], (error, stdout, stderr) => {
                if (error) {
                    
                    return reject({ ok: false, error: 'Identity cycling failed completely.' });
                }
                resolve({ ok: true, message: 'Ghost Identity rotated (Fallback).' });
            });
        });
    });
}

function startRotationTimer() {
    if (intervalTimer) clearInterval(intervalTimer);
    intervalTimer = setInterval(() => {
        console.log(`[NETWORK] Triggering scheduled Tor identity rotation...`);
        cycleTorIdentity().catch(() => {});
    }, currentInterval);
}

// POST /api/network/cycle-identity
router.post('/cycle-identity', async (req, res) => {
    try {
        const result = await cycleTorIdentity();
        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// POST /api/network/interval
// Configure the rotation interval (in milliseconds)
router.post('/interval', (req, res) => {
    const { interval } = req.body;
    if (typeof interval !== 'number' || interval < 60000) {
        return res.status(400).json({ ok: false, error: 'Invalid interval (min 60000ms)' });
    }
    currentInterval = interval;
    startRotationTimer();
    console.log(`[NETWORK] Rotation interval updated to ${currentInterval}ms.`);
    res.json({ ok: true, interval: currentInterval });
});

// POST /api/network/tor/restart
// Restart the Tor service
router.post('/tor/restart', (req, res) => {
    console.log(`[NETWORK] Restarting Tor service...`);
    execFile('systemctl', ['restart', 'tor'], (error) => {
        if (error) {
            
            return res.status(500).json({ ok: false, error: 'Tor restart failed.' });
        }
        res.json({ ok: true, message: 'Tor service restarted.' });
    });
});

// Initialize rotation timer
startRotationTimer();

module.exports = router;
