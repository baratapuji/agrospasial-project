'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Check, Copy, Download, Lock, LocateFixed, MapPin, PenTool, Trash2, Undo2 } from 'lucide-react';
import {
  downloadGeoJSON, isValidLatLng, polygonAreaHectares, toFeatureCollection,
  type LatLng, type SpatialDraft,
} from '@/lib/geo';

const PickerMap = dynamic(() => import('./PickerMap'), {
  ssr: false,
  loading: () => <div className="grid h-[420px] animate-pulse place-items-center rounded-2xl bg-padi-900 text-sm text-padi-100/60">Memuat peta…</div>,
});

type Tier = 'SILVER' | 'GOLD' | 'LUXURY';

interface Props {
  tier: Tier;
  value: SpatialDraft;
  onChange: (v: SpatialDraft) => void;
  shopName?: string;
}

const btn = 'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kunyit-500 disabled:cursor-not-allowed disabled:opacity-40';
const input = 'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-fg focus:outline-2 focus:outline-kunyit-500';

export default function SpatialPicker({ tier, value, onChange, shopName }: Props) {
  const canDraw = tier === 'LUXURY';
  const [mode, setMode] = useState<'point' | 'polygon'>('point');
  const [drawing, setDrawing] = useState(false);
  const [focus, setFocus] = useState<{ pos: LatLng } | null>(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [copied, setCopied] = useState(false);
  const [geoError, setGeoError] = useState('');

  const polygon = value.polygon ?? [];
  const area = polygonAreaHectares(polygon);
  const fc = toFeatureCollection(value, { shop: shopName, tier });

  useEffect(() => { if (!canDraw) { setMode('point'); setDrawing(false); } }, [canDraw]);

  // Sinkronkan kolom teks saat titik berubah lewat peta (tanpa mengganggu ketikan)
  useEffect(() => {
    if (!value.point) return;
    if (Number(lat) !== value.point[0]) setLat(value.point[0].toFixed(6));
    if (Number(lng) !== value.point[1]) setLng(value.point[1].toFixed(6));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.point]);

  const setPoint = (p: LatLng) => onChange({ ...value, point: p });
  const setPolygon = (pts: LatLng[] | null) => onChange({ ...value, polygon: pts });

  const onText = (nextLat: string, nextLng: string) => {
    setLat(nextLat); setLng(nextLng);
    const a = parseFloat(nextLat), b = parseFloat(nextLng);
    if (isValidLatLng(a, b)) setPoint([a, b]);
  };

  const locate = () => {
    setGeoError('');
    if (!navigator.geolocation) return setGeoError('Browser tidak mendukung geolokasi.');
    navigator.geolocation.getCurrentPosition(
      (pos) => { const p: LatLng = [pos.coords.latitude, pos.coords.longitude]; setPoint(p); setFocus({ pos: p }); },
      () => setGeoError('Lokasi tidak bisa diakses. Izinkan akses lokasi di browser.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const chooseMode = (m: 'point' | 'polygon') => {
    setMode(m);
    setDrawing(m === 'polygon' && polygon.length < 3);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(fc, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { setGeoError('Gagal menyalin. Gunakan tombol Unduh.'); }
  };

  const fileName = `${(shopName ?? 'lokasi-toko').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'lokasi-toko'}.geojson`;

  return (
    <div className="space-y-4">
      {/* Pilih alat */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Alat peta">
        <button type="button" aria-pressed={mode === 'point'} onClick={() => chooseMode('point')}
          className={`${btn} ${mode === 'point' ? 'bg-btn text-btn-fg' : 'ring-1 ring-line text-fg hover:bg-surface'}`}>
          <MapPin className="size-3.5" aria-hidden /> Titik toko
        </button>
        <button type="button" aria-pressed={mode === 'polygon'} disabled={!canDraw} onClick={() => chooseMode('polygon')}
          title={canDraw ? undefined : 'Gambar poligon lahan hanya untuk paket Luxury'}
          className={`${btn} ${mode === 'polygon' ? 'bg-btn text-btn-fg' : 'ring-1 ring-line text-fg hover:bg-surface'}`}>
          {canDraw ? <PenTool className="size-3.5" aria-hidden /> : <Lock className="size-3.5" aria-hidden />} Gambar lahan
        </button>
        {!canDraw && <span className="text-xs text-muted">Poligon lahan tersedia untuk paket Luxury.</span>}
      </div>

      {/* Peta */}
      <div className="relative isolate overflow-hidden rounded-2xl ring-1 ring-line">
        <PickerMap
          point={value.point} polygon={polygon} mode={mode} drawing={drawing} focus={focus}
          onPoint={setPoint} onPolygon={setPolygon} onFinish={() => polygon.length >= 3 && setDrawing(false)}
        />
      </div>

      {/* Kontrol gambar poligon */}
      {mode === 'polygon' && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface p-3 ring-1 ring-line">
          {drawing ? (
            <button type="button" disabled={polygon.length < 3} onClick={() => setDrawing(false)} className={`${btn} bg-kunyit-400 text-padi-950`}>
              <Check className="size-3.5" aria-hidden /> Selesai menggambar
            </button>
          ) : (
            <button type="button" onClick={() => { setPolygon([]); setDrawing(true); }} className={`${btn} bg-btn text-btn-fg`}>
              <PenTool className="size-3.5" aria-hidden /> Gambar ulang
            </button>
          )}
          <button type="button" disabled={polygon.length === 0} onClick={() => setPolygon(polygon.slice(0, -1))} className={`${btn} ring-1 ring-line text-fg`}>
            <Undo2 className="size-3.5" aria-hidden /> Urungkan
          </button>
          <button type="button" disabled={polygon.length === 0} onClick={() => { setPolygon(null); setDrawing(false); }} className={`${btn} ring-1 ring-line text-fg`}>
            <Trash2 className="size-3.5" aria-hidden /> Hapus
          </button>
          <p className="ml-auto text-xs text-muted" aria-live="polite">
            {drawing ? 'Klik peta untuk menambah titik; klik titik kuning untuk menutup.' : `${polygon.length} titik`}
            {area > 0 && <> · <strong className="text-fg">{area.toFixed(2)} ha</strong></>}
          </p>
        </div>
      )}

      {/* Koordinat & ekspor */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">Latitude
            <input className={`${input} mt-1 normal-case`} inputMode="decimal" value={lat} placeholder="-4.8214" onChange={(e) => onText(e.target.value, lng)} onBlur={() => value.point && setFocus({ pos: value.point })} />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">Longitude
            <input className={`${input} mt-1 normal-case`} inputMode="decimal" value={lng} placeholder="104.8856" onChange={(e) => onText(lat, e.target.value)} onBlur={() => value.point && setFocus({ pos: value.point })} />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={locate} className={`${btn} ring-1 ring-line text-fg hover:bg-surface`}><LocateFixed className="size-3.5" aria-hidden /> Lokasi saya</button>
          <button type="button" disabled={fc.features.length === 0} onClick={() => downloadGeoJSON(fc, fileName)} className={`${btn} bg-btn text-btn-fg`}><Download className="size-3.5" aria-hidden /> Unduh GeoJSON</button>
          <button type="button" disabled={fc.features.length === 0} onClick={copy} className={`${btn} ring-1 ring-line text-fg hover:bg-surface`}>
            {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />} {copied ? 'Tersalin' : 'Salin'}
          </button>
        </div>
      </div>
      {geoError && <p role="alert" className="text-xs text-red-500">{geoError}</p>}
    </div>
  );
}