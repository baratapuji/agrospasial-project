import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  timeout: 10000,
});

export interface ShopProduct {
  name: string;
  price: number | string; // Prisma Decimal dikirim sebagai string lewat JSON
  unit_type: string;
  category?: { name: string };
}

export interface SpatialLayer {
  id: string;
  asset_type: 'POINT' | 'POLYGON';
  geom: { type?: string; coordinates?: unknown } | null;
  area_hectares?: number | string | null;
  shop: {
    id?: string;
    name: string;
    description?: string | null;
    products: ShopProduct[];
  };
}

/** Daftar komoditas unik milik toko pada satu layer. */
export function getCommodities(layer: SpatialLayer): string[] {
  const names = layer.shop.products.map((p) => p.category?.name).filter((n): n is string => !!n);
  return [...new Set(names)];
}

export async function fetchLayers(): Promise<SpatialLayer[]> {
  const { data } = await api.get('/spatial/layers');
  if (!data.success) throw new Error(data.message ?? 'Layer tidak dapat dimuat');
  return data.data as SpatialLayer[];
}