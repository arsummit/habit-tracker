import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (const byte of buf) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

function makePNG(size) {
  // Draw a solid #007AFF circle on white background
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const cx = size / 2, cy = size / 2, r = size * 0.45;
  const rowSize = 1 + size * 3;
  const raw = Buffer.alloc(rowSize * size, 0);

  for (let y = 0; y < size; y++) {
    raw[y * rowSize] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;
      const inCircle = dx * dx + dy * dy <= r * r;
      const base = y * rowSize + 1 + x * 3;
      if (inCircle) {
        raw[base] = 0; raw[base + 1] = 122; raw[base + 2] = 255; // #007AFF
      } else {
        raw[base] = 242; raw[base + 1] = 242; raw[base + 2] = 247; // #F2F2F7
      }
    }
  }

  // Draw a white checkmark inside the circle
  const stroke = Math.max(2, size * 0.06);
  const pts = [
    [cx - r * 0.35, cy],
    [cx - r * 0.05, cy + r * 0.3],
    [cx + r * 0.38, cy - r * 0.28],
  ];
  for (let seg = 0; seg < pts.length - 1; seg++) {
    const [x0, y0] = pts[seg], [x1, y1] = pts[seg + 1];
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
    for (let t = 0; t <= steps; t++) {
      const px = x0 + (x1 - x0) * t / steps;
      const py = y0 + (y1 - y0) * t / steps;
      for (let sy = -stroke; sy <= stroke; sy++) {
        for (let sx = -stroke; sx <= stroke; sx++) {
          if (sx * sx + sy * sy > stroke * stroke) continue;
          const ix = Math.round(px + sx), iy = Math.round(py + sy);
          if (ix < 0 || iy < 0 || ix >= size || iy >= size) continue;
          const base = iy * rowSize + 1 + ix * 3;
          raw[base] = 255; raw[base + 1] = 255; raw[base + 2] = 255;
        }
      }
    }
  }

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public', { recursive: true });
writeFileSync('public/icon-192.png', makePNG(192));
writeFileSync('public/icon-512.png', makePNG(512));
console.log('✓ Icons generated: public/icon-192.png, public/icon-512.png');
