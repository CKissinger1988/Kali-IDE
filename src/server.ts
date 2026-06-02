import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

import apiNetwork from '../api_network.js';
import apiPcap from '../api_proxmox_pcap.js';
import apiAuth from '../api_auth.js';
import apiMsf from '../api_msf.js';
import apiGhost from '../api_ghost.js';
import apiSovereign from '../api_sovereign.js';
import apiSignal from '../api_signal.js';
import apiHexstrike from '../api_hexstrike.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

// Set default DB path for Cloud Run if not specified
if (process.env.K_SERVICE && !process.env.DB_PATH) {
  process.env.DB_PATH = '/tmp/sovereign.db';
  console.log(`[BOOT] Detected Cloud Run. Using /tmp/sovereign.db for persistence.`);
}

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Auth Middleware
const authenticateSovereign = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ ok: false, error: 'Authorization Required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ ok: false, error: 'Invalid or Expired Sovereign Token' });
    }
};

// Public Routes
app.use('/api/auth', apiAuth);
app.use(express.static(path.join(__dirname, '../dashboard/dist')));

// Protected API Routes
app.use('/api/network', authenticateSovereign, apiNetwork);
app.use('/api/proxmox', authenticateSovereign, apiPcap);
app.use('/api/msf', authenticateSovereign, apiMsf);
app.use('/api/ghost', authenticateSovereign, apiGhost);
app.use('/api/sovereign', authenticateSovereign, apiSovereign);
app.use('/api/signal', authenticateSovereign, apiSignal);
app.use('/api/hexstrike', authenticateSovereign, apiHexstrike);

// Placeholder for other APIs referenced in dashboard
app.get('/api/status', (req, res) => {
    res.json({ ok: true, sovereign_mode: true, tier: 'APEX' });
});

// Jarvis Tactical Pondering
app.post('/api/ponder', (req, res) => {
    const { prompt, sector } = req.body;
    
    if (typeof prompt !== 'string' || typeof sector !== 'string') {
        return res.status(400).json({ ok: false, error: "Invalid parameters. 'prompt' and 'sector' must be strings." });
    }

    const p = prompt.toLowerCase();
    
    let result = `Directive received. Consulting strategic mesh for ${sector} sector.`;

    if (p.includes('strike') || p.includes('exploit')) {
        result = "[JARVIS] Tactical Strike authorized. Selecting optimal zero-day vector. Strike Hud initiated.";
    } else if (p.includes('recon') || p.includes('scan')) {
        result = "[JARVIS] Ghost recon pipeline dispatched. Amassing perimeter intelligence.";
    } else if (p.includes('loot') || p.includes('exfiltrate')) {
        result = "[JARVIS] Hypervisor out-of-band channel established. Commencing data exfiltration.";
    } else if (p.includes('fortify') || p.includes('lockdown')) {
        result = "[JARVIS] Mesh fortification sequence active. Rotating cryptographic sub-keys.";
    } else {
        result = `JARVIS: Analyzing directive: "${prompt}". Proceeding with OMNIPOTENT STEALTH logic.`;
    }

    res.json({ ok: true, result });
});

// Socket.io Logic
io.on('connection', (socket) => {
  console.log(`[SOCKET] Sovereign client connected: ${socket.id}`);

  // Simulate periodically anchoring mesh state to blockchain
  const anchorInterval = setInterval(() => {
    const root = require('crypto').randomBytes(32).toString('hex');
    const tx = "0x" + require('crypto').randomBytes(32).toString('hex');
    socket.emit('blockchain:anchor', { root, tx });
  }, 60000);

  socket.on('hexstrike:trigger', (payload) => {
    console.log(`[HEXSTRIKE] Triggered strike against ${payload.target}`);
    // Simulate strike progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      socket.emit('strike:progress', { progress, log: [`[*] Payload injection: ${progress}%`, `[+] Bypassing EDR...`] });
      if (progress >= 100) {
        clearInterval(interval);
        socket.emit('strike:complete', { success: true });
      }
    }, 500);
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET] Client disconnected`);
  });
});

// Fallback for SPA
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard/dist/index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` AI SUPREME SOVEREIGN CORE ACTIVE ON PORT ${PORT}`);
  console.log(`=================================================`);
});
