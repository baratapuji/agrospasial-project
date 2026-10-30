export type LatLng = [number, number]; // [lat, lng] (urutan Leaflet)

export interface SpatialDraft {
  point: LatLng | null;
  polygon: LatLng[] | null;
}

export const hasPolygon = (d: SpatialDraft) => (d.polygon?.length ?? 0) >= 3;

export const isValidLatLng = (lat: number, lng: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

/** Luas poligon dalam hektar (rumus bola bumi, tanpa dependensi). */
export function polygonAreaHectares(ring: LatLng[]): number {
  if (ring.length < 3) return 0;
  const R = 6378137;
  const rad = Math.PI / 180;
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [lat1, lng1] = ring[i];
    const [lat2, lng2] = ring[(i + 1) % ring.length];
    sum += (lng2 - lng1) * rad * (2 + Math.sin(lat1 * rad) + Math.sin(lat2 * rad));
  }
  return Math.abs((sum * R * R) / 2) / 10000;
}

// GeoJSON memakai urutan [lng, lat]
export const toPointGeom = (p: LatLng) => ({ type: 'Point' as const, coordinates: [p[1], p[0]] });

export const toPolygonGeom = (pts: LatLng[]) => {
  const ring = pts.map(([lat, lng]) => [lng, lat]);
  ring.push(ring[0]); // GeoJSON mewajibkan ring tertutup
  return { type: 'Polygon' as const, coordinates: [ring] };
};

export function toFeatureCollection(d: SpatialDraft, props: Record<string, unknown> = {}) {
  const features: Array<{ type: 'Feature'; properties: Record<string, unknown>; geometry: ReturnType<typeof toPointGeom> | ReturnType<typeof toPolygonGeom> }> = [];
  if (d.point) {
    features.push({ type: 'Feature', properties: { ...props, asset_type: 'POINT' }, geometry: toPointGeom(d.point) });
  }
  if (d.polygon && hasPolygon(d)) {
    features.push({
      type: 'Feature',
      properties: { ...props, asset_type: 'POLYGON', area_hectares: Number(polygonAreaHectares(d.polygon).toFixed(4)) },
      geometry: toPolygonGeom(d.polygon),
    });
  }
  return { type: 'FeatureCollection' as const, features };
}

export function downloadGeoJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}