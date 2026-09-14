import React, { useState, useEffect } from 'react';
import { X, Package, Truck, CheckCircle2, Clock, AlertTriangle, MessageCircle, MapPin, Phone, Mail, User, CreditCard, Hash, Calendar, Trash2, Save, Send, ShieldCheck } from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateTrackingCode: (orderId: string, trackingCode: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onAnonymizeCustomer?: (orderId: string) => void;
}

const STATUS_OPTIONS: { label: string; value: OrderStatus; color: string }[] = [
  { label: 'Pendente', value: 'Pendente', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { label: 'Pago', value: 'Pago', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { label: 'Em Processamento', value: 'Em Processamento', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { label: 'Enviado CTT', value: 'Enviado CTT', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { label: 'Em Trânsito', value: 'Em Trânsito', color: 'bg-yellow-500/20 text-[#FFDD00] border-yellow-500/40' },
  { label: 'Entregue', value: 'Entregue', color: 'bg-green-500/20 text-green-300 border-green-500/40' },
  { label: 'Concluído', value: 'Concluído', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  { label: 'Cancelado', value: 'Cancelado', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
];

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  onUpdateTrackingCode,
  onDeleteOrder,
  onAnonymizeCustomer,
}) => {
  if (!isOpen || !order) return null;

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [trackingCodeInput, setTrackingCodeInput] = useState(order.trackingCode || order.id);
  const [isSavedTracking, setIsSavedTracking] = useState(false);

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
      setTrackingCodeInput(order.trackingCode || order.id);
    }
  }, [order?.id, order?.status, order?.trackingCode]);

  const handleStatusChange = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    onUpdateStatus(order.id, newStatus);
  };

  const handleSaveTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCodeInput.trim()) {
      onUpdateTrackingCode(order.id, trackingCodeInput.trim().toUpperCase());
      setIsSavedTracking(true);
      setTimeout(() => setIsSavedTracking(false), 2000);
    }
  };

  // Build clean WhatsApp message to customer
  const cleanPhone = order.phone.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('351') ? cleanPhone : `351${cleanPhone}`;
  const whatsappMessage = encodeURIComponent(
    `Olá ${order.customerName}! Aqui é da equipa KICKS CLUB (kicksclub.pt) a respeito da sua encomenda ${order.id}. O estado atual é: ${currentStatus}. Código de rastreio CTT: ${trackingCodeInput}. Estamos à sua inteira disposição!`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-[#141414] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-8 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-neutral-800 text-[#FFDD00] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black uppercase text-white tracking-tight font-condensed">
                  PEDIDO {order.id}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                  STATUS_OPTIONS.find((s) => s.value === currentStatus)?.color || 'bg-neutral-800 text-white'
                }`}>
                  {currentStatus}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Registado a {new Date(order.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Status & CTT Code Control Bar */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">
                  ATUALIZAR ESTADO DA ENCOMENDA
                </span>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleStatusChange(opt.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        currentStatus === opt.value
                          ? `${opt.color} ring-2 ring-[#FFDD00]/20 font-black scale-105`
                          : 'bg-black/50 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tracking Code Editor */}
            <form onSubmit={handleSaveTracking} className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                  Código de Rastreio CTT Expresso
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={trackingCodeInput}
                    onChange={(e) => setTrackingCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ex: KC-98421PT"
                    className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white font-mono uppercase focus:outline-none focus:border-[#FFDD00]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto mt-auto px-5 py-2 bg-neutral-800 hover:bg-[#FFDD00] hover:text-black text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                {isSavedTracking ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <span>Guardado!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Atualizar Código</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Customer Contact */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <User className="w-4 h-4 text-[#FFDD00]" />
                <span>Dados do Cliente</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Nome Completo</span>
                  <span className="font-bold text-white">{order.customerName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Telemóvel</span>
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      {order.phone}
                    </span>
                  </div>

                  {/* Direct WhatsApp button */}
                  <a
                    href={`https://wa.me/${internationalPhone}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">E-mail</span>
                  <span className="text-neutral-300 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-neutral-400" />
                    {order.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FFDD00]" />
                <span>Morada de Envio</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Morada & Número</span>
                  <span className="font-bold text-white">{order.address}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Código Postal</span>
                    <span className="text-neutral-300 font-mono">{order.postalCode}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Cidade</span>
                    <span className="text-neutral-300 font-bold">{order.city}</span>
                  </div>
                </div>

                {order.notes && (
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Notas de Entrega</span>
                    <span className="text-amber-200/90 italic text-[11px]">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Ordered Products Table */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#FFDD00]" />
              <span>Itens da Encomenda ({order.items.length})</span>
            </h4>

            <div className="space-y-2.5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 bg-black/40 border border-neutral-800/80 rounded-xl">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-black uppercase text-[#FFDD00] block tracking-wider">
                      {item.brand}
                    </span>
                    <h5 className="text-xs font-bold text-white truncate">
                      {item.name}
                    </h5>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-0.5">
                      {item.color && <span>Cor: <strong className="text-[#FFDD00]">{item.color}</strong></span>}
                      <span>Tamanho EU: <strong className="text-white">{item.size}</strong></span>
                      <span>Qtd: <strong className="text-white">{item.quantity}</strong></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-white block">
                      {(item.price * item.quantity).toFixed(2)}€
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {item.price.toFixed(2)}€ / cada
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="pt-3 border-t border-neutral-800 text-xs space-y-1.5">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span>{order.subtotal.toFixed(2)}€</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Desconto de Cupão</span>
                  <span>-{order.discount.toFixed(2)}€</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>Envio Seguro (7-15 dias úteis)</span>
                <span className="text-green-400 font-bold">GRÁTIS</span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-neutral-800">
                <span>Total Pago</span>
                <span className="text-[#FFDD00] text-base">{order.total.toFixed(2)}€</span>
              </div>
              <div className="text-[11px] text-neutral-500 pt-1 flex items-center justify-between">
                <span>Método de Pagamento:</span>
                <span className="uppercase font-bold text-neutral-300">
                  {order.paymentMethod === 'mbway' ? 'MB WAY Portugal' : order.paymentMethod === 'card' ? 'Cartão de Crédito' : 'Referência Multibanco'}
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone: Delete / Anonymize Order */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Tem a certeza que deseja remover o pedido ${order.id}?`)) {
                    onDeleteOrder(order.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover Pedido</span>
              </button>

              {onAnonymizeCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Tem a certeza que deseja anonimizar os dados pessoais do cliente deste pedido (${order.id}) ao abrigo do RGPD? Os dados fiscais/contabilísticos serão mantidos mas nome, morada, email e telefone serão anonimizados.`)) {
                      onAnonymizeCustomer(order.id);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  title="Anonimizar PII do cliente ao abrigo do RGPD (Direito ao Esquecimento)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFDD00]" />
                  <span>Anonimizar (RGPD)</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#FFDD00] hover:bg-[#FFE838] text-black text-xs font-black uppercase rounded-xl transition-colors font-condensed"
            >
              Concluir
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
