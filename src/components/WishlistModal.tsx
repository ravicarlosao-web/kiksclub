import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Flame } from 'lucide-react';
import { Sneaker } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Sneaker[];
  onRemoveWishlist: (product: Sneaker) => void;
  onQuickView: (product: Sneaker) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveWishlist,
  onQuickView,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 text-black shadow-2xl border border-neutral-200 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 border border-red-200 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase font-condensed">
              Meus Favoritos ({wishlistProducts.length})
            </h3>
            <p className="text-xs text-neutral-500">
              Sneakers e peças de streetwear guardadas no teu cofre pessoal.
            </p>
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-5 animate-in fade-in duration-300">
            <div className="relative inline-block mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center text-red-400 shadow-inner">
                <Heart className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-black text-[#FFDD00] flex items-center justify-center border-2 border-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#B45309] font-condensed">
                O TEU COFRE PESSOAL
              </span>
              <h4 className="text-xl sm:text-2xl font-black uppercase font-condensed tracking-tight text-neutral-950">
                A TUA WISHLIST ESTÁ VAZIA
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Ainda não guardaste nenhum par no teu cofre. Clica no ícone de coração nos teus sneakers de eleição para os teres sempre à mão.
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                const section = document.getElementById('section-tenis') || document.getElementById('departments-nav');
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-7 py-3.5 bg-[#FFDD00] text-black font-black uppercase text-xs tracking-wider rounded-xl hover:bg-[#FFE838] transition-all font-condensed shadow-md shadow-[#FFDD00]/25 inline-flex items-center gap-2 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>Explorar Lançamentos</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlistProducts.map((product) => (
              <div 
                key={product.id}
                className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 hover:border-neutral-300 transition-colors gap-4"
              >
                <div 
                  onClick={() => {
                    onClose();
                    onQuickView(product);
                  }}
                  className="flex items-center gap-4 cursor-pointer flex-1"
                >
                  <div className="w-16 h-16 bg-white rounded-xl p-1 border border-neutral-200 flex-shrink-0 flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#B45309]">{product.brand}</span>
                    <h4 className="text-xs font-black uppercase text-neutral-900 line-clamp-1">{product.name}</h4>
                    <span className="text-sm font-black font-condensed text-black mt-1 block">
                      {product.price.toFixed(2).replace('.', ',')}€
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onQuickView(product);
                    }}
                    className="px-3.5 py-2 bg-[#FFDD00] hover:bg-[#FFE838] text-black rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 font-condensed shadow-sm"
                  >
                    <span>Ver</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onRemoveWishlist(product)}
                    className="p-2 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-100"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
