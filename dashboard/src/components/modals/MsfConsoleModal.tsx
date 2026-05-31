import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface MsfConsoleModalProps {
  sessionId: string | number;
  peer: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MsfConsoleModal({ sessionId, peer, isOpen, onClose }: MsfConsoleModalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (isOpen && terminalRef.current && !xtermRef.current) {
      const term = new Terminal({
        cursorBlink: true,
        theme: {
          background: '#0f0f0f',
          foreground: '#3dd68c',
        },
        fontSize: 12,
        fontFamily: 'monospace',
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();

      term.writeln(`\x1b[1;31m[*] \x1b[0mConnecting to MSF Session ${sessionId} [${peer}]...`);
      term.writeln(`\x1b[1;32m[+] \x1b[0mEstablished encrypted bridge.`);
      term.write(`\n\x1b[1;34mmeterpreter\x1b[0m > `);

      term.onData(async (data) => {
        if (data === '\r') {
          term.write('\r\n');
          // In a real app, we'd send the buffer to the backend
          // Here we'll just simulate a response
          term.write(`\x1b[1;34mmeterpreter\x1b[0m > `);
        } else {
          term.write(data);
        }
      });

      xtermRef.current = term;
    }

    return () => {
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
      }
    };
  }, [isOpen, sessionId, peer]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[50000] flex items-center justify-center p-10">
      <div className="w-full max-w-4xl h-[600px] bg-[#0f0f0f] border border-[#333] rounded-xl flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-[#181818] px-5 py-3 border-b border-[#2b2b2b] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-red-500 font-bold">💀 SESSION_CONSOLE</span>
            <span className="text-[#8e8e8e] text-xs font-mono">ID: {sessionId} | {peer}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-[#8e8e8e] hover:text-white text-xs font-bold uppercase tracking-tighter"
          >
            Terminate Bridge
          </button>
        </div>
        <div ref={terminalRef} className="flex-1 p-2" />
      </div>
    </div>
  );
}
