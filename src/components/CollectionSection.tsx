import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

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

          {/* Controls: Navigation Arrows + VER TUDO */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Arrows hidden on mobile (grid layout), visible on sm+ (scroll layout) */}
            <button
              onClick={() => scroll('left')}
              className="hidden sm:flex w-9 h-9 rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 hover:border-black items-center justify-center text-neutral-800 transition-colors shadow-xs"
              aria-label="Sneakers anteriores"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => scroll('right')}
              className="hidden sm:flex w-9 h-9 rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 hover:border-black items-center justify-center text-neutral-800 transition-colors shadow-xs"
              aria-label="Próximos sneakers"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

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

        {/* Product Cards — Grid on mobile, horizontal scroll on sm+ */}
        <div
          ref={scrollContainerRef}
          className="
            grid grid-cols-2 gap-3
            sm:flex sm:gap-4 sm:overflow-x-auto sm:pb-4 sm:pt-1 sm:no-scrollbar sm:snap-x sm:snap-mandatory sm:scroll-smooth
          "
        >
          {products.map((sneaker) => (
            <div 
              key={sneaker.id}
              className="sm:w-[255px] md:w-[260px] lg:w-[calc(20%-13px)] sm:flex-shrink-0 sm:snap-start"
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

