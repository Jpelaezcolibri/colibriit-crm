-- Schema Multi-Campaña para el ColibriIT Executive CRM (Supabase)

-- A. Limpiar cualquier estructura vieja si existe (Precaución en Producción, pero ideal aquí)
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;

-- 1. Tabla de Campañas (Workspaces)
CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla de Compañías (Empresas)
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
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

-- 3. Tabla de Contactos
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  empresa_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
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

-- Triggers y lógica de seguridad
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_modtime
BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_contacts_modtime
BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Habilitar RLS (Seguridad a Nivel de Filas)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (solo para uso de esta aplicación front-end internamente conectada al Dashboard)
CREATE POLICY "Allow public read/write" ON campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON contacts FOR ALL USING (true) WITH CHECK (true);
