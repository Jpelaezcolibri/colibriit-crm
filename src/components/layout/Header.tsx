import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { Target, Users, Calendar, Activity, FolderPlus, ChevronDown } from 'lucide-react';
import NewCampaignModal from '../campaigns/NewCampaignModal';

export function Header() {
  const { state, campaigns, activeCampaignId, setActiveCampaignId, createNewCampaign } = useAppState();
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeSequencesCount = state.companies.filter(c => 
    state.contacts.some(contact => contact.empresa_id === c.id && contact.fase !== 'por_prospectar' && contact.fase !== 'archivado')
  ).length;

  const respondedCount = state.contacts.filter(c => c.fase === 'respondio').length;
  const discoveryCount = state.contacts.filter(c => c.fase === 'discovery').length;

  const activeCampaignName = campaigns.find(c => c.id === activeCampaignId)?.nombre || "Cargando...";

  return (
    <>
      <header className="border-b border-zinc-800 bg-black text-white p-4 relative z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Activity className="text-cyan-500 h-6 w-6" />
              <h1 className="text-xl font-bold font-mono hidden md:block">COLIBRIIT COMMAND CENTER</h1>
            </div>

            {/* Campaign Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 px-3 py-1.5 rounded-lg transition-colors group"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                <span className="text-sm font-bold text-zinc-200 group-hover:text-white max-w-[150px] truncate">
                  {activeCampaignName}
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 pb-2 mb-2 border-b border-zinc-800/50">
                    <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Workspaces</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {campaigns.map(camp => (
                      <button
                        key={camp.id}
                        onClick={() => {
                          setActiveCampaignId(camp.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                          activeCampaignId === camp.id 
                            ? 'bg-cyan-500/10 text-cyan-400 font-bold' 
                            : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        {activeCampaignId === camp.id && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>}
                        <span className="truncate">{camp.nombre}</span>
                      </button>
                    ))}
                  </div>
                  <div className="px-2 pt-2 mt-2 border-t border-zinc-800/50">
                    <button 
                      onClick={() => {
                        setShowNewCampaign(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-cyan-900/40 text-zinc-200 hover:text-cyan-400 px-3 py-2 rounded-lg text-sm transition-colors border border-dashed border-zinc-700 hover:border-cyan-500/50"
                    >
                      <FolderPlus className="w-4 h-4" />
                      Nueva Campaña
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-mono text-zinc-300">Activos: {activeSequencesCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-mono text-zinc-300">Respondieron: {respondedCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-mono text-zinc-300">Discovery: {discoveryCount}</span>
            </div>
          </div>
        </div>
      </header>

      {showNewCampaign && (
        <NewCampaignModal 
          onClose={() => setShowNewCampaign(false)}
          onSave={async (name, desc) => {
            await createNewCampaign(name, desc);
          }}
        />
      )}
    </>
  );
}
