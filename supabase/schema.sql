-- Schema Multi-Tenant: SaaS ColibriIT CRM (V3 - RLS & Auth)

-- 🚀 PASO 0: Limpieza obligatoria (Borra estructuras vulnerables viejas)
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;

-- 🚀 PASO 1: Creación de Tablas Blindadas

-- 1A. Campañas (Ahora ligadas nativamente a UN vendedor/usuario en auth.users)
CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 1B. Compañías / Prospectos
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  pais TEXT NOT NULL,
  sector TEXT NOT NULL,
  tier INTEGER NOT NULL,
  pain_point TEXT NOT NULL,
  use_case TEXT NOT NULL,
  palanca_entrada TEXT NOT NULL,
  caso_referencia TEXT NOT NULL,
  co_sell_partner TEXT,
  notas TEXT,
  meddic_data JSONB,
  pipeline_stage TEXT NOT NULL,
  bitacora JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 1C. Contactos / Actores
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  empresa_id TEXT REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  cargo TEXT NOT NULL,
  email TEXT,
  linkedin TEXT,
  whatsapp TEXT,
  telefono TEXT,
  es_decisor BOOLEAN DEFAULT false,
  notas TEXT,
  fase TEXT NOT NULL,
  secuencia JSONB,
  investigacion JSONB,
  proxima_accion TEXT,
  fecha_proxima TIMESTAMP WITH TIME ZONE,
  sf_sync_status TEXT DEFAULT 'not_synced',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Triggers de Auditoría Básica
CREATE OR REPLACE FUNCTION update_modified_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_modtime BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_contacts_modtime BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 🚀 PASO 2: SEGURIDAD (Row Level Security)

-- Encender el muro de fuego en todas las tablas
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- REGLAS DE CAMPAÑAS: "Solo lee/escribe quien haya creado la campaña"
CREATE POLICY "Users can fully manage their own campaigns"
  ON campaigns FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- REGLAS DE COMPAÑIAS: "Si eres dueño de la Campaña que envuelve esta Compañía, entonces tienes permiso"
CREATE POLICY "Users can fully manage companies in their campaigns"
  ON companies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = companies.campaign_id AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = companies.campaign_id AND campaigns.user_id = auth.uid()
    )
  );

-- REGLAS DE CONTACTOS: "Si eres dueño de la Campaña que envuelve la Compañia de este Contacto, tienes permiso"
CREATE POLICY "Users can fully manage contacts in their campaigns"
  ON contacts FOR ALL
  USING (
     EXISTS (
      SELECT 1 FROM companies
      JOIN campaigns ON campaigns.id = companies.campaign_id
      WHERE companies.id = contacts.empresa_id AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
     EXISTS (
      SELECT 1 FROM companies
      JOIN campaigns ON campaigns.id = companies.campaign_id
      WHERE companies.id = contacts.empresa_id AND campaigns.user_id = auth.uid()
    )
  );
