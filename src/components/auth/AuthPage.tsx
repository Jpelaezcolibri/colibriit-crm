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
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 blur-[120px] rounded-full poiner-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/20 blur-[120px] rounded-full poiner-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Activity className="h-10 w-10 text-cyan-400" />
            <span className="text-3xl font-extrabold text-white tracking-tighter">ColibriIT</span>
          </div>
          <h1 className="text-xl text-zinc-400 font-mono tracking-wide">
            EXECUTIVE CRM
          </h1>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800/50 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isLogin ? 'Acceso Corporativo' : 'Nuevo Workspace'}
          </h2>

          {errorMsg && (
            <div className={`p-3 mb-4 rounded-lg text-sm border ${errorMsg.includes('revisa tu correo') ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50' : 'bg-red-900/30 text-red-400 border-red-900/50'}`}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400 text-xs uppercase tracking-wider flex items-center gap-2">
                <Mail className="h-3 w-3" /> Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-cyan-500 h-12"
                placeholder="usuario@tuempresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400 text-xs uppercase tracking-wider flex items-center gap-2">
                <Lock className="h-3 w-3" /> Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-cyan-500 h-12"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold tracking-wide mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Server className="h-4 w-4 animate-spin" /> Procesando...
                </span>
              ) : (
                isLogin ? 'Iniciar Sesión' : 'Crear Cuenta Segura'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-cyan-500 hover:text-cyan-400 font-mono transition-colors"
            >
              {isLogin
                ? '¿No tienes cuenta? Registra tu Workspace'
                : '¿Ya tienes cuenta? Iniciar sesión'}
            </button>
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-8">
          © 2026 ColibriIT. Sistema asegurado mediante políticas militares RLS (Row-Level Security).
        </p>
      </div>
    </div>
  );
}
