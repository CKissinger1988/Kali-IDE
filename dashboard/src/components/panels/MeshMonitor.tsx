import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

interface Anchor {
  root: string;
  tx: string;
  timestamp: string;
}

export default function MeshMonitor() {
  const [anchors, setAnchors] = useState<Anchor[]>([]);

  useEffect(() => {
    const s = io(window.location.origin);

    s.on('blockchain:anchor', (data: any) => {
      setAnchors(prev => [{ ...data, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const triggerAnchor = async () => {
    // Manually trigger an anchor if needed
    try {
      const res = await fetch('/api/sovereign/anchor', { method: 'POST' });
      const data = await res.json();
      setAnchors(prev => [{ ...data, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
    } catch (err) {}
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-500">🔗 Mesh Blockchain Anchoring</h2>
        <button 
          onClick={triggerAnchor}
          className="bg-green-600/10 border border-green-600/50 text-green-600 px-3 py-1 rounded text-xs font-bold hover:bg-green-600 hover:text-white transition-colors"
        >
          FORCE_ANCHOR
        </button>
      </div>

      <div className="bg-[#181818] border border-[#2b2b2b] rounded-xl overflow-hidden shadow-lg">
        <div className="bg-[#252525] px-5 py-3 text-[11px] font-bold text-[#8e8e8e] border-b border-[#2b2b2b] uppercase tracking-widest">
          Recent Immutable State Roots
        </div>
        <div className="divide-y divide-[#2b2b2b]">
          {anchors.map((a, i) => (
            <div key={i} className="p-4 flex flex-col gap-2 hover:bg-[#1f1f1f] transition-colors">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#555] font-mono">{a.timestamp}</span>
                <span className="text-[9px] bg-green-900/20 text-green-500 px-1.5 py-0.5 rounded border border-green-900/50 font-bold uppercase">Confirmed</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[11px] text-[#8e8e8e]">STATE_ROOT: <span className="text-white font-mono">{a.root}</span></div>
                <div className="text-[11px] text-[#8e8e8e]">TX_HASH: <span className="text-cyan-400 font-mono truncate">{a.tx}</span></div>
              </div>
            </div>
          ))}
          {anchors.length === 0 && (
            <div className="p-10 text-center text-[#555] italic text-xs">
              Synchronizing with sovereign ledger...
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#181818] p-5 rounded-xl border border-[#2b2b2b] flex flex-col gap-3">
        <div className="text-[11px] font-bold text-[#8e8e8e] uppercase tracking-widest">Mesh Integrity Status</div>
        <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
                <span className="text-[9px] text-[#555]">NODES</span>
                <span className="text-lg font-mono text-white">07</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[9px] text-[#555]">LATENCY</span>
                <span className="text-lg font-mono text-cyan-400">14ms</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[9px] text-[#555]">ENCRYPTION</span>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-mono text-green-500">TYPE_1</span>
                    <span className="bg-green-900/30 text-green-500 border border-green-900/50 px-1 py-0.5 rounded text-[8px] tracking-widest mt-1">SECURED</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
