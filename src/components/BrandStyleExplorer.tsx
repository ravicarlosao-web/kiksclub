import React, { useState } from 'react';
import { ArrowRight, Layers, Tag, Sparkles } from 'lucide-react';
import { BRAND_FILTERS, CATEGORY_EXPLORER_CARDS } from '../data/sneakers';
import { BrandFilter } from '../types';

interface BrandStyleExplorerProps {
  onSelectBrand: (brandKey: string) => void;
  activeBrand: string;
  onSelectCategory?: (categoryKey: string) => void;
  activeCategory?: string;
}

export const BrandStyleExplorer: React.FC<BrandStyleExplorerProps> = ({
  onSelectBrand,
  activeBrand,
  onSelectCategory,
  activeCategory,
}) => {
  const [viewMode, setViewMode] = useState<'categories' | 'brands'>('categories');

  const handleCategoryClick = (categoryKey: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryKey);
    }
    if (categoryKey === 'ALL') {
      onSelectBrand('ALL');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const targetSection = document.getElementById(`section-${categoryKey}`);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative bg-white text-black py-16 border-b border-neutral-200 overflow-hidden">
      
      {/* Corner crosshairs decorative elements */}
      <div className="crosshair-corner top-4 left-4" />
      <div className="crosshair-corner top-4 right-4" />
      <div className="crosshair-corner bottom-4 left-4" />
      <div className="crosshair-corner bottom-4 right-4" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-block mb-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#B45309]">
                FILTRO PREMIUM
              </span>
              <div className="h-1 w-8 bg-[#FFDD00] mt-0.5 rounded-full"></div>
            </div>

            <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tight leading-none font-condensed text-black">
              EXPLORA POR ESTILO & CATEGORIA
            </h2>

            <p className="text-neutral-600 text-sm sm:text-base mt-2 font-normal max-w-2xl">
              Navega pelas categorias oficiais e marcas mais conceituadas da{' '}
              <strong className="text-black font-bold">cultura streetwear, calçado, acessórios e luxo</strong> internacional.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1 bg-neutral-100 border border-neutral-300/80 rounded-2xl shadow-xs self-start md:self-auto">
            <button
              onClick={() => setViewMode('categories')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all font-condensed ${
                viewMode === 'categories'
                  ? 'bg-black text-[#FFDD00] shadow-sm'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Por Categoria</span>
            </button>

            <button
              onClick={() => setViewMode('brands')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all font-condensed ${
                viewMode === 'brands'
                  ? 'bg-black text-[#FFDD00] shadow-sm'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Por Marcas</span>
            </button>
          </div>
        </div>

        {/* View Mode 1: CATEGORIES (Default) */}
        {viewMode === 'categories' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {CATEGORY_EXPLORER_CARDS.map((cat, index: number) => {
              const isCatalogBox = cat.isCatalogBox;
              const isSelected = activeCategory === cat.categoryKey;

              return (
                <div
                  key={index}
                  onClick={() => handleCategoryClick(cat.categoryKey)}
                  className={`group relative rounded-2xl p-4 flex flex-col justify-between h-56 sm:h-64 cursor-pointer transition-all duration-300 overflow-hidden border ${
                    isCatalogBox
                      ? 'bg-[#141414] text-white border-neutral-800 hover:border-[#FFDD00]'
                      : isSelected
                      ? 'bg-neutral-100 border-[#FFDD00] ring-2 ring-[#FFDD00]/70 shadow-md'
                      : 'bg-[#F7F7F8] hover:bg-[#EFEFEF] border-neutral-200/80 hover:border-neutral-400 hover:shadow-md'
                  } hover:-translate-y-1`}
                >
                  {/* Category Header */}
                  <div className="z-10">
                    <div className={`text-xs font-black uppercase tracking-wider line-clamp-1 font-condensed ${
                      isCatalogBox ? 'text-white' : 'text-neutral-900'
                    }`}>
                      {cat.name}
                    </div>
                    <div className={`text-[10px] uppercase tracking-widest font-semibold mt-0.5 ${
                      isCatalogBox ? 'text-neutral-400' : 'text-neutral-500'
                    }`}>
                      {cat.subtitle}
                    </div>
                  </div>

                  {/* Category Image poking from bottom */}
                  <div className="absolute -bottom-3 -right-3 w-32 sm:w-36 h-32 sm:h-36 flex items-end justify-end pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-xl filter drop-shadow-md opacity-95 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                  </div>

                  {/* Bottom CTA / Dot indicator */}
                  <div className="z-10 mt-auto flex items-center justify-between">
                    {isCatalogBox ? (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#FFDD00]">
                        <span>VER TUDO</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-neutral-300 group-hover:bg-[#FFDD00] transition-colors" />
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* View Mode 2: BRANDS */
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {BRAND_FILTERS.map((brand: BrandFilter, index: number) => {
              const isCatalogBox = brand.brandKey === 'ALL';
              const isSelected = activeBrand === brand.brandKey;

              return (
                <div
                  key={index}
                  onClick={() => onSelectBrand(brand.brandKey)}
                  className={`group relative rounded-2xl p-4 flex flex-col justify-between h-56 sm:h-64 cursor-pointer transition-all duration-300 overflow-hidden border ${
                    isCatalogBox
                      ? 'bg-[#141414] text-white border-neutral-800 hover:border-[#FFDD00]'
                      : isSelected
                      ? 'bg-neutral-100 border-[#FFDD00] ring-2 ring-[#FFDD00]/70 shadow-md'
                      : 'bg-[#F7F7F8] hover:bg-[#EFEFEF] border-neutral-200/80 hover:border-neutral-400 hover:shadow-md'
                  } hover:-translate-y-1`}
                >
                  {/* Brand Header */}
                  <div className="z-10">
                    <div className={`text-xs font-black uppercase tracking-wider line-clamp-1 ${
                      isCatalogBox ? 'text-white' : 'text-neutral-900'
                    }`}>
                      {brand.name}
                    </div>
                    <div className={`text-[10px] uppercase tracking-widest font-semibold mt-0.5 ${
                      isCatalogBox ? 'text-neutral-400' : 'text-neutral-500'
                    }`}>
                      {brand.subtitle}
                    </div>
                  </div>

                  {/* Brand Image poking from bottom */}
                  <div className="absolute -bottom-4 -right-4 w-32 sm:w-36 h-32 sm:h-36 flex items-end justify-end pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="w-full h-full object-contain filter drop-shadow-md"
                      loading="lazy"
                    />
                  </div>

                  {/* Bottom CTA / Dot indicator */}
                  <div className="z-10 mt-auto flex items-center justify-between">
                    {isCatalogBox ? (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#FFDD00]">
                        <span>VER TUDO</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-neutral-300 group-hover:bg-[#FFDD00] transition-colors" />
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
