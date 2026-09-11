import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, KeyRound, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminUser } from '../../types';

interface AdminLoginPageProps {
  onLoginSuccess: (user: AdminUser, token: string) => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setError('Por favor preencha o e-mail e a palavra-passe.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Ignora se não for JSON válido
      }

      if (!res.ok) {
        setError(data?.error || `Erro no servidor de autenticação (${res.status}). Por favor tenta novamente.`);
        return;
      }

      if (!data?.user) {
        setError('Resposta inválida do servidor. Por favor tenta novamente.');
        return;
      }

      const adminUser: AdminUser = {
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        lastLogin: data.user.lastLogin,
      };

      onLoginSuccess(adminUser, data.token);
    } catch (err) {
      setError('Erro de ligação ao servidor. Verifica a tua ligação à internet.');
      console.error('[AdminLogin]', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#0A0A0A] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFDD00]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-72 h-72 bg-[#FFDD00]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10">
        
        {/* Return to store button */}
        <div className="mb-6">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-[#FFDD00] transition-colors uppercase tracking-wider group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#FFDD00]" />
            <span>Voltar à Loja Pública</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-[#141414] border border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
          
          {/* Header & Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black border border-neutral-800 text-[#FFDD00] mb-4 shadow-inner">
              <KeyRound className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-condensed">
                KICKS<span className="text-[#FFDD00]">CLUB</span>.PT
              </span>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[#FFDD00] text-black rounded-md font-condensed">
                ADMIN
              </span>
            </div>

            <p className="text-xs text-neutral-400 mt-1">
              Painel de Gestão e Controlo de Encomendas & Estoque
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                E-mail de Administrador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kicksclub.pt"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Palavra-passe
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white transition-colors"
                  aria-label="Alternar visibilidade de palavra-passe"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Security notice */}
            <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span>Autenticação segura via JWT — sessão válida por 7 dias</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#FFDD00] hover:bg-[#FFE838] active:bg-[#e6c800] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 font-condensed hover:scale-[1.01]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>A autenticar...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>ENTRAR NO PAINEL ADMIN</span>
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-neutral-800/80">
            <p className="text-[11px] text-neutral-500 text-center">
              As credenciais são definidas nas variáveis de ambiente do servidor.
              Contacta o administrador do sistema se não tens acesso.
            </p>
          </div>

          {/* Security Badges */}
          <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-neutral-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              <span>Acesso Restrito SSL</span>
            </div>
            <span className="text-neutral-700">•</span>
            <span>Stepzone Portugal</span>
          </div>

        </div>

      </div>
    </div>
  );
};
