import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadState, saveState } from '@/lib/storage';
import type { AppState } from '@/lib/storage';
import type { Company, Contact, Campaign } from '@/lib/types';
import { calculateNextStep } from '@/lib/sequence-engine';
import { 
  fetchCampaigns, 
  createCampaign, 
  fetchStateFromSupabase, 
  migrateLocalStateToSupabase, 
  upsertCompanyToSupabase, 
  upsertContactToSupabase 
} from '@/lib/supabase-service';

interface AppContextType {
  state: AppState;
  isCloudSyncing: boolean;
  campaigns: Campaign[];
  activeCampaignId: string | null;
  setActiveCampaignId: (id: string) => void;
  createNewCampaign: (nombre: string, descripcion: string) => Promise<void>;
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
  const [isCloudSyncing, setIsCloudSyncing] = useState(true);
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignIdState] = useState<string | null>(null);

  // Initialize Campaigns
  useEffect(() => {
    async function initCampaigns() {
      setIsCloudSyncing(true);
      let camps = await fetchCampaigns();
      
      // If no campaigns exist, it means fresh DB. Migrate local data into a Legacy Campaign
      if (camps.length === 0) {
        console.log("No campaigns found. Running Legacy Migration...");
        const legacyId = await migrateLocalStateToSupabase(state);
        camps = await fetchCampaigns(); // refetch
        if (legacyId) {
          setActiveCampaignIdState(legacyId);
        }
      } else {
        // If campaigns exist, default to the most recent one (or could be saved preference)
        setActiveCampaignIdState(camps[0].id);
      }
      setCampaigns(camps);
    }
    initCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When active campaign changes, fetch its state
  useEffect(() => {
    if (!activeCampaignId) return;

    async function loadCampaignState() {
      setIsCloudSyncing(true);
      const cloudState = await fetchStateFromSupabase(activeCampaignId!);
      
      if (cloudState) {
        setState(cloudState);
        saveState(cloudState); // maintain local offline mirror for this campaign
      } else {
        // Empty campaign
        setState({ companies: [], contacts: [] });
      }
      setIsCloudSyncing(false);
    }
    
    loadCampaignState();
  }, [activeCampaignId]);

  const setActiveCampaignId = (id: string) => {
    setActiveCampaignIdState(id);
  };

  const createNewCampaign = async (nombre: string, descripcion: string) => {
    setIsCloudSyncing(true);
    const newCamp = await createCampaign(nombre, descripcion);
    if (newCamp) {
      setCampaigns(prev => [newCamp, ...prev]);
      setActiveCampaignIdState(newCamp.id);
    }
    setIsCloudSyncing(false);
  };

  // State Modifiers
  const updateContact = (updatedContact: Contact) => {
    setState((prev) => {
      const newState = { ...prev, contacts: prev.contacts.map((c) => (c.id === updatedContact.id ? updatedContact : c)) };
      saveState(newState);
      return newState;
    });
    upsertContactToSupabase(updatedContact);
  };

  const updateCompany = (updatedCompany: Company) => {
    setState((prev) => {
      const newState = { ...prev, companies: prev.companies.map((c) => (c.id === updatedCompany.id ? updatedCompany : c)) };
      saveState(newState);
      return newState;
    });
    upsertCompanyToSupabase(updatedCompany);
  };

  const addContact = (newContact: Contact) => {
    setState((prev) => {
      const newState = { ...prev, contacts: [...prev.contacts, newContact] };
      saveState(newState);
      return newState;
    });
    upsertContactToSupabase(newContact);
  };

  const addCompany = (newCompany: Company) => {
    // Inject active campaign
    const companyToSave = { ...newCompany, campaign_id: activeCampaignId! };
    setState((prev) => {
      const newState = { ...prev, companies: [...prev.companies, companyToSave] };
      saveState(newState);
      return newState;
    });
    upsertCompanyToSupabase(companyToSave);
  };

  // Sequence Actions
  const advanceStep = (contactId: string) => {
    let updatedContactRef: Contact | undefined;
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

      const nextStepInfo = calculateNextStep(updatedContact, company.tier);
      updatedContact.proxima_accion = nextStepInfo.texto;
      updatedContact.fecha_proxima = nextStepInfo.fecha?.toString();

      updatedContactRef = updatedContact;
      const newState = { ...prev, contacts: prev.contacts.map(c => c.id === contactId ? updatedContact : c) };
      saveState(newState);
      return newState;
    });

    if (updatedContactRef) upsertContactToSupabase(updatedContactRef);
  };

  const markReplied = (contactId: string) => {
    let updatedContactRef: Contact | undefined;
    setState((prev) => {
      const contact = prev.contacts.find(c => c.id === contactId);
      if (!contact) return prev;

      const updatedContact: Contact = {
        ...contact,
        fase: 'respondio',
        proxima_accion: "Prospecto respondió. Siguiente acción: Proponer Discovery Call.",
        fecha_proxima: new Date().toISOString(),
      };

      updatedContactRef = updatedContact;
      const newState = { ...prev, contacts: prev.contacts.map(c => c.id === contactId ? updatedContact : c) };
      saveState(newState);
      return newState;
    });

    if (updatedContactRef) upsertContactToSupabase(updatedContactRef);
  };

  const activateProspect = (contactId: string) => {
    let updatedContactRef: Contact | undefined;
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

      updatedContactRef = updatedContact;
      const newState = { ...prev, contacts: prev.contacts.map(c => c.id === contactId ? updatedContact : c) };
      saveState(newState);
      return newState;
    });

    if (updatedContactRef) upsertContactToSupabase(updatedContactRef);
  };

  const updateMeddicData = (companyId: string, meddicData: any) => {
    let updatedCompanyRef: Company | undefined;
    setState((prev) => {
      const company = prev.companies.find(c => c.id === companyId);
      if (!company) return prev;

      const updatedCompany = { ...company, meddicData };
      updatedCompanyRef = updatedCompany;
      const newState = { ...prev, companies: prev.companies.map(c => c.id === companyId ? updatedCompany : c) };
      saveState(newState);
      return newState;
    });
    if (updatedCompanyRef) upsertCompanyToSupabase(updatedCompanyRef);
  };

  const moveCompanyToStage = (companyId: string, stage: any) => {
    let updatedCompanyRef: Company | undefined;
    setState((prev) => {
      const company = prev.companies.find(c => c.id === companyId);
      if (!company) return prev;

      const updatedCompany = { ...company, pipelineStage: stage };
      updatedCompanyRef = updatedCompany;
      const newState = { ...prev, companies: prev.companies.map(c => c.id === companyId ? updatedCompany : c) };
      saveState(newState);
      return newState;
    });
    if (updatedCompanyRef) upsertCompanyToSupabase(updatedCompanyRef);
  };

  const addCompanyLog = (companyId: string, msg: string) => {
    let updatedCompanyRef: Company | undefined;
    setState((prev) => {
      const company = prev.companies.find(c => c.id === companyId);
      if (!company) return prev;

      const updatedCompany = { 
        ...company, 
        bitacora: [{ fecha: new Date().toISOString(), msg }, ...(company.bitacora || [])] 
      };
      updatedCompanyRef = updatedCompany;
      const newState = { ...prev, companies: prev.companies.map(c => c.id === companyId ? updatedCompany : c) };
      saveState(newState);
      return newState;
    });
    if (updatedCompanyRef) upsertCompanyToSupabase(updatedCompanyRef);
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      isCloudSyncing,
      campaigns,
      activeCampaignId,
      setActiveCampaignId,
      createNewCampaign,
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
