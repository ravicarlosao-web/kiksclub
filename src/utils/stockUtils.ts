import { Sneaker } from '../types';

/**
 * Deterministic default stock generator for products that don't have sizeStock explicitly set.
 * Creates a realistic inventory distribution where some sizes have 1-3 pairs and some are out of stock.
 */
export function getDefaultSizeStock(productId: string, size: number | string): number {
  const str = `${productId}-${size}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1000;
  }
  // Roughly 20% of sizes are sold out (0), 30% have low stock (1 or 2), 50% have normal stock (3 to 6)
  const rem = hash % 10;
  if (rem === 0 || rem === 1) return 0; // Esgotado
  if (rem === 2 || rem === 3) return 1; // Apenas 1 par
  if (rem === 4 || rem === 5) return 2; // 2 pares
  if (rem === 6 || rem === 7) return 3; // 3 pares
  return 4; // 4 pares
}

/**
 * Returns the exact stock quantity for a specific size of a product.
 */
export function getSizeStock(product: Sneaker, size: number | string): number {
  if (!product.inStock) return 0;
  const key = String(size);
  if (product.sizeStock && key in product.sizeStock) {
    return Math.max(0, Number(product.sizeStock[key]) || 0);
  }
  return getDefaultSizeStock(product.id, size);
}

/**
 * Returns whether a specific size of a product is currently available in stock.
 */
export function isSizeInStock(product: Sneaker, size: number | string): boolean {
  return getSizeStock(product, size) > 0;
}

/**
 * Returns the total units available across all sizes of a product.
 */
export function getTotalStock(product: Sneaker): number {
  if (!product.inStock || !product.sizes || product.sizes.length === 0) return 0;
  return product.sizes.reduce<number>((sum, size) => sum + getSizeStock(product, size), 0);
}

/**
 * Returns whether any size of the product has at least 1 unit in stock.
 */
export function isProductAvailable(product: Sneaker): boolean {
  if (!product.inStock) return false;
  if (!product.sizes || product.sizes.length === 0) return true;
  return product.sizes.some((size) => isSizeInStock(product, size));
}

/**
 * Finds the first size of a product that is currently in stock.
 * If none is in stock, returns the first size or undefined.
 */
export function getFirstAvailableSize(product: Sneaker): number | string | undefined {
  if (!product.sizes || product.sizes.length === 0) return undefined;
  const available = product.sizes.find((size) => isSizeInStock(product, size));
  return available !== undefined ? available : product.sizes[0];
}

/**
 * Generates an initial sizeStock map for an array of sizes, assigning custom or default quantities.
 */
export function buildInitialSizeStock(sizes: (number | string)[], defaultQty: number = 2): Record<string, number> {
  const result: Record<string, number> = {};
  for (const s of sizes) {
    result[String(s)] = defaultQty;
  }
  return result;
}
