import { useAppState } from '@/hooks/useAppState';
import { Target, Users, Calendar, Activity } from 'lucide-react';

export function Header() {
  const { state } = useAppState();

  const activeSequencesCount = state.companies.filter(c => 
    state.contacts.some(contact => contact.empresa_id === c.id && contact.fase !== 'por_prospectar' && contact.fase !== 'archivado')
  ).length;

  const respondedCount = state.contacts.filter(c => c.fase === 'respondio').length;
  const discoveryCount = state.contacts.filter(c => c.fase === 'discovery').length;

  return (
    <header className="border-b border-zinc-800 bg-black text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Activity className="text-cyan-500 h-6 w-6" />
          <h1 className="text-xl font-bold font-mono">COLIBRIIT COMMAND CENTER</h1>
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
  );
}
