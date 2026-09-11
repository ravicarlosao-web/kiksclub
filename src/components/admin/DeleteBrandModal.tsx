import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  ArrowRight, 
  Loader2, 
  Layers, 
  ShieldAlert 
} from 'lucide-react';
import { Brand } from '../../types';

interface DeleteBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand | null;
  allBrands: Brand[];
  onConfirmDelete: (brandId: string, options?: { reassignTo?: string; force?: boolean }) => Promise<void>;
}

export const DeleteBrandModal: React.FC<DeleteBrandModalProps> = ({
  isOpen,
  onClose,
  brand,
  allBrands,
  onConfirmDelete,
}) => {
  const [deleteMode, setDeleteMode] = useState<'reassign' | 'force'>('reassign');
  const [reassignTargetId, setReassignTargetId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !brand) return null;

  const productCount = brand.productCount ?? 0;
  const otherBrands = allBrands.filter((b) => b.id !== brand.id);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');

      if (productCount > 0) {
        if (deleteMode === 'reassign') {
          if (!reassignTargetId) {
            setError('Por favor seleciona uma marca de destino para reatribuir os produtos.');
            setIsDeleting(false);
            return;
          }
          await onConfirmDelete(brand.id, { reassignTo: reassignTargetId });
        } else {
          await onConfirmDelete(brand.id, { force: true });
        }
      } else {
        await onConfirmDelete(brand.id);
      }

      onClose();
    } catch (err: any) {
      console.error('[Delete Brand Modal Error]', err);
      setError(err.message || 'Erro ao eliminar marca.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#161616] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-800/60 flex items-center justify-center text-red-400">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-white font-condensed tracking-wider">
                Eliminar Marca
              </h3>
              <span className="text-[11px] text-neutral-400 font-mono">{brand.name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          {productCount > 0 ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#FFDD00] shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  Esta marca tem <strong className="text-white font-bold">{productCount} {productCount === 1 ? 'produto associado' : 'produtos associados'}</strong> no catálogo. 
                  Para não deixar produtos órfãos, escolhe o que fazer com eles:
                </div>
              </div>

              {/* Opções de Resolução */}
              <div className="space-y-2.5">
                <label className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                  deleteMode === 'reassign' 
                    ? 'bg-neutral-900/90 border-[#FFDD00]/50' 
                    : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                }`}>
                  <input
                    type="radio"
                    name="deleteMode"
                    value="reassign"
                    checked={deleteMode === 'reassign'}
                    onChange={() => setDeleteMode('reassign')}
                    className="mt-1 accent-[#FFDD00]"
                  />
                  <div className="flex-1 space-y-2">
                    <span className="text-xs font-bold text-white block">
                      Reatribuir produtos a outra marca
                    </span>
                    {deleteMode === 'reassign' && (
                      <select
                        value={reassignTargetId}
                        onChange={(e) => setReassignTargetId(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                      >
                        <option value="">-- Selecionar Marca de Destino --</option>
                        {otherBrands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.productCount ?? 0} produtos)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                  deleteMode === 'force' 
                    ? 'bg-neutral-900/90 border-red-500/50' 
                    : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                }`}>
                  <input
                    type="radio"
                    name="deleteMode"
                    value="force"
                    checked={deleteMode === 'force'}
                    onChange={() => setDeleteMode('force')}
                    className="mt-1 accent-red-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-red-300 block">
                      Desassociar produtos (deixar sem marca)
                    </span>
                    <span className="text-[11px] text-neutral-400 block mt-0.5">
                      Os produtos continuarão à venda na loja, mas o campo de marca ficará vazio.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-300 leading-relaxed">
              Tens a certeza que pretendes eliminar a marca <strong className="text-white font-bold">{brand.name}</strong>?
              Esta ação não pode ser anulada.
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-condensed uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md shadow-red-600/20"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>A eliminar...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirmar Eliminação</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
