import React from 'react';
import { 
  Footprints, 
  Shirt, 
  Sparkles, 
  Watch, 
  Headphones, 
  Glasses, 
  Briefcase, 
  Gem, 
  Package, 
  ChevronRight,
  Layers
} from 'lucide-react';
import { StoreCategory, Sneaker } from '../types';

interface DepartmentCategoryNavProps {
  categories: StoreCategory[];
  products: Sneaker[];
  activeCategory?: string;
  onSelectCategory: (categoryId: string) => void;
}

export const DepartmentCategoryNav: React.FC<DepartmentCategoryNavProps> = ({
  categories,
  products,
  activeCategory,
  onSelectCategory,
}) => {
  const renderIcon = (iconName: string, className: string = "w-5 h-5") => {
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

  const getProductCount = (catId: string, slug: string) => {
    return products.filter(p => {
      if (p.department) {
        return p.department.toLowerCase() === catId.toLowerCase() || p.department.toLowerCase() === slug.toLowerCase();
      }
      if (catId === 'tenis' || slug === 'tenis') {
        return true;
      }
      return false;
    }).length;
  };

  const handleCategoryClick = (catId: string) => {
    onSelectCategory(catId);
    const targetElement = document.getElementById(`section-${catId}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative z-10 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFDD00]/10 border border-[#FFDD00]/30 flex items-center justify-center text-[#FFDD00]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white font-condensed tracking-wide">
                DEPARTAMENTOS & CATEGORIAS
              </h2>
              <p className="text-[11px] text-neutral-400">
                Navega pelos 5 grandes departamentos oficiais da Kicks Club
              </p>
            </div>
          </div>

          <div className="text-[11px] font-bold uppercase text-neutral-400 font-condensed">
            <span className="text-[#FFDD00] font-black">{categories.length}</span> Secções Disponíveis
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const count = getProductCount(cat.id, cat.slug);
            const isActive = activeCategory === cat.id || activeCategory === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between group relative overflow-hidden ${
                  isActive
                    ? 'bg-[#FFDD00] border-[#FFDD00] text-black shadow-lg shadow-[#FFDD00]/20 scale-[1.02]'
                    : 'bg-black/60 border-neutral-800 hover:border-neutral-700 text-white hover:bg-neutral-900/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isActive 
                        ? 'bg-black text-[#FFDD00]' 
                        : 'bg-neutral-900 border border-neutral-800 text-[#FFDD00] group-hover:border-[#FFDD00]/40'
                    }`}>
                      {renderIcon(cat.icon, "w-5 h-5")}
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-black/15 text-black' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {count} {count === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  <h3 className={`text-sm font-black uppercase font-condensed tracking-tight leading-snug ${
                    isActive ? 'text-black' : 'text-white'
                  }`}>
                    {cat.name}
                  </h3>

                  <p className={`text-[11px] line-clamp-1 mt-1 font-medium ${
                    isActive ? 'text-neutral-800' : 'text-neutral-400'
                  }`}>
                    {cat.subcategories && cat.subcategories.slice(0, 2).join(', ')}
                    {cat.subcategories && cat.subcategories.length > 2 ? '...' : ''}
                  </p>
                </div>

                <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] font-black uppercase tracking-wider font-condensed ${
                  isActive ? 'border-black/20 text-black' : 'border-neutral-800/80 text-[#FFDD00]'
                }`}>
                  <span>Explorar</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
