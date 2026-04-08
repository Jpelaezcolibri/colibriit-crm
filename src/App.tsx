import { AppProvider } from '@/hooks/useAppState';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import AuthPage from '@/components/auth/AuthPage';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProspectView from '@/components/prospects/ProspectView';
import AgendaView from '@/components/calendar/AgendaView';
import SalesforceView from '@/components/salesforce/SalesforceView';
import { PipelineBoard } from '@/components/pipeline/PipelineBoard';

function MainApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-cyan-500 animate-spin"></div>
          <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Cargando Workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Si hay usuario, retornamos la App central con su Provider de Contexto
  return (
    <AppProvider>
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <Tabs defaultValue="secuencia" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-zinc-900 border border-zinc-800 p-1 mb-6 rounded-lg h-auto">
              <TabsTrigger value="secuencia" className="py-2.5 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-mono text-xs tracking-wider">🎯 PIPELINE UNIFICADO</TabsTrigger>
              <TabsTrigger value="prospectos" className="py-2.5 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-mono text-xs tracking-wider">🔍 DESCUBRIMIENTO</TabsTrigger>
              <TabsTrigger value="agenda" className="py-2.5 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-mono text-xs tracking-wider">📅 AGENDA</TabsTrigger>
              <TabsTrigger value="sf_config" className="py-2.5 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-mono text-xs tracking-wider">⚙️ SALESFORCE</TabsTrigger>
            </TabsList>
            
            <TabsContent value="secuencia" className="m-0 border-0 rounded-xl p-0 min-h-[600px] outline-none">
              <PipelineBoard />
            </TabsContent>
            
            <TabsContent value="prospectos" className="m-0 border border-zinc-800/80 rounded-xl p-6 bg-zinc-950 min-h-[600px]">
              <ProspectView />
            </TabsContent>
            
            <TabsContent value="agenda" className="m-0 border border-zinc-800/80 rounded-xl p-6 bg-zinc-950 min-h-[600px]">
              <AgendaView />
            </TabsContent>
            
            <TabsContent value="sf_config" className="m-0 border border-zinc-800/80 rounded-xl p-6 bg-zinc-950 min-h-[600px]">
              <SalesforceView />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AppProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
