'use client';
import { useEffect } from 'react';
import { LayersControl, MapContainer, Marker, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLng } from '@/lib/geo';
import PolygonEditor from './PolygonEditor';

const DEFAULT_CENTER: LatLng = [-4.815, 104.886];

const pinIcon = L.divIcon({
  className: '',
  html: `<svg width="30" height="40" viewBox="0 0 30 40" style="filter:drop-shadow(0 3px 3px rgba(0,0,0,.35))">
    <path d="M15 1C7.2 1 1 7.2 1 14.8 1 25.5 15 39 15 39s14-13.500 14-24.200C29 7.200 22.800 1 15 1z" fill="#f2b632" stroke="#12301f" stroke-width="2"/>
    <circle cx="15" cy="14.500" r="5.500" fill="#12301f"/></svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

function PointPicker({ enabled, onPoint }: { enabled: boolean; onPoint: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => { if (enabled) onPoint([e.latlng.lat, e.latlng.lng]); } });
  return null;
}

function FlyTo({ focus }: { focus: { pos: LatLng } | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.flyTo(focus.pos, Math.max(map.getZoom(), 16), { duration: 0.8 });
  }, [focus, map]);
  return null;
}

interface Props {
  point: LatLng | null;
  polygon: LatLng[];
  mode: 'point' | 'polygon';
  drawing: boolean;
  focus: { pos: LatLng } | null;
  onPoint: (p: LatLng) => void;
  onPolygon: (pts: LatLng[]) => void;
  onFinish: () => void;
}

export default function PickerMap({ point, polygon, mode, drawing, focus, onPoint, onPolygon, onFinish }: Props) {
  return (
    <MapContainer center={point ?? polygon[0] ?? DEFAULT_CENTER} zoom={point ? 16 : 12} zoomControl={false} className="picker-map h-[420px] w-full rounded-2xl bg-padi-900">
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Satelit">
          <TileLayer
            attribution="Tiles &copy; Esri, Maxar, Earthstar Geographics"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Peta">
          <TileLayer className="osm-tiles" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
        </LayersControl.BaseLayer>
        <LayersControl.Overlay checked name="Nama tempat">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" maxZoom={19} />
        </LayersControl.Overlay>
      </LayersControl>

      <ZoomControl position="bottomright" />
      <FlyTo focus={focus} />
      <PointPicker enabled={mode === 'point'} onPoint={onPoint} />

      {point && (
        <Marker
          position={point}
          icon={pinIcon}
          draggable
          eventHandlers={{ dragend: (e) => { const ll = e.target.getLatLng(); onPoint([ll.lat, ll.lng]); } }}
        />
      )}
      <PolygonEditor points={polygon} drawing={drawing} onChange={onPolygon} onFinish={onFinish} />
    </MapContainer>
  );
}