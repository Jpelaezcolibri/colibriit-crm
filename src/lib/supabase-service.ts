import { supabase } from './supabase';
import type { Company, Contact, Campaign } from './types';
import type { AppState } from './storage';

export async function fetchCampaigns(): Promise<Campaign[]> {
  try {
    const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    return [];
  }
}

export async function createCampaign(nombre: string, descripcion: string = ""): Promise<Campaign | null> {
  const newCamp = {
    id: `CAMP-${Date.now()}`,
    nombre,
    descripcion
  };
  try {
    const { error } = await supabase.from('campaigns').insert(newCamp);
    if (error) throw error;
    return newCamp;
  } catch (err) {
    console.error("Error creating campaign:", err);
    return null;
  }
}

export async function fetchStateFromSupabase(campaignId: string): Promise<AppState | null> {
  try {
    const { data: companies, error: errC } = await supabase
      .from('companies')
      .select('*')
      .eq('campaign_id', campaignId);
      
    if (errC) throw errC;

    // We only fetch contacts for the companies in this campaign
    const companyIds = companies?.map(c => c.id) || [];
    
    let contacts: any[] = [];
    if (companyIds.length > 0) {
      const { data: fetchContacts, error: errT } = await supabase
        .from('contacts')
        .select('*')
        .in('empresa_id', companyIds);
      if (errT) throw errT;
      contacts = fetchContacts || [];
    }

    const parsedCompanies: Company[] = (companies || []).map(c => ({
      id: c.id,
      campaign_id: c.campaign_id,
      nombre: c.nombre,
      pais: c.pais,
      sector: c.sector,
      tier: c.tier,
      pain_point: c.pain_point,
      use_case: c.use_case,
      palanca_entrada: c.palanca_entrada,
      caso_referencia: c.caso_referencia,
      co_sell_partner: c.co_sell_partner,
      notas: c.notas,
      meddicData: c.meddic_data,
      pipelineStage: c.pipeline_stage,
      bitacora: c.bitacora || [],
      sf_sync_status: 'not_synced'
    }));

    const parsedContacts: Contact[] = contacts.map(t => ({
      id: t.id,
      empresa_id: t.empresa_id,
      nombre: t.nombre,
      cargo: t.cargo,
      email: t.email,
      linkedin: t.linkedin,
      whatsapp: t.whatsapp,
      telefono: t.telefono,
      es_decisor: t.es_decisor,
      notas: t.notas,
      fase: t.fase,
      secuencia: t.secuencia || { paso_actual: 0, pasos: {} },
      investigacion: t.investigacion,
      proxima_accion: t.proxima_accion,
      fecha_proxima: t.fecha_proxima,
      sf_sync_status: t.sf_sync_status || 'not_synced'
    }));

    return { companies: parsedCompanies, contacts: parsedContacts };
  } catch (error) {
    console.error("Error fetching from Supabase:", error);
    return null;
  }
}

export async function migrateLocalStateToSupabase(localState: AppState) {
  try {
    // 1. Crear campaña legacy base
    const legacyCampaign: Campaign = {
      id: "CAMP-LEGACY-001",
      nombre: "General (Heredada)",
      descripcion: "Campaña importada automáticamente desde la data local anterior."
    };
    await supabase.from('campaigns').upsert(legacyCampaign);

    // 2. Asociar todos los prospectos a la campaña Legacy
    const companiesToInsert = localState.companies.map(c => ({
      id: c.id,
      campaign_id: legacyCampaign.id,
      nombre: c.nombre,
      pais: c.pais,
      sector: c.sector,
      tier: c.tier,
      pain_point: c.pain_point,
      use_case: c.use_case,
      palanca_entrada: c.palanca_entrada,
      caso_referencia: c.caso_referencia,
      co_sell_partner: c.co_sell_partner,
      notas: c.notas,
      meddic_data: c.meddicData || null,
      pipeline_stage: c.pipelineStage,
      bitacora: c.bitacora || []
    }));

    // Insertar empresas
    if (companiesToInsert.length > 0) {
      const { error: errC } = await supabase.from('companies').upsert(companiesToInsert);
      if (errC) throw errC;
    }

    // 3. Insertar contactos
    const contactsToInsert = localState.contacts.map(t => ({
      id: t.id,
      empresa_id: t.empresa_id,
      nombre: t.nombre,
      cargo: t.cargo,
      email: t.email,
      linkedin: t.linkedin,
      whatsapp: t.whatsapp,
      telefono: t.telefono,
      es_decisor: t.es_decisor,
      notas: t.notas,
      fase: t.fase,
      secuencia: t.secuencia,
      investigacion: t.investigacion,
      proxima_accion: t.proxima_accion,
      fecha_proxima: t.fecha_proxima,
      sf_sync_status: t.sf_sync_status
    }));

    if (contactsToInsert.length > 0) {
      const { error: errT } = await supabase.from('contacts').upsert(contactsToInsert);
      if (errT) throw errT;
    }

    console.log("Migración Legacy Multi-Campaña a Supabase completada con éxito.");
    return legacyCampaign.id;
  } catch (error) {
    console.error("Error migrating to Supabase:", error);
    return null;
  }
}

// Actualizaciones unitarias
export async function upsertCompanyToSupabase(c: Company) {
  const row = {
    id: c.id,
    campaign_id: c.campaign_id, // Important for relations
    nombre: c.nombre,
    pais: c.pais,
    sector: c.sector,
    tier: c.tier,
    pain_point: c.pain_point,
    use_case: c.use_case,
    palanca_entrada: c.palanca_entrada,
    caso_referencia: c.caso_referencia,
    co_sell_partner: c.co_sell_partner,
    notas: c.notas,
    meddic_data: c.meddicData || null,
    pipeline_stage: c.pipelineStage,
    bitacora: c.bitacora || []
  };
  await supabase.from('companies').upsert(row);
}

export async function upsertContactToSupabase(t: Contact) {
  const row = {
    id: t.id,
    empresa_id: t.empresa_id,
    nombre: t.nombre,
    cargo: t.cargo,
    email: t.email,
    linkedin: t.linkedin,
    whatsapp: t.whatsapp,
    telefono: t.telefono,
    es_decisor: t.es_decisor,
    notas: t.notas,
    fase: t.fase,
    secuencia: t.secuencia,
    investigacion: t.investigacion,
    proxima_accion: t.proxima_accion,
    fecha_proxima: t.fecha_proxima,
    sf_sync_status: t.sf_sync_status
  };
  await supabase.from('contacts').upsert(row);
}
