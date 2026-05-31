import { useEffect, useState } from 'react';
import { apiFetch } from '../../api';

interface GhostNode {
  hostname: string;
  ip: string;
  status: string;
}

export default function GhostTactical() {
  const [ghosts, setGhosts] = useState<GhostNode[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGhosts = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/ghost/nodes');
      if (res.ok) setGhosts(res.ghosts);
    } catch (err) {
      console.error("Failed to load ghost nodes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (hostname: string, type: string, action: string) => {
    try {
      await apiFetch(`/api/ghost/${hostname}/tactical/${type}`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      alert(`${action.toUpperCase()} action dispatched to ${hostname}.`);
    } catch (err) {
      console.error(`Tactical action failed on ${hostname}:`, err);
    }
  };

  const destructAll = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to globally destruct all ghost nodes? This action cannot be undone.")) return;
    try {
      await apiFetch('/api/ghost/destruct-all', { method: 'POST' });
      loadGhosts();
    } catch (err) {
      console.error("Global destruct failed:", err);
    }
  };

  useEffect(() => {
    loadGhosts();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-orange-500">👻 Ghost Tactical Matrix</h2>
        <div className="flex gap-2">
          <button 
            onClick={loadGhosts}
            className="text-xs text-[#8e8e8e] hover:text-white"
          >
            Rescan Mesh
          </button>
          <button 
            onClick={destructAll}
            className="text-xs text-red-500 hover:text-red-400 font-bold"
          >
            GLOBAL_DESTRUCT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ghosts.map((g, i) => (
          <div key={i} className="bg-[#181818] border border-[#2b2b2b] rounded-xl p-5 flex flex-col gap-4 shadow-lg hover:border-orange-500/30 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-white font-mono font-bold">{g.hostname}</div>
                <div className="text-[10px] text-[#555] font-mono">{g.ip}</div>
              </div>
              <span className="bg-green-900/20 text-green-500 text-[9px] px-2 py-0.5 rounded-full border border-green-900/50">
                {g.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleAction(g.hostname, 'proxy', 'start')}
                className="bg-[#252525] border border-[#333] text-[#ccc] py-2 rounded text-[11px] font-bold hover:bg-[#333] hover:text-white"
              >
                PROXY ON
              </button>
              <button 
                onClick={() => handleAction(g.hostname, 'simulation', 'cover')}
                className="bg-[#252525] border border-[#333] text-[#ccc] py-2 rounded text-[11px] font-bold hover:bg-[#333] hover:text-white"
              >
                COVER FLOW
              </button>
              <button 
                onClick={() => handleAction(g.hostname, 'exploit', 'pivot')}
                className="bg-[#252525] border border-[#333] text-[#ccc] py-2 rounded text-[11px] font-bold hover:bg-[#333] hover:text-white"
              >
                PIVOT_INIT
              </button>
              <button 
                onClick={() => handleAction(g.hostname, 'vanish', 'now')}
                className="bg-[#252525] border border-[#333] text-red-500/70 py-2 rounded text-[11px] font-bold hover:bg-red-900/20 hover:text-red-500"
              >
                DECOMMISSION
              </button>
            </div>
          </div>
        ))}
      </div>

      {ghosts.length === 0 && !loading && (
        <div className="p-20 text-center text-[#8e8e8e] border border-dashed border-[#2b2b2b] rounded-xl italic">
          No tactical ghost assets detected in the current mission sector.
        </div>
      )}

      <div className="mt-8 border-t border-[#2b2b2b] pt-8">
        <h3 className="text-sm font-bold text-[#8e8e8e] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
            Tactical Out-of-Band Comm (Signal)
            <span className="bg-cyan-900/30 text-cyan-500 border border-cyan-900/50 px-1.5 py-0.5 rounded text-[8px] tracking-widest ml-2">TYPE 1 E2E</span>
        </h3>
        <div className="bg-[#181818] border border-[#2b2b2b] rounded-xl p-5 flex gap-3">
            <input 
                type="text" 
                id="signal-msg"
                placeholder="Secure message payload..."
                className="flex-1 bg-black border border-[#333] rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
            />
            <button 
                onClick={async () => {
                    const msg = (document.getElementById('signal-msg') as HTMLInputElement).value;
                    if(!msg) return;
                    await apiFetch('/api/signal/send', { method: 'POST', body: JSON.stringify({ message: msg }) });
                    
                    (document.getElementById('signal-msg') as HTMLInputElement).value = '';
                }}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all"
            >
                DISPATCH
            </button>
        </div>
      </div>
    </div>
  );
}
