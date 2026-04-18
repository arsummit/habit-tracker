import { useEffect, useRef } from 'react';

const COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#AF52DE', '#FF2D55', '#00C7BE'];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  w: number; h: number;
  rotation: number;
  rotV: number;
  opacity: number;
}

export default function Confetti({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const startRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Burst origin: center-ish, slightly above middle
    const ox = canvas.width / 2;
    const oy = canvas.height * 0.55;

    const particles: Particle[] = Array.from({ length: 160 }, () => {
      const angle = (Math.random() * Math.PI * 1.6) - Math.PI * 1.3; // wide upward spread
      const speed = 5 + Math.random() * 20;
      return {
        x: ox + (Math.random() - 0.5) * 60,
        y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        w: 7 + Math.random() * 7,
        h: 4 + Math.random() * 4,
        rotation: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.3,
        opacity: 1,
      };
    });

    const DURATION = 2500;
    const GRAVITY = 0.45;
    const DRAG = 0.985;

    const draw = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = elapsed / DURATION;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = 0;
      particles.forEach(p => {
        p.vy += GRAVITY;
        p.vx *= DRAG;
        p.vy *= DRAG;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotV;
        p.opacity = Math.max(0, 1 - Math.max(0, progress - 0.6) * 2.5);

        if (p.opacity <= 0 || p.y > canvas.height + 20) return;
        alive++;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        // Alternate rect and circle
        if (p.h / p.w > 0.7) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });

      if (elapsed < DURATION && alive > 0) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        onDone();
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none' }}
    />
  );
}
