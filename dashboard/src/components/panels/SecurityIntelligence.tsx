import { useEffect, useState } from 'react';
import { apiFetch } from '../../api';

interface Vulnerability {
  cve: string;
  vmid: number;
  ip: string;
}

export default function SecurityIntelligence() {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [cveDetails, setCveDetails] = useState<Record<string, string>>({});
  const [engineStatus, setEngineStatus] = useState<any>(null);
  const [pivots, setPivots] = useState<any[]>([]);

  const loadVulns = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/proxmox/vulnerabilities');
      if (res.ok) setVulns(res.data);
      
      const statusRes = await apiFetch('/api/hexstrike/status');
      if (statusRes.ok) setEngineStatus(statusRes.state);

      const pivotRes = await apiFetch('/api/hexstrike/pivots');
      if (pivotRes.ok) setPivots(pivotRes.pivots);
    } catch (err) {
      console.error("Failed to load security intelligence:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCveInfo = async (cve: string) => {
    if (cveDetails[cve]) return;
    try {
      setCveDetails(prev => ({ ...prev, [cve]: 'Querying NIST...' }));
      const res = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cve}`);
      const data = await res.json();
      const desc = data.vulnerabilities?.[0]?.cve?.descriptions?.find((d: any) => d.lang === 'en')?.value;
      setCveDetails(prev => ({ ...prev, [cve]: desc || 'No description found.' }));
    } catch (err) {
      setCveDetails(prev => ({ ...prev, [cve]: 'NIST lookup failed.' }));
    }
  };

  const handleHexstrike = async (v: Vulnerability) => {
    if (!window.confirm(`Initiate HEXSTRIKE sequence against ${v.ip}?`)) return;
    try {
      await apiFetch('/api/proxmox/vm/snapshot', {
        method: 'POST',
        body: JSON.stringify({ target: v.ip, type: 'pre-strike-failsafe' })
      });
      alert(`Failsafe snapshot created. HEXSTRIKE executing on ${v.ip}.`);
    } catch (err) {
      console.error("Failed to execute Hexstrike:", err);
    }
  };

  useEffect(() => {
    loadVulns();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cyan-400">🛡️ Security Intelligence</h2>
        <button onClick={loadVulns} className="text-xs text-[#8e8e8e] hover:text-white">Refresh Intel</button>
      </div>

      <div className="space-y-4">
        <div className="text-[11px] font-bold text-[#8e8e8e] uppercase tracking-widest">Active Vulnerabilities</div>
        {vulns.map((v, i) => (
          <div key={i} className="bg-[#181818] border border-[#2b2b2b] p-4 rounded-lg flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-red-500 font-mono font-bold cursor-pointer hover:underline" onClick={() => fetchCveInfo(v.cve)}>
                {v.cve}
              </span>
              <button 
                onClick={() => handleHexstrike(v)}
                className="bg-red-900/20 text-red-500 border border-red-900/50 px-3 py-1 rounded text-[10px] font-bold hover:bg-red-900/40"
              >
                HEXSTRIKE
              </button>
            </div>
            <div className="text-[11px] text-[#8e8e8e]">
              Target: <span className="text-white font-mono">{v.ip}</span> (VM {v.vmid})
            </div>
            {cveDetails[v.cve] && (
              <div className="text-[11px] bg-black/40 p-2 rounded border border-[#333] text-[#ccc] leading-relaxed">
                {cveDetails[v.cve]}
              </div>
            )}
          </div>
        ))}
        {vulns.length === 0 && !loading && (
          <div className="bg-[#181818] p-8 rounded-lg text-center text-[#8e8e8e] italic border border-[#2b2b2b] border-dashed">
            No critical vulnerabilities detected in the perimeter.
          </div>
        )}
      </div>

      <div className="sidebar-section-title text-[11px] font-bold text-[#8e8e8e] uppercase tracking-widest mt-4">Lateral Pivot suggestions (Jarvis)</div>
      {pivots.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 mt-2">
            {pivots.map((p, i) => (
                <div key={i} className="bg-[#181818] border border-[#2b2b2b] p-4 rounded-lg flex flex-col gap-2 hover:border-cyan-500/30 transition-colors">
                    <div className="flex justify-between items-center">
                        <span className="text-[12px] font-bold text-cyan-400">{p.vector}</span>
                        <span className="text-[9px] font-mono text-[#555]">CONFIDENCE: <span className="text-green-500">{p.confidence}</span></span>
                    </div>
                    <div className="text-[11px] text-[#8e8e8e]">
                        Source: <span className="text-white">{p.source}</span> → Target: <span className="text-white">{p.target}</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded font-mono text-[9px] text-[#666] border border-[#222]">
                        PATH: {p.path}
                    </div>
                    <button className="mt-1 bg-cyan-900/20 text-cyan-500 border border-cyan-900/50 py-1.5 rounded text-[10px] font-bold hover:bg-cyan-900/40">
                        EXECUTE PIVOT
                    </button>
                </div>
            ))}
        </div>
      ) : (
        <div className="bg-[#3dd68c]/5 border border-[#3dd68c]/20 p-4 rounded-lg text-[12px] text-[#ccc]">
            Autonomous agent analyzing lateral vectors... <span className="animate-pulse">|</span>
        </div>
      )}

      {engineStatus && (
        <div className="mt-8 border-t border-[#2b2b2b] pt-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[11px] font-bold text-[#8e8e8e] uppercase tracking-widest">Hexstrike Mission Log</h3>
            <span className="flex items-center gap-1.5 text-[9px] text-green-500 font-bold uppercase">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
              Autonomous Online
            </span>
          </div>
          <div className="bg-black border border-[#2b2b2b] p-4 rounded-xl font-mono text-[10px] text-orange-500/80 h-48 overflow-y-auto custom-scrollbar">
            {engineStatus.missionLog.map((log: string, i: number) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
