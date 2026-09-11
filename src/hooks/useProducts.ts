import { useState, useEffect, useCallback } from 'react';
import type { Sneaker } from '../types';
import { SNEAKERS } from '../data/sneakers';

const API = '/api/products';

function getToken(): string {
  return localStorage.getItem('kicksclub_jwt') || '';
}

function authHeader() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

export function useProducts() {
  const [products, setProducts] = useState<Sneaker[]>(SNEAKERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API}?limit=500`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Erro ao carregar produtos`);
      }
      const data: Sneaker[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido';
      setError(msg);
      console.warn('[useProducts] A utilizar catálogo local como fallback:', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = useCallback(async (product: Sneaker): Promise<Sneaker> => {
    const res = await fetch(API, {
      method: 'POST',
      headers: authHeader(),
      credentials: 'include',
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro ao criar produto' }));
      throw new Error(err.error || 'Erro ao criar produto');
    }
    const created: Sneaker = await res.json();
    setProducts((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateProduct = useCallback(async (product: Sneaker): Promise<Sneaker> => {
    const res = await fetch(`${API}/${product.id}`, {
      method: 'PUT',
      headers: authHeader(),
      credentials: 'include',
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro ao actualizar produto' }));
      throw new Error(err.error || 'Erro ao actualizar produto');
    }
    const updated: Sneaker = await res.json();
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    return updated;
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`${API}/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro ao eliminar produto' }));
      throw new Error(err.error || 'Erro ao eliminar produto');
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Actualiza stock localmente após encomenda (optimistic update)
  const decrementStock = useCallback((items: { productId: string; size: number | string; quantity: number }[]) => {
    setProducts((prev) =>
      prev.map((p) => {
        const matching = items.filter((item) => item.productId === p.id);
        if (matching.length === 0) return p;
        const updatedStock: Record<string, number> = { ...(p.sizeStock || {}) };
        matching.forEach((item) => {
          const key = String(item.size);
          updatedStock[key] = Math.max(0, (updatedStock[key] ?? 2) - item.quantity);
        });
        const totalRemaining = Object.values(updatedStock).reduce((s, q) => s + q, 0);
        return { ...p, sizeStock: updatedStock, inStock: totalRemaining > 0 };
      })
    );
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    decrementStock,
  };
}
