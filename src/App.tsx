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
      <div className="min-h-screen bg-background text-white selection:bg-cyan-500/30">
        <Header />
        <main className="mx-auto px-4 py-8 max-w-[98%]">
          <Tabs defaultValue="secuencia" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-zinc-900 border border-zinc-800/80 p-1.5 mb-10 rounded-2xl h-auto shadow-2xl">
              <TabsTrigger value="secuencia" className="py-3.5 text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-bold text-sm tracking-widest transition-all duration-300 rounded-xl uppercase">🎯 Pipeline Unificado</TabsTrigger>
              <TabsTrigger value="prospectos" className="py-3.5 text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-bold text-sm tracking-widest transition-all duration-300 rounded-xl uppercase">🔍 Descubrimiento</TabsTrigger>
              <TabsTrigger value="agenda" className="py-3.5 text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-bold text-sm tracking-widest transition-all duration-300 rounded-xl uppercase">📅 Agenda</TabsTrigger>
              <TabsTrigger value="sf_config" className="py-3.5 text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-bold text-sm tracking-widest transition-all duration-300 rounded-xl uppercase">⚙️ Salesforce</TabsTrigger>
            </TabsList>
            
            <TabsContent value="secuencia" className="m-0 border-0 rounded-3xl p-0 min-h-[600px] outline-none">
              <PipelineBoard />
            </TabsContent>
            
            <TabsContent value="prospectos" className="m-0 border border-zinc-800/50 rounded-3xl p-8 bg-zinc-900/30 backdrop-blur-sm min-h-[600px] shadow-sm">
              <ProspectView />
            </TabsContent>
            
            <TabsContent value="agenda" className="m-0 border border-zinc-800/50 rounded-3xl p-8 bg-zinc-900/30 backdrop-blur-sm min-h-[600px] shadow-sm">
              <AgendaView />
            </TabsContent>
            
            <TabsContent value="sf_config" className="m-0 border border-zinc-800/50 rounded-3xl p-8 bg-zinc-900/30 backdrop-blur-sm min-h-[600px] shadow-sm">
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
