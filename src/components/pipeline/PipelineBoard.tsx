import React, { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import type { PipelineStage } from '@/lib/types';
import { PipelineCard } from './PipelineCard';
import CompanyDetailModal from './CompanyDetailModal';
import {
  Rocket,
  Target,
  FileText,
  Handshake,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

const STAGES: { id: PipelineStage; label: string; sublabel: string; icon: any; color: string; borderColor: string }[] = [
  { id: 'outreach', label: 'Outreach', sublabel: 'Secuencia activa', icon: Rocket, color: 'text-blue-400', borderColor: 'border-t-blue-500' },
  { id: 'discovery', label: 'Discovery', sublabel: 'Reunión / Qualifying', icon: Target, color: 'text-amber-400', borderColor: 'border-t-amber-500' },
  { id: 'proposal', label: 'Propuesta', sublabel: 'SOW / Demo', icon: FileText, color: 'text-indigo-400', borderColor: 'border-t-indigo-500' },
  { id: 'negotiation', label: 'Negociación', sublabel: 'Cierre comercial', icon: Handshake, color: 'text-purple-400', borderColor: 'border-t-purple-500' },
  { id: 'closed_won', label: 'Cerrado ✓', sublabel: 'Won', icon: CheckCircle2, color: 'text-emerald-400', borderColor: 'border-t-emerald-500' },
];

export const PipelineBoard: React.FC = () => {
  const { state, moveCompanyToStage, addCompanyLog } = useAppState();
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('companyId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const onDrop = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    const companyId = e.dataTransfer.getData('companyId');
    if (companyId) {
      const company = state.companies.find(c => c.id === companyId);
      if (company && company.pipelineStage !== stage) {
        moveCompanyToStage(companyId, stage);
        addCompanyLog(companyId, `Movido de ${company.pipelineStage || 'outreach'} → ${stage}`);
      }
    }
    setDragOverStage(null);
  };

  // Only show companies that are in EMPRESAS_SECUENCIA (active pipeline)
  // EP* companies stay in the "Descubrimiento" tab
  const pipelineCompanies = state.companies.filter(c => c.id.startsWith('E') && !c.id.startsWith('EP'));

  const getCompaniesByStage = (stage: PipelineStage) => {
    return pipelineCompanies
      .filter(c => (c.pipelineStage || 'outreach') === stage)
      .sort((a, b) => a.tier - b.tier); // T1 primero
  };

  // Stats
  const totalActive = pipelineCompanies.filter(c => c.pipelineStage !== 'closed_won' && c.pipelineStage !== 'closed_lost').length;
  const totalResponded = state.contacts.filter(c => c.fase === 'respondio' || c.fase === 'discovery').length;

  // Selected company object
  const selectedCompany = selectedCompanyId ? state.companies.find(c => c.id === selectedCompanyId) : null;

  return (
    <div className="flex flex-col h-full relative">
      {/* Pipeline Stats Bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-mono text-zinc-400">
              <span className="text-zinc-200 font-bold">{totalActive}</span> cuentas activas
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <span className="text-xs font-mono text-zinc-400">
            <span className="text-cyan-400 font-bold">{totalResponded}</span> respondieron
          </span>
        </div>
        <span className="text-[10px] text-zinc-600 font-mono">Arrastra para mover entre etapas</span>
      </div>

      {/* Kanban Board */}
      <div className="flex h-full gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {STAGES.map((stage) => {
          const stageCompanies = getCompaniesByStage(stage.id);
          const Icon = stage.icon;
          const isOver = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={(e) => onDragOver(e, stage.id)}
              onDrop={(e) => onDrop(e, stage.id)}
              onDragLeave={() => setDragOverStage(null)}
              className={`flex-shrink-0 w-[300px] flex flex-col rounded-2xl bg-zinc-900/30 border-t-2 border transition-all duration-200 ${
                isOver
                  ? `${stage.borderColor} border-zinc-700/50 bg-zinc-800/20 scale-[1.01]`
                  : `${stage.borderColor} border-zinc-800/30`
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-zinc-800/30">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-zinc-800/60 ${stage.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200 leading-none">{stage.label}</h3>
                    <p className="text-[9px] text-zinc-600 mt-0.5">{stage.sublabel}</p>
                  </div>
                </div>
                <span className={`text-[12px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  stageCompanies.length > 0 ? `${stage.color} bg-zinc-800` : 'text-zinc-600 bg-zinc-800/50'
                }`}>
                  {stageCompanies.length}
                </span>
              </div>

              {/* Column Body */}
              <div className="flex-1 overflow-y-auto p-2.5 custom-scrollbar min-h-[400px]">
                {stageCompanies.map((company) => (
                  <PipelineCard
                    key={company.id}
                    company={company}
                    contacts={state.contacts.filter(c => c.empresa_id === company.id)}
                    onDragStart={onDragStart}
                    onClick={() => setSelectedCompanyId(company.id)}
                  />
                ))}

                {stageCompanies.length === 0 && (
                  <div className="h-28 border-2 border-dashed border-zinc-800/40 rounded-xl flex flex-col items-center justify-center text-zinc-700 gap-1">
                    <Icon className="w-5 h-5 opacity-30" />
                    <span className="text-[9px] font-medium uppercase tracking-widest">Drop aquí</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedCompany && (
        <CompanyDetailModal 
          company={selectedCompany} 
          onClose={() => setSelectedCompanyId(null)} 
        />
      )}
    </div>
  );
};
