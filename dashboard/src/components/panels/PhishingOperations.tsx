import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';

interface Campaign {
  id: string;
  name: string;
  status: string;
  targets: number;
  clicked: number;
  compromised: number;
}

interface Credential {
  id: string;
  campaignId: string;
  target: string;
  identity: string;
  secret: string;
  timestamp: string;
}

export default function PhishingOperations() {
  const [campaignName, setCampaignName] = useState('');
  const [targetEmails, setTargetEmails] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(true);
  const [jarvisActive, setJarvisActive] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/phishing/campaigns');
      if (res.ok && res.campaigns) {
        setCampaigns(res.campaigns);
      }
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };

  const loadCredentials = async () => {
    try {
      setLoadingCreds(true);
      const res = await apiFetch('/api/phishing/credentials');
      if (res.ok && res.credentials) {
        setCredentials(res.credentials);
      }
    } catch (err) {
      
    } finally {
      setLoadingCreds(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
    loadCredentials();
  }, []);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName || !targetEmails) return;
    
    setIsLaunching(true);
    try {
      await apiFetch('/api/phishing/launch', {
        method: 'POST',
        body: JSON.stringify({ name: campaignName, targets: targetEmails.split('\n') })
      });
      
      setCampaignName('');
      setTargetEmails('');
      loadCampaigns();
    } catch (err) {
      
      
    } finally {
      setIsLaunching(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.true) return;
    
    try {
      await apiFetch(`/api/phishing/campaigns/${id}`, {
        method: 'DELETE'
      });
      loadCampaigns();
    } catch (err) {
      
      
    }
  };

  const toggleJarvis = async () => {
    const newState = !jarvisActive;
    setJarvisActive(newState);
    try {
      await apiFetch('/api/phishing/jarvis', {
        method: 'POST',
        body: JSON.stringify({ active: newState })
      });
    } catch (err) {
      
      setJarvisActive(!newState); // Revert on failure
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(campaigns.length / itemsPerPage));
  const paginatedCampaigns = campaigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const nextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const prevPage = () => setCurrentPage(p => Math.max(1, p - 1));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-400">🎣 Phishing Operations</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => { loadCampaigns(); loadCredentials(); }}
            className="bg-[#2a2a2a] px-3 py-1 rounded border border-[#3b3b3b] text-[12px] hover:bg-[#333] transition-colors"
          >
            {loading || loadingCreds ? 'Polling...' : 'Refresh Intel'}
          </button>
          <button
            onClick={toggleJarvis}
            className={`px-3 py-1 rounded text-[12px] font-bold border transition-colors flex items-center gap-2 ${
              jarvisActive 
                ? 'bg-orange-900/20 text-orange-500 border-orange-900/50 hover:bg-orange-900/40' 
                : 'bg-[#2a2a2a] text-[#8e8e8e] border-[#3b3b3b] hover:text-white'
            }`}
          >
            {jarvisActive && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></span>}
            {jarvisActive ? 'JARVIS AUTONOMOUS ON' : 'ACTIVATE JARVIS'}
          </button>
        </div>
      </div>

      <div className="bg-[#181818] border border-[#2b2b2b] rounded-xl p-5 shadow-xl max-w-2xl">
        <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4">Initialize New Campaign</h3>
        <form onSubmit={handleLaunch} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-[#555] font-bold uppercase">Campaign Designation</label>
                <input 
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="OP_SPEARPHISH_01"
                    className="bg-black border border-[#2b2b2b] rounded p-2 text-xs text-white outline-none focus:border-blue-500/50"
                    required
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-[#555] font-bold uppercase">Target Emails (One per line)</label>
                <textarea 
                    value={targetEmails}
                    onChange={(e) => setTargetEmails(e.target.value)}
                    placeholder="target1@example.com&#10;target2@example.com"
                    className="bg-black border border-[#2b2b2b] rounded p-2 text-xs text-white outline-none focus:border-blue-500/50 h-32 resize-none custom-scrollbar"
                    required
                />
            </div>
            <button 
                type="submit"
                disabled={isLaunching}
                className="mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-[#333] disabled:text-[#888] text-white text-[11px] font-bold py-2.5 rounded shadow-lg transition-all active:scale-95"
            >
                {isLaunching ? 'LAUNCHING...' : 'LAUNCH CAMPAIGN'}
            </button>
        </form>
      </div>

      <div className="bg-[#181818] rounded-xl border border-[#2b2b2b] overflow-hidden mt-2">
        <div className="bg-[#252525] px-5 py-3 text-[11px] font-bold text-[#8e8e8e] border-b border-[#2b2b2b] uppercase tracking-widest">
          Active Campaign Intelligence
        </div>
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="text-[#8e8e8e] border-b border-[#2b2b2b]">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Designation</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Targets</th>
              <th className="p-4 font-medium text-orange-400">Clicked</th>
              <th className="text-right p-4 font-medium text-red-500">Compromised</th>
              <th className="text-right p-4 font-medium text-[#8e8e8e]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2b2b2b]">
            {paginatedCampaigns.map(c => (
              <tr key={c.id} className="hover:bg-[#1f1f1f] transition-colors">
                <td className="p-4 font-mono text-blue-400 text-[11px]">{c.id}</td>
                <td className="p-4 font-bold text-white">{c.name}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                    c.status === 'ACTIVE' ? 'bg-blue-900/20 text-blue-400 border border-blue-900/50' :
                    c.status === 'COMPLETED' ? 'bg-green-900/20 text-green-500 border border-green-900/50' :
                    'bg-[#333] text-[#8e8e8e] border border-[#444]'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-4 font-mono text-[#ccc]">{c.targets}</td>
                <td className="p-4 font-mono text-orange-400 font-bold">{c.clicked}</td>
                <td className="p-4 text-right font-mono text-red-500 font-bold">{c.compromised}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="text-red-500 hover:text-red-400 hover:underline text-[10px] font-bold"
                  >
                    ABORT
                  </button>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-[#8e8e8e] italic">No active phishing operations detected in this sector.</td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-3 bg-[#1e1e1e] border-t border-[#2b2b2b]">
            <button disabled={currentPage === 1} onClick={prevPage} className="text-[#8e8e8e] hover:text-white disabled:opacity-50 text-[11px] font-bold px-2">PREV</button>
            <span className="text-[10px] text-[#555] font-mono">PAGE {currentPage} OF {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={nextPage} className="text-[#8e8e8e] hover:text-white disabled:opacity-50 text-[11px] font-bold px-2">NEXT</button>
          </div>
        )}
      </div>

      <div className="bg-[#181818] rounded-xl border border-[#2b2b2b] overflow-hidden mt-2">
        <div className="bg-[#252525] px-5 py-3 text-[11px] font-bold text-green-500 border-b border-[#2b2b2b] uppercase tracking-widest flex justify-between items-center">
          <span>Harvested Identity Vault</span>
          <span className="text-[9px] text-[#8e8e8e] font-mono">{credentials.length} RECORDS SECURED</span>
        </div>
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="text-[#8e8e8e] border-b border-[#2b2b2b]">
              <th className="p-4 font-medium">OP ID</th>
              <th className="p-4 font-medium">Target Host</th>
              <th className="p-4 font-medium text-cyan-400">Intercepted Identity</th>
              <th className="p-4 font-medium text-green-500 flex items-center gap-2">
                <span>Secret / Hash</span>
                <span className="bg-green-900/30 text-green-500 border border-green-900/50 px-1.5 py-0.5 rounded text-[8px] tracking-widest">TYPE 1 SECURED</span>
              </th>
              <th className="text-right p-4 font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2b2b2b]">
            {credentials.map(cred => (
              <tr key={cred.id} className="hover:bg-[#1f1f1f] transition-colors">
                <td className="p-4 font-mono text-[#8e8e8e] text-[10px]">{cred.campaignId}</td>
                <td className="p-4 font-mono text-[#ccc]">{cred.target}</td>
                <td className="p-4 font-mono text-cyan-400 font-bold">{cred.identity}</td>
                <td className="p-4 font-mono text-green-500 max-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="truncate flex-1">
                      {revealedIds.has(cred.id) 
                        ? cred.secret 
                        : `[T1-ENC] ${Array.from(cred.secret).map(c => (c.charCodeAt(0) ^ 0x55).toString(16).padStart(2, '0')).join('')}`.substring(0, 32) + '...'}
                    </span>
                    <button onClick={() => toggleReveal(cred.id)} className="text-[#8e8e8e] hover:text-white text-[10px] font-bold">
                      {revealedIds.has(cred.id) ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </td>
                <td className="p-4 text-right font-mono text-[#555] text-[10px]">{cred.timestamp}</td>
              </tr>
            ))}
            {credentials.length === 0 && !loadingCreds && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-[#8e8e8e] italic">Vault empty. Awaiting credential interceptions.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}