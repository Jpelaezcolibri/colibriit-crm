import { useState } from 'react';
import type { Contact, Company } from '@/lib/types';
import { useAppState } from '@/hooks/useAppState';
import { SEQUENCE_STEPS, calculateNextStep } from '@/lib/sequence-engine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Linkedin, Mail, MessageCircle, CloudUpload } from 'lucide-react';

interface Props { contact: Contact; company: Company; onClose: () => void; }

export default function ContactDetailModal({ contact: initialContact, company, onClose }: Props) {
  const { updateContact } = useAppState();
  const [contact, setContact] = useState<Contact>(initialContact);
  const [saved, setSaved] = useState(false);

  const nextStep = calculateNextStep(contact, company.tier as 1|2|3);

  function save() {
    updateContact(contact);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateField<K extends keyof Contact>(field: K, value: Contact[K]) {
    setContact(prev => ({ ...prev, [field]: value }));
  }

  const stepDotColors: Record<string, string> = {
    enviado: 'bg-cyan-500 border-cyan-500 text-zinc-900',
    respondio: 'bg-emerald-400 border-emerald-400 text-zinc-900',
    saltado: 'bg-zinc-600 border-zinc-500 text-zinc-300',
    no_aplica: 'bg-zinc-700 border-zinc-600 text-zinc-400',
    pendiente: 'bg-transparent border-zinc-600 text-zinc-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-zinc-950 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-zinc-100">{contact.nombre}</h2>
            <p className="text-sm text-zinc-400 font-mono mt-1">{contact.cargo} · <span className="text-zinc-500">{company.nombre}</span></p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 p-1"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Left column: editable fields */}
          <div className="space-y-4">
            <h3 className="text-xs text-zinc-400 font-mono uppercase tracking-widest mb-2">Información del Contacto</h3>

            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs font-mono">Nombre</Label>
              <Input value={contact.nombre} onChange={e => updateField('nombre', e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-zinc-100" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs font-mono">Cargo</Label>
              <Input value={contact.cargo} onChange={e => updateField('cargo', e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-zinc-100" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs font-mono flex items-center"><Mail className="h-3 w-3 mr-1" /> Email</Label>
              <Input value={contact.email ?? ''} onChange={e => updateField('email', e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-zinc-100" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs font-mono flex items-center"><Linkedin className="h-3 w-3 mr-1" /> LinkedIn</Label>
              <Input value={contact.linkedin ?? ''} onChange={e => updateField('linkedin', e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-zinc-100" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs font-mono flex items-center"><MessageCircle className="h-3 w-3 mr-1" /> WhatsApp</Label>
              <Input value={contact.whatsapp ?? ''} onChange={e => updateField('whatsapp', e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-zinc-100" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs font-mono">Próxima Acción</Label>
              <Textarea value={contact.proxima_accion} onChange={e => updateField('proxima_accion', e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-zinc-100 text-sm resize-none" rows={2} />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs font-mono">Notas</Label>
              <Textarea value={contact.notas} onChange={e => updateField('notas', e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-zinc-100 text-sm resize-none" rows={3} />
            </div>
          </div>

          {/* Right column: Sequence & context */}
          <div className="space-y-5">
            <div>
              <h3 className="text-xs text-zinc-400 font-mono uppercase tracking-widest mb-3">Timeline de Secuencia</h3>
              <div className="space-y-2">
                {SEQUENCE_STEPS.map(step => {
                  const stepData = contact.secuencia.pasos[step.id];
                  const estado = stepData?.estado ?? 'pendiente';
                  const dotColor = stepDotColors[estado] ?? 'bg-transparent border-zinc-600 text-zinc-600';
                  const isCurrent = contact.secuencia.paso_actual === step.id;
                  return (
                    <div key={step.id} className={`flex items-start space-x-3 p-2 rounded-md ${isCurrent ? 'bg-cyan-500/5 border border-cyan-500/20' : ''}`}>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${dotColor}`}>
                        {estado === 'enviado' ? '✓' : estado === 'respondio' ? '★' : step.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-300">{step.nombre}</span>
                          <span className="text-xs text-zinc-500 font-mono">{stepData?.fecha ?? '—'}</span>
                        </div>
                        <p className="text-xs text-zinc-500 truncate">{step.descripcion}</p>
                        {isCurrent && <p className="text-xs text-cyan-400 mt-0.5 italic">"{step.instruccion_isra}"</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Step Suggestion */}
            {nextStep && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
                <h4 className="text-xs font-mono uppercase text-zinc-400 mb-2">💡 Siguiente Paso Sugerido</h4>
                <p className="text-sm text-zinc-200">{nextStep.texto}</p>
                {nextStep.instruccion_isra && (
                  <p className="text-xs text-amber-400 mt-1 italic">"{nextStep.instruccion_isra}"</p>
                )}
                {nextStep.fecha && (
                  <p className="text-xs text-zinc-500 font-mono mt-2">
                    Fecha sugerida: {new Date(nextStep.fecha as string).toLocaleDateString('es-CO')}
                  </p>
                )}
              </div>
            )}

            {/* Company context */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
              <h4 className="text-xs font-mono uppercase text-zinc-500 mb-2">Contexto Empresa</h4>
              <p className="text-xs text-zinc-400"><span className="text-zinc-500">Pain:</span> {company.pain_point}</p>
              <p className="text-xs text-zinc-400 mt-1"><span className="text-zinc-500">Caso Ref:</span> {company.caso_referencia}</p>
              <p className="text-xs text-zinc-400 mt-1"><span className="text-zinc-500">Use Case:</span> {company.use_case}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-zinc-800">
          <Button variant="outline" size="sm" className="text-blue-400 border-blue-900/50 hover:bg-blue-950">
            <CloudUpload className="h-3.5 w-3.5 mr-2" />
            {contact.fase === 'por_prospectar' ? '📤 Crear Lead en SF' : '📤 Enviar a SF'}
          </Button>
          <div className="flex space-x-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400">Cancelar</Button>
            <Button size="sm" onClick={save}
              className={`font-mono ${saved ? 'bg-emerald-700 text-white' : 'bg-cyan-800 text-white hover:bg-cyan-700'}`}>
              {saved ? '✓ Guardado' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
