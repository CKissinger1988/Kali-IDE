import { useEffect, useState } from 'react';
import { apiFetch } from '../../api';
import MsfConsoleModal from '../modals/MsfConsoleModal';

interface Session {
  id: string | number;
  type: string;
  info: string;
  tunnel_peer: string;
  target_host: string;
}

export default function MsfSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/msf/sessions');
      if (res.ok && res.sessions) {
        const sessionList = Array.isArray(res.sessions) 
          ? res.sessions 
          : Object.entries(res.sessions).map(([id, s]: [string, any]) => ({ id, ...s }));
        setSessions(sessionList);
      }
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-red-500">💀 MSF Sessions</h2>
        <button 
          onClick={loadSessions}
          className="bg-[#2a2a2a] px-3 py-1 rounded border border-[#3b3b3b] text-[12px] hover:bg-[#333]"
        >
          {loading ? 'Polling...' : 'Sync Sessions'}
        </button>
      </div>

      <div className="bg-[#181818] rounded-lg border border-[#2b2b2b] overflow-hidden">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="bg-[#252525] text-[#8e8e8e]">
              <th className="p-3">ID</th>
              <th>Type</th>
              <th>Info</th>
              <th>Peer</th>
              <th className="text-right p-3">Command</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2b2b2b]">
            {sessions.map(s => (
              <tr key={s.id} className="hover:bg-[#1f1f1f]">
                <td className="p-3 font-mono text-red-400">{s.id}</td>
                <td>{s.type}</td>
                <td className="max-w-xs truncate">{s.info || '—'}</td>
                <td className="font-mono">{s.tunnel_peer || s.target_host || '—'}</td>
                <td className="p-3 text-right">
                  <button 
                    onClick={() => setActiveSession(s)}
                    className="text-cyan-400 hover:underline"
                  >
                    CONSOLE
                  </button>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-[#8e8e8e]">No established shells or sessions active.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {activeSession && (
        <MsfConsoleModal 
          sessionId={activeSession.id}
          peer={activeSession.tunnel_peer || activeSession.target_host}
          isOpen={!!activeSession}
          onClose={() => setActiveSession(null)}
        />
      )}
    </div>
  );
}
