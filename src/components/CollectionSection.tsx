import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Sneaker } from '../types';
import { ProductCard } from './ProductCard';

interface CollectionSectionProps {
  id: string;
  tag?: string;
  titlePrefix: string;
  titleHighlight: string;
  products: Sneaker[];
  wishlistIds: Set<string>;
  onToggleWishlist: (product: Sneaker) => void;
  onQuickView: (product: Sneaker) => void;
  onViewAll?: () => void;
}

export const CollectionSection: React.FC<CollectionSectionProps> = ({
  id,
  tag = 'SNEAKERS DROP',
  titlePrefix,
  titleHighlight,
  products,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onViewAll,
}) => {

  return (
    <section 
      id={`section-${id}`} 
      className="relative bg-[#FAFAFA] text-black py-10 sm:py-14 border-b border-neutral-200 overflow-hidden"
    >
      {/* Corner crosshairs decorative elements matching screenshot */}
      <div className="crosshair-corner top-3 left-3 opacity-60" />
      <div className="crosshair-corner top-3 right-3 opacity-60" />
      <div className="crosshair-corner bottom-3 left-3 opacity-60" />
      <div className="crosshair-corner bottom-3 right-3 opacity-60" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            {/* Tag in Black & Yellow Badge */}
            <span className="inline-block bg-black text-[#FFDD00] px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-1.5 shadow-xs">
              {tag}
            </span>

            {/* Main Title: Black bold condensed + Yellow accent */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tight font-condensed leading-none text-black">
              {titlePrefix} <span className="text-black underline decoration-[#FFDD00] decoration-4 underline-offset-4">{titleHighlight}</span>
            </h2>

            {/* Yellow Accent Bar below title */}
            <div className="w-10 h-1 bg-[#FFDD00] mt-2 rounded-full" />
          </div>

          {/* Controls: VER TUDO */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="px-3.5 py-1.5 bg-white border border-neutral-200 hover:bg-black hover:text-white rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ml-1 shadow-xs font-condensed"
              >
                <span>VER TUDO</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Product Cards — Grid layout em todos os tamanhos */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
        >
          {products.map((sneaker) => (
            <div 
              key={sneaker.id}
            >
              <ProductCard
                product={sneaker}
                isWishlisted={wishlistIds.has(sneaker.id)}
                onToggleWishlist={onToggleWishlist}
                onQuickView={onQuickView}
              />
            </div>
          ))}
        </div>


      </div>
    </section>
  );
};

