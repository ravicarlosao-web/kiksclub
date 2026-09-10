import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Layers, 
  Sparkles, 
  Shirt, 
  Footprints, 
  Watch, 
  Headphones, 
  Glasses, 
  Briefcase, 
  Gem, 
  Package, 
  Tag, 
  ArrowRight,
  RefreshCw,
  FolderCheck,
  ShoppingBag
} from 'lucide-react';
import { StoreCategory, Sneaker } from '../../types';

interface CategoryManagementTabProps {
  categories: StoreCategory[];
  products: Sneaker[];
  onAddCategory: () => void;
  onEditCategory: (category: StoreCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onResetCategories: () => void;
  onFilterCategoryProducts: (categoryId: string) => void;
}

export const CategoryManagementTab: React.FC<CategoryManagementTabProps> = ({
  categories,
  products,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onResetCategories,
  onFilterCategoryProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Icon Resolver
  const renderCategoryIcon = (iconName: string, className: string = "w-5 h-5") => {
    switch (iconName?.toLowerCase()) {
      case 'footprints':
        return <Footprints className={className} />;
      case 'shirt':
        return <Shirt className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'watch':
        return <Watch className={className} />;
      case 'headphones':
        return <Headphones className={className} />;
      case 'glasses':
        return <Glasses className={className} />;
      case 'briefcase':
        return <Briefcase className={className} />;
      case 'gem':
        return <Gem className={className} />;
      default:
        return <Package className={className} />;
    }
  };

  // Calculate items count for each category
  const getProductCountForCategory = (catId: string, slug: string) => {
    return products.filter(p => {
      if (p.department) {
        return p.department.toLowerCase() === catId.toLowerCase() || p.department.toLowerCase() === slug.toLowerCase();
      }
      // If no department specified, default sneakers belong to 'tenis'
      if (catId === 'tenis' || slug === 'tenis') {
        return true;
      }
      return false;
    }).length;
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.subcategories.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Stats & Action */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 sm:p-6 backdrop-blur-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#FFDD00] font-condensed tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Arquitetura de Catálogo & Departamentos</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-condensed tracking-tight mt-1">
              Gerir Categorias da Loja
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              Configura as 5 grandes categorias do site (Ténis, Roupa, Acessórios, Relógios e Eletrónicos) e adiciona novas categorias personalizadas.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onResetCategories}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Restaurar categorias originais"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Repor Base</span>
            </button>

            <button
              onClick={onAddCategory}
              className="px-4 py-2.5 bg-[#FFDD00] hover:bg-[#FFE838] text-black font-black uppercase text-xs rounded-xl flex items-center gap-2 transition-all font-condensed shadow-md shadow-[#FFDD00]/10 hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nova Categoria</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-neutral-800/80">
          <div className="p-3 bg-black/50 border border-neutral-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block font-condensed">Total de Categorias</span>
            <span className="text-xl font-black text-white font-condensed">{categories.length} Secções</span>
          </div>
          <div className="p-3 bg-black/50 border border-neutral-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block font-condensed">Artigos no Catálogo</span>
            <span className="text-xl font-black text-[#FFDD00] font-condensed">{products.length} Produtos</span>
          </div>
          <div className="p-3 bg-black/50 border border-neutral-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block font-condensed">Subcategorias Ativas</span>
            <span className="text-xl font-black text-white font-condensed">
              {categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)} Tipos
            </span>
          </div>
          <div className="p-3 bg-black/50 border border-neutral-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block font-condensed">Navegação Loja</span>
            <span className="text-xl font-black text-green-400 font-condensed flex items-center gap-1">
              <FolderCheck className="w-4 h-4" /> 100% Sincronizada
            </span>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome ou subcategoria..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:border-[#FFDD00] focus:outline-hidden"
          />
        </div>

        <div className="text-xs text-neutral-400 font-bold uppercase self-end sm:self-center font-condensed">
          A exibir <span className="text-[#FFDD00]">{filteredCategories.length}</span> de {categories.length} categorias
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => {
          const productCount = getProductCountForCategory(category.id, category.slug);

          return (
            <div
              key={category.id}
              className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                {/* Header with Icon & Actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-black border border-neutral-800 flex items-center justify-center text-[#FFDD00] group-hover:border-[#FFDD00]/50 transition-colors shadow-inner">
                      {renderCategoryIcon(category.icon, "w-6 h-6")}
                    </div>
                    <div>
                      <h3 className="text-base font-black uppercase text-white font-condensed tracking-wide">
                        {category.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-[#FFDD00] bg-[#FFDD00]/10 px-1.5 py-0.2 rounded border border-[#FFDD00]/20">
                          slug: {category.slug}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditCategory(category)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                      title="Editar Categoria"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Tens a certeza que queres remover a categoria "${category.name}"?`)) {
                          onDeleteCategory(category.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                      title="Eliminar Categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
                  {category.description}
                </p>

                {/* Subcategories Tags */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-bold uppercase text-neutral-500 font-condensed block">
                    Subcategorias / Artigos Associados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {category.subcategories && category.subcategories.map((sub, i) => (
                      <span 
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#FFDD00]" />
                  <span><strong className="text-white font-bold">{productCount}</strong> produtos associados</span>
                </div>

                <button
                  onClick={() => onFilterCategoryProducts(category.id)}
                  className="px-2.5 py-1 text-[11px] font-black uppercase text-[#FFDD00] hover:text-white hover:bg-neutral-900 rounded-lg flex items-center gap-1 transition-colors font-condensed"
                >
                  <span>Ver Produtos</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-16 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6">
          <p className="text-neutral-400 text-sm font-bold">Nenhuma categoria encontrada com o termo "{searchTerm}".</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-3 px-4 py-2 bg-neutral-800 text-white text-xs font-bold rounded-xl hover:bg-neutral-700"
          >
            Limpar Pesquisa
          </button>
        </div>
      )}

    </div>
  );
};
