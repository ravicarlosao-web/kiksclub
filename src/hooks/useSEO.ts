import { useEffect } from 'react';
import { updateDocumentSEO, SEOMetaConfig } from '../utils/seo';

/**
 * Hook para atualizar o SEO automaticamente ao alternar rotas ou produtos
 */
export function useSEO(pageKey: string, customConfig?: Partial<SEOMetaConfig>) {
  useEffect(() => {
    updateDocumentSEO(pageKey, customConfig);
  }, [pageKey, customConfig?.title, customConfig?.description, customConfig?.canonicalUrl]);
}
