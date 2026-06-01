import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../../api';

interface LogEntry {
  type: 'user' | 'jarvis' | 'system';
  content: string;
  timestamp: string;
}

export default function TerminalConsole() {
  const [input, setQuery] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    { type: 'system', content: 'AI Supreme Sovereign Core established.', timestamp: new Date().toLocaleTimeString() },
    { type: 'system', content: 'Awaiting tactical directives...', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [loading, setLoading] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || loading) return;

    const userCmd = input;
    setQuery('');
    setLogs(prev => [...prev, { type: 'user', content: userCmd, timestamp: new Date().toLocaleTimeString() }]);
    
    try {
      setLoading(true);
      const res = await apiFetch('/api/ponder', {
        method: 'POST',
        body: JSON.stringify({ prompt: userCmd, sector: 'omni' })
      });
      setLogs(prev => [...prev, { type: 'jarvis', content: res.result, timestamp: new Date().toLocaleTimeString() }]);
    } catch (err) {
      setLogs(prev => [...prev, { type: 'system', content: 'Connection to Jarvis Strategic Core timed out.', timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full max-h-[calc(100vh-160px)]">
      <div className="flex-1 bg-[#101010] border border-[#2b2b2b] p-6 rounded-xl font-mono text-[12px] overflow-y-auto custom-scrollbar shadow-inner">
        {logs.map((log, i) => (
          <div key={i} className="mb-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="flex gap-2 items-center mb-1">
              <span className="text-[9px] text-[#555]">{log.timestamp}</span>
              <span className={`text-[10px] font-bold px-1 rounded ${
                log.type === 'user' ? 'text-cyan-500' : 
                log.type === 'jarvis' ? 'text-orange-500' : 'text-[#8e8e8e]'
              }`}>
                {log.type.toUpperCase()}
              </span>
            </div>
            <div className={`leading-relaxed ${
              log.type === 'user' ? 'text-white' : 
              log.type === 'jarvis' ? 'text-[#ccc]' : 'text-[#8e8e8e] italic'
            }`}>
              {log.type === 'user' && <span className="text-cyan-500 mr-2">$</span>}
              {log.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-orange-500/50 animate-pulse font-bold mt-4">
            {'>'} JARVIS IS PONDERING...
          </div>
        )}
        <div ref={logEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-3 bg-[#181818] p-2 rounded-full border border-[#2b2b2b] focus-within:border-cyan-500/50 transition-colors">
        <input 
          type="text"
          value={input}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter sovereign directive..."
          className="flex-1 bg-transparent px-4 py-2 text-white font-mono text-sm outline-none"
          autoFocus
        />
        <button 
          type="submit"
          disabled={loading}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            loading ? 'bg-[#333] cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.3)]'
          }`}
        >
          {loading ? '...' : '⚡'}
        </button>
      </form>
    </div>
  );
}
