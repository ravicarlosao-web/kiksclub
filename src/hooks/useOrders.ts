import { useState, useCallback } from 'react';
import type { Order, OrderStatus } from '../types';

const API = '/api/orders';

function authHeader() {
  const token = localStorage.getItem('kicksclub_jwt') || '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Busca todas as encomendas (admin only) */
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}?limit=500`, {
        headers: authHeader(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao carregar encomendas');
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Cria uma encomenda (checkout público) */
  const createOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingCode'>): Promise<Order> => {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro ao criar encomenda' }));
      throw new Error(err.error || 'Erro ao criar encomenda');
    }
    const created: Order = await res.json();
    setOrders((prev) => [created, ...prev]);
    return created;
  }, []);

  /** Busca uma encomenda pelo código de rastreio (tracking público) */
  const fetchOrderByCode = useCallback(async (code: string): Promise<Order | null> => {
    try {
      const res = await fetch(`${API}/${encodeURIComponent(code.toUpperCase())}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Erro ao procurar encomenda');
      return await res.json();
    } catch (e: unknown) {
      console.error('[fetchOrderByCode]', e);
      return null;
    }
  }, []);

  /** Actualiza o estado de uma encomenda (admin) */
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus): Promise<void> => {
    const res = await fetch(`${API}/${orderId}`, {
      method: 'PUT',
      headers: authHeader(),
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Erro ao actualizar estado');
    const updated: Order = await res.json();
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }, []);

  /** Actualiza o código de tracking de uma encomenda (admin) */
  const updateOrderTracking = useCallback(async (orderId: string, trackingCode: string): Promise<void> => {
    const res = await fetch(`${API}/${orderId}`, {
      method: 'PUT',
      headers: authHeader(),
      credentials: 'include',
      body: JSON.stringify({ trackingCode }),
    });
    if (!res.ok) throw new Error('Erro ao actualizar tracking');
    const updated: Order = await res.json();
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }, []);

  /** Elimina uma encomenda (admin) */
  const deleteOrder = useCallback(async (orderId: string): Promise<void> => {
    const res = await fetch(`${API}/${orderId}`, {
      method: 'DELETE',
      headers: authHeader(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Erro ao eliminar encomenda');
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  /** Anonimiza os dados de cliente ao abrigo do RGPD (admin) */
  const anonymizeOrderCustomer = useCallback(async (orderId: string): Promise<void> => {
    const res = await fetch(`${API}/${orderId}?action=anonymize`, {
      method: 'POST',
      headers: authHeader(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro ao anonimizar dados' }));
      throw new Error(err.error || 'Erro ao anonimizar dados');
    }
    await fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    fetchOrderByCode,
    updateOrderStatus,
    updateOrderTracking,
    deleteOrder,
    anonymizeOrderCustomer,
  };
}
