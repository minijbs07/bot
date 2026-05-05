'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck, Terminal, AlertCircle, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const ALLOWED_DOMAIN = "@alumnos.unican.es";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      if (!email.endsWith(ALLOWED_DOMAIN)) {
        setError(`Solo se permiten registros nuevos con el correo oficial de la universidad (${ALLOWED_DOMAIN})`);
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || '/bot'}/chat`,
        }
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("¡Registro casi completo! Revisa tu correo de la UC para confirmar tu cuenta.");
      }
      setLoading(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push('/chat');
        router.refresh();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-dark border border-white/5 p-8 md:p-10 rounded-[32px] shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? 'signup' : 'login'}
              initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex flex-col items-center mb-8">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 mb-6 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                >
                  <ShieldCheck size={32} />
                </motion.div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  {isSignUp ? 'Crear Cuenta' : 'Acceso Seguro'}
                </h1>
                <p className="text-zinc-500 text-center text-sm">
                  {isSignUp
                    ? 'Regístrate con tu correo de la UC para empezar.'
                    : 'Identifícate para acceder al Botcasso Toolbox.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white"
                      placeholder={isSignUp ? "usuario@alumnos.unican.es" : "tu@email.com"}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Contraseña</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs"
                  >
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </motion.div>
                )}

                {message && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-xs"
                  >
                    <ShieldCheck size={16} className="shrink-0" />
                    {message}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? 'Procesando...' : (
                    <>
                      {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
                      {isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
            >
              {isSignUp ? '¿Ya tienes cuenta? Entra aquí' : '¿No tienes cuenta? Crea una'}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
              <Terminal size={14} />
              BOTCASSO TOOLBOX
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
