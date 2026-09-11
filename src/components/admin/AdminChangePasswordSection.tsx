import React, { useState } from 'react';
import { KeyRound, Check, RefreshCw, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const AdminChangePasswordSection: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword) {
      setErrorMessage('Por favor introduz a palavra-passe atual.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage('A nova palavra-passe deve conter no mínimo 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('A confirmação da palavra-passe não coincide com a nova palavra-passe.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage('A nova palavra-passe deve ser diferente da palavra-passe atual.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('kicksclub_admin_token') || sessionStorage.getItem('kicksclub_admin_token') || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao alterar a palavra-passe.');
      }

      setSuccessMessage('Palavra-passe de administrador atualizada com sucesso na base de dados!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha na comunicação com o servidor de autenticação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-[#141414] border border-neutral-800 rounded-3xl space-y-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFDD00]/15 border border-[#FFDD00]/30 flex items-center justify-center text-[#FFDD00]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-black uppercase text-white font-condensed tracking-wide flex items-center gap-2">
              <span>Segurança da Conta Admin</span>
              <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold">
                Bcrypt Salt 12
              </span>
            </h4>
            <p className="text-xs text-neutral-400">
              Altera a palavra-passe de acesso ao painel de administração (ligado diretamente ao Turso DB)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPasswords(!showPasswords)}
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="hidden sm:inline">{showPasswords ? 'Ocultar' : 'Mostrar'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-green-950/60 border border-green-800/80 rounded-2xl text-green-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-300 mb-1.5 font-condensed">
            Palavra-passe Atual *
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Introduz a senha atual"
            className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-300 mb-1.5 font-condensed">
              Nova Palavra-passe * (mínimo 8 caracteres)
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nova senha segura"
              className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-300 mb-1.5 font-condensed">
              Confirmar Nova Palavra-passe *
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repete a nova senha"
              className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00]"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#FFDD00] hover:bg-[#FFE838] text-black font-black uppercase text-xs rounded-xl flex items-center gap-2 font-condensed transition-all shadow-md shadow-[#FFDD00]/10 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>A Atualizar Senha...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Atualizar Palavra-passe</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
