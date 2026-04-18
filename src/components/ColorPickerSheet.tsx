import { useState, useRef, useEffect, useCallback } from 'react';

type Mode = 'grid' | 'spectrum' | 'sliders';

// ── Color math ──────────────────────────────────────────────
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').padEnd(6, '0');
  return [parseInt(h.slice(0, 2), 16) || 0, parseInt(h.slice(2, 4), 16) || 0, parseInt(h.slice(4, 6), 16) || 0];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

// ── Grid data ────────────────────────────────────────────────
const HUES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 300];
const LIGHTNESSES = [15, 25, 35, 45, 55, 65, 75, 85];

const GRID: string[][] = (() => {
  const grays = Array.from({ length: 10 }, (_, i) => {
    const v = Math.round(255 * (1 - i / 9));
    return rgbToHex(v, v, v);
  });
  const rows = [grays];
  for (const l of LIGHTNESSES) {
    rows.push(HUES.map(h => { const [r, g, b] = hslToRgb(h, 80, l); return rgbToHex(r, g, b); }));
  }
  return rows;
})();

// ── Component ────────────────────────────────────────────────
interface Props {
  color: string;
  onChange: (hex: string) => void;
  onClose: () => void;
}

export default function ColorPickerSheet({ color, onChange, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('spectrum');
  const [rgb, setRgb] = useState<[number, number, number]>(() => hexToRgb(color));
  const [hexInput, setHexInput] = useState(() => color.replace('#', '').toUpperCase());
  const [specPos, setSpecPos] = useState<{ px: number; py: number }>(() => {
    const [r, g, b] = hexToRgb(color);
    const [h, , l] = rgbToHsl(r, g, b);
    return { px: (100 - l) / 100, py: h / 360 };
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [r, g, b] = rgb;

  const applyRgb = useCallback((nr: number, ng: number, nb: number) => {
    const clamped: [number, number, number] = [
      Math.max(0, Math.min(255, Math.round(nr))),
      Math.max(0, Math.min(255, Math.round(ng))),
      Math.max(0, Math.min(255, Math.round(nb))),
    ];
    setRgb(clamped);
    setHexInput(rgbToHex(...clamped).replace('#', '').toUpperCase());
    onChange(rgbToHex(...clamped));
  }, [onChange]);

  // Draw spectrum canvas
  useEffect(() => {
    if (mode !== 'spectrum') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    const img = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
      const hue = (y / height) * 360;
      for (let x = 0; x < width; x++) {
        const lightness = 100 - (x / width) * 100;
        const [pr, pg, pb] = hslToRgb(hue, 100, lightness);
        const i = (y * width + x) * 4;
        img.data[i] = pr; img.data[i + 1] = pg; img.data[i + 2] = pb; img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [mode]);

  const pickSpectrum = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setSpecPos({ px, py });
    const hue = py * 360;
    const lightness = 100 - px * 100;
    const [pr, pg, pb] = hslToRgb(hue, 100, lightness);
    applyRgb(pr, pg, pb);
  }, [applyRgb]);

  const currentHex = rgbToHex(r, g, b);

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        maxWidth: 430, margin: '0 auto',
        background: '#F2F2F7', borderRadius: '20px 20px 0 0',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
          <span style={{ fontSize: 20 }}>✏️</span>

          {/* Tabs */}
          <div style={{ display: 'flex', background: '#E5E5EA', borderRadius: 10, padding: 2 }}>
            {(['Grid', 'Spectrum', 'Sliders'] as const).map(m => (
              <button key={m} onClick={() => setMode(m.toLowerCase() as Mode)} style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 500,
                background: mode === m.toLowerCase() ? '#FFFFFF' : 'transparent',
                color: '#1C1C1E',
                boxShadow: mode === m.toLowerCase() ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
              }}>{m}</button>
            ))}
          </div>

          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: '50%', background: '#C7C7CC',
            border: 'none', fontSize: 14, fontWeight: 700, color: '#666', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ padding: '0 16px 12px' }}>

          {/* ── Spectrum ── */}
          {mode === 'spectrum' && (
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', touchAction: 'none', cursor: 'crosshair' }}>
              <canvas
                ref={canvasRef}
                width={400} height={300}
                style={{ width: '100%', height: 300, display: 'block' }}
                onClick={e => pickSpectrum(e.clientX, e.clientY)}
                onMouseMove={e => { if (e.buttons === 1) pickSpectrum(e.clientX, e.clientY); }}
                onTouchStart={e => { e.preventDefault(); const t = e.touches[0]; pickSpectrum(t.clientX, t.clientY); }}
                onTouchMove={e => { e.preventDefault(); const t = e.touches[0]; pickSpectrum(t.clientX, t.clientY); }}
              />
              {/* Picker dot */}
              <div style={{
                position: 'absolute',
                left: `${specPos.px * 100}%`, top: `${specPos.py * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: 22, height: 22, borderRadius: '50%',
                border: '2.5px solid #FFFFFF',
                boxShadow: '0 0 0 1.5px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.3)',
                background: currentHex,
                pointerEvents: 'none',
              }} />
            </div>
          )}

          {/* ── Grid ── */}
          {mode === 'grid' && (
            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 6 }}>
              {GRID.map((row, ri) => (
                <div key={ri} style={{ display: 'flex' }}>
                  {row.map((c, ci) => (
                    <button key={ci} onClick={() => { const [pr, pg, pb] = hexToRgb(c); applyRgb(pr, pg, pb); }} style={{
                      flex: 1, aspectRatio: '1', background: c, border: 'none',
                      outline: currentHex.toLowerCase() === c.toLowerCase() ? '2px solid #1C1C1E' : 'none',
                      outlineOffset: -2,
                      borderRadius: ri === 0 && ci === 0 ? '6px 0 0 0' : ri === 0 && ci === 9 ? '0 6px 0 0' : ri === 8 && ci === 0 ? '0 0 0 6px' : ri === 8 && ci === 9 ? '0 0 6px 0' : 0,
                      cursor: 'pointer',
                    }} />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ── Sliders ── */}
          {mode === 'sliders' && (
            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: '16px' }}>
              <style>{`
                .color-slider { -webkit-appearance: none; appearance: none; height: 28px; background: transparent; width: 100%; cursor: pointer; }
                .color-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 26px; height: 26px; border-radius: 50%; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.35); border: 0.5px solid rgba(0,0,0,0.15); }
                .color-slider::-webkit-slider-runnable-track { height: 12px; border-radius: 6px; }
              `}</style>

              {(['RED', 'GREEN', 'BLUE'] as const).map((ch, i) => {
                const val = [r, g, b][i];
                const gradient = [
                  `linear-gradient(to right, rgb(0,${g},${b}), rgb(255,${g},${b}))`,
                  `linear-gradient(to right, rgb(${r},0,${b}), rgb(${r},255,${b}))`,
                  `linear-gradient(to right, rgb(${r},${g},0), rgb(${r},${g},255))`,
                ][i];
                return (
                  <div key={ch} style={{ marginBottom: i < 2 ? 14 : 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', marginBottom: 4, letterSpacing: 0.5 }}>{ch}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{ position: 'absolute', left: 0, right: 0, height: 12, borderRadius: 6, background: gradient, pointerEvents: 'none' }} />
                        <input
                          className="color-slider"
                          type="range" min={0} max={255} value={val}
                          onChange={e => {
                            const v = Number(e.target.value);
                            applyRgb(i === 0 ? v : r, i === 1 ? v : g, i === 2 ? v : b);
                          }}
                        />
                      </div>
                      <input type="number" min={0} max={255} value={val}
                        onChange={e => {
                          const v = Math.max(0, Math.min(255, Number(e.target.value)));
                          applyRgb(i === 0 ? v : r, i === 1 ? v : g, i === 2 ? v : b);
                        }}
                        style={{ width: 52, padding: '5px 6px', textAlign: 'center', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 15, background: '#F2F2F7', color: '#1C1C1E' }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Hex */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid #F2F2F7' }}>
                <span style={{ fontSize: 14, color: '#007AFF', fontWeight: 500 }}>sRGB Hex Color #</span>
                <input
                  value={hexInput}
                  onChange={e => {
                    const v = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0, 6);
                    setHexInput(v);
                    if (v.length === 6) { const [pr, pg, pb] = hexToRgb('#' + v); applyRgb(pr, pg, pb); }
                  }}
                  style={{ width: 80, padding: '5px 8px', textAlign: 'center', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 15, background: '#F2F2F7', color: '#1C1C1E', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer — color preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '4px 20px 8px' }}>
          <div style={{ width: 60, height: 60, borderRadius: 12, background: currentHex, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }} />
          <button style={{ width: 34, height: 34, borderRadius: '50%', background: '#E5E5EA', border: 'none', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8E8E93' }}>+</button>
        </div>

      </div>
    </>
  );
}
