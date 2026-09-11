import { useState, useEffect, useCallback } from 'react';
import type { Brand } from '../types';

const API = '/api/brands';

function authHeader() {
  const token = localStorage.getItem('kicksclub_jwt') || '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Erro ao carregar marcas`);
      const data: Brand[] = await res.json();
      if (Array.isArray(data)) {
        setBrands(data);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido';
      setError(msg);
      console.warn('[useBrands] Erro ao carregar marcas:', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const createBrand = useCallback(async (brand: { name: string; id?: string; logoUrl?: string; description?: string }): Promise<Brand> => {
    const res = await fetch(API, {
      method: 'POST',
      headers: authHeader(),
      credentials: 'include',
      body: JSON.stringify(brand),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro ao criar marca' }));
      throw new Error(err.error || 'Erro ao criar marca');
    }
    const created: Brand = await res.json();
    setBrands((prev) => {
      const exists = prev.some(b => b.id === created.id);
      if (exists) return prev.map(b => b.id === created.id ? created : b);
      return [...prev, created].sort((a, b) => a.name.localeCompare(b.name));
    });
    return created;
  }, []);

  const updateBrand = useCallback(async (brand: Brand): Promise<Brand> => {
    const res = await fetch(`${API}/${brand.id}`, {
      method: 'PUT',
      headers: authHeader(),
      credentials: 'include',
      body: JSON.stringify(brand),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro ao atualizar marca' }));
      throw new Error(err.error || 'Erro ao atualizar marca');
    }
    const updated: Brand = await res.json();
    setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    return updated;
  }, []);

  const deleteBrand = useCallback(async (id: string, options?: { reassignTo?: string; force?: boolean }): Promise<void> => {
    const params = new URLSearchParams();
    if (options?.reassignTo) params.set('reassignTo', options.reassignTo);
    if (options?.force) params.set('force', 'true');

    const url = params.toString() ? `${API}/${id}?${params.toString()}` : `${API}/${id}`;

    const res = await fetch(url, {
      method: 'DELETE',
      headers: authHeader(),
      credentials: 'include',
      body: options ? JSON.stringify(options) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro ao eliminar marca' }));
      const errorObj = new Error(err.error || 'Erro ao eliminar marca') as Error & { productCount?: number };
      if (err.productCount) errorObj.productCount = err.productCount;
      throw errorObj;
    }
    setBrands((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return {
    brands,
    loading,
    error,
    refetch: fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand,
  };
}
