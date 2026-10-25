'use client';

import { useEffect, useRef } from 'react';

type Mote = { x: number; y: number; r: number; vy: number; vx: number; phase: number; speed: number };

const BOKEH = [
  { x: '8%', y: '14%', s: 150, d: 17, o: 0.55 }, { x: '78%', y: '10%', s: 220, d: 23, o: 0.5 },
  { x: '90%', y: '52%', s: 120, d: 19, o: 0.5 }, { x: '3%', y: '58%', s: 190, d: 26, o: 0.45 },
  { x: '44%', y: '70%', s: 260, d: 21, o: 0.4 }, { x: '62%', y: '36%', s: 90, d: 15, o: 0.55 },
];

// Jonli fon: yumshoq nur dogʻlari, quyosh nurlari va suzib yuruvchi oltin changlar.
// Faqat koʻrinib turganda chizadi va "harakatni kamaytirish" sozlamasini hurmat qiladi.
export default function Ambient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let motes: Mote[] = [];
    let raf = 0;
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(18, Math.min(56, Math.round((width * height) / 30000)));
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.8 + Math.random() * 2.4,
        vy: -(0.08 + Math.random() * 0.22),
        vx: (Math.random() - 0.5) * 0.14,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.9,
      }));
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const m of motes) {
        if (!reduce) {
          m.x += m.vx + Math.sin(time / 2600 + m.phase) * 0.12;
          m.y += m.vy;
          if (m.y < -10) { m.y = height + 10; m.x = Math.random() * width; }
          if (m.x < -10) m.x = width + 10;
          if (m.x > width + 10) m.x = -10;
        }
        const twinkle = 0.45 + 0.55 * Math.sin(time / 1000 * m.speed + m.phase);
        const alpha = 0.85 * twinkle;
        const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 5);
        glow.addColorStop(0, `rgba(255,230,160,${alpha})`);
        glow.addColorStop(0.45, `rgba(240,190,95,${alpha * 0.35})`);
        glow.addColorStop(1, 'rgba(240,190,95,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (time: number) => {
      if (visible) draw(time);
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduce) draw(0);
    else raf = requestAnimationFrame(loop);
    const onVisibility = () => { visible = document.visibilityState === 'visible'; };
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    // Kursor boʻylab panellarda yorugʻlik dogʻi
    const onMove = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const panel = target?.closest?.('.tahrir-panel, .tahrir-tabs') as HTMLElement | null;
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      panel.style.setProperty('--my', `${event.clientY - rect.top}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div aria-hidden className="tahrir-ambient fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="tahrir-paper" />
      <div className="tahrir-aurora tahrir-aurora-a" />
      <div className="tahrir-aurora tahrir-aurora-b" />
      <div className="tahrir-aurora tahrir-aurora-c" />
      {BOKEH.map((b, i) => (
        <div key={i} className="tahrir-bokeh" style={{ left: b.x, top: b.y, width: b.s, height: b.s, ['--d' as string]: `${b.d}s`, ['--o' as string]: b.o }} />
      ))}
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="tahrir-vignette" />
    </div>
  );
}
