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

export const PipelineCard: React.FC<PipelineCardProps> = ({ company, contacts, onDragStart, onClick }) => {
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
      className={`group relative bg-zinc-900/60 backdrop-blur-sm border rounded-xl p-4 mb-3 cursor-grab active:cursor-grabbing hover:bg-zinc-800/60 transition-all duration-200 shadow-lg ${getBorderClass()}`}
    >
      {/* Response indicator pulse */}
      {hasResponse && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-2.5 mb-3">
        <div className="p-1.5 bg-zinc-800/80 rounded-lg group-hover:scale-105 transition-transform shrink-0">
          <Building2 className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[13px] font-bold text-zinc-100 leading-tight line-clamp-1">{company.nombre}</h4>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold ${getTierColor(company.tier)}`}>
              T{company.tier}
            </span>
            <span className="text-[9px] text-zinc-500 flex items-center gap-0.5">
              <Globe2 className="w-2.5 h-2.5" />
              {company.pais}
            </span>
            <span className="text-[9px] text-zinc-600">•</span>
            <span className="text-[9px] text-zinc-500 truncate">{company.sector}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="space-y-2.5">
        {company.pipelineStage === 'outreach' ? (
          /* ── OUTREACH: Show Sequence Progress ── */
          <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Secuencia</span>
              <span className={`text-[10px] font-mono font-bold ${pasoActual >= 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {pasoActual}/7
              </span>
            </div>
            {/* Step circles with canal icons */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((step) => {
                const stepData = mainContact?.secuencia?.pasos?.[step];
                const estado = stepData?.estado || 'pendiente';
                return (
                  <div
                    key={step}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${STEP_ESTADO_COLOR[estado] || 'bg-zinc-800'}`}
                    title={`P${step}: ${stepData?.canal || '?'} — ${estado}`}
                  />
                );
              })}
            </div>
            {/* Active contact info */}
            {mainContact && (
              <div className="mt-2.5 flex items-start gap-2">
                <div className={`shrink-0 mt-0.5 p-1 rounded ${hasResponse ? 'bg-cyan-500/10 text-cyan-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  <Zap className="w-3 h-3" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-zinc-300 truncate">{mainContact.nombre}</p>
                  <p className="text-[9px] text-zinc-500 line-clamp-1">{mainContact.proxima_accion}</p>
                </div>
              </div>
            )}
            {/* Show secondary contacts */}
            {activeContacts.length > 1 && (
              <p className="text-[9px] text-zinc-600 mt-1.5">
                +{activeContacts.length - 1} contacto{activeContacts.length > 2 ? 's' : ''} más en secuencia
              </p>
            )}
          </div>
        ) : (
          /* ── DISCOVERY+ : Show MEDDIC & Deal Info ── */
          <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <Target className="w-3 h-3 text-amber-500" />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">MEDDIC</span>
              </div>
              <span className={`text-[10px] font-mono font-bold ${
                meddicScore >= 15 ? 'text-emerald-400' :
                meddicScore >= 10 ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {meddicScore}/18
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  meddicScore >= 15 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                  meddicScore >= 10 ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.3)]' :
                  'bg-red-500/60'
                }`}
                style={{ width: `${Math.max((meddicScore / 18) * 100, 3)}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
              {company.use_case}
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
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] text-zinc-500">
              <Users className="w-3 h-3" />
              <span>{contacts.length} contacto{contacts.length !== 1 ? 's' : ''}</span>
            </div>
            {company.co_sell_partner && company.co_sell_partner !== '—' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                Co-sell
              </span>
            )}
          </div>
          <button className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-500 hover:text-zinc-100">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
