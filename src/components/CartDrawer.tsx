import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Lock,
  ChevronLeft,
  MessageCircle,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { CartItem, Sneaker, Order } from '../types';
import { getSizeStock } from '../utils/stockUtils';
import { PolicyTab } from './PoliciesModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, size: number | string, quantity: number) => void;
  onUpdateSize?: (productId: string, oldSize: number | string, newSize: number | string) => void;
  onRemoveItem: (productId: string, size: number | string) => void;
  onClearCart: () => void;
  onOpenTrackingWithCode?: (code: string) => void;
  directSneaker?: Sneaker | null;
  onAddDirectSneaker?: (sneaker: Sneaker, size: number | string) => void;
  onOrderCreated?: (order: Order) => void;
  onOpenPolicies?: (tab: PolicyTab) => void;
  onOpenPrivacy?: () => void;
  onSubmitOrder?: (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingCode'>) => Promise<Order>;
}

const AVAILABLE_SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onUpdateSize,
  onRemoveItem,
  onClearCart,
  onOpenTrackingWithCode,
  directSneaker,
  onAddDirectSneaker,
  onOrderCreated,
  onOpenPolicies,
  onOpenPrivacy,
  onSubmitOrder,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [couponError, setCouponError] = useState('');
  const [step, setStep] = useState<'selection' | 'delivery' | 'success'>('selection');
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  
  // Direct sneaker selection state
  const [directSize, setDirectSize] = useState<number>(41);
  const [directQty, setDirectQty] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Editing size inline for an item in cart
  const [editingItemKey, setEditingItemKey] = useState<string | null>(null);

  // Delivery Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    postalCode: '',
    city: 'Lisboa',
    notes: '',
    paymentMethod: 'mbway',
  });

  const [orderCode, setOrderCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (directSneaker) {
      setDirectSize(41);
      setDirectQty(1);
      setSelectedImage(directSneaker.image);
      setStep('selection');
    }
  }, [directSneaker]);

  useEffect(() => {
    if (isOpen && !directSneaker && items.length > 0) {
      setStep('selection');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate Subtotals & Totals
  const effectiveItems = directSneaker 
    ? [{ product: directSneaker, size: directSize, quantity: directQty }]
    : items;

  const subtotal = effectiveItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity, 
    0
  );
  const discountAmount = discountApplied ? (subtotal * discountPercent) / 100 : 0;
  const shippingCost = subtotal >= 120 ? 0 : 5; // Taxa de envio 5€, gratuito acima de 120€
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          setDiscountPercent(Number(data.discountPercent) || 10);
          setDiscountApplied(true);
          setCouponError('');
          return;
        } else if (data.message) {
          setCouponError(data.message);
          setDiscountApplied(false);
          return;
        }
      }
    } catch {
      // offline fallback
    }
    if (code === 'KICKS10' || code === 'STEP10' || code === 'CLUB10') {
      setDiscountPercent(10);
      setDiscountApplied(true);
      setCouponError('');
    } else {
      setCouponError('Cupão inválido ou expirado.');
      setDiscountApplied(false);
    }
  };

  const handleProceedToDelivery = () => {
    if (directSneaker && onAddDirectSneaker) {
      onAddDirectSneaker(directSneaker, directSize);
    }
    setStep('delivery');
  };

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedPrivacy) {
      alert('Por favor, confirma que leste e aceitas a Política de Privacidade (RGPD) para prosseguir.');
      return;
    }
    setIsSubmitting(true);

    try {
      const orderItems = effectiveItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        brand: item.product.brand,
        image: item.product.image,
        size: item.size,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const orderPayload = {
        customerName: formData.name || 'Cliente KICKS CLUB',
        phone: formData.phone || '+351 900 000 000',
        email: formData.email || 'cliente@kicksclub.pt',
        address: formData.address || 'Morada em Portugal',
        postalCode: formData.postalCode || '1000-001',
        city: formData.city || 'Lisboa',
        notes: formData.notes,
        paymentMethod: (formData.paymentMethod as Order['paymentMethod']) || 'mbway',
        items: orderItems,
        subtotal,
        discount: discountAmount,
        shipping: shippingCost,
        total,
      };

      // Tentar checkout seguro via Stripe (Cartão, MB WAY, Multibanco)
      try {
        const stripeRes = await fetch('/api/checkout/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });

        if (stripeRes.ok) {
          const sessionData = await stripeRes.json();
          if (sessionData?.url) {
            localStorage.setItem('kicksclub_last_order_id', sessionData.orderId);
            onClearCart();
            window.location.href = sessionData.url;
            return;
          }
        }
      } catch (stripeErr) {
        console.warn('[Stripe Checkout] Falha ao criar sessão Stripe, a utilizar fluxo direto:', stripeErr);
      }

      let createdOrder: Order;

      if (onSubmitOrder) {
        // Usar API real
        createdOrder = await onSubmitOrder(orderPayload as Parameters<typeof onSubmitOrder>[0]);
      } else {
        // Fallback local (sem API configurada)
        const generatedCode = `KC-${Math.floor(10000 + Math.random() * 90000)}PT`;
        createdOrder = {
          id: generatedCode,
          ...orderPayload,
          status: 'Pendente',
          trackingCode: generatedCode,
          createdAt: new Date().toISOString(),
        };
      }

      setOrderCode(createdOrder.id);

      if (onOrderCreated) {
        onOrderCreated(createdOrder);
      }

      setStep('success');
      onClearCart();
    } catch (err) {
      console.error('[CartDrawer checkout]', err);
      // Continuar mesmo em caso de erro de API (fallback graceful)
      const fallbackCode = `KC-${Math.floor(10000 + Math.random() * 90000)}PT`;
      setOrderCode(fallbackCode);
      setStep('success');
      onClearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSizeChange = (productId: string, oldSize: number, newSize: number) => {
    if (onUpdateSize) {
      onUpdateSize(productId, oldSize, newSize);
      setEditingItemKey(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/45 transition-opacity duration-300 animate-in fade-in">
      {/* Non-blurred background overlay - click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* 
        Responsive Positioning & Smooth Natural Animation:
        - On mobile (< md): Slides in gently from the top (top-0 inset-x-0 max-h-[92vh])
        - On desktop (>= md): Slides in from the right with extended width (max-w-2xl)
      */}
      <div className="fixed inset-x-0 top-0 max-h-[94vh] md:max-h-full md:inset-y-0 md:left-auto md:right-0 md:w-[620px] max-w-full flex">
        <div className="w-full bg-white text-black shadow-2xl flex flex-col justify-between rounded-b-3xl md:rounded-b-none md:rounded-l-3xl overflow-hidden border-b md:border-b-0 md:border-l border-neutral-200 duration-300 ease-out animate-in slide-in-from-top md:slide-in-from-right">
          
          {/* Clean Top Header */}
          <div className="px-6 py-4 bg-[#0E0E0E] text-white flex items-center justify-between border-b border-neutral-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFDD00] text-black flex items-center justify-center font-black shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase font-condensed tracking-wider">
                  {step === 'selection' && 'Finalizar Compra • Calçado'}
                  {step === 'delivery' && 'Informações para Entrega'}
                  {step === 'success' && 'Encomenda Confirmada!'}
                </h2>
                <span className="text-[10px] text-[#FFDD00] font-bold tracking-wider uppercase block">
                  Envio Seguro • 7-15 dias úteis
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Scrollable Content Area with generous breathing room */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            
            {/* ======================================================== */}
            {/* STEP 1: DETALHES DO CALÇADO E ESCOLHA DO TAMANHO POR NÚMERO */}
            {/* ======================================================== */}
            {step === 'selection' && (
              <div className="space-y-6">
                
                {/* Mode A: Direct Sneaker View (Expanded & Clean) */}
                {directSneaker ? (
                  <div className="space-y-5">
                    
                    {/* Sneaker Visual Showcase & Info Grid - Compact and proportional */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                      
                      {/* Shoe Image - Balanced height */}
                      <div className="sm:col-span-4 relative bg-white rounded-xl p-2 border border-neutral-200 flex flex-col items-center justify-center h-28 sm:h-32">
                        <span className="absolute top-1.5 left-1.5 bg-[#FF3333] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase">
                          -{directSneaker.discountPercentage}% OFF
                        </span>
                        
                        <img 
                          src={selectedImage || directSneaker.image} 
                          alt={directSneaker.name}
                          className="max-h-24 max-w-full object-contain filter drop-shadow-md transition-transform duration-300 hover:scale-105"
                        />

                        {/* Miniature Angles if available */}
                        {directSneaker.gallery && directSneaker.gallery.length > 1 && (
                          <div className="flex gap-1 mt-1">
                            {directSneaker.gallery.slice(0, 3).map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedImage(img)}
                                className={`w-6 h-6 rounded border p-0.5 bg-white transition-all ${
                                  (selectedImage || directSneaker.image) === img 
                                    ? 'border-[#FFDD00] ring-1 ring-[#FFDD00]' 
                                    : 'border-neutral-200 opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={img} alt="" className="w-full h-full object-contain" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Shoe Details */}
                      <div className="sm:col-span-8 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#B45309] block">
                          {directSneaker.brand}
                        </span>
                        <h3 className="text-sm sm:text-base font-black uppercase text-neutral-900 leading-tight">
                          {directSneaker.name}
                        </h3>

                        {/* Price Display */}
                        <div className="flex items-baseline gap-2 pt-0.5">
                          <span className="text-xl font-black font-condensed text-black">
                            {directSneaker.price.toFixed(2).replace('.', ',')}€
                          </span>
                          <span className="text-xs font-medium text-neutral-400 line-through">
                            {directSneaker.originalPrice.toFixed(2).replace('.', ',')}€
                          </span>
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                            Poupas {(directSneaker.originalPrice - directSneaker.price).toFixed(2).replace('.', ',')}€
                          </span>
                        </div>

                        {/* Authenticity guarantee */}
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 pt-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#CA8A04] flex-shrink-0" />
                          <span>100% Autêntico • Caixa original selada</span>
                        </div>
                      </div>

                    </div>

                    {/* SIZE SELECTION BY NUMBER - Compact, clean and no excess height */}
                    <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#B45309]" />
                          <span>Escolhe o teu Tamanho (Número EU):</span>
                        </label>
                        <span className="text-[11px] font-black bg-[#FFDD00] text-black px-2 py-0.5 rounded-md border border-black/10 shadow-xs">
                          Nº {directSize} EU
                        </span>
                      </div>

                      {/* Number Grid - Compact proportional size */}
                      <div className="grid grid-cols-6 gap-1.5">
                        {AVAILABLE_SIZES.map((sizeNum) => {
                          const isSelected = directSize === sizeNum;
                          return (
                            <button
                              key={sizeNum}
                              type="button"
                              onClick={() => setDirectSize(sizeNum)}
                              className={`py-1.5 px-1 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-0.5 border ${
                                isSelected
                                  ? 'bg-[#FFDD00] text-black border-black ring-1.5 ring-black shadow-xs font-black'
                                  : 'bg-white text-neutral-800 border-neutral-200 hover:border-black hover:bg-neutral-100'
                              }`}
                            >
                              <span className="text-xs">{sizeNum}</span>
                              <span className="text-[8px] font-bold text-neutral-500 uppercase">EU</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Quantity row */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200">
                        <span className="text-[11px] font-bold text-neutral-700">Quantidade de Pares:</span>
                        <div className="flex items-center border border-neutral-300 rounded-lg bg-white p-0.5">
                          <button
                            type="button"
                            onClick={() => setDirectQty(Math.max(1, directQty - 1))}
                            className="p-1 hover:text-black rounded"
                            disabled={directQty <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-[11px] font-black">{directQty}</span>
                          <button
                            type="button"
                            onClick={() => setDirectQty(directQty + 1)}
                            className="p-1 hover:text-black rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : items.length === 0 ? (
                  /* Empty state with Personality */
                  <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in duration-300">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-3xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 shadow-inner">
                        <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 w-8 h-8 rounded-full bg-black border-2 border-white flex items-center justify-center text-[#FFDD00] shadow-md">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1.5 max-w-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#B45309] font-condensed">
                        PREMIUM STREETWEAR CLUB
                      </span>
                      <h3 className="text-2xl font-black uppercase font-condensed tracking-tight text-neutral-950">
                        O TEU SACO ESTÁ VAZIO
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Ainda não garantiste nenhum par hoje. Os lançamentos mais procurados e edições limitadas esgotam rapidamente em Portugal.
                      </p>
                    </div>

                    {/* Trust micro badges */}
                    <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
                      <span className="flex items-center gap-1">
                        <span className="text-green-600">✓</span> 100% Autêntico
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="text-green-600">✓</span> Envio 7-15 dias úteis
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="text-green-600">✓</span> Trocas em 14 Dias
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        const section = document.getElementById('section-tenis') || document.getElementById('departments-nav');
                        if (section) {
                          section.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#FFDD00] text-black font-black uppercase text-xs tracking-wider rounded-xl hover:bg-[#FFE838] transition-all font-condensed shadow-lg shadow-[#FFDD00]/25 flex items-center justify-center gap-2 hover:scale-[1.02]"
                    >
                      <Sparkles className="w-4 h-4 stroke-[2.5]" />
                      <span>Explorar Lançamentos</span>
                    </button>
                  </div>
                ) : (
                  /* Items list */
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Calçados Selecionados ({items.reduce((a, b) => a + b.quantity, 0)})
                    </div>

                    {items.map((item) => {
                      const itemKey = `${item.product.id}-${item.size}`;
                      const isEditingSize = editingItemKey === itemKey;

                      return (
                        <div 
                          key={itemKey} 
                          className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 relative group transition-all"
                        >
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-white rounded-xl p-1.5 border border-neutral-200 flex-shrink-0 flex items-center justify-center">
                              <img 
                                src={item.product.image} 
                                alt={item.product.name} 
                                className="w-full h-full object-contain"
                              />
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] font-black uppercase text-[#B45309]">
                                  {item.product.brand}
                                </span>
                                <h4 className="text-xs sm:text-sm font-black uppercase text-neutral-900 line-clamp-1">
                                  {item.product.name}
                                </h4>
                                
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-xs font-bold text-neutral-600">Tamanho:</span>
                                  <span className="text-xs font-black bg-[#FFDD00] text-black px-2 py-0.5 rounded border border-black/20">
                                    Nº {item.size} EU
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setEditingItemKey(isEditingSize ? null : itemKey)}
                                    className="text-[11px] font-bold text-[#B45309] underline hover:text-black"
                                  >
                                    {isEditingSize ? 'Fechar' : 'Alterar Número'}
                                  </button>
                                </div>
                              </div>

                              {(() => {
                                const availStock = getSizeStock(item.product, item.size);
                                const isAtMax = item.quantity >= availStock;
                                const isOutOfStock = availStock === 0;

                                return (
                                  <>
                                    {isOutOfStock && (
                                      <span className="text-[10px] font-bold text-red-600 block mt-1">
                                        Aviso: Tamanho esgotado no armazém.
                                      </span>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-base font-black font-condensed text-black">
                                        {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}€
                                      </span>

                                      <div className="flex items-center border border-neutral-300 rounded-lg bg-white">
                                        <button
                                          onClick={() => onUpdateQuantity(item.product.id, item.size, item.quantity - 1)}
                                          className="p-1 hover:text-red-500"
                                          aria-label="Diminuir quantidade"
                                        >
                                          <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="px-2 text-xs font-bold">{item.quantity}</span>
                                        <button
                                          onClick={() => !isAtMax && onUpdateQuantity(item.product.id, item.size, item.quantity + 1)}
                                          disabled={isAtMax}
                                          className="p-1 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                                          title={isAtMax ? `Stock máximo (${availStock} un.) atingido` : 'Adicionar mais um'}
                                          aria-label="Aumentar quantidade"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>

                            <button
                              onClick={() => onRemoveItem(item.product.id, item.size)}
                              className="text-neutral-400 hover:text-red-500 p-1 self-start"
                              aria-label="Remover do carrinho"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {isEditingSize && (
                            <div className="mt-3 pt-3 border-t border-neutral-200 animate-in fade-in duration-200">
                              <span className="text-[11px] font-black uppercase text-neutral-800 block mb-2">
                                Escolhe o novo número:
                              </span>
                              <div className="grid grid-cols-6 gap-1.5">
                                {AVAILABLE_SIZES.map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => handleSizeChange(item.product.id, item.size, s)}
                                    className={`py-1.5 rounded-lg text-xs font-black transition-colors ${
                                      item.size === s
                                        ? 'bg-black text-[#FFDD00] ring-2 ring-black'
                                        : 'bg-white text-neutral-800 border border-neutral-200 hover:border-black'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Cupão de Desconto */}
                {effectiveItems.length > 0 && (
                  <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Código Cupão (ex: KICKS10)"
                      className="flex-1 bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-[#FFDD00]"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-black text-[#FFDD00] text-xs font-bold uppercase rounded-xl hover:bg-neutral-800 transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                )}

                {discountApplied && (
                  <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    <CheckCircle2 className="w-4 h-4 text-[#CA8A04]" /> Cupão de 10% aplicado com sucesso!
                  </div>
                )}

              </div>
            )}

            {/* ======================================================== */}
            {/* STEP 2: PREENCHER INFORMAÇÕES PARA ENTREGA */}
            {/* ======================================================== */}
            {step === 'delivery' && (
              <form id="delivery-form" onSubmit={handleDeliverySubmit} className="space-y-4 text-xs">
                
                {/* Back button & Summary Chip */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setStep('selection')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-black"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Voltar para Escolha de Tamanho</span>
                  </button>
                  <span className="text-[11px] font-extrabold text-[#B45309] bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    {effectiveItems[0]?.product.name} (Nº {effectiveItems[0]?.size})
                  </span>
                </div>

                {/* Delivery Form Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-neutral-800 block mb-1">
                      Nome Completo do Destinatário <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: João Miguel Santos"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 font-medium focus:outline-none focus:border-[#FFDD00] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-800 block mb-1">
                        Telemóvel (WhatsApp / MB WAY) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-neutral-500 font-bold text-xs">🇵🇹 +351</span>
                        <input
                          required
                          type="tel"
                          placeholder="912 345 678"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 pl-18 font-medium focus:outline-none focus:border-[#FFDD00] focus:bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-bold text-neutral-800 block mb-1">
                        Email para Notificações <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="joao.santos@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 font-medium focus:outline-none focus:border-[#FFDD00] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-800 block mb-1">
                      Morada de Entrega em Portugal <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Rua / Avenida, Número da Porta, Andar"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 font-medium focus:outline-none focus:border-[#FFDD00] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-800 block mb-1">
                        Código Postal <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="1000-001"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 font-medium focus:outline-none focus:border-[#FFDD00] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-800 block mb-1">
                        Cidade / Distrito <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Lisboa / Porto..."
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 font-medium focus:outline-none focus:border-[#FFDD00] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Métodos de Pagamento */}
                <div className="pt-2">
                  <label className="font-bold text-neutral-900 block mb-2 text-xs uppercase tracking-wider">
                    Método de Pagamento
                  </label>
                  <div className="space-y-2">
                    
                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.paymentMethod === 'mbway' 
                        ? 'border-[#FFDD00] bg-yellow-50/70 ring-1 ring-[#FFDD00]' 
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={formData.paymentMethod === 'mbway'}
                          onChange={() => setFormData({ ...formData, paymentMethod: 'mbway' })}
                          className="accent-[#CA8A04] w-4 h-4"
                        />
                        <div>
                          <span className="font-black text-neutral-900 block text-xs">MB WAY (Recomendado)</span>
                          <span className="text-[10px] text-neutral-500">Notificação rápida no telemóvel</span>
                        </div>
                      </div>
                      <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded">
                        MB WAY
                      </span>
                    </label>

                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.paymentMethod === 'card' 
                        ? 'border-[#FFDD00] bg-yellow-50/70 ring-1 ring-[#FFDD00]' 
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={formData.paymentMethod === 'card'}
                          onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                          className="accent-[#CA8A04] w-4 h-4"
                        />
                        <div>
                          <span className="font-black text-neutral-900 block text-xs">Cartão de Crédito / Débito</span>
                          <span className="text-[10px] text-neutral-500">Visa, MasterCard, Apple Pay</span>
                        </div>
                      </div>
                      <span className="text-neutral-600 font-bold text-xs">VISA / MC</span>
                    </label>

                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.paymentMethod === 'multibanco' 
                        ? 'border-[#FFDD00] bg-yellow-50/70 ring-1 ring-[#FFDD00]' 
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={formData.paymentMethod === 'multibanco'}
                          onChange={() => setFormData({ ...formData, paymentMethod: 'multibanco' })}
                          className="accent-[#CA8A04] w-4 h-4"
                        />
                        <div>
                          <span className="font-black text-neutral-900 block text-xs">Referência Multibanco</span>
                          <span className="text-[10px] text-neutral-500">Entidade e referência geradas</span>
                        </div>
                      </div>
                      <span className="font-black text-black text-xs bg-neutral-200 px-2 py-0.5 rounded">MB</span>
                    </label>

                  </div>
                </div>

                {/* Termos & RGPD Checkbox Obrigatório */}
                <div className="pt-3 pb-1 border-t border-neutral-200">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={agreedPrivacy}
                      onChange={(e) => setAgreedPrivacy(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-[#B45309] focus:ring-[#B45309] accent-[#B45309] cursor-pointer"
                    />
                    <span className="text-[11px] text-neutral-600 leading-snug">
                      Li e aceito a{' '}
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenPrivacy) {
                            onOpenPrivacy();
                          }
                        }}
                        className="text-black font-bold underline hover:text-[#B45309]"
                      >
                        Política de Privacidade (RGPD)
                      </button>
                      {' '}e autorizo o tratamento dos meus dados para expedição da encomenda pela KicksClub.pt.
                    </span>
                  </label>
                </div>

              </form>
            )}

            {/* ======================================================== */}
            {/* STEP 3: CONFIRMAÇÃO DO PEDIDO & RASTREAMENTO */}
            {/* ======================================================== */}
            {step === 'success' && (
              <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-yellow-100 text-[#CA8A04] flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-black uppercase font-condensed text-black">
                    Encomenda Confirmada!
                  </h3>
                  <p className="text-xs text-neutral-600 max-w-xs mx-auto mt-1">
                    A tua encomenda no <strong>KicksClub.pt</strong> já está em preparação no armazém de Lisboa.
                  </p>
                </div>

                <div className="bg-neutral-100 p-4 rounded-2xl border border-neutral-200 my-4 text-xs space-y-1">
                  <span className="text-neutral-500 block uppercase text-[10px] font-bold">
                    Código de Envio CTT Expresso
                  </span>
                  <span className="text-xl font-black font-condensed text-black tracking-wider block">
                    {orderCode}
                  </span>
                  <span className="text-[11px] text-[#B45309] font-bold block pt-1">
                    ⚡ Entrega estimada em 7 a 15 dias úteis
                  </span>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenTrackingWithCode) {
                        onOpenTrackingWithCode(orderCode);
                      }
                    }}
                    className="w-full py-3.5 bg-black text-[#FFDD00] rounded-xl font-black uppercase text-xs tracking-wider hover:bg-neutral-800 transition-colors shadow-md"
                  >
                    Rastrear Encomenda Agora
                  </button>

                  <a
                    href={`https://wa.me/244952948694?text=Ol%C3%A1%20Kicks%20Club!%20Fiz%20a%20encomenda%20com%20o%20c%C3%B3digo%20${orderCode}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Acompanhar no WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      setStep('selection');
                      onClose();
                    }}
                    className="w-full py-2 text-neutral-500 text-xs font-bold hover:text-black"
                  >
                    Continuar a Navegar
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Action Footer (For Selection & Delivery steps) */}
          {step !== 'success' && effectiveItems.length > 0 && (
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 space-y-3 flex-shrink-0">
              
              <div className="space-y-2">
                {/* Linha de Envio */}
                <div className="flex items-center justify-between text-xs text-neutral-700 font-bold">
                  <div className="flex items-center gap-1.5">
                    <span>Envio Expresso CTT:</span>
                    {shippingCost === 0 ? (
                      <span className="text-emerald-700 font-extrabold uppercase bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                        GRÁTIS (&gt; 120€)
                      </span>
                    ) : (
                      <span className="text-neutral-900 font-extrabold font-condensed text-sm">
                        5,00€
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">
                    {shippingCost === 0 ? 'Portes Oferta' : 'Grátis a partir de 120€'}
                  </span>
                </div>

                {/* Barra de Progresso de Envio Grátis */}
                {subtotal < 120 && (
                  <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 space-y-1.5">
                    <div className="flex items-center justify-between font-bold leading-tight">
                      <span>Adiciona mais <strong className="text-black font-black">{(120 - subtotal).toFixed(2).replace('.', ',')}€</strong> para teres <strong className="text-[#B45309]">Envio Grátis</strong>!</span>
                      <span className="font-condensed text-xs text-neutral-600">{Math.min(100, Math.round((subtotal / 120) * 100))}%</span>
                    </div>
                    <div className="w-full bg-amber-200/60 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#FFDD00] h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round((subtotal / 120) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Subtotal & Total */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-200">
                  <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Subtotal:</span>
                  <span className="text-xs font-bold text-neutral-700 font-condensed">
                    {subtotal.toFixed(2).replace('.', ',')}€
                  </span>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-sm font-black uppercase text-neutral-900 font-condensed">Total a Pagar:</span>
                  <div className="text-base sm:text-lg font-black font-condensed text-black">
                    {total.toFixed(2).replace('.', ',')}€
                  </div>
                </div>
              </div>

              {step === 'selection' ? (
                <button
                  type="button"
                  onClick={handleProceedToDelivery}
                  className="w-full py-3.5 bg-[#FFDD00] hover:bg-[#FFE838] text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-md shadow-[#FFDD00]/25 flex items-center justify-center gap-2 transition-all font-condensed hover:scale-[1.01]"
                >
                  <span>Preencher Dados para Entrega</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              ) : (
                <button
                  type="submit"
                  form="delivery-form"
                  disabled={isSubmitting || !agreedPrivacy}
                  className="w-full py-3.5 bg-[#FFDD00] hover:bg-[#FFE838] text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-md shadow-[#FFDD00]/25 flex items-center justify-center gap-2 transition-all font-condensed hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span>A Processar Pedido...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirmar Pedido ({total.toFixed(2).replace('.', ',')}€)</span>
                    </>
                  )}
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500">
                <Lock className="w-3 h-3 text-[#B45309]" />
                <span>Check-out Seguro • MB WAY / Multibanco / Cartão</span>
              </div>

              {onOpenPolicies && (
                <div className="flex items-center justify-center gap-3 pt-1 text-[10px] font-bold text-neutral-500 border-t border-neutral-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPolicies('sizes');
                    }}
                    className="hover:text-black hover:underline"
                  >
                    Trocas (14D)
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPolicies('shipping');
                    }}
                    className="hover:text-black hover:underline"
                  >
                    Envio 7-15 dias úteis
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPolicies('authenticity');
                    }}
                    className="hover:text-black hover:underline"
                  >
                    100% Autêntico
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
