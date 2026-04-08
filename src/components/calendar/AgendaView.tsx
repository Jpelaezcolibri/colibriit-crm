import React from 'react';
import { useAppState } from '@/hooks/useAppState';
import type { Contact } from '@/lib/types';
import { SEQUENCE_STEPS } from '@/lib/sequence-engine';
import { parseISO, isToday, isBefore, isAfter, addDays, isTomorrow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronRight, AlertTriangle, Clock, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge"; // Usando el componente real si existe, o el fallback abajo

interface AgendaItem {
  contact: Contact;
  companyName: string;
  companyId: string;
  stepId: number;
  stepName: string;
  dueDate: Date;
  action: string;
  isOverdue: boolean;
  isToday: boolean;
}

export default function AgendaView() {
  const { state, advanceStep } = useAppState();

  const tasks: AgendaItem[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = addDays(today, 7);

  state.contacts.forEach(contact => {
    if (contact.fase === 'por_prospectar' || contact.fase === 'archivado') return;
    const company = state.companies.find(c => c.id === contact.empresa_id);
    if (!contact.fecha_proxima) return;

    let dueDate: Date;
    try { 
      dueDate = parseISO(contact.fecha_proxima); 
      if (isNaN(dueDate.getTime())) return;
    } catch { return; }
    
    dueDate.setHours(0, 0, 0, 0);

    // Show overdue OR tasks within next 7 days
    if (isAfter(dueDate, nextWeek) && !isBefore(dueDate, today)) return;

    const stepId = contact.secuencia.paso_actual;
    const stepDef = SEQUENCE_STEPS.find(s => s.id === stepId);

    tasks.push({
      contact,
      companyName: company?.nombre ?? contact.empresa_id,
      companyId: contact.empresa_id,
      stepId,
      stepName: contact.fase === 'discovery' ? 'DISCOVERY CALL' :
                contact.fase === 'respondio' ? 'RESPONDIÓ — Proponer Discovery' :
                (stepDef?.nombre ?? `Paso ${stepId}`),
      dueDate,
      action: contact.proxima_accion,
      isOverdue: isBefore(dueDate, today),
      isToday: isToday(dueDate),
    });
  });

  // Sort by date
  tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const overdue = tasks.filter(t => t.isOverdue);
  const todayTasks = tasks.filter(t => t.isToday);
  const tomorrow = tasks.filter(t => isTomorrow(t.dueDate));
  const thisWeek = tasks.filter(t => !t.isOverdue && !t.isToday && !isTomorrow(t.dueDate));

  function TaskCard({ t, bgClass }: { t: AgendaItem; bgClass: string }) {
    const isDiscovery = t.contact.fase === 'discovery';
    return (
      <div className={`flex items-start justify-between p-4 rounded-xl border animate-in fade-in slide-in-from-bottom-2 duration-300 ${bgClass}`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className={`font-mono text-[10px] uppercase ${t.isOverdue ? 'bg-red-500/10 text-red-400 border-red-500/20' : t.isToday ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
              {t.dueDate.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
            </Badge>
            {t.isOverdue && (
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-tight">
                ⚠️ Vencida {Math.abs(Math.round((t.dueDate.getTime() - today.getTime()) / 86400000))}d
              </span>
            )}
          </div>
          <div className="font-bold text-zinc-100 text-sm">{t.companyName} <span className="text-zinc-500 mx-1">→</span> {t.contact.nombre}</div>
          <div className="text-xs font-mono text-zinc-400 mt-1 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            {isDiscovery ? '📞 DISCOVERY CALL' : t.contact.fase === 'respondio' ? '✅ RESPUESTA RECIBIDA' : `P${t.stepId}: ${t.stepName}`}
          </div>
          {t.action && (
            <div className="flex items-start text-xs text-zinc-500 mt-2 bg-black/20 p-2 rounded border border-zinc-800/50">
              <ChevronRight className="h-3 w-3 text-zinc-600 mr-1 mt-0.5 flex-shrink-0" />
              {t.action}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 ml-4 shrink-0">
          <Button size="sm" onClick={() => advanceStep(t.contact.id)}
            className="h-8 text-[11px] font-bold bg-zinc-800 text-zinc-200 hover:bg-emerald-600 hover:text-white transition-all border border-zinc-700 hover:border-emerald-500">
            ✓ Completar
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-[11px] text-zinc-500 hover:text-zinc-300">
            Reagendar
          </Button>
        </div>
      </div>
    );
  }

  function Section({ title, icon, tasks, className, badgeClass }: { title: string; icon: React.ReactNode; tasks: AgendaItem[]; className: string; badgeClass: string }) {
    if (tasks.length === 0) return null;
    return (
      <div className="animate-in fade-in duration-500">
        <div className={`flex items-center justify-between mb-4 border-b border-zinc-800 pb-2`}>
          <div className={`flex items-center gap-2 ${className}`}>
            {icon}
            <h3 className="font-bold text-xs uppercase tracking-widest">{title}</h3>
          </div>
          <Badge className={badgeClass}>{tasks.length}</Badge>
        </div>
        <div className="space-y-3">
          {tasks.map((t, i) => (
            <TaskCard key={`${t.contact.id}-${i}`} t={t}
              bgClass={t.isOverdue ? 'bg-red-500/5 border-red-500/10' : t.isToday ? 'bg-amber-500/5 border-amber-500/10' : 'bg-zinc-900/40 border-zinc-800/50'} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Vencidas', val: overdue.length, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Para Hoy', val: todayTasks.length, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Mañana', val: tomorrow.length, color: 'text-zinc-400', bg: 'bg-zinc-800/50' },
          { label: 'Semana', val: thisWeek.length, color: 'text-zinc-400', bg: 'bg-zinc-800/50' },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-xl border border-zinc-800 ${s.bg} flex flex-col items-center justify-center text-center`}>
            <span className={`text-2xl font-black font-mono ${s.color}`}>{String(s.val).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase font-bold text-zinc-500 mt-1 tracking-tighter">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-12">
        <Section 
          title="Tareas Vencidas" 
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />} 
          tasks={overdue} 
          className="text-red-500" 
          badgeClass="bg-red-500 text-white" 
        />
        <Section 
          title="Prioridad Hoy" 
          icon={<Clock className="h-4 w-4 text-amber-500" />} 
          tasks={todayTasks} 
          className="text-amber-500" 
          badgeClass="bg-amber-500 text-zinc-950" 
        />
        <Section 
          title="Siguiente: Mañana" 
          icon={<CalendarIcon className="h-4 w-4 text-zinc-400" />} 
          tasks={tomorrow} 
          className="text-zinc-300" 
          badgeClass="bg-zinc-700 text-zinc-100" 
        />
        <Section 
          title="Próximos 7 días" 
          icon={<CalendarIcon className="h-4 w-4 text-zinc-500" />} 
          tasks={thisWeek} 
          className="text-zinc-500" 
          badgeClass="bg-zinc-800 text-zinc-400" 
        />
      </div>

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-600 space-y-4">
          <CheckCircle2 className="h-12 w-12 text-zinc-800" />
          <p className="font-mono text-sm tracking-tight text-center">No hay acciones pendientes en el radar.<br/>Buen trabajo manteniendo el flujo.</p>
        </div>
      )}
    </div>
  );
}
