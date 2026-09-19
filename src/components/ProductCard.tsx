import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { Sneaker } from '../types';
import { isProductAvailable } from '../utils/stockUtils';

interface ProductCardProps {
  product: Sneaker;
  isWishlisted: boolean;
  onToggleWishlist: (product: Sneaker) => void;
  onQuickView: (product: Sneaker) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
}) => {
  const isAvailable = isProductAvailable(product);
  const [activeImage, setActiveImage] = React.useState<string>(product.image);
  const [activeColorName, setActiveColorName] = React.useState<string | null>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : null
  );

  React.useEffect(() => {
    setActiveImage(product.image);
    setActiveColorName(product.colors && product.colors.length > 0 ? product.colors[0].name : null);
  }, [product.image, product.id]);

  return (
    <article 
      className="group relative bg-white rounded-2xl p-3 sm:p-5 flex flex-col justify-between border border-neutral-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.09)] transition-all duration-300 select-none h-full overflow-hidden"
      itemScope 
      itemType="https://schema.org/Product"
    >
      {/* Microdados para motores de busca */}
      <meta itemProp="name" content={product.name} />
      <meta itemProp="brand" content={product.brand} />
      <meta itemProp="image" content={activeImage} />
      <meta itemProp="description" content={product.description || `${product.brand} ${product.name} - Calçado e streetwear exclusivo em Portugal.`} />

      {/* Top Badges & Actions */}
      <div className="flex items-center justify-between z-10 w-full mb-1">
        {/* Discount or Sold-out Badge */}
        {isAvailable ? (
          <span className="bg-[#FF3333] text-white text-[9px] sm:text-xs font-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-[6px] tracking-wide uppercase leading-none shadow-xs">
            -{product.discountPercentage}% OFF
          </span>
        ) : (
          <span className="bg-neutral-900 text-red-400 text-[9px] sm:text-[11px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-[6px] tracking-wider uppercase leading-none shadow-xs border border-red-500/30">
            ESGOTADO
          </span>
        )}

        {/* Wishlist Button: White circular button with black outline heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-neutral-100/90 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          aria-label={isWishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart 
            className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 transition-colors ${
              isWishlisted 
                ? 'fill-red-500 text-red-500 stroke-red-500' 
                : 'text-black stroke-[2] fill-transparent hover:text-red-500'
            }`} 
          />
        </button>
      </div>

      {/* Sneaker Image Container */}
      <div 
        onClick={() => onQuickView(product)}
        className="relative w-full h-36 sm:h-52 flex items-center justify-center cursor-pointer my-2 sm:my-3 overflow-hidden"
      >
        <img
          src={activeImage}
          alt={`${product.brand} ${product.name} - Sneakers Originais em Portugal`}
          className="w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.07)] group-hover:scale-105 transition-all duration-300 ease-out"
          loading="lazy"
        />
      </div>

      {/* Product Details */}
      <div className="pt-2 flex flex-col justify-between flex-grow">
        <div>
          {/* Brand Tag in Bold Yellow / Amber */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#B45309] block leading-tight">
              {product.brand}
            </span>
            {product.colors && product.colors.length > 1 && (
              <span className="text-[10px] font-bold text-neutral-400">
                {product.colors.length} cores
              </span>
            )}
          </div>

          {/* Distinctive Small Yellow Accent Line under Brand Name */}
          <div className="w-7 h-[2.5px] bg-[#FFDD00] mt-1 mb-2.5 rounded-full" />

          {/* Color Variants Interactive Swatches */}
          {product.colors && product.colors.length > 1 && (
            <div 
              className="flex items-center gap-1.5 mb-2 py-0.5 overflow-x-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              {product.colors.slice(0, 5).map((color, idx) => {
                const isSelected = activeColorName === color.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage(color.image);
                      setActiveColorName(color.name);
                    }}
                    onMouseEnter={() => {
                      setActiveImage(color.image);
                      setActiveColorName(color.name);
                    }}
                    title={`Cor: ${color.name}`}
                    className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer flex-shrink-0 ${
                      isSelected
                        ? 'border-black ring-2 ring-[#FFDD00] scale-110'
                        : 'border-neutral-300 hover:scale-115 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color.hex || '#000000' }}
                  />
                );
              })}
              {product.colors.length > 5 && (
                <span className="text-[10px] font-bold text-neutral-400 pl-0.5">
                  +{product.colors.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Product Title: Deep Black */}
          <h3 
            onClick={() => onQuickView(product)}
            className="text-xs sm:text-[15px] font-extrabold uppercase text-[#0B1A30] tracking-tight leading-snug line-clamp-2 min-h-[34px] sm:min-h-[44px] cursor-pointer hover:text-[#CA8A04] transition-colors mt-1"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Price & Action Area with Offer Schema */}
        <div 
          onClick={() => onQuickView(product)}
          className="flex items-center justify-between pt-3 sm:pt-4 mt-auto cursor-pointer border-t border-neutral-100 gap-2"
          itemProp="offers" 
          itemScope 
          itemType="https://schema.org/Offer"
        >
          <meta itemProp="priceCurrency" content="EUR" />
          <meta itemProp="price" content={String(product.price)} />
          <meta itemProp="availability" content={isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
          <meta itemProp="url" content={`https://kicksclub.pt/?product=${encodeURIComponent(product.id)}`} />
          <meta itemProp="priceValidUntil" content="2026-12-31" />

          {/* Price Pair */}
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-lg font-black text-[#0B1A30] tracking-tight font-condensed leading-none">
              {product.price.toFixed(2).replace('.', ',')}€
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-[#8292A2] line-through leading-none mt-1">
              {product.originalPrice.toFixed(2).replace('.', ',')}€
            </span>
          </div>

          {/* Comprar Action Button — icon only on mobile, full text on sm+ */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className={`flex-shrink-0 px-2 sm:px-3 py-1.5 font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-lg flex items-center gap-0.5 sm:gap-1 font-condensed shadow-xs group-hover:scale-105 transition-all ${
              isAvailable
                ? 'bg-[#FFDD00] hover:bg-[#FFE838] text-black'
                : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'
            }`}
          >
            <span className="hidden sm:inline">{isAvailable ? 'COMPRAR' : 'VER'}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

    </article>
  );
};

