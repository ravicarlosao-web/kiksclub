import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Zap,
  Check,
  Minus,
  Plus,
  AlertCircle,
  ArrowRight,
  Star,
  Package,
  Info,
  ChevronRight,
  Share2,
  Copy,
  BadgeCheck,
  Sparkles,
} from 'lucide-react';
import { Sneaker } from '../types';
import {
  getSizeStock,
  getFirstAvailableSize,
  getTotalStock,
  isProductAvailable,
} from '../utils/stockUtils';
import { PolicyTab } from './PoliciesModal';

interface ProductDetailPageProps {
  product: Sneaker;
  allProducts: Sneaker[];
  isWishlisted: boolean;
  onToggleWishlist: (product: Sneaker) => void;
  onAddToCart: (product: Sneaker, size: number | string, quantity: number) => void;
  onDirectCheckout: (product: Sneaker, size: number | string) => void;
  onNavigateBack: () => void;
  onNavigateToProduct: (product: Sneaker) => void;
  onOpenPolicies?: (tab: PolicyTab) => void;
}

type DetailTab = 'description' | 'details' | 'sizing' | 'shipping';

const DETAIL_TABS: { key: DetailTab; label: string; icon: React.ReactNode }[] = [
  { key: 'description', label: 'Descrição', icon: <Info className="w-4 h-4" /> },
  { key: 'details', label: 'Detalhes', icon: <Package className="w-4 h-4" /> },
  { key: 'sizing', label: 'Guia de Tamanhos', icon: <BadgeCheck className="w-4 h-4" /> },
  { key: 'shipping', label: 'Envio & Trocas', icon: <Truck className="w-4 h-4" /> },
];

const SIZE_GUIDE_ROWS = [
  { eu: 38, uk: 5, us: '6', cm: '24.0' },
  { eu: 39, uk: 6, us: '6.5', cm: '24.5' },
  { eu: 40, uk: 6.5, us: '7', cm: '25.0' },
  { eu: 41, uk: 7, us: '7.5', cm: '25.5' },
  { eu: 42, uk: 8, us: '8.5', cm: '26.5' },
  { eu: 43, uk: 9, us: '9.5', cm: '27.5' },
  { eu: 44, uk: 9.5, us: '10', cm: '28.0' },
  { eu: 45, uk: 10.5, us: '11', cm: '29.0' },
  { eu: 46, uk: 11, us: '12', cm: '30.0' },
];

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onDirectCheckout,
  onNavigateBack,
  onNavigateToProduct,
  onOpenPolicies,
}) => {
  const firstAvailable = getFirstAvailableSize(product);
  const [selectedSize, setSelectedSize] = useState<number | string>(
    firstAvailable !== undefined ? firstAvailable : product.sizes[0] || 41
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<DetailTab>('description');
  const [copied, setCopied] = useState(false);
  const [zoomedIn, setZoomedIn] = useState(false);

  // Reset on product change
  useEffect(() => {
    const avail = getFirstAvailableSize(product);
    setSelectedSize(avail !== undefined ? avail : product.sizes[0] || 41);
    setActiveImage(product.image);
    setQuantity(1);
    setAddedAnimation(false);
    setActiveTab('description');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const currentSizeStock = selectedSize !== undefined ? getSizeStock(product, selectedSize) : 0;
  const isSelectedSizeAvailable = currentSizeStock > 0;
  const totalStock = getTotalStock(product);

  // Clamp quantity
  useEffect(() => {
    if (isSelectedSizeAvailable && quantity > currentSizeStock) {
      setQuantity(Math.max(1, currentSizeStock));
    }
  }, [currentSizeStock, isSelectedSizeAvailable, quantity]);

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const relatedProducts = useMemo(() => {
    return allProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.brand === product.brand ||
            p.department === product.department ||
            p.category === product.category) &&
          isProductAvailable(p)
      )
      .slice(0, 6);
  }, [allProducts, product]);

  const handleAdd = () => {
    if (!isSelectedSizeAvailable) return;
    onAddToCart(product, selectedSize, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${product.brand} ${product.name}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const savings = product.originalPrice - product.price;

  return (
    <div className="min-h-screen bg-[#F5F5F0]">

      {/* ── Sticky Breadcrumb / Back Bar ───────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onNavigateBack}
            id="product-detail-back-btn"
            className="flex items-center gap-2 text-sm font-bold text-neutral-700 hover:text-black transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar</span>
          </button>

          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <button onClick={onNavigateBack} className="hover:text-black transition-colors">Loja</button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
            <span className="text-neutral-400 capitalize">{product.department || product.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
            <span className="text-neutral-900 font-bold truncate max-w-[180px]">{product.name}</span>
          </nav>

          <div className="flex items-center gap-2">
            {/* Share */}
            <button
              onClick={handleShare}
              id="product-detail-share-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:border-black hover:text-black transition-all"
            >
              {copied ? (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Partilhar</span>
                </>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => onToggleWishlist(product)}
              id="product-detail-wishlist-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isWishlisted
                  ? 'bg-red-50 border-red-300 text-red-600'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-red-300 hover:text-red-500'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500' : ''}`} />
              <span className="hidden sm:inline">{isWishlisted ? 'Guardado' : 'Favorito'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ── Left: Gallery ─────────────────────────────────── */}
          <div className="lg:col-span-6 xl:col-span-7">

            {/* Main Image */}
            <div
              className={`relative bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm aspect-square flex items-center justify-center cursor-zoom-in transition-all ${zoomedIn ? 'cursor-zoom-out' : ''}`}
              onClick={() => setZoomedIn(!zoomedIn)}
            >
              {/* Discount badge */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <span className="bg-[#FF3333] text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-md">
                  -{product.discountPercentage}% OFF
                </span>
                {product.tag && (
                  <span className="bg-[#FFDD00] text-black text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                    {product.tag}
                  </span>
                )}
              </div>

              {/* Wishlist on image */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
                className={`absolute top-4 right-4 z-10 w-11 h-11 rounded-full shadow-md flex items-center justify-center border transition-all ${
                  isWishlisted
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'bg-white border-neutral-200 text-neutral-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
              </button>

              <img
                src={activeImage}
                alt={`${product.brand} ${product.name}`}
                className={`w-full h-full object-contain p-8 transition-transform duration-500 filter drop-shadow-2xl ${zoomedIn ? 'scale-125' : 'scale-100'}`}
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 flex-shrink-0 rounded-2xl border-2 p-1.5 bg-white overflow-hidden transition-all ${
                      activeImage === img
                        ? 'border-[#FFDD00] ring-2 ring-[#FFDD00]/40 shadow-md'
                        : 'border-neutral-200 opacity-60 hover:opacity-100 hover:border-neutral-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges (desktop only, below gallery) */}
            <div className="hidden lg:grid grid-cols-3 gap-3 mt-6">
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-neutral-200">
                <ShieldCheck className="w-6 h-6 text-[#B45309] flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-black text-neutral-900 uppercase tracking-wide">100% Autêntico</p>
                  <p className="text-[10px] text-neutral-500 leading-tight">Com caixa original</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-neutral-200">
                <Truck className="w-6 h-6 text-[#B45309] flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-black text-neutral-900 uppercase tracking-wide">Envio Seguro</p>
                  <p className="text-[10px] text-neutral-500 leading-tight">7–15 dias úteis</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-neutral-200">
                <RotateCcw className="w-6 h-6 text-[#B45309] flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-black text-neutral-900 uppercase tracking-wide">14 Dias Trocas</p>
                  <p className="text-[10px] text-neutral-500 leading-tight">Troca de tamanho</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Product Info & Purchase ─────────────────── */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-6">

            {/* Brand & Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.brandLogo && (
                  <img src={product.brandLogo} alt={product.brand} className="h-6 object-contain" />
                )}
                <span className="text-xs font-black uppercase tracking-widest text-[#B45309]">
                  {product.brand}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase text-neutral-950 font-condensed tracking-tight leading-none">
                {product.name}
              </h1>
              {product.subcategory && (
                <p className="text-sm text-neutral-500 mt-1 font-medium capitalize">{product.subcategory}</p>
              )}
            </div>

            {/* Price Block */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-4xl font-black text-black font-condensed">
                  {product.price.toFixed(2).replace('.', ',')}€
                </span>
                <span className="text-xl text-neutral-400 line-through font-medium">
                  {product.originalPrice.toFixed(2).replace('.', ',')}€
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Poupas {savings.toFixed(2).replace('.', ',')}€ ({product.discountPercentage}%)
                </span>

                {/* Rating placeholder */}
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i <= 4 ? 'fill-[#FFDD00] text-[#FFDD00]' : 'text-neutral-300'}`} />
                  ))}
                  <span className="ml-1 font-medium">(4.8)</span>
                </div>
              </div>
            </div>

            {/* Stock Indicator */}
            {isSelectedSizeAvailable ? (
              currentSizeStock <= 2 ? (
                <div className="flex items-center gap-2.5 text-sm font-bold text-amber-900 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-400 flex-shrink-0 animate-bounce" />
                  <span>
                    Stock Limitado! Restam apenas <strong>{currentSizeStock} {currentSizeStock === 1 ? 'par' : 'pares'}</strong> no tamanho {selectedSize}.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-sm font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Disponível em armazém • {currentSizeStock} unidades • Entrega em 7–15 dias úteis</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-2.5 text-sm font-bold text-red-900 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span>O tamanho {selectedSize} está esgotado. Seleciona outro tamanho.</span>
              </div>
            )}

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-black uppercase tracking-wider text-neutral-800">
                  Tamanho (EU)
                </span>
                <button
                  onClick={() => onOpenPolicies?.('sizes')}
                  className="text-xs font-bold text-[#B45309] underline underline-offset-2 hover:text-amber-700 transition-colors"
                >
                  Guia de tamanhos →
                </button>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {product.sizes.map((size) => {
                  const sizeQty = getSizeStock(product, size);
                  const isAvail = sizeQty > 0;
                  const isSel = String(selectedSize) === String(size);

                  return (
                    <button
                      key={size}
                      type="button"
                      id={`size-btn-${size}`}
                      disabled={!isAvail}
                      onClick={() => isAvail && setSelectedSize(size)}
                      title={!isAvail ? `Tamanho ${size} esgotado` : `${sizeQty} em stock`}
                      className={`relative py-3 px-1 rounded-xl text-sm font-bold transition-all border flex flex-col items-center justify-center gap-0.5 ${
                        isSel && isAvail
                          ? 'bg-black text-white border-black ring-2 ring-[#FFDD00] shadow-md'
                          : !isAvail
                          ? 'bg-neutral-100 text-neutral-400 border-neutral-200 opacity-50 cursor-not-allowed line-through'
                          : 'bg-white text-neutral-800 border-neutral-200 hover:border-black hover:shadow-sm'
                      }`}
                    >
                      <span className="leading-none text-sm">{size}</span>
                      {!isAvail ? (
                        <span className="text-[8px] font-black uppercase text-red-500 tracking-tight no-underline">
                          OUT
                        </span>
                      ) : sizeQty <= 2 ? (
                        <span className={`text-[8px] font-bold ${isSel ? 'text-[#FFDD00]' : 'text-amber-600'}`}>
                          {sizeQty} un.
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-black uppercase tracking-wider text-neutral-800">
                Quantidade:
              </span>
              <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  id="quantity-decrease-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!isSelectedSizeAvailable || quantity <= 1}
                  className="px-4 py-3 text-neutral-600 hover:text-black hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-r border-neutral-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-3 text-sm font-black text-black min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  id="quantity-increase-btn"
                  onClick={() => setQuantity(Math.min(currentSizeStock, quantity + 1))}
                  disabled={!isSelectedSizeAvailable || quantity >= currentSizeStock}
                  className="px-4 py-3 text-neutral-600 hover:text-black hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-l border-neutral-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {isSelectedSizeAvailable && (
                <span className="text-xs text-neutral-500">
                  Máx. <strong>{currentSizeStock}</strong>
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Add to Cart */}
              <button
                id="add-to-cart-btn"
                onClick={handleAdd}
                disabled={!isSelectedSizeAvailable}
                className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-200 ${
                  !isSelectedSizeAvailable
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : addedAnimation
                    ? 'bg-emerald-500 text-white scale-[1.01] shadow-lg shadow-emerald-500/30'
                    : 'bg-[#FFDD00] hover:bg-[#FFE838] text-black shadow-lg shadow-[#FFDD00]/30 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {!isSelectedSizeAvailable ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
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

              {/* Direct Checkout / MB WAY */}
              <button
                id="direct-checkout-btn"
                onClick={() => onDirectCheckout(product, selectedSize)}
                disabled={!isSelectedSizeAvailable}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all group ${
                  !isSelectedSizeAvailable
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : 'bg-black hover:bg-neutral-900 text-white shadow-lg shadow-black/20 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${!isSelectedSizeAvailable ? 'bg-neutral-400 text-neutral-200' : 'bg-red-600 text-white'}`}>
                    MB
                  </span>
                  <span className="font-black">WAY</span>
                </div>
                <span>{isSelectedSizeAvailable ? 'Comprar Imediatamente' : 'Indisponível'}</span>
                {isSelectedSizeAvailable && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                )}
              </button>
            </div>

            {/* Delivery & Return Info */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => onOpenPolicies?.('shipping')}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all text-left group"
              >
                <Truck className="w-5 h-5 text-[#B45309] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-neutral-900 uppercase tracking-wide group-hover:text-black">Envio Seguro</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">7–15 dias úteis, rastreado</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicies?.('sizes')}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all text-left group"
              >
                <RotateCcw className="w-5 h-5 text-[#B45309] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-neutral-900 uppercase tracking-wide group-hover:text-black">14 Dias Trocas</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">Troca de tamanho gratuita</p>
                </div>
              </button>
            </div>

            {/* Authenticity */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <ShieldCheck className="w-7 h-7 text-[#B45309] flex-shrink-0" />
              <div>
                <p className="text-sm font-black text-amber-900 uppercase tracking-wide">100% Garantia de Autenticidade</p>
                <p className="text-xs text-amber-700 mt-0.5">Todos os produtos incluem caixa original e são inspecionados antes do envio.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Detail Tabs ──────────────────────────────────────── */}
        <div className="mt-12 lg:mt-16">
          {/* Tab Nav */}
          <div className="flex gap-1 overflow-x-auto pb-1 border-b border-neutral-200">
            {DETAIL_TABS.map((tab) => (
              <button
                key={tab.key}
                id={`tab-${tab.key}-btn`}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-wide whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-[#FFDD00] text-black bg-[#FFDD00]/10'
                    : 'border-transparent text-neutral-500 hover:text-black hover:border-neutral-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm">
            {activeTab === 'description' && (
              <div>
                <h2 className="text-xl font-black uppercase text-neutral-950 mb-4">Sobre este Produto</h2>
                <p className="text-neutral-700 leading-relaxed text-base">{product.description}</p>
              </div>
            )}

            {activeTab === 'details' && (
              <div>
                <h2 className="text-xl font-black uppercase text-neutral-950 mb-4">Detalhes do Produto</h2>
                {product.details && product.details.length > 0 ? (
                  <ul className="space-y-2.5">
                    {product.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFDD00] mt-2 flex-shrink-0 ring-2 ring-[#FFDD00]/30" />
                        <span className="text-neutral-700 text-sm leading-relaxed">{detail}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Marca', value: product.brand },
                      { label: 'Categoria', value: product.department || product.category },
                      { label: 'Estado', value: 'Novo com caixa' },
                      { label: 'Autenticidade', value: '100% Original' },
                      { label: 'País de Envio', value: 'Portugal' },
                      { label: 'SKU', value: product.id.slice(0, 10).toUpperCase() },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                        <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">{item.label}</p>
                        <p className="text-sm font-bold text-neutral-900 mt-1 capitalize">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sizing' && (
              <div>
                <h2 className="text-xl font-black uppercase text-neutral-950 mb-2">Guia de Tamanhos</h2>
                <p className="text-sm text-neutral-500 mb-5">Tabela de conversão para calçado de adulto.</p>
                <div className="overflow-x-auto rounded-2xl border border-neutral-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-950 text-white">
                        {['EU', 'UK', 'US', 'CM'].map((h) => (
                          <th key={h} className="px-4 py-3 font-black uppercase tracking-wider text-center text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SIZE_GUIDE_ROWS.map((row, idx) => (
                        <tr
                          key={row.eu}
                          className={`text-center transition-colors ${
                            String(selectedSize) === String(row.eu)
                              ? 'bg-[#FFDD00] text-black font-black'
                              : idx % 2 === 0
                              ? 'bg-white hover:bg-neutral-50'
                              : 'bg-neutral-50 hover:bg-neutral-100'
                          }`}
                        >
                          <td className="px-4 py-2.5 font-bold">{row.eu}</td>
                          <td className="px-4 py-2.5">{row.uk}</td>
                          <td className="px-4 py-2.5">{row.us}</td>
                          <td className="px-4 py-2.5">{row.cm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-neutral-500 mt-4 leading-relaxed">
                  ℹ️ Em caso de dúvida entre dois tamanhos, recomendamos escolher o maior. Para dúvidas específicas, contacta-nos via WhatsApp.
                </p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div>
                <h2 className="text-xl font-black uppercase text-neutral-950 mb-5">Envio & Trocas</h2>
                <div className="space-y-4">
                  {[
                    {
                      icon: <Truck className="w-6 h-6 text-[#B45309]" />,
                      title: 'Taxa de Envio & Prazos',
                      desc: 'Taxa fixa de 5€ para todo o território nacional, sendo o envio expresso 100% gratuito em encomendas acima de 120€. Envio processado em 1–3 dias úteis com entrega estimada em 7–15 dias úteis com código de rastreio CTT.',
                    },
                    {
                      icon: <Package className="w-6 h-6 text-[#B45309]" />,
                      title: 'Embalagem & Rastreio',
                      desc: 'Todos os pedidos são embalados com proteção premium e enviados com código de rastreio CTT Express. Recebes notificações de estado por email.',
                    },
                    {
                      icon: <RotateCcw className="w-6 h-6 text-[#B45309]" />,
                      title: 'Política de Trocas (14 dias)',
                      desc: 'Aceitamos trocas de tamanho até 14 dias após a receção, desde que os artigos estejam em perfeito estado com caixa original. Não são aceites devoluções por preferência.',
                    },
                    {
                      icon: <ShieldCheck className="w-6 h-6 text-[#B45309]" />,
                      title: 'Autenticidade Garantida',
                      desc: 'Todos os produtos KicksClub são 100% originais, verificados e inspecionados antes do envio. Em caso de dúvida, devolvemos o valor integral.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                      <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                      <div>
                        <p className="text-sm font-black text-neutral-900 uppercase tracking-wide">{item.title}</p>
                        <p className="text-sm text-neutral-600 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ─────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#B45309]">
                  Poderás também gostar
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-neutral-950 font-condensed tracking-tight mt-1">
                  Produtos <span className="text-[#B45309]">Relacionados</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {relatedProducts.map((related) => {
                const relAvail = isProductAvailable(related);
                return (
                  <button
                    key={related.id}
                    id={`related-product-${related.id}`}
                    onClick={() => onNavigateToProduct(related)}
                    className="group bg-white rounded-2xl p-4 border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all text-left flex flex-col"
                  >
                    <div className="relative aspect-square rounded-xl bg-neutral-50 overflow-hidden mb-3">
                      <img
                        src={related.image}
                        alt={related.name}
                        className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                      />
                      {!relAvail && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <span className="text-[9px] font-black uppercase bg-neutral-900 text-red-400 px-2 py-1 rounded">ESGOTADO</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#B45309] mb-0.5">{related.brand}</p>
                      <p className="text-xs font-bold text-neutral-900 uppercase line-clamp-2 leading-snug">{related.name}</p>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2 pt-2 border-t border-neutral-100">
                      <span className="text-sm font-black text-black font-condensed">
                        {related.price.toFixed(2).replace('.', ',')}€
                      </span>
                      <span className="text-[10px] text-neutral-400 line-through">
                        {related.originalPrice.toFixed(2).replace('.', ',')}€
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Bottom CTA (mobile sticky) ───────────────────────── */}
      </div>

      {/* Mobile Sticky Add to Cart */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-4 py-3 safe-area-inset-bottom shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-500 font-medium truncate">{product.brand} · Tamanho: <strong className="text-black">{selectedSize}</strong></p>
            <p className="text-base font-black text-black">{product.price.toFixed(2).replace('.', ',')}€</p>
          </div>
          <button
            id="mobile-add-to-cart-btn"
            onClick={handleAdd}
            disabled={!isSelectedSizeAvailable}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-all ${
              !isSelectedSizeAvailable
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-500 text-white'
                : 'bg-[#FFDD00] text-black hover:bg-[#FFE838] active:scale-95'
            }`}
          >
            {addedAnimation ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
            <span>{addedAnimation ? 'Adicionado!' : 'Adicionar'}</span>
          </button>
          <button
            onClick={() => onDirectCheckout(product, selectedSize)}
            disabled={!isSelectedSizeAvailable}
            className={`px-4 py-3 rounded-xl font-black text-sm uppercase transition-all ${
              !isSelectedSizeAvailable
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-neutral-900 active:scale-95'
            }`}
          >
            MB
          </button>
        </div>
      </div>

      {/* Mobile bottom padding for sticky bar */}
      <div className="lg:hidden h-24" />
    </div>
  );
};
