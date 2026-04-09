import { useState, useMemo } from 'react';
import { useAppState } from '@/hooks/useAppState';
import type { Contact } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CloudUpload, ChevronRight } from 'lucide-react';

const ESTADO_ORDER = ['pendiente', 'investigando', 'contacto_identificado', 'listo_para_secuencia'] as const;
const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  pendiente:             { label: '⬜ Pendiente',    color: 'bg-zinc-700/50 text-zinc-300 border-zinc-600' },
  investigando:          { label: '🟡 Investigando', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  contacto_identificado: { label: '🟢 Identificado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  listo_para_secuencia:  { label: '🚀 Listo',        color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
};

const TIER_COLORS: Record<number, string> = {
  1: 'bg-red-500/10 text-red-500 border-red-500/20',
  2: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  3: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

export default function ProspectView() {
  const { state, updateContact, activateProspect } = useAppState();
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterPais, setFilterPais] = useState<string>('all');

  // Only companies that ONLY appear in "por_prospectar" contacts
  const prospectCompanies = useMemo(() => {
    return state.companies.filter(c =>
      state.contacts.some(contact => contact.empresa_id === c.id && contact.fase === 'por_prospectar') &&
      !state.contacts.some(contact => contact.empresa_id === c.id && contact.fase !== 'por_prospectar' && contact.fase !== 'archivado')
    );
  }, [state.companies, state.contacts]);

  const filtered = useMemo(() => {
    return prospectCompanies.filter(c => {
      const matchSearch = c.nombre.toLowerCase().includes(search.toLowerCase()) || 
                          c.sector.toLowerCase().includes(search.toLowerCase());
      const matchTier = filterTier === 'all' || String(c.tier) === filterTier;
      const matchPais = filterPais === 'all' || c.pais === filterPais;
      return matchSearch && matchTier && matchPais;
    });
  }, [prospectCompanies, search, filterTier, filterPais]);

  const allPaises = useMemo(() => {
    return [...new Set(prospectCompanies.map(c => c.pais))].sort();
  }, [prospectCompanies]);

  const statsByEstado = useMemo(() => {
    const stats: Record<string, number> = {};
    ESTADO_ORDER.forEach(e => {
      stats[e] = state.contacts.filter(c => c.fase === 'por_prospectar' && c.investigacion?.estado === e).length;
    });
    return stats;
  }, [state.contacts]);

  function advanceEstado(contact: Contact) {
    const currentIdx = ESTADO_ORDER.indexOf(contact.investigacion?.estado as typeof ESTADO_ORDER[number]);
    const nextEstado = ESTADO_ORDER[Math.min(currentIdx + 1, ESTADO_ORDER.length - 1)];
    updateContact({
      ...contact,
      investigacion: {
        ...contact.investigacion!,
        estado: nextEstado,
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-zinc-900 border border-zinc-700/50 p-3 rounded-lg text-sm font-mono text-zinc-300">
        <div className="flex space-x-4">
          <span>Total: <strong className="text-white">{prospectCompanies.length}</strong></span>
          {ESTADO_ORDER.map(e => (
            <span key={e}>
              {ESTADO_LABELS[e].label}: <strong className="text-white">{statsByEstado[e] || 0}</strong>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-3 py-1 text-sm font-mono w-48 focus:outline-none focus:border-zinc-500"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)}
            className="bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-2 py-1 text-sm font-mono">
            <option value="all">Tier ▼</option>
            <option value="1">Tier 1</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
          </select>
          <select value={filterPais} onChange={e => setFilterPais(e.target.value)}
            className="bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-2 py-1 text-sm font-mono">
            <option value="all">País ▼</option>
            {allPaises.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Prospect cards */}
      <div className="grid gap-4">
        {filtered.map(company => {
          const contact = state.contacts.find(c => c.empresa_id === company.id && c.fase === 'por_prospectar');
          if (!contact) return null;
          const estadoInfo = ESTADO_LABELS[contact.investigacion?.estado ?? 'pendiente'];
          const canActivate = contact.investigacion?.estado === 'listo_para_secuencia' ||
            (contact.nombre !== 'Por identificar' && (contact.email || contact.linkedin));

          return (
            <div key={company.id} className="border border-zinc-800 rounded-lg bg-zinc-900/40 overflow-hidden">
              <div className="p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="text-xs text-zinc-400 font-mono">{company.id}</span>
                    <h3 className="font-semibold text-zinc-100">{company.nombre}</h3>
                    <Badge variant="outline" className={`text-xs px-1.5 py-0 ${TIER_COLORS[company.tier]}`}>T{company.tier}</Badge>
                    <Badge variant="outline" className={`text-xs px-1.5 py-0 ${estadoInfo.color}`}>{estadoInfo.label}</Badge>
                    <span className="text-xs text-zinc-500 font-mono">{company.pais} · {company.sector}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-zinc-400 mb-3">
                    {contact.nombre !== 'Por identificar' && (
                      <div><span className="text-zinc-500 text-xs">👤 Contacto:</span> {contact.nombre} ({contact.cargo})</div>
                    )}
                    {contact.investigacion?.cargo_objetivo && (
                      <div><span className="text-zinc-500 text-xs">🎯 Objetivo:</span> {contact.investigacion.cargo_objetivo}</div>
                    )}
                    <div className="col-span-2"><span className="text-zinc-500 text-xs">💥 Pain:</span> {company.pain_point}</div>
                    <div><span className="text-zinc-500 text-xs">💡 Use Case:</span> {company.use_case}</div>
                    <div><span className="text-zinc-500 text-xs">🔗 Palanca:</span> {company.palanca_entrada}</div>
                    {company.caso_referencia && (
                      <div><span className="text-zinc-500 text-xs">📎 Ref:</span> {company.caso_referencia}</div>
                    )}
                  </div>

                  {contact.investigacion?.siguiente_accion && (
                    <div className="flex items-start text-xs text-zinc-400 font-mono mt-1">
                      <ChevronRight className="h-3 w-3 text-zinc-500 mr-1 mt-0.5 flex-shrink-0" />
                      {contact.investigacion.siguiente_accion}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-1.5 ml-4 items-end shrink-0">
                  {contact.investigacion?.estado !== 'listo_para_secuencia' && (
                    <Button size="sm" onClick={() => advanceEstado(contact)}
                      className="h-7 text-xs font-mono bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700">
                      ▶ Avanzar Estado
                    </Button>
                  )}
                  {canActivate && (
                    <Button size="sm" onClick={() => activateProspect(contact.id)}
                      className="h-7 text-xs font-mono bg-cyan-900/60 text-cyan-300 hover:bg-cyan-800 border border-cyan-700/50">
                      🚀 Activar Secuencia
                    </Button>
                  )}
                  <Button size="sm" variant="ghost"
                    className="h-7 text-xs font-mono text-blue-400 hover:text-blue-200 border border-blue-900/30">
                    <CloudUpload className="h-3 w-3 mr-1" /> SF Lead
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-zinc-500 font-mono">No se encontraron prospectos</div>
        )}
      </div>
    </div>
  );
}
