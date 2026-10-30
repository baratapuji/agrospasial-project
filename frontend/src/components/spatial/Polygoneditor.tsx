'use client';
import { useEffect } from 'react';
import { Marker, Polygon, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng } from '@/lib/geo';

const dot = (border: string, size: number) =>
  L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:#fff;border:3px solid ${border};box-shadow:0 1px 4px rgba(0,0,0,.5)"></span>`,
  });
const vertexIcon = dot('#12301f', 16);
const firstIcon = dot('#f2b632', 20);
const style = { color: '#f2b632', weight: 3, fillColor: '#f2b632', fillOpacity: 0.25 };

interface Props {
  points: LatLng[];
  drawing: boolean;
  onChange: (pts: LatLng[]) => void;
  onFinish: () => void;
}

/** Gambar poligon: klik peta = tambah titik, seret titik = ubah, klik kanan titik = hapus. */
export default function PolygonEditor({ points, drawing, onChange, onFinish }: Props) {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (drawing) onChange([...points, [e.latlng.lat, e.latlng.lng]]);
    },
  });

  useEffect(() => {
    const el = map.getContainer();
    el.style.cursor = drawing ? 'crosshair' : '';
    if (drawing) map.doubleClickZoom.disable();
    else map.doubleClickZoom.enable();
    return () => { el.style.cursor = ''; map.doubleClickZoom.enable(); };
  }, [drawing, map]);

  return (
    <>
      {points.length >= 3 && <Polygon positions={points} pathOptions={style} interactive={false} />}
      {points.length === 2 && <Polyline positions={points} pathOptions={style} interactive={false} />}
      {points.map((p, i) => (
        <Marker
          key={i}
          position={p}
          icon={i === 0 ? firstIcon : vertexIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const ll = e.target.getLatLng();
              onChange(points.map((q, j) => (j === i ? ([ll.lat, ll.lng] as LatLng) : q)));
            },
            click: () => { if (drawing && i === 0 && points.length >= 3) onFinish(); },
            contextmenu: () => { if (drawing || points.length > 3) onChange(points.filter((_, j) => j !== i)); },
          }}
        />
      ))}
    </>
  );
}