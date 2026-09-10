import { useState, useEffect, useCallback } from 'react';
import type { StoreCategory } from '../types';
import { INITIAL_CATEGORIES } from '../data/categories';

const API = '/api/categories';

function authHeader() {
  const token = localStorage.getItem('kicksclub_jwt') || '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export function useCategories() {
  const [categories, setCategories] = useState<StoreCategory[]>(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Erro ao carregar categorias`);
      const data: StoreCategory[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido';
      setError(msg);
      console.warn('[useCategories] A utilizar categorias locais como fallback:', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(async (category: StoreCategory): Promise<StoreCategory> => {
    const res = await fetch(API, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(category),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro ao criar categoria' }));
      throw new Error(err.error || 'Erro ao criar categoria');
    }
    const created: StoreCategory = await res.json();
    setCategories((prev) => [...prev, created]);
    return created;
  }, []);

  const updateCategory = useCallback(async (category: StoreCategory): Promise<StoreCategory> => {
    const res = await fetch(`${API}/${category.id}`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify(category),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro ao actualizar categoria' }));
      throw new Error(err.error || 'Erro ao actualizar categoria');
    }
    const updated: StoreCategory = await res.json();
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    return updated;
  }, []);

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`${API}/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro ao eliminar categoria' }));
      throw new Error(err.error || 'Erro ao eliminar categoria');
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
