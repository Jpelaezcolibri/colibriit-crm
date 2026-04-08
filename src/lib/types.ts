export type PipelineStage = "outreach" | "discovery" | "proposal" | "negotiation" | "closed_won" | "closed_lost";

export interface Campaign {
  id: string;
  user_id: string;
  nombre: string;
  descripcion?: string;
}

export interface Company {
  id: string;                    // Ej: "E01", "E02"
  campaign_id?: string;          // Opcional inicial pero recomendado
  nombre: string;
  pais: string;                  // "Colombia" | "México" | "Panamá" | "Perú" | "Chile"
  sector: string;
  tier: 1 | 2 | 3;
  empleados?: string;
  crm_actual?: string;
  pain_point: string;
  use_case: string;              // Solución ColibriIT propuesta
  palanca_entrada: string;       // Cómo llegar (co-sell, evento, LinkedIn)
  caso_referencia: string;       // Cliente similar como social proof
  co_sell_partner?: string;
  notas: string;
  meddicData?: MeddicData;
  
  // Salesforce sync
  sf_account_id?: string;        // SF Account ID (18 chars)
  sf_sync_status: "not_synced" | "synced" | "modified" | "error";
  sf_last_sync?: string;         // ISO date

  // Pipeline y Negocio
  pipelineStage: PipelineStage;
  bitacora: Array<{ fecha: string; msg: string; autor?: string }>;
}

export interface MeddicData {
  filtro: Record<string, string>;
  filtro_notas: Record<string, string>;
  score: Record<string, { val: number; nota: string }>;
  dolor: {
    tecnico: string;
    negocio: string;
    personal: string;
    kpis: string;
    valor_usd: string;
  };
  competencia: {
    nombres: string;
    fortalezas: string;
    debilidades: string;
    estrategia: string;
  };
}

export interface SequenceStep {
  estado: "pendiente" | "enviado" | "respondio" | "no_aplica" | "saltado";
  fecha?: string;          // Fecha de ejecución
  canal: string;           // LinkedIn, Email, WhatsApp, etc.
  notas?: string;          // Notas específicas del paso
}

export interface Contact {
  id: string;                    // Ej: "T01", "T02" (secuencia) o "P01-C1" (prospecto)
  empresa_id: string;            // FK a Company
  nombre: string;
  cargo: string;
  email?: string;
  linkedin?: string;
  whatsapp?: string;
  telefono?: string;
  es_decisor: boolean;
  notas: string;

  // Estado en el proceso
  fase: "por_prospectar" | "en_secuencia" | "respondio" | "discovery" | "propuesta" | "cerrado" | "archivado" | "pausado";
  
  // Secuencia Sandler 7 pasos (solo cuando fase !== "por_prospectar")
  secuencia: {
    fecha_inicio?: string;       // Fecha P1
    paso_actual: number;         // 0 a 7
    pasos: Record<number, SequenceStep>;
  };
  
  // Para prospectos sin contacto (POR_PROSPECTAR)
  investigacion?: {
    estado: "pendiente" | "investigando" | "contacto_identificado" | "listo_para_secuencia";
    cargo_objetivo?: string;     // El cargo que se busca
    siguiente_accion: string;
    prioridad: "ALTA" | "MEDIA" | "BAJA";
  };

  // Próxima acción calculada
  proxima_accion: string;
  fecha_proxima?: string;

  // Salesforce sync
  sf_lead_id?: string;           // SF Lead ID (si es prospecto)
  sf_contact_id?: string;        // SF Contact ID (si es contacto activo)
  sf_sync_status: "not_synced" | "synced" | "modified" | "syncing" | "error";
  sf_last_sync?: string;
  sf_sync_error?: string;
}

export interface SFConfig {
  instanceUrl: string;        // "https://colibriit.my.salesforce.com"
  accessToken: string;        // OAuth Bearer Token
  apiVersion: string;         // "v59.0"
}

export interface NextStepSuggestion {
  texto: string;
  fecha?: string | Date;
  paso_siguiente: number | null;
  instruccion_isra?: string;
  canal?: string;
  dias_espera?: number;
}
