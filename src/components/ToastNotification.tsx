import React, { useEffect } from 'react';
import { ShoppingBag, Heart, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      aria-live="polite"
      className="fixed bottom-5 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] sm:w-auto pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 3800);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'cart':
        return (
          <div className="w-8 h-8 rounded-xl bg-[#FFDD00] text-black flex items-center justify-center flex-shrink-0 shadow-xs">
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
      case 'wishlist-add':
        return (
          <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Heart className="w-4 h-4 fill-current" />
          </div>
        );
      case 'wishlist-remove':
        return (
          <div className="w-8 h-8 rounded-xl bg-neutral-800 text-neutral-400 border border-neutral-700 flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4" />
          </div>
        );
      case 'success':
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div 
      className="pointer-events-auto bg-[#141414]/95 backdrop-blur-md border border-neutral-800 text-white rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 transition-all hover:border-neutral-700 max-w-sm"
      role="alert"
    >
      {/* Product Image Thumbnail OR Icon */}
      {toast.product?.image ? (
        <div className="relative w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex-shrink-0 p-1 flex items-center justify-center overflow-hidden">
          <img 
            src={toast.product.image} 
            alt={toast.product.name} 
            className="w-full h-full object-contain filter drop-shadow-sm" 
          />
          <div className="absolute -bottom-1 -right-1">
            {toast.type === 'cart' ? (
              <span className="w-4 h-4 rounded-full bg-[#FFDD00] text-black flex items-center justify-center text-[9px] font-black">
                ✓
              </span>
            ) : toast.type === 'wishlist-add' ? (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px]">
                ♥
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        getIcon()
      )}

      {/* Text Info */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#FFDD00] font-condensed">
            {toast.title}
          </span>
          {toast.product?.size && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-neutral-800 text-neutral-300 rounded font-mono">
              Tam: {toast.product.size}
            </span>
          )}
        </div>

        {toast.product ? (
          <p className="text-xs font-bold text-white truncate max-w-[200px]">
            {toast.product.name}
          </p>
        ) : toast.message ? (
          <p className="text-xs text-neutral-300 line-clamp-2">
            {toast.message}
          </p>
        ) : null}

        {toast.product?.price !== undefined && (
          <span className="text-[11px] font-black text-neutral-400 font-condensed">
            {toast.product.price.toFixed(2).replace('.', ',')}€
          </span>
        )}
      </div>

      {/* Quick Action Button (optional) */}
      {toast.actionLabel && toast.onAction && (
        <button
          onClick={() => {
            toast.onAction?.();
            onDismiss(toast.id);
          }}
          className="px-2.5 py-1.5 bg-[#FFDD00] hover:bg-[#FFE838] text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 flex-shrink-0 font-condensed shadow-xs"
        >
          <span>{toast.actionLabel}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )}

      {/* Dismiss Button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-neutral-500 hover:text-white rounded-lg transition-colors flex-shrink-0"
        aria-label="Fechar notificação"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
