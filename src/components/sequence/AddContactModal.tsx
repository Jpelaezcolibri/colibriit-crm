import React, { useState } from 'react';
import { X, UserPlus, Mail, Linkedin, Building, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Company, Contact } from '@/lib/types';

interface Props {
  company: Company;
  onClose: () => void;
  onSave: (contact: Contact) => void;
}

export default function AddContactModal({ company, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: '',
    email: '',
    linkedin: '',
    telefono: '',
    notas: '',
    es_decisor: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate base structure for the new contact
    const newContact: Contact = {
      id: `C-${Date.now()}`,
      empresa_id: company.id,
      nombre: formData.nombre,
      cargo: formData.cargo,
      email: formData.email,
      linkedin: formData.linkedin,
      telefono: formData.telefono,
      es_decisor: formData.es_decisor,
      notas: formData.notas,
      fase: "por_prospectar",
      secuencia: {
        paso_actual: 0,
        pasos: {}
      },
      proxima_accion: "Validar e iniciar outreach.",
      sf_sync_status: "not_synced"
    };

    onSave(newContact);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col slide-in-from-bottom-5 animate-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              Nuevo Contacto
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-1">Para: {company.nombre}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-zinc-300 text-xs uppercase tracking-wider font-mono">Nombre Completo</Label>
              <div className="flex bg-zinc-900 rounded-md border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                <span className="flex items-center px-3 border-r border-zinc-800 text-zinc-500"><UserPlus className="w-4 h-4" /></span>
                <Input 
                  id="nombre" 
                  autoFocus
                  required
                  placeholder="Ej. Ana Pérez"
                  className="border-0 bg-transparent text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo" className="text-zinc-300 text-xs uppercase tracking-wider font-mono">Cargo / Posición</Label>
              <div className="flex bg-zinc-900 rounded-md border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                <span className="flex items-center px-3 border-r border-zinc-800 text-zinc-500"><Building className="w-4 h-4" /></span>
                <Input 
                  id="cargo" 
                  required
                  placeholder="Ej. CTO, Director de TI"
                  className="border-0 bg-transparent text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300 text-xs uppercase tracking-wider font-mono">Email Corporativo</Label>
                <div className="flex bg-zinc-900 rounded-md border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                  <span className="flex items-center px-3 border-r border-zinc-800 text-zinc-500"><Mail className="w-4 h-4" /></span>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="email@empresa.com"
                    className="border-0 bg-transparent text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-zinc-300 text-xs uppercase tracking-wider font-mono">LinkedIn URL</Label>
                <div className="flex bg-zinc-900 rounded-md border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                  <span className="flex items-center px-3 border-r border-zinc-800 text-zinc-500"><Linkedin className="w-4 h-4" /></span>
                  <Input 
                    id="linkedin" 
                    placeholder="linkedin.com/in/perfil"
                    className="border-0 bg-transparent text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-zinc-300 text-xs uppercase tracking-wider font-mono">Teléfono / WhatsApp</Label>
              <div className="flex bg-zinc-900 rounded-md border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                <span className="flex items-center px-3 border-r border-zinc-800 text-zinc-500"><Phone className="w-4 h-4" /></span>
                <Input 
                  id="telefono" 
                  placeholder="+57 300..."
                  className="border-0 bg-transparent text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 mt-2">
               <div>
                  <h4 className="text-sm font-bold text-zinc-200">¿Es Tomador de Decisión?</h4>
                  <p className="text-xs text-zinc-500">Afecta el peso del mapa MEDDIC</p>
               </div>
               <button 
                  type="button" 
                  onClick={() => setFormData({...formData, es_decisor: !formData.es_decisor})}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${formData.es_decisor ? 'bg-emerald-500' : 'bg-zinc-700'}`}
               >
                 <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.es_decisor ? 'translate-x-5' : 'translate-x-0'}`} />
               </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800 mt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              Guardar Contacto
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
