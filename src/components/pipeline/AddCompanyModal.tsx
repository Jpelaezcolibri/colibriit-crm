import React, { useState } from 'react';
import { X, Building2, MapPin, Briefcase, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Company } from '@/lib/types';

interface Props {
  onClose: () => void;
  onSave: (company: Company) => void;
}

export default function AddCompanyModal({ onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    nombre: '',
    pais: 'Colombia',
    sector: '',
    tier: 1 as 1 | 2 | 3,
    pain_point: '',
    use_case: '',
    palanca_entrada: 'Outbound Frío',
    caso_referencia: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    const newCompany: Company = {
      id: `E-${Date.now()}`,
      campaign_id: '', // Este field inyecta el estado global (AppProvider)
      nombre: formData.nombre,
      pais: formData.pais,
      sector: formData.sector,
      tier: formData.tier,
      pain_point: formData.pain_point,
      use_case: formData.use_case,
      palanca_entrada: formData.palanca_entrada,
      caso_referencia: formData.caso_referencia,
      notas: '',
      pipelineStage: 'outreach', // Arranca siempre en outreach
      bitacora: [],
      sf_sync_status: 'not_synced'
    };

    onSave(newCompany);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col slide-in-from-bottom-5 animate-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Nuevo Lead (B2B)
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="nombre" className="text-zinc-300 text-xs uppercase tracking-wider font-mono">Nombre de la Empresa</Label>
              <Input 
                id="nombre" 
                autoFocus
                required
                placeholder="Ej. Grupo Éxito"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pais" className="text-zinc-300 text-xs uppercase tracking-wider font-mono flex items-center gap-1"><MapPin className="w-3 h-3"/> País</Label>
              <select
                id="pais"
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-md h-10 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                value={formData.pais}
                onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
              >
                <option>Colombia</option>
                <option>México</option>
                <option>Chile</option>
                <option>Perú</option>
                <option>Panamá</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector" className="text-zinc-300 text-xs uppercase tracking-wider font-mono flex items-center gap-1"><Briefcase className="w-3 h-3"/> Industria / Sector</Label>
              <Input 
                id="sector" 
                required
                placeholder="Ej. Retail / CPG"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-zinc-300 text-xs uppercase tracking-wider font-mono">Nivel de Cuenta (Tier)</Label>
              <div className="flex gap-2">
                {[1, 2, 3].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, tier: t as any })}
                    className={`flex-1 py-2 text-sm font-bold border rounded-md transition-colors ${
                      formData.tier === t 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Tier {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="pain_point" className="text-zinc-300 text-xs uppercase tracking-wider font-mono flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500"/> Pain Point Asumido</Label>
              <Input 
                id="pain_point" 
                required
                placeholder="Ej. Dispersión de datos comerciales / Lenta adopción CRM"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500"
                value={formData.pain_point}
                onChange={(e) => setFormData({ ...formData, pain_point: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="use_case" className="text-zinc-300 text-xs uppercase tracking-wider font-mono">Hipótesis / Use Case Propuesto</Label>
              <Input 
                id="use_case" 
                required
                placeholder="Ej. Implementación de Sales Cloud con AI"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500"
                value={formData.use_case}
                onChange={(e) => setFormData({ ...formData, use_case: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              Agregar Empresa a la Campaña
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
