import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  FolderPlus, 
  Tag, 
  Shirt, 
  Footprints, 
  Sparkles, 
  Watch, 
  Headphones, 
  Glasses, 
  Briefcase, 
  Gem, 
  ShieldCheck,
  Package,
  Layers
} from 'lucide-react';
import { StoreCategory } from '../../types';

interface AddEditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: StoreCategory) => void;
  categoryToEdit?: StoreCategory | null;
}

const AVAILABLE_ICONS = [
  { name: 'Footprints', label: 'Ténis / Calçado', icon: Footprints },
  { name: 'Shirt', label: 'Roupa / Vestuário', icon: Shirt },
  { name: 'Sparkles', label: 'Acessórios / Jóias', icon: Sparkles },
  { name: 'Watch', label: 'Relógios / Tempo', icon: Watch },
  { name: 'Headphones', label: 'Eletrónicos / Som', icon: Headphones },
  { name: 'Glasses', label: 'Óculos', icon: Glasses },
  { name: 'Briefcase', label: 'Malas & Pastas', icon: Briefcase },
  { name: 'Gem', label: 'Alta Joalharia', icon: Gem },
  { name: 'Tag', label: 'Geral / Outros', icon: Tag },
  { name: 'Package', label: 'Colecionáveis', icon: Package },
];

export const AddEditCategoryModal: React.FC<AddEditCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryToEdit
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Shirt');
  const [subcategoriesInput, setSubcategoriesInput] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSlug(categoryToEdit.slug || categoryToEdit.id);
      setDescription(categoryToEdit.description || '');
      setIcon(categoryToEdit.icon || 'Shirt');
      setSubcategoriesInput(categoryToEdit.subcategories ? categoryToEdit.subcategories.join(', ') : '');
      setBannerImage(categoryToEdit.bannerImage || '');
      setError('');
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setIcon('Shirt');
      setSubcategoriesInput('');
      setBannerImage('');
      setError('');
    }
  }, [categoryToEdit, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!categoryToEdit) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor indica o nome da categoria.');
      return;
    }

    const finalSlug = (slug.trim() || name.trim())
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const subcats = subcategoriesInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newCategory: StoreCategory = {
      id: categoryToEdit ? categoryToEdit.id : finalSlug,
      name: name.trim(),
      slug: finalSlug,
      description: description.trim() || `Coleção exclusiva de ${name.trim()} da StepZone.pt / Kicks Club.`,
      icon,
      subcategories: subcats.length > 0 ? subcats : [name.trim()],
      bannerImage: bannerImage.trim() || undefined,
      featured: true
    };

    onSave(newCategory);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#141414] border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFDD00]/15 border border-[#FFDD00]/30 flex items-center justify-center text-[#FFDD00]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white font-condensed tracking-wide">
                {categoryToEdit ? 'Editar Categoria' : 'Nova Categoria da Loja'}
              </h2>
              <p className="text-xs text-neutral-400">
                Estrutura as secções do site e navegação dos clientes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Nome da Categoria */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-300 mb-1 font-condensed">
              Nome da Categoria *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Roupa & Streetwear, Acessórios, Relógios..."
              className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-sm focus:border-[#FFDD00] focus:outline-hidden transition-colors"
              required
            />
          </div>

          {/* Slug Identificador */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-300 mb-1 font-condensed">
              Slug / Identificador (URL & Sistema)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ex: roupa, relogios, acessorios"
              className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-neutral-300 text-sm focus:border-[#FFDD00] focus:outline-hidden font-mono"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">
              Usado para associar produtos e filtros no site (sem espaços nem acentos).
            </span>
          </div>

          {/* Seleção do Ícone Visual */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-300 mb-2 font-condensed">
              Ícone Representativo
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all ${
                      isSelected 
                        ? 'bg-[#FFDD00] text-black border-[#FFDD00] font-bold shadow-md shadow-[#FFDD00]/20 scale-105' 
                        : 'bg-black/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                    title={item.label}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-[9px] truncate max-w-full block font-condensed uppercase">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-300 mb-1 font-condensed">
              Descrição Curta
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve apresentação da coleção para os utilizadores na loja..."
              className="w-full px-3.5 py-2 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:border-[#FFDD00] focus:outline-hidden resize-none"
            />
          </div>

          {/* Subcategorias */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-300 mb-1 font-condensed">
              Subcategorias / Tipos de Artigo (Separados por vírgula)
            </label>
            <input
              type="text"
              value={subcategoriesInput}
              onChange={(e) => setSubcategoriesInput(e.target.value)}
              placeholder="Ex: Casacos, Calções, Hoodies, T-Shirts"
              className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-sm focus:border-[#FFDD00] focus:outline-hidden"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">
              Exemplo para Ténis: "Sneakers, Loafers, Slides". Para Acessórios: "Colares, Bonés, Malas".
            </span>
          </div>

          {/* Imagem de Banner / Fundo */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-300 mb-1 font-condensed">
              URL da Imagem de Banner (Opcional)
            </label>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:border-[#FFDD00] focus:outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#FFDD00] hover:bg-[#FFE838] text-black font-black uppercase text-xs rounded-xl flex items-center gap-1.5 transition-all font-condensed shadow-md"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{categoryToEdit ? 'Guardar Alterações' : 'Criar Categoria'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
