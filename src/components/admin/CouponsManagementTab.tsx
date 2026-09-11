import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Percent, 
  Calendar, 
  Hash, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Copy,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export interface CouponItem {
  id: string;
  code: string;
  discountPercent: number;
  discountAmount: number;
  minOrderValue: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export const CouponsManagementTab: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscountPercent, setNewDiscountPercent] = useState<number | string>(10);
  const [newMaxUses, setNewMaxUses] = useState<string>('');
  const [newExpiresAt, setNewExpiresAt] = useState<string>('');
  const [newMinOrder, setNewMinOrder] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const getAuthToken = () => {
    return localStorage.getItem('kicksclub_admin_token') || sessionStorage.getItem('kicksclub_admin_token') || '';
  };

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/coupons', { headers });
      if (!res.ok) {
        throw new Error(`Erro ao carregar cupões (HTTP ${res.status})`);
      }
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao carregar a lista de cupões da base de dados.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    const cleanCode = newCode.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 2) {
      setModalError('O código deve ter pelo menos 2 caracteres.');
      return;
    }

    const percent = Number(newDiscountPercent);
    if (isNaN(percent) || percent < 1 || percent > 100) {
      setModalError('A percentagem de desconto deve ser entre 1% e 100%.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: cleanCode,
          discountPercent: percent,
          maxUses: newMaxUses ? parseInt(newMaxUses, 10) : null,
          expiresAt: newExpiresAt ? new Date(newExpiresAt).toISOString() : null,
          minOrderValue: newMinOrder ? parseFloat(newMinOrder) : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar cupão');
      }

      setSuccessMessage(`Cupão "${cleanCode}" criado com sucesso!`);
      setTimeout(() => setSuccessMessage(''), 4000);

      // Reset form & close
      setNewCode('');
      setNewDiscountPercent(10);
      setNewMaxUses('');
      setNewExpiresAt('');
      setNewMinOrder('');
      setIsModalOpen(false);

      // Refresh list
      fetchCoupons();
    } catch (err: any) {
      setModalError(err.message || 'Falha ao gravar o cupão na base de dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/coupons', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id, isActive: !currentActive }),
      });

      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !currentActive } : c))
        );
      }
    } catch (err) {
      console.error('Erro ao alternar estado do cupão:', err);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`Tens a certeza de que desejas eliminar o cupão "${code}"?`)) {
      return;
    }

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/coupons?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Erro ao eliminar cupão');
      }
    } catch (err) {
      console.error('Erro ao eliminar cupão:', err);
    }
  };

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] border border-neutral-800 p-5 sm:p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FFDD00]" />
            <h3 className="text-xl font-black uppercase text-white font-condensed tracking-tight flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#FFDD00]" />
              <span>Gestão de Cupões & Descontos</span>
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            Cria e gere códigos promocionais conectados à base de dados Turso para o checkout da loja
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCoupons}
            className="p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#FFDD00] hover:bg-[#FFE838] text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all font-condensed shadow-md shadow-[#FFDD00]/10"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Criar Novo Cupão</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-green-950/60 border border-green-800/80 rounded-2xl text-green-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#141414] border border-neutral-800 rounded-2xl space-y-1">
          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Total de Cupões</span>
          <p className="text-2xl font-black text-white font-condensed">{totalCoupons}</p>
          <p className="text-[11px] text-neutral-500">Registados na base de dados</p>
        </div>

        <div className="p-4 bg-[#141414] border border-neutral-800 rounded-2xl space-y-1">
          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Cupões Ativos</span>
          <p className="text-2xl font-black text-green-400 font-condensed">{activeCoupons}</p>
          <p className="text-[11px] text-neutral-500">Prontos a aplicar no checkout</p>
        </div>

        <div className="p-4 bg-[#141414] border border-neutral-800 rounded-2xl space-y-1">
          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Validação Automática</span>
          <p className="text-sm font-bold text-[#FFDD00] mt-1 flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            Integrada na API
          </p>
          <p className="text-[11px] text-neutral-500">Verificação em tempo real</p>
        </div>
      </div>

      {/* Coupons Table List */}
      <div className="bg-[#141414] border border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <h4 className="text-sm font-black uppercase text-white font-condensed tracking-wide">
            Lista de Cupões Promocionais
          </h4>
          <span className="text-xs text-neutral-400 font-bold">{coupons.length} Cupões</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-neutral-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#FFDD00] mx-auto" />
            <p className="text-xs font-bold">A carregar cupões do Turso...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Ticket className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-sm font-bold text-neutral-300">Nenhum cupão encontrado</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Clica no botão "Criar Novo Cupão" acima para adicionares o primeiro código com desconto.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#FFDD00] text-black font-black text-xs uppercase rounded-xl font-condensed"
            >
              + Criar Cupão
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900/80 text-neutral-400 uppercase text-[10px] tracking-wider font-bold border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Desconto</th>
                  <th className="py-3 px-4">Usos</th>
                  <th className="py-3 px-4">Expiração</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white text-sm bg-black/80 px-2.5 py-1 rounded-lg border border-neutral-800 text-[#FFDD00]">
                          {c.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(c.code)}
                          className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
                          title="Copiar código"
                        >
                          {copiedCode === c.code ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      <span className="inline-flex items-center gap-1 text-[#FFDD00]">
                        <Percent className="w-3 h-3" />
                        {c.discountPercent}% OFF
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-300">
                      {c.maxUses !== null ? (
                        <span>{c.usedCount} / {c.maxUses}</span>
                      ) : (
                        <span className="text-neutral-500">Ilimitado ({c.usedCount} usados)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-400">
                      {c.expiresAt ? (
                        new Date(c.expiresAt).toLocaleDateString('pt-PT', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      ) : (
                        <span className="text-neutral-500">Sem limite</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(c.id, c.isActive)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${
                          c.isActive
                            ? 'bg-green-950/60 border border-green-800 text-green-400 hover:bg-green-900/60'
                            : 'bg-neutral-800/80 border border-neutral-700 text-neutral-400 hover:bg-neutral-800'
                        }`}
                        title="Clica para alternar estado"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-green-400' : 'bg-neutral-500'}`} />
                        <span>{c.isActive ? 'Ativo' : 'Inativo'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-lg transition-colors border border-red-800/50"
                        title="Eliminar cupão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar Novo Cupão */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#161616] border border-neutral-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FFDD00]/15 border border-[#FFDD00]/30 flex items-center justify-center text-[#FFDD00]">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white font-condensed tracking-wide">
                    Novo Cupão Promocional
                  </h3>
                  <p className="text-[11px] text-neutral-400">Registar código com desconto na loja</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-5 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-black uppercase text-neutral-300 mb-1 font-condensed tracking-wider">
                  Código do Cupão * (Ex: VERAO20, KICKS15)
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="EX: VERAO15"
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 font-mono font-bold uppercase focus:outline-none focus:border-[#FFDD00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-neutral-300 mb-1 font-condensed tracking-wider">
                  Desconto em Percentagem (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newDiscountPercent}
                    onChange={(e) => setNewDiscountPercent(e.target.value)}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00] pr-8"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-neutral-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-neutral-300 mb-1 font-condensed tracking-wider">
                  Limite Máximo de Utilizações (Opcional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newMaxUses}
                  onChange={(e) => setNewMaxUses(e.target.value)}
                  placeholder="Deixa vazio para utilizações ilimitadas"
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-neutral-300 mb-1 font-condensed tracking-wider">
                  Data de Expiração (Opcional)
                </label>
                <input
                  type="date"
                  value={newExpiresAt}
                  onChange={(e) => setNewExpiresAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00]"
                />
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#FFDD00] hover:bg-[#FFE838] text-black font-black uppercase text-xs rounded-xl flex items-center gap-1.5 font-condensed transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>A Gravar...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Criar Cupão</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
