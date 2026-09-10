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

  return (
    <div 
      className="group relative bg-white rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between border border-neutral-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.09)] transition-all duration-300 select-none h-full"
    >
      {/* Top Badges & Actions */}
      <div className="flex items-center justify-between z-10 w-full mb-1">
        {/* Discount or Sold-out Badge */}
        {isAvailable ? (
          <span className="bg-[#FF3333] text-white text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-[6px] tracking-wide uppercase leading-none shadow-xs">
            -{product.discountPercentage}% OFF
          </span>
        ) : (
          <span className="bg-neutral-900 text-red-400 text-[10px] sm:text-[11px] font-black px-2 py-1 rounded-[6px] tracking-wider uppercase leading-none shadow-xs border border-red-500/30">
            ESGOTADO
          </span>
        )}

        {/* Wishlist Button: White circular button with black outline heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="w-9 h-9 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-neutral-100/90 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          aria-label={isWishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart 
            className={`w-4.5 h-4.5 transition-colors ${
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
        className="relative w-full h-36 sm:h-44 flex items-center justify-center cursor-pointer my-2 overflow-hidden"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.07)] group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />
      </div>

      {/* Product Details */}
      <div className="pt-2 flex flex-col justify-between flex-grow">
        <div>
          {/* Brand Tag in Bold Yellow / Amber */}
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#B45309] block leading-tight">
            {product.brand}
          </span>

          {/* Distinctive Small Yellow Accent Line under Brand Name */}
          <div className="w-7 h-[2.5px] bg-[#FFDD00] mt-1 mb-2.5 rounded-full" />

          {/* Product Title: Deep Black */}
          <h3 
            onClick={() => onQuickView(product)}
            className="text-[13px] sm:text-[14px] font-extrabold uppercase text-[#0B1A30] tracking-tight leading-snug line-clamp-2 min-h-[38px] cursor-pointer hover:text-[#CA8A04] transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Price & Action Area */}
        <div 
          onClick={() => onQuickView(product)}
          className="flex items-center justify-between pt-3 mt-auto cursor-pointer border-t border-neutral-100"
        >
          {/* Price Pair */}
          <div className="flex items-baseline">
            <span className="text-base sm:text-[17px] font-black text-[#0B1A30] tracking-tight font-condensed">
              {product.price.toFixed(2).replace('.', ',')}€
            </span>
            <span className="text-xs sm:text-[13px] font-medium text-[#8292A2] line-through ml-2">
              {product.originalPrice.toFixed(2).replace('.', ',')}€
            </span>
          </div>

          {/* Comprar Action Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className={`px-3 py-1.5 font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-1 font-condensed shadow-xs group-hover:scale-105 transition-all ${
              isAvailable
                ? 'bg-[#FFDD00] hover:bg-[#FFE838] text-black'
                : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'
            }`}
          >
            <span>{isAvailable ? 'COMPRAR' : 'VER TAMANHOS'}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

    </div>
  );
};

