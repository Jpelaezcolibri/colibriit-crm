import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

const SF_CONFIG_KEY = 'colibriit_sf_config';

export default function SalesforceView() {
  const [instanceUrl, setInstanceUrl] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SF_CONFIG_KEY) || '{}').instanceUrl || ''; } catch { return ''; }
  });
  const [accessToken, setAccessToken] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SF_CONFIG_KEY) || '{}').accessToken || ''; } catch { return ''; }
  });
  const [apiVersion] = useState('v59.0');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  function saveConfig() {
    localStorage.setItem(SF_CONFIG_KEY, JSON.stringify({ instanceUrl, accessToken, apiVersion }));
    alert('Configuración guardada.');
  }

  async function testConnection() {
    if (!instanceUrl || !accessToken) {
      setTestMessage('Ingresa la URL y el Access Token primero.');
      setTestStatus('error');
      return;
    }
    setTestStatus('testing');
    try {
      const res = await fetch(`${instanceUrl}/services/data/${apiVersion}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        setTestStatus('ok');
        setTestMessage('Conexión exitosa ✅');
      } else {
        setTestStatus('error');
        setTestMessage(`Error ${res.status}: ${res.statusText}`);
      }
    } catch (e: unknown) {
      setTestStatus('error');
      setTestMessage(`Error de red: ${e instanceof Error ? e.message : 'desconocido'}`);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-1">⚙️ Configuración Salesforce</h2>
        <p className="text-sm text-zinc-400 font-mono">Conecta tu instancia de Salesforce para sincronizar Leads, Contactos y Accounts.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 space-y-5">
        <div className="space-y-2">
          <Label className="text-zinc-300 font-mono text-sm">Instance URL</Label>
          <Input
            value={instanceUrl}
            onChange={e => setInstanceUrl(e.target.value)}
            placeholder="https://tuempresa.my.salesforce.com"
            className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-300 font-mono text-sm">Access Token (OAuth Bearer)</Label>
          <Input
            type="password"
            value={accessToken}
            onChange={e => setAccessToken(e.target.value)}
            placeholder="00Dxxxx..."
            className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono"
          />
          <p className="text-xs text-zinc-500">Obtén el token desde: Setup → Connected App → Manage Consumer Details</p>
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-300 font-mono text-sm">API Version</Label>
          <Input value={apiVersion} disabled className="bg-zinc-800/60 border-zinc-700 text-zinc-500 font-mono" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={saveConfig} className="bg-zinc-700 hover:bg-zinc-600 text-white font-mono">
            💾 Guardar
          </Button>
          <Button onClick={testConnection} disabled={testStatus === 'testing'}
            className="bg-cyan-900/60 hover:bg-cyan-800 text-cyan-300 border border-cyan-700/50 font-mono">
            {testStatus === 'testing' ? '⏳ Probando...' : '🔌 Probar Conexión'}
          </Button>
          {testStatus === 'ok' && <span className="flex items-center text-sm text-emerald-400 font-mono"><CheckCircle2 className="h-4 w-4 mr-1" />{testMessage}</span>}
          {testStatus === 'error' && <span className="flex items-center text-sm text-red-400 font-mono"><XCircle className="h-4 w-4 mr-1" />{testMessage}</span>}
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-mono text-zinc-300 mb-3 font-semibold">📋 Campos Custom Requeridos en SF</h3>
        <div className="space-y-4 text-xs font-mono text-zinc-400">
          <div>
            <h4 className="text-zinc-300 mb-1">Objeto Lead:</h4>
            <ul className="space-y-1 ml-2">
              {['Prospecto_ID_ColibriIT__c (External ID)', 'Tier__c', 'Pain_Point__c', 'Caso_Referencia__c', 'Use_Case__c', 'LinkedIn_URL__c', 'Estado_Investigacion__c'].map(f => (
                <li key={f} className="text-zinc-500">• {f}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-300 mb-1">Objeto Contact:</h4>
            <ul className="space-y-1 ml-2">
              {['Prospecto_ID_ColibriIT__c (External ID)', 'Sequencia_Paso_Actual__c', 'Estado_Secuencia__c', 'Paso_1_Fecha__c ... Paso_7_Fecha__c'].map(f => (
                <li key={f} className="text-zinc-500">• {f}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-300 mb-1">Objeto Account:</h4>
            <ul className="space-y-1 ml-2">
              {['ColibriIT_Account_ID__c (External ID)', 'Tier_ColibriIT__c', 'Palanca_Entrada__c', 'CRM_Actual__c'].map(f => (
                <li key={f} className="text-zinc-500">• {f}</li>
              ))}
            </ul>
          </div>
        </div>
        <a href="https://help.salesforce.com/s/articleView?id=sf.connected_app_create.htm" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center text-xs text-cyan-400 mt-4 hover:text-cyan-200">
          <ExternalLink className="h-3 w-3 mr-1" /> Guía: Crear Connected App en Salesforce
        </a>
      </div>
    </div>
  );
}
