import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  onClose: () => void;
  onSave: (nombre: string, desc: string) => void;
}

export default function NewCampaignModal({ onClose, onSave }: Props) {
  const [nombre, setNombre] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onSave(nombre, desc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col slide-in-from-bottom-5 animate-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-cyan-400" />
              Nueva Campaña / Workspace
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-zinc-300 text-xs uppercase tracking-wider font-mono">Nombre de la Campaña</Label>
              <Input 
                id="nombre" 
                autoFocus
                required
                placeholder="Ej. Q2 Expansión México"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus-visible:ring-cyan-500"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc" className="text-zinc-300 text-xs uppercase tracking-wider font-mono">Descripción (Opcional)</Label>
              <Input 
                id="desc" 
                placeholder="Ej. Targeteando a CTOs de Finanzas"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus-visible:ring-cyan-500"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              Cancelar
            </Button>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              Crear Campaña
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
