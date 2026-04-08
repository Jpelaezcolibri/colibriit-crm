import { addDays, parseISO } from "date-fns";
import type { Contact, NextStepSuggestion } from "./types";

export const SEQUENCE_STEPS = [
  {
    id: 1,
    nombre: "LinkedIn Conexión",
    canal: "LinkedIn",
    dias_desde_inicio: 0,
    descripcion: "Nota hiperpersonalizada 300 chars. Historia implícita. Sin CTA agresivo.",
    instruccion_isra: "La primera línea es todo. Si no genera curiosidad sola, el mensaje muere ahí.",
    color: "#0A66C2",
  },
  {
    id: 2,
    nombre: "Email Día 2",
    canal: "Email",
    dias_desde_inicio: 1,
    descripcion: "Historia Isra Bravo + Pain Sandler + CTA suave '¿Aplica?'.",
    instruccion_isra: "Historia primero, venta después. Siempre. Sin excepción.",
    color: "#EA4335",
  },
  {
    id: 3,
    nombre: "Follow-Up #1",
    canal: "Email",
    dias_desde_inicio: 6,
    descripcion: "Nueva historia, mismo ángulo. Empieza con 'Desde que te escribí...'",
    instruccion_isra: "Termina antes de lo esperado. El lector debe quedar con una pregunta.",
    color: "#FBBC04",
  },
  {
    id: 4,
    nombre: "LinkedIn DM",
    canal: "LinkedIn DM",
    dias_desde_inicio: 8,
    descripcion: "Si aceptó LinkedIn. DIFERENTE al email. 50-80 palabras.",
    instruccion_isra: "Un mensaje = Una idea. Solo una. Si tienes dos ideas, son dos mensajes distintos.",
    color: "#0A66C2",
  },
  {
    id: 5,
    nombre: "Follow-Up #2",
    canal: "Email",
    dias_desde_inicio: 11,
    descripcion: "Cambio de ángulo. Ofrecer valor SIN pedir reunión. 'No sé si aplica, pero...'",
    instruccion_isra: "Nunca muestres necesidad. Este prospecto no es el único.",
    color: "#FF6D01",
  },
  {
    id: 6,
    nombre: "WhatsApp",
    canal: "WhatsApp",
    dias_desde_inicio: 15,
    descripcion: "SOLO si hay señal: aceptó LinkedIn o abrió email 2+ veces. 3-5 líneas.",
    instruccion_isra: "Específico > genérico, siempre.",
    color: "#25D366",
  },
  {
    id: 7,
    nombre: "Ruptura",
    canal: "Email",
    dias_desde_inicio: 25,
    descripcion: "Último mensaje. 'Entiendo que no es el momento.'",
    instruccion_isra: "Historia de cliente > estadística. Una historia bien contada vale más que cualquier número.",
    color: "#DC3545",
  },
];

export function calculateNextStep(contact: Contact, tier: 1 | 2 | 3): NextStepSuggestion {
  if (contact.fase === "por_prospectar") {
    return {
      texto: calculateNextProspectStep(contact),
      paso_siguiente: 0,
    };
  }

  const pasoOriginal = contact.secuencia.paso_actual;

  if (pasoOriginal >= 7 || contact.fase === "respondio" || contact.fase === "discovery") {
    if (contact.fase === "respondio") {
      return {
        texto: "Prospecto respondió. Siguiente acción sugerida: Proponer Discovery Call 15min.",
        fecha: addDays(new Date(), 1).toISOString(),
        paso_siguiente: null,
      };
    }
    if (contact.fase === "discovery") {
      return {
        texto: "Discovery Call agendada. Preparar briefing Sandler (Pain, Budget, Decision).",
        paso_siguiente: null,
      };
    }
    return {
      texto: "Secuencia completada. Crear reminder 60 días para re-contactar.",
      fecha: addDays(new Date(), 60).toISOString(),
      paso_siguiente: null,
    };
  }

  // Si estamos en el paso actual, el siguiente es pasoOriginal + 1
  const nextPasoIdx = pasoOriginal; 
  const nextStepDef = SEQUENCE_STEPS[nextPasoIdx];
  const currentStepDef = pasoOriginal > 0 ? SEQUENCE_STEPS[pasoOriginal - 1] : { dias_desde_inicio: 0 };
  
  // Buffer por Tier: T1:0, T2:1, T3:2
  const tierBuffer = tier === 1 ? 0 : tier === 2 ? 1 : 2;
  
  // Días base entre pasos + buffer (acumulado por paso)
  const baseDiff = nextStepDef.dias_desde_inicio - (currentStepDef.dias_desde_inicio || 0);
  const diasEspera = baseDiff + tierBuffer;

  const ultimaFechaStr = contact.secuencia.pasos[pasoOriginal]?.fecha || contact.secuencia.fecha_inicio || new Date().toISOString();
  let ultimaFecha = parseISO(ultimaFechaStr);
  if (isNaN(ultimaFecha.getTime())) ultimaFecha = new Date();
  
  const fechaSugerida = addDays(ultimaFecha, diasEspera);

  return {
    texto: `${nextStepDef.nombre}: ${nextStepDef.descripcion}`,
    instruccion_isra: nextStepDef.instruccion_isra,
    fecha: fechaSugerida.toISOString(),
    paso_siguiente: nextStepDef.id,
    canal: nextStepDef.canal,
    dias_espera: diasEspera,
  };
}

export function calculateNextProspectStep(contact: Contact): string {
  const estado = contact.investigacion?.estado || "pendiente";
  switch (estado) {
    case "pendiente":
      return `Buscar ${contact.investigacion?.cargo_objetivo || "decisor"} en LinkedIn. Principio Sandler: siempre empezar por C-Level.`;
    case "investigando":
      return contact.nombre.includes("Por identificar")
        ? `Identificar ${contact.investigacion?.cargo_objetivo || "decisor"} en LinkedIn. Verificar CRM actual. Mapear estructura C-Level.`
        : `Confirmar datos de ${contact.nombre}. Buscar email en Apollo. Verificar LinkedIn.`;
    case "contacto_identificado":
      return (contact.email || contact.linkedin)
        ? `Preparar hook personalizado. Listo para P1.`
        : `Obtener email o LinkedIn de ${contact.nombre}. Sin canal no se activa secuencia.`;
    case "listo_para_secuencia":
      return `🚀 LISTO — Enviar invitación LinkedIn (P1) a ${contact.nombre}. Programar Email Día 2 para mañana.`;
    default:
      return contact.proxima_accion || "Investigar prospecto";
  }
}
