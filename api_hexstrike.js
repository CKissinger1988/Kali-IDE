/**
 * AI Supreme C2 Backend - Hexstrike AI Autonomous Engine Bridge
 * Integrates the autonomous strike logic and intelligence analysis.
 */
const express = require('express');
const router = express.Router();
const { execFile } = require('child_process');
const path = require('path');

// Simulation of Hexstrike AI Engine state
const hexstrikeState = {
    autonomous: true,
    activeTargets: [],
    missionLog: [
        "[HEXSTRIKE] Autonomous Engine Online. Policy: APEX_SOVEREIGN",
        "[INTEL] Periodic perimeter scan initiated."
    ],
    decisionLog: [] // Structured agent decisions
};

// GET /api/hexstrike/status
router.get('/status', (req, res) => {
    res.json({ ok: true, state: hexstrikeState });
});

// POST /api/hexstrike/log-decision
router.post('/log-decision', (req, res) => {
    const { action, target, reasoning, confidence } = req.body;
    
    if (!action || !target || !reasoning) {
        return res.status(400).json({ ok: false, error: 'Missing decision data.' });
    }

    const decision = {
        timestamp: new Date().toISOString(),
        action,
        target,
        reasoning,
        confidence: confidence || 'N/A'
    };
    
    hexstrikeState.decisionLog.push(decision);
    hexstrikeState.missionLog.push(`[DECISION] ${action} on ${target}. Reason: ${reasoning.substring(0, 50)}...`);
    
    console.log(`[HEXSTRIKE] Decision logged: ${action} on ${target}`);
    
    res.json({ ok: true, decision });
});

// POST /api/hexstrike/analyze-pcap
router.post('/analyze-pcap', (req, res) => {
    const { file } = req.body;
    
    if (typeof file !== 'string' || !file.trim()) {
        return res.status(400).json({ ok: false, error: 'Invalid or missing file parameter.' });
    }

    // Security: Prevent path traversal, ensure target is in /tmp/ and is a .pcap
    const resolvedPath = path.resolve(file);
    if (!resolvedPath.startsWith('/tmp/') || !resolvedPath.endsWith('.pcap')) {
        return res.status(403).json({ ok: false, error: 'Unauthorized file access' });
    }
    
    // Resolve analyzer path
    const analyzerScript = path.join(__dirname, 'security-audit-agent', 'analyzer.py');
    
    console.log(`[HEXSTRIKE] Passing ${resolvedPath} to SecurityAuditAgent for defensive analysis...`);
    
    // Using scapy analyzer.py
    execFile('python3', [analyzerScript, resolvedPath], (error, stdout, stderr) => {
        if (error) {
            
            return res.status(500).json({ ok: false, error: 'Defense analysis failed.' });
        }
        
        const report = stdout.trim();
        hexstrikeState.missionLog.push(`[INTEL] Analysis of ${path.basename(resolvedPath)} complete. Findings: ${report || 'NONE'}`);
        
        res.json({ ok: true, report });
    });
});

// GET /api/hexstrike/pivots
router.get('/pivots', (req, res) => {
    const mockPivots = [
        { 
            source: 'VM 101', 
            target: 'INTERNAL_DB_SVR', 
            vector: 'SQL_INJECTION_PIVOT', 
            confidence: '92%',
            path: '10.0.0.15 -> 10.0.0.22'
        },
        { 
            source: 'VM 103', 
            target: 'DOMAIN_CONTROLLER', 
            vector: 'LDAP_PASS_THE_HASH', 
            confidence: '78%',
            path: '10.0.0.18 -> 10.0.0.5'
        }
    ];
    
    console.log(`[HEXSTRIKE] Autonomous pivot analysis complete. ${mockPivots.length} vectors identified.`);
    
    res.json({ ok: true, pivots: mockPivots });
});

// POST /api/hexstrike/trigger
router.post('/trigger', (req, res) => {
    const { target, cve } = req.body;
    
    if (typeof target !== 'string' || !target.trim() || typeof cve !== 'string' || !cve.trim()) {
        return res.status(400).json({ ok: false, error: 'Invalid or missing target/cve parameter.' });
    }

    console.log(`[HEXSTRIKE] Autonomous payload generation for ${target} [${cve}]...`);
    
    hexstrikeState.activeTargets.push({ target, cve, progress: 0 });
    
    res.json({ ok: true, message: `Autonomous strike against ${target} initialized.` });
});

module.exports = router;
