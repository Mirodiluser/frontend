'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Check, Coins, Feather, FileType, RefreshCw, Sparkles, X } from 'lucide-react';
import { GUIDE_CSS } from './guideStyles';
import { DEMOS } from './GuideDemos';

export type GuideTab = 'translit' | 'corrector' | 'converter';

interface Step {
  id: string;
  /** Qaysi data-guide elementi yoritiladi (yoʻq boʻlsa, markazda koʻrsatiladi) */
  target?: string;
  /** Qoʻllanma shu qadamga oʻtganda ochiladigan tab */
  tab?: GuideTab;
  icon: LucideIcon;
  title: string;
  text: string;
  bullets?: string[];
}

export const GUIDE_STEPS: Step[] = [
  {
    id: 'welcome',
    icon: Feather,
    title: 'Tahrir.AI ga xush kelibsiz',
    text: 'Bu qisqa qoʻllanma sayt imkoniyatlarini bosqichma-bosqich koʻrsatadi. Taxminan bir daqiqa vaqt oladi.',
  },
  {
    id: 'tabs',
    target: 'tabs',
    icon: Sparkles,
    title: 'Uchta asosiy boʻlim',
    text: 'Kerakli vositani shu yerdagi tablar orqali tanlaysiz.',
    bullets: [
      'Kirill ↔ Latin: matnni bir zumda oʻgirish',
      'Imlo Tahrirchi: Word hujjatidagi xatolarni belgilash',
      'Fayl Konverter: fayllarni boshqa formatga oʻtkazish',
    ],
  },
  {
    id: 'translit',
    target: 'translit',
    tab: 'translit',
    icon: RefreshCw,
    title: 'Kirill ↔ Latin',
    text: 'Matnni qoʻyasiz, natija darhol chiqadi. Foydalanish cheksiz.',
    bullets: [
      'Tepadagi almashtirish tugmasi yoʻnalishni oʻzgartiradi: Kirill → Lotin yoki Lotin → Kirill',
      '“Buferdan qoʻyish” nusxalangan matnni bir bosishda joylaydi',
      '“Nusxa olish” tayyor natijani nusxalaydi',
    ],
  },
  {
    id: 'corrector',
    target: 'corrector',
    tab: 'corrector',
    icon: Sparkles,
    title: 'Imlo Tahrirchi',
    text: 'Dissertatsiya, maqola va referatingizdagi imlo xatolarini topadi.',
    bullets: [
      'Faqat Word (.DOCX) fayli qabul qilinadi',
      'Sahifalar soni avtomatik hisoblanadi: 1 sahifa = 1 tanga',
      'Xato soʻzlar hujjatda sariq rang bilan belgilanadi',
      'Hujjatning qolgan qismi oʻzgarmaydi, tayyor faylni yuklab olasiz',
    ],
  },
  {
    id: 'converter',
    target: 'converter',
    tab: 'converter',
    icon: FileType,
    title: 'Fayl Konverter',
    text: 'Faylni yuklang va qaysi formatga oʻgirishni tanlang.',
    bullets: [
      'DOCX, DOC, TXT, PDF, ODT, RTF, HTML va rasmlar (JPG, PNG, WebP) qabul qilinadi',
      'PDF → Word uchun ikki xil rejim bor',
      'Konvertatsiya bepul',
    ],
  },
  {
    id: 'account',
    target: 'account',
    icon: Coins,
    title: 'Hisob va tangalar',
    text: 'Imlo Tahrirchi tangalar bilan ishlaydi. Balans va doʻkon shu yerda.',
    bullets: [
      '“Kirish” orqali hisobingizga kirasiz yoki roʻyxatdan oʻtasiz',
      '“Doʻkon”da kerakli tanga miqdorini tanlab, kartaga aynan koʻrsatilgan summani oʻtkazasiz',
      'Toʻlov tasdiqlangach, tangalar balansingizga qoʻshiladi',
    ],
  },
  {
    id: 'done',
    target: 'guide-btn',
    icon: Check,
    title: 'Tayyor!',
    text: 'Qoʻllanmani istalgan payt shu tugma orqali qayta koʻrishingiz mumkin.',
  },
];

interface GuideTourProps {
  onClose: () => void;
  onTabChange: (tab: GuideTab) => void;
}

const PAD = 10;
const GAP = 18;
const EDGE = 16;
const BP_MOBILE = 640;
const N = GUIDE_STEPS.length;
const CHIPS = ['Kirill ↔ Latin', 'Imlo Tahrirchi', 'Fayl Konverter', 'Tangalar'];

/* ---------- pruzhina (semi-implicit Euler, kichik qadamlar bilan barqaror) ---------- */
interface Sp { p: number; v: number }
const mk = (p = 0): Sp => ({ p, v: 0 });
function spring(s: Sp, t: number, k: number, c: number, dt: number) {
  const n = Math.max(1, Math.ceil(dt / 0.008));
  const h = dt / n;
  for (let i = 0; i < n; i++) {
    s.v += (k * (t - s.p) - c * s.v) * h;
    s.p += s.v * h;
  }
}
function snap(s: Sp, t: number) { s.p = t; s.v = 0; }

/* ---------- kursor yoʻlboshchi nuqtalari ---------- */
type Pt = { x: number; y: number };
const q = (sel: string) => document.querySelector<HTMLElement>(sel);
const mid = (el: Element | null | undefined): Pt | null => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
};
const WAYPOINTS: Record<string, (() => Pt | null)[]> = {
  tabs: [0, 1, 2].map((i) => () => mid(document.querySelectorAll('[data-guide="tabs"] button')[i])),
  translit: [
    () => mid(q('[data-guide="translit"] button[title="Almashtirish"]')),
    () => mid(q('[data-guide="translit"] textarea')),
  ],
  corrector: [() => mid(q('[data-guide="corrector"] #fileInput')?.parentElement) ?? mid(q('[data-guide="corrector"]'))],
  converter: [
    () => mid(q('[data-guide="converter"] input[type="file"]')?.parentElement) ?? mid(q('[data-guide="converter"]')),
  ],
  account: [() => mid(q('[data-guide="account"] > :last-child')) ?? mid(q('[data-guide="account"]'))],
  done: [() => mid(q('[data-guide="guide-btn"]'))],
};

/* ---------- konfetti ---------- */
interface Part { x: number; y: number; vx: number; vy: number; r: number; vr: number; w: number; h: number; t: number; c: string; round: boolean }
const COLORS = ['#F7D8B5', '#E2B180', '#FFF3E3', '#C99562', '#fff', '#f5c542', '#d98a5a'];

function pad2(n: number) { return String(n).padStart(2, '0'); }

function Words({ text, base, step }: { text: string; base: number; step: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i} className="tg-w" style={{ ['--d' as string]: base + i * step } as React.CSSProperties}>
          {w + ' '}
        </span>
      ))}
    </>
  );
}

export default function GuideTour({ onClose, onTabChange }: GuideTourProps) {
  const [index, setIndex] = useState(0);
  const [on, setOn] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [ripple, setRipple] = useState(0);

  const holeRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const indexRef = useRef(0);
  const scrolledFor = useRef(-1);
  const closing = useRef(false);
  const busy = useRef(false);
  const reduced = useRef(false);
  const parts = useRef<Part[]>([]);
  const cur = useRef({ wi: 0, arrived: 0, startAt: 0 });
  const sp = useRef({
    x: mk(), y: mk(), w: mk(), h: mk(), r: mk(), ho: mk(),
    cx: mk(), cy: mk(), px: mk(), py: mk(), po: mk(),
    init: false,
  });

  const step = GUIDE_STEPS[index];
  const isLast = index === N - 1;
  const Demo = DEMOS[step.id];

  const dust = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const a = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        const b = (Math.sin(i * 78.233) * 12345.678) % 1;
        const r = Math.abs(a);
        const s = Math.abs(b);
        return {
          left: `${r * 100}%`,
          size: 2 + s * 4,
          dur: 11 + r * 14,
          delay: -s * 20,
          o: 0.25 + s * 0.5,
          dx: (a - 0.5) * 120,
        };
      }),
    [],
  );

  useEffect(() => {
    indexRef.current = index;
    cur.current = { wi: 0, arrived: 0, startAt: performance.now() };
    scrolledFor.current = -1;
    const tab = GUIDE_STEPS[index].tab;
    if (tab) onTabChange(tab);
    const id = window.setTimeout(() => (index === 0 ? ctaRef : nextRef).current?.focus({ preventScroll: true }), 120);
    return () => window.clearTimeout(id);
  }, [index, onTabChange]);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const finish = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setOn(false);
    onTabChange('translit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(onClose, 650);
  }, [onClose, onTabChange]);

  const go = useCallback((to: number) => {
    if (busy.current || closing.current || to < 0 || to >= N || to === indexRef.current) return;
    busy.current = true;
    setLeaving(true);
    window.setTimeout(() => {
      setIndex(to);
      setLeaving(false);
      busy.current = false;
    }, reduced.current ? 0 : 230);
  }, []);

  const next = useCallback(() => {
    if (indexRef.current >= N - 1) finish();
    else go(indexRef.current + 1);
  }, [finish, go]);
  const back = useCallback(() => go(indexRef.current - 1), [go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); finish(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish, next, back]);

  // Konfetti: yakuniy qadamda
  useEffect(() => {
    if (!isLast || reduced.current) return;
    const fire = (ox: number, oy: number, n: number, spread: number, power: number) => {
      for (let i = 0; i < n; i++) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * spread;
        const v = power * (0.45 + Math.random() * 0.75);
        parts.current.push({
          x: ox, y: oy, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v,
          r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 14,
          w: 5 + Math.random() * 6, h: 3 + Math.random() * 5, t: 0,
          c: COLORS[(Math.random() * COLORS.length) | 0], round: Math.random() < 0.3,
        });
      }
    };
    const t1 = window.setTimeout(() => {
      const r = cardRef.current?.getBoundingClientRect();
      if (r) fire(r.left + r.width / 2, r.top + 40, 90, 2.4, 900);
    }, 450);
    const t2 = window.setTimeout(() => {
      const p = mid(q('[data-guide="guide-btn"]'));
      if (p) fire(p.x, p.y, 70, 3.6, 640);
    }, 850);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [isLast]);

  // Asosiy sikl: pruzhinalar, kursor, konfetti
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const S = sp.current;

    const loop = (now: number) => {
      const dt = Math.min(0.034, (now - last) / 1000);
      last = now;
      const rm = reduced.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < BP_MOBILE;
      const idx = indexRef.current;
      const s = GUIDE_STEPS[idx];

      let hole = { x: vw / 2, y: vh / 2, w: 0, h: 0, r: 0 };
      let ho = 0;
      let found: Element | null = null;
      if (s.target) {
        const el = q(`[data-guide="${s.target}"]`);
        if (el) {
          const rc = el.getBoundingClientRect();
          if (rc.width > 0 && rc.height > 0) {
            found = el;
            const br = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
            hole = { x: rc.left - PAD, y: rc.top - PAD, w: rc.width + PAD * 2, h: rc.height + PAD * 2, r: Math.min(32, br + PAD) };
            ho = 1;
          }
        }
      }

      if (found && scrolledFor.current !== idx) {
        scrolledFor.current = idx;
        const rc = found.getBoundingClientRect();
        const inHeader = !!found.closest('header');
        const top = inHeader ? 0 : Math.max(0, window.scrollY + rc.top - (mobile ? 96 : 104));
        if (Math.abs(top - window.scrollY) > 4) window.scrollTo({ top, behavior: rm ? 'auto' : 'smooth' });
      }

      const card = cardRef.current;
      const cw = card ? card.offsetWidth : 0;
      const ch = card ? card.offsetHeight : 0;
      let cx: number;
      let cy: number;
      if (!found || !card) {
        cx = (vw - cw) / 2;
        cy = (vh - ch) / 2;
      } else if (mobile) {
        cx = (vw - cw) / 2;
        cy = vh - ch - 12;
      } else {
        cx = Math.min(Math.max(hole.x + hole.w / 2 - cw / 2, EDGE), vw - cw - EDGE);
        const below = hole.y + hole.h + GAP;
        const above = hole.y - GAP - ch;
        if (below + ch <= vh - EDGE) cy = below;
        else if (above >= EDGE) cy = above;
        else cy = vh - ch - 24;
      }

      if (!S.init) {
        S.init = true;
        snap(S.x, vw / 2); snap(S.y, vh / 2); snap(S.w, 0); snap(S.h, 0); snap(S.r, 0);
        snap(S.cx, cx); snap(S.cy, cy + 24); snap(S.px, vw * 0.62); snap(S.py, vh * 0.7);
      }

      // Kursor nishoni
      const wps = WAYPOINTS[s.id];
      let cp: Pt | null = null;
      if (wps && now - cur.current.startAt > 700) cp = wps[cur.current.wi % wps.length]?.() ?? null;
      const cu = cur.current;
      if (cp && cursorRef.current) {
        const dx = cp.x - S.px.p;
        const dy = cp.y - S.py.p;
        if (Math.hypot(dx, dy) < 5 && Math.abs(S.px.v) + Math.abs(S.py.v) < 40) {
          if (!cu.arrived) {
            cu.arrived = now;
            const el = cursorRef.current;
            el.classList.add('tg-press');
            window.setTimeout(() => el.classList.remove('tg-press'), 170);
            setRipple((v) => v + 1);
          } else if (now - cu.arrived > 1500) {
            cu.wi += 1;
            cu.arrived = 0;
          }
        }
      }

      const set = (sv: Sp, t: number, k: number, c: number) => (rm ? snap(sv, t) : spring(sv, t, k, c, dt));
      set(S.x, hole.x, 170, 22);
      set(S.y, hole.y, 170, 22);
      set(S.w, hole.w, 170, 22);
      set(S.h, hole.h, 170, 22);
      set(S.r, hole.r, 170, 22);
      set(S.ho, ho, 90, 18);
      set(S.cx, cx, 150, 20);
      set(S.cy, cy, 150, 20);
      if (cp) { set(S.px, cp.x, 120, 17); set(S.py, cp.y, 120, 17); }
      set(S.po, cp ? 1 : 0, 80, 16);

      const w = Math.max(0, S.w.p);
      const h = Math.max(0, S.h.p);
      const r = Math.max(0, Math.min(S.r.p, w / 2, h / 2));
      if (blurRef.current) {
        const d =
          `M0 0H${vw}V${vh}H0Z` +
          `M${S.x.p + r} ${S.y.p}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}` +
          `a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}` +
          `v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
        blurRef.current.style.clipPath = `path(evenodd, "${d}")`;
      }
      if (holeRef.current) {
        const hs = holeRef.current.style;
        hs.width = `${w}px`;
        hs.height = `${h}px`;
        hs.borderRadius = `${r}px`;
        hs.transform = `translate3d(${S.x.p}px, ${S.y.p}px, 0)`;
        hs.opacity = String(Math.min(1, Math.max(0, S.ho.p)));
      }
      if (card) {
        card.style.transform = `translate3d(${S.cx.p}px, ${S.cy.p}px, 0)`;
        card.style.width = mobile ? `${vw - 24}px` : '';
      }
      if (cursorRef.current) {
        const cs = cursorRef.current.style;
        cs.transform = `translate3d(${S.px.p}px, ${S.py.p}px, 0)`;
        cs.opacity = String(Math.min(1, Math.max(0, S.po.p)));
      }

      // Konfetti
      const cv = canvasRef.current;
      if (cv) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        if (cv.width !== Math.round(vw * dpr) || cv.height !== Math.round(vh * dpr)) {
          cv.width = Math.round(vw * dpr);
          cv.height = Math.round(vh * dpr);
        }
        const g = cv.getContext('2d');
        if (g) {
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          g.clearRect(0, 0, vw, vh);
          const ps = parts.current;
          for (let i = ps.length - 1; i >= 0; i--) {
            const p = ps[i];
            p.t += dt;
            p.vy += 1100 * dt;
            p.vx *= 1 - 1.4 * dt;
            p.vy *= 1 - 0.6 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.r += p.vr * dt;
            if (p.y > vh + 30 || p.t > 4.2) { ps.splice(i, 1); continue; }
            g.save();
            g.globalAlpha = Math.max(0, Math.min(1, (4.2 - p.t) * 1.2));
            g.translate(p.x, p.y);
            g.rotate(p.r);
            g.scale(1, Math.cos(p.t * 9 + p.r));
            g.fillStyle = p.c;
            if (p.round) { g.beginPath(); g.arc(0, 0, p.w / 2, 0, 6.283); g.fill(); }
            else g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            g.restore();
          }
        }
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Karta: 3D qiyalik va yorugʻlik izi
  const onGlassMove = (e: React.MouseEvent) => {
    const g = glassRef.current;
    if (!g || reduced.current) return;
    const r = g.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    g.style.setProperty('--ry', `${(px - 0.5) * 6}deg`);
    g.style.setProperty('--rx', `${-(py - 0.5) * 6}deg`);
    g.style.setProperty('--mx', `${px * 100}%`);
    g.style.setProperty('--my', `${py * 100}%`);
  };
  const onGlassLeave = () => {
    const g = glassRef.current;
    if (!g) return;
    g.style.setProperty('--ry', '0deg');
    g.style.setProperty('--rx', '0deg');
  };
  // Magnit effektli tugma
  const onMag = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reduced.current) return;
    const b = e.currentTarget;
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.16}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
  };
  const onMagOut = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = ''; };

  const cursorPos = useMemo(() => ripple, [ripple]);

  return (
    <div className={`tg-root${on ? ' tg-on' : ''}`} role="presentation" data-testid="guide-root">
      <style>{GUIDE_CSS}</style>
      <div className="tg-block" onClick={(e) => e.stopPropagation()} />
      <div ref={blurRef} className="tg-blur">
        <div className="tg-blob b1" />
        <div className="tg-blob b2" />
        <div className="tg-blob b3" />
      </div>
      <div className="tg-dust" aria-hidden="true">
        {dust.map((d, i) => (
          <i
            key={i}
            style={{
              left: d.left, width: d.size, height: d.size, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s`,
              ['--o' as string]: d.o, ['--dx' as string]: `${d.dx}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Yoritilgan joy: porlash, aylanuvchi halqa, skaner, toʻlqin */}
      <div ref={holeRef} className="tg-hole" aria-hidden="true">
        <div className="tg-glow" />
        <div className="tg-ring" />
        <div key={`s${index}`} className="tg-scan" />
        <div key={`w${index}`} className="tg-wave" />
      </div>

      {index === 0 ? (
        <div key="hero" className={`tg-hero-wrap${leaving ? ' tg-out' : ''}`} style={{ position: 'absolute', inset: 0 }}>
          <div ref={cardRef} className="tg-hero" role="dialog" aria-modal="true" aria-labelledby="tg-title" tabIndex={-1}>
            <div className="tg-hb hb1" />
            <div className="tg-hb hb2" />
            <button className="tg-x" onClick={finish} aria-label="Yopish" type="button"><X size={16} /></button>
            <div style={{ position: 'relative' }}>
              <div className="tg-mark" aria-hidden="true">
                <span className="pr" /><span className="pr" /><span className="pr" />
                <div className="core"><div><Feather size={34} color="#F2C99A" strokeWidth={1.7} /></div></div>
              </div>
              <h2 id="tg-title" className="tg-title" aria-label="Tahrir.AI">
                {Array.from('TAHRIR').map((c, i) => (
                  <span key={i} className="ch" style={{ ['--i' as string]: i } as React.CSSProperties}>{c}</span>
                ))}
                <span className="ch">.</span>
                {Array.from('AI').map((c, i) => (
                  <span key={i} className="ai" style={{ ['--i' as string]: i + 7 } as React.CSSProperties}>{c}</span>
                ))}
              </h2>
              <p className="tg-sub">Qisqa qoʻllanma: saytning barcha imkoniyatlari bir daqiqada. Har bir boʻlimni jonli koʻrsatamiz.</p>
              <div className="tg-chips">
                {CHIPS.map((c, i) => (
                  <span key={c} className="tg-chip" style={{ ['--i' as string]: i } as React.CSSProperties}>
                    <Sparkles size={12} color="#E2B180" /> {c}
                  </span>
                ))}
              </div>
              <div className="tg-cta">
                <button ref={ctaRef} className="tg-btn tg-next tg-big" onClick={next} type="button" onMouseMove={onMag} onMouseLeave={onMagOut}>
                  Boshlash <ArrowRight size={17} strokeWidth={2.4} />
                </button>
                <div><button className="tg-btn tg-skip" onClick={finish} type="button" style={{ marginTop: 6 }}>Oʻtkazib yuborish</button></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div key="card" ref={cardRef} className="tg-card" role="dialog" aria-modal="true" aria-labelledby="tg-title" tabIndex={-1}>
          <div ref={glassRef} className="tg-glass" onMouseMove={onGlassMove} onMouseLeave={onGlassLeave}>
            <button className="tg-x" onClick={finish} aria-label="Yopish" type="button"><X size={16} /></button>
            <div className="tg-stage" key={`st${step.id}`}>
              <span className="tg-ghost" aria-hidden="true">{pad2(index)}</span>
              {Demo && <Demo />}
            </div>
            <div className={`tg-body${leaving ? ' tg-out' : ''}`}>
              <div key={step.id}>
                <div className="tg-kicker">Qoʻllanma · {pad2(index)} / {pad2(N - 1)}</div>
                <h3 id="tg-title" className="tg-h"><Words text={step.title} base={40} step={60} /></h3>
                <p className="tg-p" aria-live="polite"><Words text={step.text} base={200} step={22} /></p>
                {step.bullets && (
                  <ul className="tg-ul">
                    {step.bullets.map((b, i) => (
                      <li key={b} className="tg-li" style={{ animationDelay: `${480 + i * 130}ms` }}>
                        <span className="tg-tick"><Check size={10} color="#1a0f08" strokeWidth={3.4} /></span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="tg-seg" aria-hidden="true">
                {GUIDE_STEPS.slice(1).map((s, i) => <i key={s.id} className={i < index ? 'on' : ''} />)}
              </div>
              <div className="tg-foot">
                <button className="tg-btn tg-skip" onClick={finish} type="button">{isLast ? 'Yopish' : 'Oʻtkazib yuborish'}</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="tg-btn tg-back" onClick={back} disabled={index <= 1} type="button">Orqaga</button>
                  <button ref={nextRef} className="tg-btn tg-next" onClick={next} type="button" onMouseMove={onMag} onMouseLeave={onMagOut}>
                    {isLast ? 'Tugatish' : 'Keyingisi'}
                    {!isLast && <ArrowRight size={15} strokeWidth={2.4} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtual kursor */}
      <div ref={cursorRef} className="tg-cursor" aria-hidden="true">
        <svg width="26" height="30" viewBox="0 0 26 30" fill="none">
          <path d="M3 2 L3 23 L8.6 18 L12.4 27 L16 25.4 L12.3 16.7 L20 16.4 Z" fill="#FFF8EF" stroke="#2a1a10" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        {ripple > 0 && <span key={cursorPos} className="tg-ripple" style={{ left: -14, top: -14 }} />}
      </div>

      <canvas ref={canvasRef} className="tg-confetti" aria-hidden="true" />
    </div>
  );
}
