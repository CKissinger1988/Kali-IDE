import { useState } from 'react';
import { apiFetch } from '../../api';

interface ProjectZeroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectZeroModal({ isOpen, onClose }: ProjectZeroModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePurge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    try {
      setLoading(true);
      const res = await apiFetch('/api/sovereign/project-zero', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        
        window.location.reload();
      }
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-red-950/90 backdrop-blur-md z-[60000] flex items-center justify-center p-10">
      <div className="w-full max-w-lg bg-[#0f0f0f] border-2 border-red-600 rounded-2xl p-10 shadow-[0_0_100px_rgba(220,38,38,0.3)]">
        <h1 className="text-3xl font-black text-red-600 tracking-tighter mb-2 text-center uppercase">Project Zero</h1>
        <p className="text-[#8e8e8e] text-center text-sm mb-8">Enter the final override code to initiate a complete mesh purge and secure data scrubbing sequence.</p>
        
        <form onSubmit={handlePurge} className="flex flex-col gap-5">
          <input 
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="OVERRIDE CODE"
            className="bg-black border border-red-900/50 rounded-lg px-5 py-4 text-white text-center font-mono text-xl tracking-[0.5em] outline-none focus:border-red-600 shadow-inner"
            autoFocus
          />
          
          <div className="flex gap-3 mt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#222] text-[#8e8e8e] py-3 rounded-lg font-bold hover:bg-[#333] transition-colors"
            >
              ABORT
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all active:scale-95"
            >
              {loading ? 'PURGING...' : 'INITIATE PURGE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
