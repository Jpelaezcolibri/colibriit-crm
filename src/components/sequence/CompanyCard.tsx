import { useState } from 'react';
import type { Company, MeddicData } from '@/lib/types';
import { useAppState } from '@/hooks/useAppState';
import { ChevronDown, ChevronRight, Building2, Link as LinkIcon, Microscope } from 'lucide-react';
import ContactRow from './ContactRow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MeddicModal from '../shared/MeddicModal';

export default function CompanyCard({ company }: { company: Company }) {
  const [expanded, setExpanded] = useState(true);
  const [showMeddic, setShowMeddic] = useState(false);
  const { state, updateMeddicData } = useAppState();
  
  const contacts = state.contacts.filter(c => c.empresa_id === company.id && c.fase !== 'por_prospectar');

  const tierColors: Record<number, string> = {
    1: 'bg-red-500/10 text-red-500 border-red-500/20',
    2: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    3: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  };

  const meddicScore = company.meddicData?.score
    ? Object.values(company.meddicData.score).reduce((acc, v) => acc + (v?.val || 0), 0)
    : 0;

  const handleSaveMeddic = (data: MeddicData) => {
    updateMeddicData(company.id, data);
  };

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/40">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          {expanded ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
          <Building2 className="h-5 w-5 text-zinc-500" />
          <h3 className="font-semibold text-zinc-100">{company.nombre}</h3>
          <Badge variant="outline" className={`font-mono ${tierColors[company.tier]} px-1.5 py-0`}>T{company.tier}</Badge>
          <span className="text-xs text-zinc-500 font-mono ml-4">{company.pais} · {company.sector}</span>
          
          {meddicScore > 0 && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ml-2 py-0 h-5 px-1.5 font-mono text-[10px]">
              MEDDIC: {meddicScore}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10" 
            onClick={(e) => {
              e.stopPropagation();
              setShowMeddic(true);
            }}
          >
            <Microscope className="h-3.5 w-3.5 mr-2" />
            MEDDIC
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-white" onClick={(e) => e.stopPropagation()}>
            <LinkIcon className="h-3.5 w-3.5 mr-2" />
            SF Sync
          </Button>
          <div className="text-xs text-zinc-500 font-mono">
            {contacts.length} contactos
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="border-t border-zinc-800 bg-black/20 p-4">
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-zinc-400 p-3 bg-zinc-950/50 rounded-md border border-zinc-800/50">
            <div>
              <span className="font-mono text-zinc-500 mr-2 block text-xs underline decoration-zinc-700 underline-offset-4 mb-1">Pain:</span> 
              {company.pain_point}
            </div>
            <div>
              <span className="font-mono text-zinc-500 mr-2 block text-xs underline decoration-zinc-700 underline-offset-4 mb-1">Co-sell:</span> 
              {company.co_sell_partner || '—'}
            </div>
            <div>
              <span className="font-mono text-zinc-500 mr-2 block text-xs underline decoration-zinc-700 underline-offset-4 mb-1">Caso Ref:</span> 
              {company.caso_referencia}
            </div>
          </div>
          
          <div className="space-y-3 mt-4">
            {contacts.map(contact => (
              <ContactRow key={contact.id} contact={contact} company={company} />
            ))}
            <Button variant="outline" size="sm" className="w-full border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200">
              + Agregar Contacto
            </Button>
          </div>
        </div>
      )}

      {showMeddic && (
        <MeddicModal 
          company={company} 
          onClose={() => setShowMeddic(false)} 
          onSave={handleSaveMeddic} 
        />
      )}
    </div>
  );
}
