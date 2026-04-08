import { useState } from 'react';
import type { Company, MeddicData } from '@/lib/types';
import { X, HelpCircle, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TRIAGE_Q = [
  { id: 'compelling_event', label: '¿Existe un evento urgente (compelling event)?' },
  { id: 'presupuesto_ruta', label: '¿Hay presupuesto o ruta al presupuesto?' },
  { id: 'posibilidad_ganar', label: '¿Tenemos posibilidad real de ganar?' },
  { id: 'vale_la_pena', label: '¿Vale la pena ganar este deal?' },
  { id: 'acceso_tomadores', label: '¿Tenemos acceso a tomadores de decisión?' }
];

const MEDDIC_FIELDS = [
  { id: 'metrics', label: 'Metrics (KPIs)', info: 'KPIs concretos y metas cuantificables que el cliente quiere alcanzar.' },
  { id: 'economic_buyer', label: 'Economic Buyer', info: 'La persona con poder de veto y acceso al presupuesto final.' },
  { id: 'decision_criteria', label: 'Decision Criteria', info: 'Requisitos técnicos, de negocio y financieros para elegir una solución.' },
  { id: 'decision_process', label: 'Decision Process', info: 'Pasos formales, aprobaciones y tiempos para llegar a la firma.' },
  { id: 'identified_pain', label: 'Identified Pain', info: 'El problema de negocio crítico que dispara la necesidad de compra.' },
  { id: 'champion', label: 'Champion', info: 'Persona interna con poder e influencia que vende por nosotros.' }
];

const DEFAULT_MEDDIC: MeddicData = {
  filtro: { compelling_event: '', presupuesto_ruta: '', posibilidad_ganar: '', vale_la_pena: '', acceso_tomadores: '' },
  filtro_notas: { compelling_event: '', presupuesto_ruta: '', posibilidad_ganar: '', vale_la_pena: '', acceso_tomadores: '' },
  score: {
    metrics: { val: 0, nota: '' }, economic_buyer: { val: 0, nota: '' },
    decision_criteria: { val: 0, nota: '' }, decision_process: { val: 0, nota: '' },
    identified_pain: { val: 0, nota: '' }, champion: { val: 0, nota: '' }
  },
  dolor: { tecnico: '', negocio: '', personal: '', kpis: '', valor_usd: '' },
  competencia: { nombres: '', fortalezas: '', debilidades: '', estrategia: '' },
};

export default function MeddicModal({ 
  company, 
  onClose, 
  onSave 
}: { 
  company: Company; 
  onClose: () => void;
  onSave: (data: MeddicData) => void;
}) {
  const [data, setData] = useState<MeddicData>(company.meddicData || JSON.parse(JSON.stringify(DEFAULT_MEDDIC)));

  // Computed Triage
  const triageScore = Object.values(data?.filtro || {}).reduce((acc, v) => acc + (v === 'si' ? 1 : v === 'parcial' ? 0.5 : 0), 0);
  const triagePass = triageScore >= 3;

  // Computed MEDDIC Score (6 to 18)
  const meddicScore = Object.values(data?.score || {}).reduce((acc, v) => acc + (v?.val || 0), 0);
  const mStatus = meddicScore >= 15 ? 'GO 🔥' : (meddicScore >= 10 ? 'GO CONDICIONAL ⚠️' : 'NO GO 🛑');
  const mColor = meddicScore >= 15 ? 'text-emerald-400' : (meddicScore >= 10 ? 'text-amber-400' : 'text-red-400');

  const updateFiltro = (k: string, v: string) => setData({ ...data, filtro: { ...data.filtro, [k]: v } });
  const updateFiltroNota = (k: string, v: string) => setData({ ...data, filtro_notas: { ...data.filtro_notas, [k]: v } });
  const updateScore = (k: string, f: string, v: any) => {
    setData({
      ...data,
      score: {
        ...data.score,
        [k]: { ...data.score[k], [f]: v }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 h-full shadow-2xl flex flex-col slide-in-from-right animate-in duration-500">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Account Plan MEDDIC</h2>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono text-[10px]">ENTERPRISE</Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-1">{company.nombre} • {company.sector}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Dashboard Bar */}
        <div className="bg-zinc-900/30 px-6 py-4 border-b border-zinc-800 flex gap-4">
           <div className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-center">
             <span className="block text-[10px] font-mono text-zinc-500 mb-1 uppercase tracking-wider">Triage Score</span>
             <span className={`font-bold text-xl font-mono ${triagePass ? 'text-emerald-400' : 'text-red-400'}`}>{triageScore} <span className="text-zinc-600 text-sm">/ 5</span></span>
           </div>
           <div className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-center">
             <span className="block text-[10px] font-mono text-zinc-500 mb-1 uppercase tracking-wider">MEDDIC Status</span>
             <span className={`font-bold text-lg ${mColor}`}>{meddicScore > 0 ? `${meddicScore} · ${mStatus}` : 'N/A'}</span>
           </div>
        </div>

        {/* Form Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
           
           {/* Section 1: Triage */}
           <section>
             <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center">
               <span className="w-4 h-[1px] bg-zinc-800 mr-2"></span>
               1. Filtro Decisivo (Triage)
             </h3>
             <div className="space-y-4">
               {TRIAGE_Q.map(q => (
                 <div key={q.id} className="group">
                   <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-t-lg border border-zinc-800 group-focus-within:border-zinc-700 transition-colors">
                     <label className="text-xs font-medium text-zinc-300">{q.label}</label>
                     <div className="flex items-center space-x-1">
                       {['no', 'parcial', 'si'].map(opt => (
                         <button 
                           key={opt} 
                           onClick={() => updateFiltro(q.id, opt)}
                           className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${data.filtro[q.id] === opt 
                             ? (opt === 'si' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                                opt === 'parcial' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                                'bg-red-500/20 text-red-400 border border-red-500/30') 
                             : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 hover:bg-zinc-750 hover:text-zinc-400'}`}
                         >
                           {opt.toUpperCase()}
                         </button>
                       ))}
                     </div>
                   </div>
                   <input 
                     type="text" 
                     placeholder="Justificación / evidencia..." 
                     className="w-full text-xs p-2.5 bg-zinc-950 border border-t-0 border-zinc-800 rounded-b-lg outline-none focus:border-zinc-700 text-zinc-300 placeholder:text-zinc-600"
                     value={data.filtro_notas[q.id] || ''} 
                     onChange={e => updateFiltroNota(q.id, e.target.value)} 
                   />
                 </div>
               ))}
             </div>
             {!triagePass && triageScore > 0 && (
               <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3 text-[11px] text-red-400 leading-relaxed font-mono">
                 <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                 <span>ADVERTENCIA: Triage fallido ({triageScore}/5). Redirigir esfuerzos a prospección de otros decisores o industrias con mayor urgencia.</span>
               </div>
             )}
           </section>

           {/* Section 2: MEDDIC Scoring */}
           <section className={!triagePass ? 'opacity-40' : ''}>
             <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center">
               <span className="w-4 h-[1px] bg-zinc-800 mr-2"></span>
               2. Calificación MEDDIC
             </h3>
             <div className="grid grid-cols-1 gap-4">
               {MEDDIC_FIELDS.map(f => (
                 <div key={f.id} className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
                   <div className="flex justify-between items-start mb-3">
                     <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-zinc-100">{f.label}</span>
                          <div className="relative group/info">
                            <HelpCircle className="h-3.5 w-3.5 text-zinc-600 cursor-help hover:text-zinc-400" />
                            <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-zinc-800 text-zinc-200 text-[10px] rounded shadow-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 border border-zinc-700">
                              {f.info}
                            </div>
                          </div>
                        </div>
                     </div>
                     <div className="flex space-x-1 p-1 bg-zinc-950 rounded-full border border-zinc-800">
                       {[1, 2, 3].map(val => (
                         <button 
                           key={val}
                           onClick={() => updateScore(f.id, 'val', val)} 
                           className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${data.score[f.id].val === val 
                             ? (val === 1 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                                val === 2 ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 
                                'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]') 
                             : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800'}`}
                         >
                           {data.score[f.id].val === val && (val === 3 ? <CheckCircle2 className="h-3.5 w-3.5 text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/80" />)}
                         </button>
                       ))}
                     </div>
                   </div>
                   <textarea 
                     placeholder={`Evidencia clave para ${f.label}...`} 
                     className="w-full text-xs p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg focus:border-zinc-700 outline-none text-zinc-300 placeholder:text-zinc-600 resize-none h-16"
                     value={data.score[f.id].nota} 
                     onChange={e => updateScore(f.id, 'nota', e.target.value)}
                   />
                 </div>
               ))}
             </div>
           </section>

           {/* Section 3: Extra Intel */}
           <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              <div className="space-y-3">
                 <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-2">Client Pain Points</h4>
                 <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800 space-y-3">
                    <textarea 
                      className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded p-2 focus:border-zinc-700 outline-none h-14" 
                      placeholder="Dolor Técnico (Legacy, soporte, EOL...)" 
                      value={data.dolor.tecnico} 
                      onChange={e => setData({...data, dolor:{...data.dolor, tecnico:e.target.value}})} 
                    />
                    <textarea 
                      className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded p-2 focus:border-zinc-700 outline-none h-14" 
                      placeholder="Impacto de Negocio (ROI, costos, ingresos...)" 
                      value={data.dolor.negocio} 
                      onChange={e => setData({...data, dolor:{...data.dolor, negocio:e.target.value}})} 
                    />
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-zinc-600 text-[10px] font-mono">$</span>
                      <input 
                        type="text" 
                        className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded p-2 pl-5 focus:border-zinc-700 outline-none font-mono" 
                        placeholder="Valor del Pain (USD)" 
                        value={data.dolor.valor_usd} 
                        onChange={e => setData({...data, dolor:{...data.dolor, valor_usd:e.target.value}})} 
                      />
                    </div>
                 </div>
              </div>
              <div className="space-y-3">
                 <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-2">Competitive Intel</h4>
                 <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800 space-y-3 h-full">
                    <textarea 
                      className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded p-2 focus:border-zinc-700 outline-none h-20" 
                      placeholder="Competidores y su presencia..." 
                      value={data.competencia.nombres} 
                      onChange={e => setData({...data, competencia:{...data.competencia, nombres:e.target.value}})} 
                    />
                    <textarea 
                      className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded p-2 focus:border-zinc-700 outline-none h-28" 
                      placeholder="Estrategia defensiva / ataque..." 
                      value={data.competencia.estrategia} 
                      onChange={e => setData({...data, competencia:{...data.competencia, estrategia:e.target.value}})} 
                    />
                 </div>
              </div>
           </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-end items-center space-x-3 sticky bottom-0 z-50">
          <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
            Cancelar
          </Button>
          <Button 
            onClick={() => { onSave(data); onClose(); }} 
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all font-semibold"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Plan MEDDIC
          </Button>
        </div>
      </div>
    </div>
  );
}
