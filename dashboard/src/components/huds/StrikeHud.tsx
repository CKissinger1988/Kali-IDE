interface StrikeHudProps {
  active: boolean;
  progress: number;
  log: string[];
}

export default function StrikeHud({ active, progress, log }: StrikeHudProps) {
  if (!active) return null;

  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 w-[400px] bg-[rgba(248,81,73,0.1)] border border-[#f85149] rounded-lg p-5 z-[30000] shadow-[0_0_30px_rgba(248,81,73,0.3)] backdrop-blur-[10px]">
      <div className="flex justify-between items-center mb-3">
        <strong className="text-[#f85149] tracking-widest text-sm">NEURAL STRIKE IN PROGRESS</strong>
        <span className="bg-[#f85149] shadow-[0_0_10px_#f85149] w-2 h-2 rounded-full"></span>
      </div>
      <div className="h-1 bg-[#333] rounded-full overflow-hidden mb-3">
        <div className="h-full bg-[#f85149] transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="font-mono text-[10px] text-[#f85149] h-20 overflow-y-auto leading-relaxed">
        {log.map((line, i) => <div key={i}>{line}</div>)}
      </div>
    </div>
  );
}
