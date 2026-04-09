import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, Lock, Mail, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Notice on successful register
        setErrorMsg('Por favor revisa tu correo para confirmar tu cuenta (si tienes confirmación activada). O intenta iniciar sesión.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full poiner-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full poiner-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Activity className="h-12 w-12 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
            <span className="text-4xl font-extrabold text-white tracking-tight">ColibriIT</span>
          </div>
          <h1 className="text-sm text-zinc-500 font-bold uppercase tracking-[0.3em]">
            Command Center
          </h1>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10">
          <h2 className="text-2xl font-bold text-white mb-8 text-center italic">
            {isLogin ? 'Acceso Corporativo' : 'Nuevo Workspace'}
          </h2>

          {errorMsg && (
            <div className={`p-4 mb-6 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-2 ${errorMsg.includes('revisa tu correo') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 ml-1">
                <Mail className="h-3.5 w-3.5" /> Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="bg-zinc-950/50 border-zinc-800/80 text-white focus-visible:ring-cyan-500 h-14 rounded-xl text-base"
                placeholder="usuario@tuempresa.com"
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 ml-1">
                <Lock className="h-3.5 w-3.5" /> Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="bg-zinc-950/50 border-zinc-800/80 text-white focus-visible:ring-cyan-500 h-14 rounded-xl text-base"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-extrabold text-base tracking-tight rounded-xl mt-4 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
            >
              {loading ? (
                <span className="flex items-center gap-2.5 text-black">
                  <Server className="h-5 w-5 animate-spin" /> Procesando...
                </span>
              ) : (
                isLogin ? 'Iniciar Sesión' : 'Crear Workspace'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-cyan-500 hover:text-cyan-400 font-bold transition-all underline underline-offset-4 decoration-cyan-500/30 hover:decoration-cyan-500"
            >
              {isLogin
                ? '¿No tienes cuenta? Registra tu Workspace'
                : '¿Ya tienes cuenta? Iniciar sesión'}
            </button>
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-10 font-medium px-8 leading-relaxed">
          © 2026 ColibriIT. Sistema asegurado mediante políticas avanzadas de aislamiento de datos (RLS).
        </p>
      </div>
    </div>
  );
}
