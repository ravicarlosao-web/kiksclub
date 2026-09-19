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
  /** Maximo de produtos visiveis na homepage. Default: 8 */
  maxVisible?: number;
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
  maxVisible = 8,
}) => {
  const visibleProducts = products.slice(0, maxVisible);
  const hasMore = products.length > maxVisible;

  return (
    <section
      id={`section-${id}`}
      className="relative bg-[#FAFAFA] text-black py-10 sm:py-14 border-b border-neutral-200 overflow-hidden"
    >
      <div className="crosshair-corner top-3 left-3 opacity-60" />
      <div className="crosshair-corner top-3 right-3 opacity-60" />
      <div className="crosshair-corner bottom-3 left-3 opacity-60" />
      <div className="crosshair-corner bottom-3 right-3 opacity-60" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <span className="inline-block bg-black text-[#FFDD00] px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-1.5 shadow-xs">
              {tag}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tight font-condensed leading-none text-black">
              {titlePrefix} <span className="text-black underline decoration-[#FFDD00] decoration-4 underline-offset-4">{titleHighlight}</span>
            </h2>
            <div className="w-10 h-1 bg-[#FFDD00] mt-2 rounded-full" />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {products.length > 0 && (
              <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-full">
                {products.length} {products.length === 1 ? 'produto' : 'produtos'}
              </span>
            )}
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="px-3.5 py-1.5 bg-white border border-neutral-200 hover:bg-black hover:text-white rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all shadow-xs font-condensed"
              >
                <span>VER TUDO</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Product Grid — limited to maxVisible */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {visibleProducts.map((sneaker) => (
            <div key={sneaker.id}>
              <ProductCard
                product={sneaker}
                isWishlisted={wishlistIds.has(sneaker.id)}
                onToggleWishlist={onToggleWishlist}
                onQuickView={onQuickView}
              />
            </div>
          ))}
        </div>

        {/* "Ver mais" CTA quando ha mais produtos alem do limite */}
        {hasMore && onViewAll && (
          <div className="mt-8 flex flex-col items-center gap-2">
            <button
              onClick={onViewAll}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-black hover:bg-neutral-900 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all font-condensed shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>VER TODOS OS {products.length} PRODUTOS</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
            <span className="text-[11px] text-neutral-400 font-medium">
              A mostrar {visibleProducts.length} de {products.length}
            </span>
          </div>
        )}

      </div>
    </section>
  );
};
