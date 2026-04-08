import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadState, saveState } from '@/lib/storage';
import type { AppState } from '@/lib/storage';
import type { Company, Contact } from '@/lib/types';
import { calculateNextStep } from '@/lib/sequence-engine';

interface AppContextType {
  state: AppState;
  updateContact: (updatedContact: Contact) => void;
  updateCompany: (updatedCompany: Company) => void;
  addContact: (newContact: Contact) => void;
  addCompany: (newCompany: Company) => void;
  advanceStep: (contactId: string) => void;
  markReplied: (contactId: string) => void;
  activateProspect: (contactId: string) => void;
  updateMeddicData: (companyId: string, meddicData: any) => void;
  moveCompanyToStage: (companyId: string, stage: any) => void;
  addCompanyLog: (companyId: string, msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState());

  // Auto-save on state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateContact = (updatedContact: Contact) => {
    setState((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c) => (c.id === updatedContact.id ? updatedContact : c)),
    }));
  };

  const updateCompany = (updatedCompany: Company) => {
    setState((prev) => ({
      ...prev,
      companies: prev.companies.map((c) => (c.id === updatedCompany.id ? updatedCompany : c)),
    }));
  };

  const addContact = (newContact: Contact) => {
    setState((prev) => ({
      ...prev,
      contacts: [...prev.contacts, newContact],
    }));
  };

  const addCompany = (newCompany: Company) => {
    setState((prev) => ({
      ...prev,
      companies: [...prev.companies, newCompany],
    }));
  };

  const advanceStep = (contactId: string) => {
    setState((prev) => {
      const contact = prev.contacts.find(c => c.id === contactId);
      if (!contact) return prev;

      const company = prev.companies.find(comp => comp.id === contact.empresa_id);
      if (!company) return prev;

      const currentPaso = contact.secuencia.paso_actual;
      const nextPasoNum = currentPaso + 1;
      
      const updatedPasos = { ...contact.secuencia.pasos };
      updatedPasos[nextPasoNum] = {
        estado: 'enviado',
        fecha: new Date().toISOString(),
        canal: contact.secuencia.pasos[nextPasoNum]?.canal || 'Email',
      };

      const updatedContact: Contact = {
        ...contact,
        fase: 'en_secuencia',
        secuencia: {
          ...contact.secuencia,
          paso_actual: nextPasoNum,
          pasos: updatedPasos,
          fecha_inicio: contact.secuencia.fecha_inicio || new Date().toISOString(),
        }
      };

      // Recalcular proxima accion
      const nextStepInfo = calculateNextStep(updatedContact, company.tier);
      updatedContact.proxima_accion = nextStepInfo.texto;
      updatedContact.fecha_proxima = nextStepInfo.fecha?.toString();

      return {
        ...prev,
        contacts: prev.contacts.map(c => c.id === contactId ? updatedContact : c)
      };
    });
  };

  const markReplied = (contactId: string) => {
    setState((prev) => {
      const contact = prev.contacts.find(c => c.id === contactId);
      if (!contact) return prev;

      const updatedContact: Contact = {
        ...contact,
        fase: 'respondio',
        proxima_accion: "Prospecto respondió. Siguiente acción: Proponer Discovery Call.",
        fecha_proxima: new Date().toISOString(),
      };

      return {
        ...prev,
        contacts: prev.contacts.map(c => c.id === contactId ? updatedContact : c)
      };
    });
  };

  const activateProspect = (contactId: string) => {
    setState((prev) => {
      const contact = prev.contacts.find(c => c.id === contactId);
      if (!contact) return prev;

      const company = prev.companies.find(comp => comp.id === contact.empresa_id);
      if (!company) return prev;

      const updatedContact: Contact = {
        ...contact,
        fase: 'en_secuencia',
        secuencia: {
          fecha_inicio: new Date().toISOString(),
          paso_actual: 1,
          pasos: {
            1: { estado: 'enviado', fecha: new Date().toISOString(), canal: 'LinkedIn' }
          }
        }
      };

      const nextStepInfo = calculateNextStep(updatedContact, company.tier);
      updatedContact.proxima_accion = nextStepInfo.texto;
      updatedContact.fecha_proxima = nextStepInfo.fecha?.toString();

      return {
        ...prev,
        contacts: prev.contacts.map(c => c.id === contactId ? updatedContact : c)
      };
    });
  };

  const updateMeddicData = (companyId: string, meddicData: any) => {
    setState((prev) => ({
      ...prev,
      companies: prev.companies.map(c => c.id === companyId ? { ...c, meddicData } : c)
    }));
  };

  const moveCompanyToStage = (companyId: string, stage: any) => {
    setState((prev) => ({
      ...prev,
      companies: prev.companies.map(c => c.id === companyId ? { 
        ...c, 
        pipelineStage: stage 
      } : c)
    }));
  };

  const addCompanyLog = (companyId: string, msg: string) => {
    setState((prev) => ({
      ...prev,
      companies: prev.companies.map(c => c.id === companyId ? { 
        ...c, 
        bitacora: [{ fecha: new Date().toISOString(), msg }, ...(c.bitacora || [])] 
      } : c)
    }));
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      updateContact, 
      updateCompany, 
      addContact, 
      addCompany,
      advanceStep,
      markReplied,
      activateProspect,
      updateMeddicData,
      moveCompanyToStage,
      addCompanyLog
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}
