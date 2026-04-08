import re
import os

prompt_path = r"c:\Users\JuanPelaez\Downloads\PROMPT_CLAUDE_CODE_COLIBRIIT_FULL.md"
with open(prompt_path, "r", encoding="utf-8") as f:
    prompt = f.read()

# Extract blocks using regex
def extract_block(var_name):
    # Match const VAR_NAME: Type[] = [ ... ];
    pattern = rf"const {var_name}:.*?= \[\n(.*?)\];"
    match = re.search(pattern, prompt, re.DOTALL)
    if match:
        return f"export const {var_name}: any[] = [\n{match.group(1)}];\n"
    return f"export const {var_name}: any[] = [];\n"

empresas_secuencia = extract_block("EMPRESAS_SECUENCIA")
contactos_secuencia = extract_block("CONTACTOS_SECUENCIA")
empresas_por_prospectar = extract_block("EMPRESAS_POR_PROSPECTAR")

# For CONTACTOS_POR_PROSPECTAR, we need to generate 26 objects based on EMPRESAS_POR_PROSPECTAR
contactos_por_prospectar = """export const CONTACTOS_POR_PROSPECTAR: any[] = [
"""

# Extract the EP lines to parse the name
ep_lines = []
for line in empresas_por_prospectar.split('\n'):
    if 'id: "EP' in line:
        ep_lines.append(line)

for i, line in enumerate(ep_lines):
    num = i + 1
    # Extract id, nombre, etc
    id_match = re.search(r'id: "(EP\d+)"', line)
    name_match = re.search(r'nombre: "(.*?)"', line)
    if id_match and name_match:
        ep_id = id_match.group(1)
        empresa_name = name_match.group(1)
        
        # Determine defaults based on rules
        if ep_id == "EP01":
            contact = """  { id: "P01", empresa_id: "EP01", nombre: "Por identificar", cargo: "Director TI / CTO", fase: "por_prospectar",
    investigacion: { estado: "pendiente", cargo_objetivo: "Director TI / CTO", siguiente_accion: "Buscar Director TI en LinkedIn. Confirmar AE SF asignado.", prioridad: "ALTA" },
    proxima_accion: "Buscar Director TI en LinkedIn.", sf_sync_status: "not_synced", es_decisor: true, notas: "",
    secuencia: { paso_actual: 0, pasos: {} } }"""
        elif ep_id == "EP02":
            contact = """  { id: "P02", empresa_id: "EP02", nombre: "Por identificar", cargo: "Gerente TI / CIO", fase: "por_prospectar",
    investigacion: { estado: "pendiente", cargo_objetivo: "Gerente TI / CIO", siguiente_accion: "Buscar Gerente TI en LinkedIn. Cruzar World Tour Colombia.", prioridad: "ALTA" },
    proxima_accion: "Buscar Gerente TI en LinkedIn.", sf_sync_status: "not_synced", es_decisor: true, notas: "",
    secuencia: { paso_actual: 0, pasos: {} } }"""
        elif ep_id == "EP03":
            contact = """  { id: "P03", empresa_id: "EP03", nombre: "Jose Quintero", cargo: "CTO", fase: "por_prospectar",
    investigacion: { estado: "investigando", cargo_objetivo: "VP TI / Director Operaciones", siguiente_accion: "Activar outreach a Jose Quintero (CTO). Buscar LinkedIn.", prioridad: "ALTA" },
    proxima_accion: "Activar outreach a Jose Quintero.", sf_sync_status: "not_synced", es_decisor: true, notas: "CTO identificado",
    secuencia: { paso_actual: 0, pasos: {} } }"""
        elif ep_id == "EP26":
            contact = f"""  {{ id: "P{num:02d}", empresa_id: "EP26", nombre: "Edgar Julio Erazo Córdoba", cargo: "CEO", email: "info@damasa.com.co", fase: "por_prospectar",
    investigacion: {{ estado: "investigando", cargo_objetivo: "CEO", siguiente_accion: "Verificar si lee correo o contactar por LinkedIn.", prioridad: "ALTA" }},
    proxima_accion: "Contactar a Edgar Julio Erazo Córdoba.", sf_sync_status: "not_synced", es_decisor: true, notas: "CEO identificado.",
    secuencia: {{ paso_actual: 0, pasos: {{}} }} }}"""
        else:
            cargo_obj = "Director Operaciones" if "Manufactura" in line else "VP de Tecnología"
            contact = f"""  {{ id: "P{num:02d}", empresa_id: "{ep_id}", nombre: "Por identificar", cargo: "{cargo_obj}", fase: "por_prospectar",
    investigacion: {{ estado: "pendiente", cargo_objetivo: "{cargo_obj}", siguiente_accion: "Buscar {cargo_obj} en LinkedIn para {empresa_name}.", prioridad: "MEDIA" }},
    proxima_accion: "Buscar {cargo_obj} en LinkedIn.", sf_sync_status: "not_synced", es_decisor: true, notas: "",
    secuencia: {{ paso_actual: 0, pasos: {{}} }} }}"""
            
        contactos_por_prospectar += contact + ",\n"

contactos_por_prospectar += "];\n"

out_content = f"// src/data/initial-data.ts\\n" + \
              empresas_secuencia + \
              contactos_secuencia + \
              empresas_por_prospectar + \
              contactos_por_prospectar

out_path = "src/data/initial-data.ts"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    f.write(out_content)

print("Data exported successfully to " + out_path)
