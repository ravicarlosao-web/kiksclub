import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Zap, 
  Check, 
  Minus, 
  Plus, 
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Sneaker } from '../types';
import { getSizeStock, isSizeInStock, getFirstAvailableSize, getTotalStock } from '../utils/stockUtils';
import { PolicyTab } from './PoliciesModal';

interface ProductDetailModalProps {
  product: Sneaker | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Sneaker, size: number | string, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Sneaker) => void;
  onDirectCheckout: (product: Sneaker, size: number | string) => void;
  onOpenPolicies?: (tab: PolicyTab) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  onDirectCheckout,
  onOpenPolicies,
}) => {
  if (!isOpen || !product) return null;

  const firstAvailable = getFirstAvailableSize(product);
  const [selectedSize, setSelectedSize] = useState<number | string>(firstAvailable !== undefined ? firstAvailable : (product.sizes[0] || 41));
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  // Update selected size when product changes
  useEffect(() => {
    if (product) {
      const avail = getFirstAvailableSize(product);
      setSelectedSize(avail !== undefined ? avail : (product.sizes[0] || 41));
      setActiveImage(product.image);
      setQuantity(1);
    }
  }, [product?.id]);

  const currentSizeStock = selectedSize !== undefined ? getSizeStock(product, selectedSize) : 0;
  const isSelectedSizeAvailable = currentSizeStock > 0;
  const totalUnits = getTotalStock(product);

  // Clamp quantity if it exceeds available stock
  useEffect(() => {
    if (isSelectedSizeAvailable && quantity > currentSizeStock) {
      setQuantity(Math.max(1, currentSizeStock));
    }
  }, [currentSizeStock, isSelectedSizeAvailable, quantity]);

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const handleAdd = () => {
    if (!isSelectedSizeAvailable) return;
    onAddToCart(product, selectedSize, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 text-black my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 flex items-center justify-center transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Visual Gallery */}
          <div className="lg:col-span-6 bg-[#F8F9FA] p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-200">
            
            {/* Top Badges */}
            <div className="flex items-center justify-between">
              <span className="bg-[#FF3333] text-white text-xs font-black px-3 py-1.5 rounded-lg">
                -{product.discountPercentage}% OFF
              </span>

              <button
                onClick={() => onToggleWishlist(product)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${
                  isWishlisted 
                    ? 'bg-red-50 text-red-500 border-red-200' 
                    : 'bg-white text-neutral-400 hover:text-red-500 border-neutral-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {/* Main Product Image */}
            <div className="my-6 aspect-square w-full flex items-center justify-center">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain filter drop-shadow-xl transition-all duration-300"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl border-2 p-1 bg-white overflow-hidden flex-shrink-0 transition-all ${
                      activeImage === img ? 'border-[#FFDD00] ring-2 ring-[#FFDD00]/50' : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Authenticity Pill */}
            <div className="mt-4 p-3 rounded-xl bg-white border border-neutral-200 flex items-center gap-3 text-xs text-neutral-700">
              <ShieldCheck className="w-5 h-5 text-[#B45309] flex-shrink-0" />
              <span>
                <strong>100% Autêntico:</strong> Caixa original com certificado e inspecionado antes do envio.
              </span>
            </div>

          </div>

          {/* Right Column: Product Info & Purchase Form */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div>
              {/* Brand */}
              <span className="text-xs font-black uppercase tracking-widest text-[#B45309]">
                {product.brand}
              </span>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-neutral-950 font-condensed tracking-tight mt-1">
                {product.name}
              </h2>

              {/* Price & Scarcity */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-3xl font-black text-black font-condensed">
                  {product.price.toFixed(2).replace('.', ',')}€
                </span>
                <span className="text-base text-neutral-400 line-through">
                  {product.originalPrice.toFixed(2).replace('.', ',')}€
                </span>
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  Poupas {(product.originalPrice - product.price).toFixed(2).replace('.', ',')}€
                </span>
              </div>

              {/* Dynamic Stock & Scarcity Notice */}
              {isSelectedSizeAvailable ? (
                currentSizeStock <= 2 ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg mt-3">
                    <Zap className="w-4 h-4 text-[#CA8A04] fill-[#FFDD00] animate-bounce" />
                    <span>
                      Stock Limitado: Restam apenas <strong>{currentSizeStock} {currentSizeStock === 1 ? 'par' : 'pares'}</strong> no tamanho {selectedSize}!
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg mt-3">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Disponível em armazém ({currentSizeStock} unidades) • Entrega em 7-15 dias úteis</span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-red-900 bg-red-50 border border-red-200 px-3 py-2 rounded-lg mt-3">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>O tamanho {selectedSize} está temporariamente esgotado. Por favor seleciona outro tamanho.</span>
                </div>
              )}
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                <span>Tamanho (EU):</span>
                <span className="text-[#B45309] underline cursor-pointer">Guia de Tamanhos</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map((size) => {
                  const sizeQty = getSizeStock(product, size);
                  const isAvailable = sizeQty > 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      className={`relative py-2.5 px-1 rounded-xl text-sm font-bold transition-all border flex flex-col items-center justify-center ${
                        isSelected && isAvailable
                          ? 'bg-black text-white border-black ring-2 ring-[#FFDD00]'
                          : !isAvailable
                          ? 'bg-neutral-100 text-neutral-400 border-neutral-200 opacity-60 cursor-not-allowed line-through'
                          : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-black'
                      }`}
                      title={!isAvailable ? `Tamanho ${size} esgotado` : `Tamanho ${size}: ${sizeQty} em stock`}
                    >
                      <span className="leading-none">{size}</span>
                      {!isAvailable ? (
                        <span className="text-[9px] font-black uppercase text-red-500 no-underline mt-0.5 tracking-tighter">
                          Esgotado
                        </span>
                      ) : sizeQty <= 2 ? (
                        <span className={`text-[9px] font-semibold mt-0.5 ${isSelected ? 'text-[#FFDD00]' : 'text-amber-600'}`}>
                          {sizeQty} un.
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase text-neutral-700">Quantidade:</span>
                <div className="flex items-center border border-neutral-300 rounded-xl bg-neutral-50">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!isSelectedSizeAvailable || quantity <= 1}
                    className="p-2 text-neutral-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-black">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(currentSizeStock, quantity + 1))}
                    disabled={!isSelectedSizeAvailable || quantity >= currentSizeStock}
                    className="p-2 text-neutral-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isSelectedSizeAvailable && (
                <span className="text-xs text-neutral-500 font-medium">
                  Máx. permitido: <strong>{currentSizeStock} pares</strong>
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleAdd}
                disabled={!isSelectedSizeAvailable}
                className={`w-full py-4 rounded-xl font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all ${
                  !isSelectedSizeAvailable
                    ? 'bg-neutral-200 text-neutral-400 border border-neutral-300 cursor-not-allowed'
                    : addedAnimation
                    ? 'bg-black text-[#FFDD00] border-2 border-[#FFDD00]'
                    : 'bg-[#FFDD00] hover:bg-[#FFE838] text-black shadow-lg shadow-[#FFDD00]/25 hover:scale-[1.01]'
                }`}
              >
                {!isSelectedSizeAvailable ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-neutral-400" />
                    <span>Tamanho Esgotado</span>
                  </>
                ) : addedAnimation ? (
                  <>
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>Adicionado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Adicionar ao Carrinho</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onDirectCheckout(product, selectedSize)}
                disabled={!isSelectedSizeAvailable}
                className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all group ${
                  !isSelectedSizeAvailable
                    ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                    : 'bg-black hover:bg-neutral-900 text-white'
                }`}
              >
                <div className="flex items-center gap-1 font-black text-white">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${!isSelectedSizeAvailable ? 'bg-neutral-400 text-neutral-200' : 'bg-red-600 text-white'}`}>MB</span>
                  <span>WAY</span>
                </div>
                <span>{isSelectedSizeAvailable ? 'Comprar Imediatamente' : 'Indisponível neste tamanho'}</span>
                {isSelectedSizeAvailable && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>

            {/* Shipping & Return guarantees with Interactive Policy links */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-200 text-xs">
              <button
                type="button"
                onClick={() => onOpenPolicies?.('shipping')}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-black transition-colors text-left"
              >
                <Truck className="w-4 h-4 text-[#B45309] flex-shrink-0" />
                <span className="text-[11px] font-medium leading-tight">Envio Seguro 7-15 dias úteis</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicies?.('sizes')}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-black transition-colors text-left"
              >
                <RotateCcw className="w-4 h-4 text-[#B45309] flex-shrink-0" />
                <span className="text-[11px] font-medium leading-tight">14 Dias para Trocas de Tamanho</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
