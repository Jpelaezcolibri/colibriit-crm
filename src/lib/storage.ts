import type { Company, Contact } from "./types";
import { EMPRESAS_SECUENCIA, EMPRESAS_POR_PROSPECTAR, CONTACTOS_SECUENCIA, CONTACTOS_POR_PROSPECTAR } from "../data/initial-data";

export interface AppState {
  companies: Company[];
  contacts: Contact[];
}

const STORAGE_KEY = "colibriit_crm_state_v2";

export function getInitialState(): AppState {
  // Merge definitions from both modules
  return {
    companies: [...EMPRESAS_SECUENCIA, ...EMPRESAS_POR_PROSPECTAR],
    contacts: [...CONTACTOS_SECUENCIA, ...CONTACTOS_POR_PROSPECTAR],
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getInitialState();
    }
    const state = JSON.parse(raw) as AppState;
    // Basic verification
    if (!state.companies || !state.contacts) return getInitialState();
    return state;
  } catch (e) {
    console.warn("Could not load from localStorage, returning default state", e);
    return getInitialState();
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state to localStorage", e);
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
