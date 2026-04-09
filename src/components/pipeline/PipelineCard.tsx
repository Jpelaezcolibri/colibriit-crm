import React from 'react';
import type { Company, Contact } from '@/lib/types';
import { Building2, Globe2, Users, ChevronRight, Target, AlertCircle, Zap } from 'lucide-react';

interface PipelineCardProps {
  company: Company;
  contacts: Contact[];
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick?: () => void;
}

const STEP_ESTADO_COLOR: Record<string, string> = {
  'enviado': 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]',
  'respondio': 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] ring-2 ring-cyan-400/30',
  'pendiente': 'bg-zinc-800',
  'no_aplica': 'bg-zinc-700',
  'saltado': 'bg-amber-600/50',
};

export const PipelineCard: React.FC<PipelineCardProps> = React.memo(({ company, contacts, onDragStart, onClick }) => {
  // MEDDIC Score
  const meddicScore = company.meddicData
    ? Object.values(company.meddicData.score).reduce((acc, curr) => acc + curr.val, 0)
    : 0;

  // Best contact in sequence
  const activeContacts = contacts
    .filter(c => c.fase === 'en_secuencia' || c.fase === 'respondio' || c.fase === 'discovery')
    .sort((a, b) => (b.secuencia?.paso_actual || 0) - (a.secuencia?.paso_actual || 0));

  const mainContact = activeContacts[0];
  const pasoActual = mainContact?.secuencia?.paso_actual || 0;

  // Has anyone responded?
  const hasResponse = contacts.some(c => c.fase === 'respondio' || c.fase === 'discovery');
  const isDiscoveryDone = contacts.some(c => c.fase === 'discovery');

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 2: return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30';
    }
  };

  // Border glow based on deal health
  const getBorderClass = () => {
    if (isDiscoveryDone) return 'border-cyan-500/40 hover:border-cyan-400/60';
    if (hasResponse) return 'border-emerald-500/30 hover:border-emerald-400/50';
    return 'border-zinc-800 hover:border-zinc-700';
  };

  // Latest bitacora entry
  const latestLog = company.bitacora?.[0];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, company.id)}
      onClick={onClick}
      className={`group relative bg-zinc-900/40 backdrop-blur-md border rounded-2xl p-5 mb-4 cursor-grab active:cursor-grabbing hover:bg-zinc-800/40 transition-all duration-300 shadow-xl ${getBorderClass()}`}
    >
      {/* Response indicator pulse */}
      {hasResponse && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-2.5 mb-3">
        <div className="p-2 bg-zinc-800/50 rounded-xl group-hover:scale-110 transition-transform shrink-0 shadow-inner">
          <Building2 className="w-5 h-5 text-zinc-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[15px] font-bold text-zinc-100 leading-snug tracking-tight line-clamp-1">{company.nombre}</h4>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[11px] px-2 py-0.5 rounded-lg border font-bold tracking-wider ${getTierColor(company.tier)}`}>
              T{company.tier}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
              <Globe2 className="w-3 h-3" />
              {company.pais}
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-[11px] text-zinc-500 font-medium truncate">{company.sector}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="space-y-2.5">
        {company.pipelineStage === 'outreach' ? (
          /* ── OUTREACH: Show Sequence Progress ── */
          <div className="bg-zinc-950/40 rounded-xl p-4 border border-zinc-800/30">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Secuencia</span>
              <span className={`text-xs font-bold ${pasoActual >= 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {pasoActual} de 7
              </span>
            </div>
            {/* Step circles with canal icons */}
            <div className="flex gap-1.5 h-2">
              {[1, 2, 3, 4, 5, 6, 7].map((step) => {
                const stepData = mainContact?.secuencia?.pasos?.[step];
                const estado = stepData?.estado || 'pendiente';
                return (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${STEP_ESTADO_COLOR[estado] || 'bg-zinc-800/50'}`}
                    title={`P${step}: ${stepData?.canal || '?'} — ${estado}`}
                  />
                );
              })}
            </div>
            {/* Active contact info */}
            {mainContact && (
              <div className="mt-4 flex items-start gap-2.5">
                <div className={`shrink-0 p-1.5 rounded-lg ${hasResponse ? 'bg-cyan-500/10 text-cyan-400' : 'bg-zinc-800/50 text-zinc-500'}`}>
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-zinc-200 truncate">{mainContact.nombre}</p>
                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mt-0.5 line-clamp-1">{mainContact.proxima_accion}</p>
                </div>
              </div>
            )}
            {/* Show secondary contacts */}
            {activeContacts.length > 1 && (
              <p className="text-[10px] text-zinc-500 font-medium mt-2">
                +{activeContacts.length - 1} contacto{activeContacts.length > 2 ? 's' : ''} más
              </p>
            )}
          </div>
        ) : (
          /* ── DISCOVERY+ : Show MEDDIC & Deal Info ── */
          <div className="bg-zinc-950/40 rounded-xl p-4 border border-zinc-800/30">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">MEDDIC Score</span>
              </div>
              <span className={`text-xs font-bold ${
                meddicScore >= 15 ? 'text-emerald-400' :
                meddicScore >= 10 ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {meddicScore} / 18
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-800/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  meddicScore >= 15 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' :
                  meddicScore >= 10 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
                  'bg-red-500/60'
                }`}
                style={{ width: `${Math.max((meddicScore / 18) * 100, 3)}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 font-medium mt-3 line-clamp-2 leading-relaxed italic">
              "{company.use_case}"
            </p>
          </div>
        )}

        {/* Latest Bitacora Entry */}
        {latestLog && (
          <div className="flex items-start gap-2 px-1">
            <AlertCircle className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[9px] text-zinc-400 line-clamp-1 italic">{latestLog.msg}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
              <Users className="w-3.5 h-3.5" />
              <span>{contacts.length} contacto{contacts.length !== 1 ? 's' : ''}</span>
            </div>
            {company.co_sell_partner && company.co_sell_partner !== '—' && (
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold uppercase tracking-wider">
                Co-sell
              </span>
            )}
          </div>
          <button className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-zinc-100 shadow-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
});
