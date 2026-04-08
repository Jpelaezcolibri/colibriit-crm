import { useState } from 'react';
import type { Company, MeddicData } from '@/lib/types';
import { useAppState } from '@/hooks/useAppState';
import { Building2, X, Globe2, Target, Users, Microscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ContactRow from '../sequence/ContactRow';
import { Button } from '@/components/ui/button';
import MeddicModal from '../shared/MeddicModal';
import AddContactModal from '../sequence/AddContactModal';
import type { Contact } from '@/lib/types';

interface Props {
  company: Company;
  onClose: () => void;
}

export default function CompanyDetailModal({ company, onClose }: Props) {
  const [showMeddic, setShowMeddic] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const { state, updateMeddicData, addContact } = useAppState();
  const contacts = state.contacts.filter(c => c.empresa_id === company.id);

  const handleSaveMeddic = (data: MeddicData) => {
    updateMeddicData(company.id, data);
  };

  const handleSaveContact = (contact: Contact) => {
    addContact(contact);
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 2: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  const meddicScore = company.meddicData?.score
    ? Object.values(company.meddicData.score).reduce((acc, v) => acc + (v?.val || 0), 0)
    : 0;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
        <div 
          className="relative bg-zinc-950 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start p-6 border-b border-zinc-800 bg-zinc-900/50 rounded-t-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-800 rounded-xl">
                <Building2 className="w-6 h-6 text-zinc-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                  {company.nombre}
                  <Badge variant="outline" className={`font-mono text-xs ${getTierColor(company.tier)}`}>
                    Tier {company.tier}
                  </Badge>
                </h2>
                <div className="flex items-center gap-3 mt-2 text-sm text-zinc-400 font-mono">
                  <span className="flex items-center gap-1"><Globe2 className="w-4 h-4" /> {company.pais}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1"><Target className="w-4 h-4" /> {company.sector}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                    <span className="text-zinc-300 uppercase tracking-widest text-[10px]">Pipeline:</span> 
                    <span className="text-emerald-400 font-bold">{company.pipelineStage || 'outreach'}</span>
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Company Context Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
                <h4 className="text-xs font-mono uppercase text-zinc-500 mb-2">Dolor Principal (Pain Point)</h4>
                <p className="text-sm text-zinc-200">{company.pain_point}</p>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
                <h4 className="text-xs font-mono uppercase text-zinc-500 mb-2">Caso de Uso (Use Case)</h4>
                <p className="text-sm text-zinc-200">{company.use_case}</p>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
                <h4 className="text-xs font-mono uppercase text-zinc-500 mb-2">Palanca de Entrada / Co-Sell</h4>
                <p className="text-sm text-zinc-200 mb-1">{company.palanca_entrada}</p>
                {company.co_sell_partner && company.co_sell_partner !== '—' && (
                  <div className="inline-flex items-center px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-xs mt-1 font-mono">
                    🤝 {company.co_sell_partner}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Caso Referencia */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono uppercase text-zinc-500 mb-1">Caso de Referencia a presentar</h4>
                  <p className="text-sm text-zinc-200">{company.caso_referencia}</p>
                </div>
              </div>
              
              {/* MEDDIC Score Quick View */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between">
                 <div>
                    <h4 className="text-xs font-mono uppercase text-zinc-500 mb-1">Calificación MEDDIC</h4>
                    <p className="text-sm text-zinc-200 line-clamp-1 italic text-zinc-400">Verifique 'MEDDIC' para detalle.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowMeddic(true)}
                      className="mt-3 text-xs bg-emerald-900/20 text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/40 hover:text-emerald-300"
                    >
                      <Microscope className="w-3.5 h-3.5 mr-2" />
                      Calificar MEDDIC
                    </Button>
                 </div>
                 <div className={`text-3xl font-bold font-mono px-4 py-2 rounded-lg border ${meddicScore >= 12 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'text-amber-400 bg-amber-400/10 border-amber-400/30'}`}>
                   {meddicScore}/18
                 </div>
              </div>
            </div>

            <hr className="border-zinc-800" />

            {/* Contacts Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-zinc-400" />
                  Contactos y Secuencias ({contacts.length})
                </h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-800 border-dashed"
                  onClick={() => setShowAddContact(true)}
                >
                  + Agregar Contacto
                </Button>
              </div>

              <div className="space-y-3">
                {contacts.length > 0 ? (
                  contacts.map(contact => (
                    <ContactRow key={contact.id} contact={contact} company={company} />
                  ))
                ) : (
                  <div className="text-center py-8 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl">
                    <p className="text-zinc-500 font-mono italic">No hay contactos registrados para esta cuenta.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {showMeddic && (
        <MeddicModal
          company={company}
          onClose={() => setShowMeddic(false)}
          onSave={handleSaveMeddic}
        />
      )}

      {showAddContact && (
        <AddContactModal 
          company={company}
          onClose={() => setShowAddContact(false)}
          onSave={handleSaveContact}
        />
      )}
    </>
  );
}
