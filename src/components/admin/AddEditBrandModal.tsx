import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  Tag, 
  Upload, 
  Loader2, 
  Image as ImageIcon,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Brand } from '../../types';

interface AddEditBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brandData: { id?: string; name: string; logoUrl?: string; description?: string }) => Promise<void>;
  brandToEdit?: Brand | null;
}

export const AddEditBrandModal: React.FC<AddEditBrandModalProps> = ({
  isOpen,
  onClose,
  onSave,
  brandToEdit,
}) => {
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (brandToEdit) {
      setName(brandToEdit.name || '');
      setLogoUrl(brandToEdit.logoUrl || '');
      setDescription(brandToEdit.description || '');
      setFormError('');
      setUploadError('');
    } else {
      setName('');
      setLogoUrl('');
      setDescription('');
      setFormError('');
      setUploadError('');
    }
  }, [brandToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica de tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('A imagem não deve ultrapassar 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');

      // Converter arquivo para base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      // Enviar para /api/upload (Cloudinary)
      const token = localStorage.getItem('kicksclub_jwt') || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ image: base64Data, folder: 'kicksclub/brands' }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao enviar o logótipo para o Cloudinary.');
      }

      const data = await res.json();
      if (data && data.url) {
        setLogoUrl(data.url);
      }
    } catch (err: any) {
      console.error('[Upload Brand Logo]', err);
      setUploadError(err.message || 'Falha no envio da imagem.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('O nome da marca é obrigatório.');
      return;
    }

    try {
      setIsSaving(true);
      setFormError('');
      await onSave({
        id: brandToEdit?.id,
        name: name.trim(),
        logoUrl: logoUrl.trim() || undefined,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      console.error('[Save Brand Error]', err);
      setFormError(err.message || 'Erro ao gravar marca.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#141414] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFDD00]/10 border border-[#FFDD00]/30 flex items-center justify-center text-[#FFDD00]">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase text-white font-condensed tracking-wider">
                {brandToEdit ? 'Editar Marca' : 'Nova Marca'}
              </h3>
              <p className="text-xs text-neutral-400">
                {brandToEdit ? `A atualizar dados da marca ${brandToEdit.name}` : 'Cadastrar uma nova marca no catálogo oficial'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {formError && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Nome da Marca */}
          <div>
            <label className="block text-xs font-black uppercase text-neutral-300 tracking-wider mb-2 font-condensed">
              Nome da Marca <span className="text-[#FFDD00]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nike, Jordan, Louis Vuitton, Trapstar..."
              className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00] transition-colors"
              required
            />
          </div>

          {/* Upload de Logótipo */}
          <div>
            <label className="block text-xs font-black uppercase text-neutral-300 tracking-wider mb-2 font-condensed">
              Logótipo da Marca (Opcional)
            </label>
            
            <div className="flex items-center gap-4">
              {/* Preview Box */}
              <div className="w-16 h-16 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-neutral-600" />
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                  id="brand-logo-file-input"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFDD00]" />
                        <span>A carregar no Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-[#FFDD00]" />
                        <span>Carregar Imagem</span>
                      </>
                    )}
                  </button>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="px-2.5 py-2 text-xs text-neutral-400 hover:text-red-400 transition-colors"
                    >
                      Remover
                    </button>
                  )}
                </div>

                {/* Input de URL alternativo */}
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Ou cola o URL da imagem (https://...)"
                  className="w-full bg-neutral-900/60 border border-neutral-800/80 rounded-lg px-3 py-1.5 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-[#FFDD00]"
                />
              </div>
            </div>

            {uploadError && (
              <p className="text-[11px] text-red-400 mt-1.5">{uploadError}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-black uppercase text-neutral-300 tracking-wider mb-2 font-condensed">
              Descrição / Bio da Marca (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Breve história, origem ou estilo da marca..."
              className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00] transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold uppercase tracking-wider hover:bg-neutral-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFDD00] text-black font-black uppercase text-xs tracking-wider hover:bg-[#FFE838] transition-all font-condensed shadow-md shadow-[#FFDD00]/20 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A Guardar...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{brandToEdit ? 'Guardar Alterações' : 'Criar Marca'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
