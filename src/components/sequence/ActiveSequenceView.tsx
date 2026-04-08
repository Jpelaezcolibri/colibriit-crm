import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import CompanyCard from './CompanyCard';

export default function ActiveSequenceView() {
  const { state } = useAppState();
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterPais, setFilterPais] = useState<string>('all');
  
  // Filter for active companies
  const activeCompanies = state.companies.filter(c => 
    state.contacts.some(contact => contact.empresa_id === c.id && contact.fase !== 'por_prospectar' && contact.fase !== 'archivado')
  );

  const filtered = activeCompanies.filter(c => {
    const matchTier = filterTier === 'all' || String(c.tier) === filterTier;
    const matchPais = filterPais === 'all' || c.pais === filterPais;
    return matchTier && matchPais;
  });

  const allPaises = [...new Set(activeCompanies.map(c => c.pais))].sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-zinc-900 border border-zinc-700/50 p-3 rounded-lg">
        <div className="flex space-x-4 text-sm font-mono text-zinc-300">
          <div className="flex items-center space-x-2">
            <span className="text-red-500 text-lg">🔥</span>
            <span>{activeCompanies.length} activas</span>
          </div>
          <div className="flex items-center space-x-2 border-l border-zinc-800 pl-4">
            <span className="text-emerald-500 text-lg">✅</span>
            <span>{state.contacts.filter(c => c.fase === 'respondio').length} rta</span>
          </div>
          <div className="flex items-center space-x-2 border-l border-zinc-800 pl-4">
            <span className="text-amber-500 text-lg">📞</span>
            <span>{state.contacts.filter(c => c.fase === 'discovery').length} disc</span>
          </div>
        </div>

        <div className="flex gap-2">
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)}
            className="bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-2 py-1 text-xs font-mono focus:outline-none">
            <option value="all">Tier All</option>
            <option value="1">Tier 1</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
          </select>
          <select value={filterPais} onChange={e => setFilterPais(e.target.value)}
            className="bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-2 py-1 text-xs font-mono focus:outline-none">
            <option value="all">País All</option>
            {allPaises.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {filtered.map(company => (
          <CompanyCard key={company.id} company={company} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-zinc-500 font-mono italic">
            No hay secuencias que coincidan con los filtros
          </div>
        )}
      </div>
    </div>
  );
}
