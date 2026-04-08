import { useState } from 'react';
import type { Contact, Company } from '@/lib/types';
import { useAppState } from '@/hooks/useAppState';
import { SEQUENCE_STEPS } from '@/lib/sequence-engine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Mail, MessageCircle, ChevronRight, CloudUpload, RefreshCw } from 'lucide-react';
import ContactDetailModal from './ContactDetailModal';

const FASE_CONFIG: Record<string, { label: string; color: string }> = {
  en_secuencia: { label: '📤 En Secuencia', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  respondio: { label: '✅ Respondió', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  discovery: { label: '📞 Discovery', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  propuesta: { label: '📄 Propuesta', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  cerrado: { label: '🏆 Cerrado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  pausado: { label: '⏸ Pausado', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  archivado: { label: '🗄 Archivado', color: 'bg-zinc-700/10 text-zinc-500 border-zinc-700/20' },
};

interface Props { contact: Contact; company: Company; }

export default function ContactRow({ contact, company }: Props) {
  const { updateContact } = useAppState();
  const [showDetail, setShowDetail] = useState(false);

  const faseConfig = FASE_CONFIG[contact.fase] ?? { label: contact.fase, color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };

  function advanceStep() {
    const currentPaso = contact.secuencia.paso_actual;
    const newPaso = Math.min(currentPaso + 1, 7);
    const today = new Date().toISOString().split('T')[0];
    const updatedContact: Contact = {
      ...contact,
      secuencia: {
        ...contact.secuencia,
        paso_actual: newPaso,
        pasos: {
          ...contact.secuencia.pasos,
          [currentPaso]: {
            ...contact.secuencia.pasos[currentPaso],
            estado: 'enviado',
            fecha: today,
          }
        }
      }
    };
    updateContact(updatedContact);
  }

  function markResponded() {
    const currentPaso = contact.secuencia.paso_actual;
    const today = new Date().toISOString().split('T')[0];
    const updatedContact: Contact = {
      ...contact,
      fase: 'respondio',
      secuencia: {
        ...contact.secuencia,
        pasos: {
          ...contact.secuencia.pasos,
          [currentPaso]: {
            ...contact.secuencia.pasos[currentPaso],
            estado: 'respondio',
            fecha: today,
          }
        }
      }
    };
    updateContact(updatedContact);
  }

  function markDiscovery() {
    updateContact({ ...contact, fase: 'discovery' });
  }

  function cycleStepStatus(paso: number) {
    const current = contact.secuencia.pasos[paso]?.estado || 'pendiente';
    const cycle: Record<string, string> = {
      pendiente: 'enviado',
      enviado: 'respondio',
      respondio: 'saltado',
      saltado: 'pendiente',
      no_aplica: 'pendiente',
    };
    const newEstado = cycle[current] ?? 'pendiente';
    const today = new Date().toISOString().split('T')[0];
    updateContact({
      ...contact,
      secuencia: {
        ...contact.secuencia,
        pasos: {
          ...contact.secuencia.pasos,
          [paso]: {
            ...contact.secuencia.pasos[paso],
            canal: contact.secuencia.pasos[paso]?.canal ?? SEQUENCE_STEPS[paso - 1]?.canal ?? 'N/A',
            estado: newEstado as 'pendiente' | 'enviado' | 'respondio' | 'no_aplica' | 'saltado',
            fecha: newEstado !== 'pendiente' ? today : undefined,
          }
        }
      }
    });
  }

  const stepDotColors: Record<string, string> = {
    enviado: 'bg-cyan-500 border-cyan-500',
    respondio: 'bg-emerald-400 border-emerald-400',
    saltado: 'bg-zinc-600 border-zinc-500',
    no_aplica: 'bg-zinc-700 border-zinc-600',
    pendiente: 'bg-transparent border-zinc-600',
  };

  const stepIcons: Record<string, string> = {
    enviado: '✓',
    respondio: '★',
    saltado: '→',
    no_aplica: '–',
    pendiente: '·',
  };

  return (
    <>
      <div className={`bg-zinc-900 border rounded-lg p-4 ${contact.fase === 'discovery' ? 'border-amber-500/40' : contact.fase === 'respondio' ? 'border-emerald-500/40' : 'border-zinc-800'}`}>
        <div className="flex items-start justify-between">
          {/* Left: name, role, status */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <button
                className="font-semibold text-zinc-100 hover:text-cyan-400 transition-colors cursor-pointer text-left"
                onClick={() => setShowDetail(true)}
              >
                {contact.nombre}
              </button>
              <span className="text-xs text-zinc-500 font-mono">{contact.cargo}</span>
              <Badge variant="outline" className={`text-xs px-1.5 py-0 ${faseConfig.color}`}>{faseConfig.label}</Badge>
              {contact.es_decisor && <Badge variant="outline" className="text-xs px-1.5 py-0 bg-purple-500/10 text-purple-400 border-purple-500/20">Decisor</Badge>}
            </div>

            {/* Channels */}
            <div className="flex items-center space-x-2 mb-3">
              {contact.linkedin && <Linkedin className="h-3 w-3 text-blue-500" />}
              {contact.email && <Mail className="h-3 w-3 text-red-400" />}
              {contact.whatsapp && <MessageCircle className="h-3 w-3 text-emerald-400" />}
              {contact.fecha_proxima && (
                <span className={`text-xs font-mono ml-2 ${
                  new Date(contact.fecha_proxima) < new Date() ? 'text-red-400' : 'text-zinc-400'
                }`}>
                  Próx: {contact.fecha_proxima}
                </span>
              )}
            </div>

            {/* Timeline */}
            <div className="flex items-center space-x-1.5">
              {SEQUENCE_STEPS.map((step) => {
                const stepData = contact.secuencia.pasos[step.id];
                const estado = stepData?.estado ?? 'pendiente';
                const dotColor = stepDotColors[estado] ?? 'bg-transparent border-zinc-600';
                const icon = stepIcons[estado] ?? '·';
                const isCurrent = contact.secuencia.paso_actual === step.id;
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <span className="text-xs text-zinc-500 font-mono mb-1">{step.id}</span>
                    <button
                      onClick={() => cycleStepStatus(step.id)}
                      title={`${step.nombre} (${step.canal}) — Estado: ${estado}\nClick para cambiar`}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all hover:scale-110 ${dotColor} ${isCurrent ? 'ring-2 ring-cyan-500 ring-offset-1 ring-offset-zinc-900' : ''}`}
                    >
                      <span className={estado === 'enviado' ? 'text-cyan-400' : estado === 'respondio' ? 'text-emerald-400' : 'text-zinc-500'}>
                        {icon}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Next action */}
            {contact.proxima_accion && (
              <div className="mt-2 text-xs text-zinc-400 font-mono">
                <ChevronRight className="h-3 w-3 inline text-zinc-500 mr-1" />
                {contact.proxima_accion}
              </div>
            )}
          </div>

          {/* Right: action buttons */}
          <div className="flex flex-col space-y-1.5 ml-4 items-end">
            <div className="flex space-x-1.5">
              <Button size="sm" onClick={advanceStep} disabled={contact.secuencia.paso_actual >= 7}
                className="h-7 text-xs font-mono bg-zinc-800 text-zinc-200 hover:bg-cyan-800 border border-zinc-700">
                ⏭ Avanzar
              </Button>
              {contact.fase !== 'respondio' && contact.fase !== 'discovery' && (
                <Button size="sm" onClick={markResponded}
                  className="h-7 text-xs font-mono bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800 border border-emerald-700/50">
                  ✅ Respondió
                </Button>
              )}
              {contact.fase !== 'discovery' && (
                <Button size="sm" onClick={markDiscovery}
                  className="h-7 text-xs font-mono bg-amber-900/50 text-amber-300 hover:bg-amber-800 border border-amber-700/50">
                  📞 Discovery
                </Button>
              )}
            </div>
            <div className="flex space-x-1.5">
              <Button size="sm" variant="ghost" onClick={() => setShowDetail(true)}
                className="h-7 text-xs font-mono text-zinc-400 hover:text-white">
                ✏️ Editar
              </Button>
              <Button size="sm" variant="ghost"
                className="h-7 text-xs font-mono text-blue-400 hover:text-blue-200 border border-blue-900/30">
                {contact.sf_sync_status === 'not_synced' ? <CloudUpload className="h-3.5 w-3.5 mr-1" /> : <RefreshCw className="h-3.5 w-3.5 mr-1" />}
                {contact.sf_sync_status === 'not_synced' ? '📤 SF' : contact.sf_sync_status === 'synced' ? '✅ SF' : '🔄 SF'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showDetail && (
        <ContactDetailModal contact={contact} company={company} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}
