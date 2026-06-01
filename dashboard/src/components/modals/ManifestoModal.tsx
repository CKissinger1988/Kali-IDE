interface ManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

export default function ManifestoModal({ isOpen, onClose, content }: ManifestoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.95)] z-[40000] p-10 overflow-y-auto">
      <div className="max-w-[800px] mx-auto bg-[#181818] border border-[#4c82ff] rounded-xl p-10 shadow-[0_0_50px_rgba(76,130,255,0.2)]">
        <div className="flex justify-between items-center mb-8 border-b border-[#2b2b2b] pb-5">
            <h1 className="text-2xl tracking-widest text-[#4c82ff]">SUPREME COMMAND MANIFESTO</h1>
            <button className="bg-[#1c1c2e] border border-[#333] text-[#4c82ff] px-3 py-1 rounded text-xs font-semibold cursor-pointer" onClick={onClose}>DISMISS</button>
        </div>
        <div className="leading-loose text-[#ccc] text-xs font-mono whitespace-pre-wrap">
            {content}
        </div>
      </div>
    </div>
  );
}
