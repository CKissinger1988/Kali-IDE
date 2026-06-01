interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const tabs = [
    { id: 'chat', label: '💬 Terminal Console' },
    { id: 'hosting', label: '☁️ Cloud Infrastructure' },
    { id: 'msf', label: '💀 MSF Sessions' },
    { id: 'missions', label: '🏁 Mission Control' },
    { id: 'security', label: '🛡️ Security Intelligence' },
    { id: 'ghost', label: '👻 Ghost Tactical' },
    { id: 'mesh', label: '🔗 Mesh Integrity' },
    { id: 'phishing', label: '🎣 Phishing Operations' },
    { id: 'scraper', label: '🕷️ Intelligence Target' },
    { id: 'settings', label: '⚙️ System Settings' },
  ];

  return (
    <aside className="w-70 bg-[#181818] border-r border-[#2b2b2b] flex flex-col p-3 gap-1 overflow-y-auto">
      <button className="bg-[#2a2a2a] border border-[#2b2b2b] text-white p-2 rounded-lg text-[13px] font-medium mb-3 cursor-pointer">
        + New Conversation
      </button>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer text-[13px] ${
            activeTab === tab.id ? 'bg-[#252525] font-bold text-white' : 'text-[#e0e0e0]'
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </aside>
  );
}
