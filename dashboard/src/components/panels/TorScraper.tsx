import { useState } from 'react';
import { apiFetch } from '../../api';

export default function TorScraper() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    try {
      setLoading(true);
      // Assuming Tor Scraper is proxied or reachable via /api/scraper
      const res = await apiFetch(`/api/scraper/search?q=${encodeURIComponent(query)}`);
      setResults(res.results || []);
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-orange-400">🕷️ Tor Scraper Interface</h2>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter intelligence target or search query..."
          className="flex-1 bg-[#181818] border border-[#2b2b2b] rounded-md px-4 py-2 text-[13px] outline-none focus:border-orange-500/50"
        />
        <button 
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md text-[13px] font-bold"
        >
          {loading ? 'SCANNING...' : 'SCATTER-SEARCH'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((r, i) => (
          <div key={i} className="bg-[#181818] border border-[#2b2b2b] rounded-lg p-4 flex flex-col gap-3">
            <div className="text-[14px] font-bold text-white truncate">{r.title}</div>
            <div className="text-[11px] text-[#8e8e8e] line-clamp-3 h-12">{r.description}</div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-orange-400 font-mono">TOR-GATEWAY</span>
              <a 
                href={r.video_url} 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 text-[11px] hover:underline"
              >
                OPEN VAULT
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {results.length === 0 && !loading && (
        <div className="p-20 text-center text-[#8e8e8e] border border-dashed border-[#2b2b2b] rounded-lg">
          Initialize Scraper via Tor circuit to begin data extraction.
        </div>
      )}
    </div>
  );
}
