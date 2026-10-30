'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCommodities, type SpatialLayer } from '@/services/spatial';

type LatLng = [number, number];

const DEFAULT_CENTER: LatLng = [-4.815, 104.886];
const PALETTE = ['#3f8a5a', '#e8a317', '#2b8fb3', '#b4572f', '#7a5bb0', '#c2417b'];
const rupiah = new Intl.NumberFormat('id-ID');

// Pin buatan sendiri: tidak bergantung pada gambar dari CDN
const pinIcon = L.divIcon({
  className: '',
  html: `<svg width="30" height="40" viewBox="0 0 30 40" style="filter:drop-shadow(0 3px 3px rgba(0,0,0,.35))">
    <path d="M15 1C7.2 1 1 7.2 1 14.8 1 25.5 15 39 15 39s14-13.500 14-24.200C29 7.200 22.800 1 15 1z" fill="#f2b632" stroke="#12301f" stroke-width="2"/>
    <circle cx="15" cy="14.500" r="5.500" fill="#12301f"/></svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -36],
});

function pointOf(l: SpatialLayer): LatLng | null {
  const c = l.geom?.coordinates as number[] | undefined;
  return l.asset_type === 'POINT' && Array.isArray(c) && c.length >= 2 ? [c[1], c[0]] : null; // GeoJSON [lng,lat] -> Leaflet [lat,lng]
}

function ringOf(l: SpatialLayer): LatLng[] | null {
  const ring = (l.geom?.coordinates as number[][][] | undefined)?.[0];
  return l.asset_type === 'POLYGON' && Array.isArray(ring) ? ring.map(([lng, lat]) => [lat, lng] as LatLng) : null;
}

function colorOf(l: SpatialLayer): string {
  let h = 0;
  for (const ch of getCommodities(l)[0] ?? '') h = (h * 31 + ch.charCodeAt(0)) % PALETTE.length;
  return PALETTE[h];
}

/** Zoom otomatis ke semua titik yang sedang tampil. */
function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length) map.fitBounds(L.latLngBounds(points), { padding: [70, 70], maxZoom: 14 });
  }, [map, points]);
  return null;
}

/** Scroll halaman tidak "tersangkut" di peta; zoom roda mouse aktif setelah peta diklik. */
function ScrollZoomGuard() {
  const map = useMap();
  useEffect(() => {
    const on = () => map.scrollWheelZoom.enable();
    const off = () => map.scrollWheelZoom.disable();
    off();
    map.on('click', on);
    map.on('mouseout', off);
    return () => { map.off('click', on); map.off('mouseout', off); };
  }, [map]);
  return null;
}

function ShopPopup({ layer }: { layer: SpatialLayer }) {
  const { shop, area_hectares } = layer;
  const area = Number(area_hectares);
  const shown = shop.products.slice(0, 4);
  return (
    <div className="w-56">
      <h3 className="font-display text-base font-bold leading-snug text-fg">{shop.name}</h3>
      {shop.description && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{shop.description}</p>}
      {area > 0 && <p className="mt-2 inline-block rounded-full bg-tile px-2.5 py-0.5 text-xs font-medium text-kunyit-400">Luas lahan {rupiah.format(area)} ha</p>}
      <div className="mt-3 border-t border-line pt-2">
        {shown.length === 0 ? (
          <p className="text-xs text-muted">Belum ada produk.</p>
        ) : (
          <ul className="space-y-1">
            {shown.map((p, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-fg">{p.name}</span>
                <span className="shrink-0 font-semibold text-fg">Rp {rupiah.format(Number(p.price))}<span className="font-normal text-muted">/{p.unit_type}</span></span>
              </li>
            ))}
          </ul>
        )}
        {shop.products.length > shown.length && <p className="mt-1.5 text-xs text-muted">+{shop.products.length - shown.length} produk lainnya</p>}
      </div>
    </div>
  );
}

export default function AgroMap({ layers = [] }: { layers?: SpatialLayer[] }) {
  const points = useMemo(
    () => layers.flatMap((l) => pointOf(l) ?? ringOf(l) ?? []).flat() as unknown as LatLng[],
    [layers],
  );

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={11} zoomControl={false} className="h-full w-full bg-padi-900">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ZoomControl position="bottomright" />
      <ScrollZoomGuard />
      <FitBounds points={points} />

      {layers.map((layer) => {
        const point = pointOf(layer);
        if (point) {
          return (
            <Marker key={layer.id} position={point} icon={pinIcon}>
              <Popup className="agro-popup"><ShopPopup layer={layer} /></Popup>
            </Marker>
          );
        }
        const ring = ringOf(layer);
        if (ring) {
          const color = colorOf(layer);
          return (
            <Polygon
              key={layer.id}
              positions={ring}
              pathOptions={{ color, weight: 2, fillColor: color, fillOpacity: 0.35 }}
              eventHandlers={{
                mouseover: (e) => e.target.setStyle({ weight: 3, fillOpacity: 0.6 }),
                mouseout: (e) => e.target.setStyle({ weight: 2, fillOpacity: 0.35 }),
              }}
            >
              <Popup className="agro-popup"><ShopPopup layer={layer} /></Popup>
            </Polygon>
          );
        }
        return null;
      })}
    </MapContainer>
  );
}