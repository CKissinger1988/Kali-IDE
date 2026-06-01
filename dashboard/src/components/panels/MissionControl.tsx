import { useEffect, useState } from 'react';
import { apiFetch } from '../../api';

interface Mission {
  id: string;
  name: string;
  target: string;
  status: string;
  nodes: number;
  coverage: string;
}

export default function MissionControl() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [, setLoading] = useState(true);
  const [newMission, setNewMission] = useState({ name: '', target: '', nodes: 1 });

  const loadMissions = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/sovereign/missions');
      if (res.ok) setMissions(res.missions);
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };

  const createMission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/sovereign/missions', {
        method: 'POST',
        body: JSON.stringify(newMission)
      });
      setNewMission({ name: '', target: '', nodes: 1 });
      loadMissions();
    } catch (err) {
      
    }
  };

  useEffect(() => {
    loadMissions();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-red-500">🏁 Strategic Mission Control</h2>
        <button onClick={loadMissions} className="text-xs text-[#8e8e8e] hover:text-white underline">Refresh Campaign State</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="text-[11px] font-bold text-[#8e8e8e] uppercase tracking-widest">Active Offensive Campaigns</div>
          <div className="grid grid-cols-1 gap-3">
            {missions.map((m) => (
              <div key={m.id} className="bg-[#181818] border border-[#2b2b2b] rounded-xl p-5 flex flex-col gap-3 shadow-lg hover:border-red-500/30 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-bold tracking-tight">{m.name}</h3>
                    <div className="text-[10px] text-[#555] font-mono mt-1">TARGET: {m.target} | NODES: {m.nodes}</div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                    m.status === 'ONGOING' ? 'bg-orange-900/20 text-orange-500 border-orange-900/50' : 
                    m.status === 'COMPLETED' ? 'bg-green-900/20 text-green-500 border-green-900/50' : 
                    'bg-cyan-900/20 text-cyan-500 border-cyan-900/50'
                  }`}>
                    {m.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1 bg-black h-1.5 rounded-full overflow-hidden border border-[#222]">
                        <div 
                            className={`h-full transition-all duration-1000 ${m.status === 'COMPLETED' ? 'bg-green-500' : 'bg-red-600'}`}
                            style={{ width: m.coverage }}
                        ></div>
                    </div>
                    <span className="text-[10px] font-mono text-[#8e8e8e]">{m.coverage} COMPLETE</span>
                </div>

                <div className="flex gap-2 mt-2">
                    <button className="bg-[#252525] text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-[#333] transition-colors">INTEL_VIEW</button>
                    <button className="bg-[#252525] text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-[#333] transition-colors">ADJUST_PAYLOAD</button>
                    <button className="ml-auto text-red-500 text-[10px] font-bold px-2 py-1.5 hover:underline">ABORT</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-[#181818] border border-[#2b2b2b] rounded-xl p-5 shadow-xl">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4">Initialize New Op</h3>
            <form onSubmit={createMission} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-[#555] font-bold uppercase">Mission Designation</label>
                    <input 
                        type="text"
                        value={newMission.name}
                        onChange={(e) => setNewMission({...newMission, name: e.target.value})}
                        placeholder="OP_DESIGNATION_V1"
                        className="bg-black border border-[#2b2b2b] rounded p-2 text-xs text-white outline-none focus:border-red-500/50"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-[#555] font-bold uppercase">Tactical Target Range</label>
                    <input 
                        type="text"
                        value={newMission.target}
                        onChange={(e) => setNewMission({...newMission, target: e.target.value})}
                        placeholder="10.0.0.0/24"
                        className="bg-black border border-[#2b2b2b] rounded p-2 text-xs text-white outline-none focus:border-red-500/50"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-[#555] font-bold uppercase">Mesh Node Allocation ({newMission.nodes})</label>
                    <input 
                        type="range"
                        min="1"
                        max="24"
                        value={newMission.nodes}
                        onChange={(e) => setNewMission({...newMission, nodes: parseInt(e.target.value)})}
                        className="accent-red-600"
                    />
                </div>
                <button 
                    type="submit"
                    className="mt-2 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold py-2.5 rounded shadow-lg transition-all active:scale-95"
                >
                    INITIATE MISSION
                </button>
            </form>
          </div>

          <div className="bg-[#181818] border border-[#2b2b2b] rounded-xl p-5 border-dashed">
            <div className="text-[9px] text-[#8e8e8e] uppercase font-bold tracking-widest mb-2">Campaign Intelligence</div>
            <div className="text-[11px] text-[#555] leading-relaxed">
                Coordinated campaigns utilize multiple shadow nodes to perform parallel vulnerability scanning and multi-vector exploitation. Results are anchored to the mesh state automatically.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
