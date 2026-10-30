'use client';

import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Konfigurasi icon marker standar Leaflet agar aman dari error asset missing
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface AdminMapViewerProps {
  assets?: any[];
}

export default function AdminMapViewer({ assets = [] }: AdminMapViewerProps) {
  // Titik tengah default (Kotabumi, Lampung Utara)
  const defaultCenter: [number, number] = [-4.815, 104.886];

  return (
    <div className="w-full h-[450px] rounded-xl overflow-hidden shadow-sm border border-slate-200 z-0 relative">
      <MapContainer 
        center={defaultCenter} 
        zoom={11} 
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {assets.map((item) => {
          // 1. Render Aset POINT (Titik Lokasi Toko)
          if (item.asset_type === 'POINT' && item.geom?.coordinates) {
            const [lng, lat] = item.geom.coordinates;
            // Validasi koordinat numerik valid
            if (typeof lat !== 'number' || typeof lng !== 'number') return null;

            return (
              <Marker key={item.id} position={[lat, lng]} icon={customIcon}>
                <Popup>
                  <div className="p-1 min-w-[140px]">
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded uppercase">
                      Titik Toko
                    </span>
                    <h4 className="font-bold text-slate-800 mt-1.5 text-sm">
                      {item.shop?.name || 'Toko Mitra Tani'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Status: {item.shop?.owner?.status_akun || 'Aktif'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          }

          // 2. Render Aset POLYGON (Batas Lahan Pertanian)
          if (item.asset_type === 'POLYGON' && item.geom?.coordinates) {
            try {
              // Format GeoJSON Polygon: coordinates[ringIndex][pointIndex][lng, lat]
              const ring = item.geom.coordinates[0];
              if (!Array.isArray(ring)) return null;

              const positions = ring.map(([lng, lat]: [number, number]) => [lat, lng]);

              return (
                <Polygon 
                  key={item.id} 
                  positions={positions} 
                  pathOptions={{ 
                    color: '#059669', // Emerald 600
                    fillColor: '#34d399', // Emerald 400
                    fillOpacity: 0.4,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-1 min-w-[150px]">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">
                        Lahan Tani
                      </span>
                      <h4 className="font-bold text-slate-800 mt-1.5 text-sm">
                        {item.shop?.name || 'Lahan Mitra'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Luas Area: <strong className="text-emerald-700">{item.area_hectares ? `${item.area_hectares} Hektar` : 'Tidak tercatat'}</strong>
                      </p>
                    </div>
                  </Popup>
                </Polygon>
              );
            } catch (err) {
              console.error('Gagal merender polygon:', err);
              return null;
            }
          }

          return null;
        })}
      </MapContainer>
    </div>
  );
}