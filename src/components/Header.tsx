import React, { useState } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  HelpCircle, 
  Truck, 
  Menu, 
  X, 
  Tag, 
  Sparkles,
  Home,
  Check,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { Sneaker, StoreCategory } from '../types';
import { INITIAL_CATEGORIES } from '../data/categories';
import { PolicyTab } from './PoliciesModal';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenTracking: () => void;
  onOpenHelp: () => void;
  onSearch: (term: string) => void;
  onSelectCategory: (category: string) => void;
  searchTerm: string;
  currentPage?: string;
  onOpenAdmin?: () => void;
  categories?: StoreCategory[];
  onOpenPolicies?: (tab?: PolicyTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenTracking,
  onOpenHelp,
  onSearch,
  onSelectCategory,
  searchTerm,
  currentPage = 'home',
  onOpenAdmin,
  categories = INITIAL_CATEGORIES,
  onOpenPolicies,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const copyCoupon = () => {
    navigator.clipboard.writeText('KICKS10');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0E0E0E] border-b border-[#222222]">
      {/* Top Banner */}
      <div 
        onClick={copyCoupon}
        className="bg-black text-xs font-semibold py-2 px-4 text-center cursor-pointer transition-colors hover:bg-neutral-900 border-b border-neutral-800 flex items-center justify-center gap-2 group"
      >
        <span className="text-[#FFDD00] flex items-center gap-1.5 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#FFDD00]" />
          10% OFF DISPONÍVEL • CUPÃO: <span className="underline decoration-[#FFDD00] font-bold text-white group-hover:text-[#FFDD00] transition-colors">KICKS10</span>
        </span>
        <Tag className="w-3.5 h-3.5 text-[#FFDD00]" />
        {copiedCoupon && (
          <span className="bg-[#FFDD00] text-black text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-fade-in">
            <Check className="w-3 h-3 stroke-[3]" /> Copiado!
          </span>
        )}
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo KICKS CLUB */}
          <div 
            onClick={() => {
              onSelectCategory('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex-shrink-0 cursor-pointer select-none group"
          >
            <div className="flex items-baseline">
              <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white font-condensed">
                KICKS <span className="text-white">CLUB</span>
              </span>
              <span className="text-[#FFDD00] font-black text-lg sm:text-xl ml-0.5">.PT</span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-medium -mt-1 group-hover:text-[#FFDD00] transition-colors">
              PREMIUM STREETWEAR CLUB
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Procurar sneakers, coleções..."
                className="w-full bg-[#1c1c1c] border border-neutral-700/80 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-[#FFDD00] focus:ring-1 focus:ring-[#FFDD00] transition-all"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
              {searchTerm && (
                <button 
                  onClick={() => onSearch('')}
                  className="absolute right-3 top-3 text-xs text-neutral-400 hover:text-white"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold tracking-wider uppercase text-neutral-200">
            <button
              onClick={() => {
                onSelectCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 hover:text-[#FFDD00] transition-colors py-2"
            >
              <Home className="w-4 h-4 text-neutral-400" />
              <span>INÍCIO</span>
            </button>

            <button
              onClick={onOpenHelp}
              className="flex items-center gap-1.5 hover:text-[#FFDD00] transition-colors py-2"
            >
              <HelpCircle className="w-4 h-4 text-neutral-400" />
              <span>AJUDA</span>
            </button>

            {onOpenPolicies && (
              <button
                onClick={() => onOpenPolicies('sizes')}
                className="flex items-center gap-1.5 hover:text-[#FFDD00] transition-colors py-2"
                title="Políticas de Trocas, CTT e Garantia"
              >
                <ShieldCheck className="w-4 h-4 text-neutral-400" />
                <span>POLÍTICAS</span>
              </button>
            )}

            <button
              onClick={onOpenTracking}
              className={`flex items-center gap-1.5 transition-colors py-2 ${
                currentPage === 'tracking' ? 'text-[#FFDD00]' : 'hover:text-[#FFDD00]'
              }`}
            >
              <Truck className={`w-4 h-4 ${currentPage === 'tracking' ? 'text-[#FFDD00]' : 'text-neutral-400'}`} />
              <span>RASTREIO</span>
            </button>

            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className={`flex items-center gap-1.5 transition-colors py-2 px-2.5 rounded-lg border ${
                  currentPage.startsWith('admin')
                    ? 'text-[#FFDD00] bg-neutral-900 border-[#FFDD00]/40'
                    : 'text-neutral-400 hover:text-white border-transparent hover:border-neutral-800'
                }`}
                title="Portal de Administração"
              >
                <Lock className={`w-3.5 h-3.5 ${currentPage.startsWith('admin') ? 'text-[#FFDD00]' : 'text-neutral-500'}`} />
                <span>ADMIN</span>
              </button>
            )}
          </nav>

          {/* Action Icons: Wishlist & Cart */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Favoritos"
              aria-label="Ver favoritos"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center p-2.5 sm:px-4 bg-[#202020] hover:bg-[#2c2c2c] text-white rounded-lg transition-all border border-neutral-700/80 group"
              aria-label="Abrir carrinho de compras"
            >
              <ShoppingBag className="w-5 h-5 text-[#FFDD00] group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FFDD00] text-black text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Procurar sneakers, coleções..."
              className="w-full bg-[#1c1c1c] border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-[#FFDD00]"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-400" />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#181818] border-b border-neutral-800 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <button
            onClick={() => {
              onSelectCategory('all');
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full flex items-center gap-3 py-2.5 text-sm font-bold text-white hover:text-[#FFDD00] border-b border-neutral-800"
          >
            <Home className="w-4 h-4 text-[#FFDD00]" />
            INÍCIO
          </button>

          <button
            onClick={() => {
              onOpenHelp();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 py-2.5 text-sm font-bold text-white hover:text-[#FFDD00] border-b border-neutral-800"
          >
            <HelpCircle className="w-4 h-4 text-[#FFDD00]" />
            AJUDA & SUPORTE
          </button>

          {onOpenPolicies && (
            <button
              onClick={() => {
                onOpenPolicies('sizes');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 py-2.5 text-sm font-bold text-white hover:text-[#FFDD00] border-b border-neutral-800"
            >
              <ShieldCheck className="w-4 h-4 text-[#FFDD00]" />
              POLÍTICAS & CONFIANÇA
            </button>
          )}

          <button
            onClick={() => {
              onOpenTracking();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 py-2.5 text-sm font-bold text-white hover:text-[#FFDD00] border-b border-neutral-800"
          >
            <Truck className="w-4 h-4 text-[#FFDD00]" />
            RASTREAR ENCOMENDA
          </button>

          {onOpenAdmin && (
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 py-2.5 text-sm font-bold text-[#FFDD00] hover:text-white"
            >
              <Lock className="w-4 h-4 text-[#FFDD00]" />
              PAINEL DE ADMINISTRAÇÃO
            </button>
          )}
        </div>
      )}
    </header>
  );
};
