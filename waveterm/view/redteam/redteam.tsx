// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import type { BlockNodeModel } from "@/app/block/blocktypes";
import { globalStore } from "@/app/store/global";
import type { TabModel } from "@/app/store/tab-model";
import { Atom, atom, PrimitiveAtom } from "jotai";
import { memo, useEffect, useState } from "react";
import { useAtom } from "jotai";

class RedTeamViewModel implements ViewModel {
    viewType = "redteam";
    blockId: string;
    nodeModel: BlockNodeModel;
    tabModel: TabModel;
    viewIcon = atom("shield-halved");
    viewName = atom("Red-Team AI Workspace");

    constructor({ blockId, nodeModel, tabModel }: ViewModelInitType) {
        this.blockId = blockId;
        this.nodeModel = nodeModel;
        this.tabModel = tabModel;
    }

    get viewComponent(): ViewComponent {
        return RedTeamView;
    }
}

interface Skill {
    id: string;
    name: string;
    description: string;
}

interface Category {
    name: string;
    skills: Skill[];
}

const REDTEAM_CATEGORIES: Category[] = [
    {
        name: "Web Application Security",
        skills: [
            { id: "offensive-sqli", name: "SQL Injection", description: "Methodology for identifying and exploiting SQL injections including blind, error, and out-of-band vectors." },
            { id: "offensive-xss", name: "Cross-Site Scripting (XSS)", description: "Stored, reflected, DOM-based, and mutation-based XSS identification and bypasses." },
            { id: "offensive-ssrf", name: "Server-Side Request Forgery", description: "SSRF targeting cloud metadata endpoints (IMDSv1/v2), internal APIs, and filter bypasses." },
            { id: "offensive-ssti", name: "Template Injection (SSTI)", description: "Detecting template engines (Jinja2, Mako, Twig) and executing arbitrary code." },
            { id: "offensive-xxe", name: "XML External Entity (XXE)", description: "Exploiting XML parsing bugs for local file extraction, SSRF, and blind data exfiltration." },
            { id: "offensive-idor", name: "Insecure Direct Object References", description: "Finding authorization bypasses, parameters brute-forcing, and business logic flaws." },
            { id: "offensive-file-upload", name: "File Upload Exploitation", description: "Bypassing extension filters, uploading webshells, and executing commands." }
        ]
    },
    {
        name: "Infrastructure & Identity",
        skills: [
            { id: "offensive-active-directory", name: "Active Directory Abuse", description: "Kerberoasting, ASREProasting, ADCS ESC1-15, token delegation, and lateral movement." },
            { id: "offensive-cloud", name: "Cloud Attack Paths", description: "AWS/Azure/GCP privilege escalation, credential extraction from EC2/VMs, and persistence." },
            { id: "offensive-jwt", name: "JWT Token Abuse", description: "Algorithm confusion, alg:none attacks, key cracking, and claim manipulation." },
            { id: "offensive-oauth", name: "OAuth Misconfiguration", description: "OAuth flow hijacking, state parameter bypass, and token theft via redirects." }
        ]
    },
    {
        name: "Autonomous Security & Tools",
        skills: [
            { id: "hexstrike-agents", name: "HexStrike AI Agents", description: "Orchestrating BugBounty, CTF Solver, and Exploit Generator autonomous agents." },
            { id: "xposure-secrets", name: "Xposure Secrets Scanning", description: "Discovering and active-verifying leaked cloud/API tokens using AST and Shodan." },
            { id: "offensive-osint", name: "OSINT Intelligence", description: "Reconnaissance pipelines, subdomains mapping, and metadata extraction." }
        ]
    }
];

function RedTeamView({ model }: { model: RedTeamViewModel }) {
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [hexstrikeStatus, setHexstrikeStatus] = useState<"checking" | "online" | "offline">("checking");
    const [xposureStatus, setXposureStatus] = useState<"checking" | "online" | "offline">("checking");
    const [mcpLog, setMcpLog] = useState<string[]>(["[System] Monitoring security services..."]);

    // Check HexStrike and Xposure health
    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch("http://localhost:8888/health");
                if (res.ok) {
                    setHexstrikeStatus("online");
                    setMcpLog(prev => [...prev, `[HexStrike] Connected successfully to FastMCP server on port 8888.`]);
                } else {
                    setHexstrikeStatus("offline");
                }
            } catch (e) {
                setHexstrikeStatus("offline");
            }

            try {
                const res = await fetch("http://localhost:8080/health");
                if (res.ok) {
                    setXposureStatus("online");
                    setMcpLog(prev => [...prev, `[Xposure] Connected successfully to API backend on port 8080.`]);
                } else {
                    setXposureStatus("offline");
                }
            } catch (e) {
                setXposureStatus("offline");
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 10000);
        return () => clearInterval(interval);
    }, []);

    const executeCommandText = (cmd: string) => {
        navigator.clipboard.writeText(cmd);
        setMcpLog(prev => [...prev, `[Clipboard] Copied command: ${cmd}`]);
    };

    return (
        <div className="flex h-full w-full bg-zinc-950 text-zinc-100 font-sans p-6 overflow-hidden">
            {/* Left sidebar: categories & skills */}
            <div className="w-1/3 border-r border-zinc-800 pr-6 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center gap-2 mb-6">
                    <i className="fa-solid fa-shield-halved text-rose-500 text-xl"></i>
                    <h2 className="text-lg font-bold text-zinc-50">Red-Team Playbook</h2>
                </div>

                <div className="space-y-6 flex-1">
                    {REDTEAM_CATEGORIES.map((category) => (
                        <div key={category.name} className="space-y-2">
                            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{category.name}</h3>
                            <div className="space-y-1">
                                {category.skills.map((skill) => (
                                    <button
                                        key={skill.id}
                                        onClick={() => setSelectedSkill(skill)}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between ${
                                            selectedSkill?.id === skill.id
                                                ? "bg-rose-950/40 border border-rose-500/50 text-rose-200"
                                                : "hover:bg-zinc-900/60 text-zinc-300"
                                        }`}
                                    >
                                        <span>{skill.name}</span>
                                        <i className="fa-solid fa-chevron-right text-xs opacity-50"></i>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right workspace: Selected Skill details & Tool Status */}
            <div className="w-2/3 pl-6 flex flex-col h-full overflow-hidden">
                {/* Header: Service status */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-zinc-400">HexStrike MCP:</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                hexstrikeStatus === "online" ? "bg-emerald-950 text-emerald-400" :
                                hexstrikeStatus === "offline" ? "bg-rose-950 text-rose-400" : "bg-zinc-800 text-zinc-400"
                            }`}>
                                <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                                    hexstrikeStatus === "online" ? "bg-emerald-400 animate-pulse" :
                                    hexstrikeStatus === "offline" ? "bg-rose-400" : "bg-zinc-400"
                                }`}></span>
                                {hexstrikeStatus}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-zinc-400">Xposure Scanner:</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                xposureStatus === "online" ? "bg-emerald-950 text-emerald-400" :
                                xposureStatus === "offline" ? "bg-rose-950 text-rose-400" : "bg-zinc-800 text-zinc-400"
                            }`}>
                                <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                                    xposureStatus === "online" ? "bg-emerald-400 animate-pulse" :
                                    xposureStatus === "offline" ? "bg-rose-400" : "bg-zinc-400"
                                }`}></span>
                                {xposureStatus}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={() => setMcpLog(prev => [...prev, `[System] Resyncing target services...`])}
                        className="p-1 px-3 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                        <i className="fa-solid fa-arrows-rotate mr-1"></i> Refresh
                    </button>
                </div>

                {/* Detail View */}
                {selectedSkill ? (
                    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto space-y-6 pr-2">
                        <div>
                            <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">Methodology &amp; Checklist</div>
                            <h1 className="text-2xl font-bold text-zinc-50">{selectedSkill.name}</h1>
                            <p className="text-zinc-300 text-sm mt-2 leading-relaxed">{selectedSkill.description}</p>
                        </div>

                        <div className="border border-zinc-800 bg-zinc-900/30 rounded-lg p-4 space-y-3">
                            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Quick Commands</h4>
                            <div className="space-y-2">
                                {selectedSkill.id === "offensive-sqli" && (
                                    <>
                                        <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded border border-zinc-800/80">
                                            <code className="text-xs text-rose-300">sqlmap -u "http://target/login" --forms --batch --dbs</code>
                                            <button onClick={() => executeCommandText(`sqlmap -u "http://target/login" --forms --batch --dbs`)} className="text-xs bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded text-zinc-300 transition-colors">Copy</button>
                                        </div>
                                        <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded border border-zinc-800/80">
                                            <code className="text-xs text-rose-300">nuclei -t vulnerabilities/sqli/ -u http://target/</code>
                                            <button onClick={() => executeCommandText(`nuclei -t vulnerabilities/sqli/ -u http://target/`)} className="text-xs bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded text-zinc-300 transition-colors">Copy</button>
                                        </div>
                                    </>
                                )}
                                {selectedSkill.id === "hexstrike-agents" && (
                                    <>
                                        <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded border border-zinc-800/80">
                                            <code className="text-xs text-rose-300">python hexstrike_server.py --port 8888 --debug</code>
                                            <button onClick={() => executeCommandText(`python hexstrike_server.py --port 8888 --debug`)} className="text-xs bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded text-zinc-300 transition-colors">Copy</button>
                                        </div>
                                        <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded border border-zinc-800/80">
                                            <code className="text-xs text-rose-300">curl http://localhost:8888/health</code>
                                            <button onClick={() => executeCommandText(`curl http://localhost:8888/health`)} className="text-xs bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded text-zinc-300 transition-colors">Copy</button>
                                        </div>
                                    </>
                                )}
                                {selectedSkill.id === "xposure-secrets" && (
                                    <>
                                        <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded border border-zinc-800/80">
                                            <code className="text-xs text-rose-300">python -m xposure target.com -rc --shodan-key YOUR_KEY</code>
                                            <button onClick={() => executeCommandText(`python -m xposure target.com -rc --shodan-key YOUR_KEY`)} className="text-xs bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded text-zinc-300 transition-colors">Copy</button>
                                        </div>
                                        <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded border border-zinc-800/80">
                                            <code className="text-xs text-rose-300">python -m xposure.api --host 0.0.0.0 --port 8080</code>
                                            <button onClick={() => executeCommandText(`python -m xposure.api --host 0.0.0.0 --port 8080`)} className="text-xs bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded text-zinc-300 transition-colors">Copy</button>
                                        </div>
                                    </>
                                )}
                                {!["offensive-sqli", "hexstrike-agents", "xposure-secrets"].includes(selectedSkill.id) && (
                                    <div className="text-xs text-zinc-500 italic">Select SQL Injection, HexStrike, or Xposure for specific quick commands. Copy any other commands from your shell directly.</div>
                                )}
                            </div>
                        </div>

                        {/* System Log Console */}
                        <div className="flex-1 flex flex-col border border-zinc-800 bg-zinc-950 rounded-lg overflow-hidden min-h-[150px]">
                            <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                                <span className="text-xs font-semibold text-zinc-300">Activity Console</span>
                                <button onClick={() => setMcpLog([])} className="text-xs text-zinc-400 hover:text-zinc-200">Clear</button>
                            </div>
                            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-zinc-400 space-y-1.5">
                                {mcpLog.map((log, index) => (
                                    <div key={index} className={log.startsWith("[Clipboard]") ? "text-amber-400" : log.startsWith("[HexStrike]") || log.startsWith("[Xposure]") ? "text-emerald-400" : "text-zinc-500"}>
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg p-6">
                        <i className="fa-solid fa-shield-halved text-zinc-700 text-4xl mb-4"></i>
                        <h3 className="text-zinc-300 font-semibold text-sm">Select a playbook item</h3>
                        <p className="text-zinc-500 text-xs mt-1 text-center max-w-xs">Explore security skills and checklists in the left pane, or connect your local target scanning agents.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export { RedTeamViewModel };
