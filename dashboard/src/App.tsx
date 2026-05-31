import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import Header from './components/Header';
import StrikeHud from './components/huds/StrikeHud';
import ManifestoModal from './components/modals/ManifestoModal';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [strike] = useState({ active: false, progress: 0, log: [] });
  const [manifestoOpen, setManifestoOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-[#e0e0e0] font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <MainPanel activeTab={activeTab} />
      </div>
      
      <StrikeHud active={strike.active} progress={strike.progress} log={strike.log} />
      <ManifestoModal 
        isOpen={manifestoOpen} 
        onClose={() => setManifestoOpen(false)} 
        content="AI Supreme: Sovereign Command Manifesto content..."
      />
    </div>
  );
}

export default App;
