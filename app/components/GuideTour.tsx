'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BookOpen,
  Coins,
  FileType,
  PartyPopper,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';

export type GuideTab = 'translit' | 'corrector' | 'converter';

interface Step {
  id: string;
  /** Qaysi data-guide elementi yoritiladi (yoʻq bo'lsa, markazda ko'rsatiladi) */
  target?: string;
  /** Qoʻllanma shu qadamga o'tganda ochiladigan tab */
  tab?: GuideTab;
  icon: LucideIcon;
  title: string;
  text: string;
  bullets?: string[];
}

export const GUIDE_STEPS: Step[] = [
  {
    id: 'welcome',
    icon: BookOpen,
    title: 'Tahrir.AI ga xush kelibsiz',
    text: 'Bu qisqa qoʻllanma sayt imkoniyatlarini bosqichma-bosqich koʻrsatadi. Taxminan bir daqiqa vaqt oladi.',
    bullets: [
      'Har bir boʻlim alohida tushuntiriladi',
      '“Keyingisi” tugmasi yoki klaviaturadagi → bilan davom eting',
      'Istalgan payt “Oʻtkazib yuborish” mumkin',
    ],
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
    icon: PartyPopper,
    title: 'Tayyor!',
    text: 'Qoʻllanmani istalgan payt shu tugma orqali qayta koʻrishingiz mumkin.',
  },
];

interface GuideTourProps {
  onClose: () => void;
  onTabChange: (tab: GuideTab) => void;
}

const PAD = 10; // yoritilgan elementdan tashqaridagi boʻsh joy
const GAP = 18; // yoritilgan element va kartochka orasidagi masofa
const EDGE = 16; // ekran chetidan minimal masofa
const BP_MOBILE = 640;

const STYLES = `
.tg-root{position:fixed;inset:0;z-index:120;opacity:0;transition:opacity .45s ease}
.tg-root.tg-on{opacity:1}
.tg-block{position:absolute;inset:0}
.tg-blur{position:absolute;inset:0;pointer-events:none;background:rgba(8,5,3,.58);
  -webkit-backdrop-filter:blur(7px) saturate(.85);backdrop-filter:blur(7px) saturate(.85)}
.tg-ring{position:absolute;left:0;top:0;pointer-events:none;box-sizing:border-box;
  border:1.5px solid rgba(226,177,128,.85);transition:opacity .35s ease;opacity:0;
  animation:tg-pulse 2.4s ease-in-out infinite}
@keyframes tg-pulse{
  0%,100%{box-shadow:0 0 0 0 rgba(212,163,115,.35),0 0 28px rgba(212,163,115,.25)}
  50%{box-shadow:0 0 0 7px rgba(212,163,115,0),0 0 44px rgba(212,163,115,.4)}}
.tg-card{position:absolute;left:0;top:0;box-sizing:border-box;width:min(92vw,392px);
  background:linear-gradient(160deg,rgba(28,19,14,.97),rgba(14,9,7,.97));
  border:1px solid rgba(212,163,115,.38);border-radius:22px;padding:20px 20px 16px;color:#FBF5F0;
  box-shadow:0 30px 70px rgba(0,0,0,.65),0 0 0 1px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,235,210,.06);
  font-family:inherit;text-align:left;will-change:transform}
.tg-card:focus{outline:none}
.tg-step{animation:tg-in .5s cubic-bezier(.22,.8,.3,1) both}
@keyframes tg-in{from{opacity:0;transform:translateY(12px);filter:blur(8px)}to{opacity:1;transform:none;filter:blur(0)}}
.tg-li{opacity:0;animation:tg-li .45s cubic-bezier(.22,.8,.3,1) forwards}
@keyframes tg-li{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
.tg-icon{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,rgba(226,177,128,.22),rgba(140,98,57,.18));
  border:1px solid rgba(212,163,115,.4);animation:tg-float 3.2s ease-in-out infinite}
@keyframes tg-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.tg-dot{height:6px;border-radius:99px;background:rgba(212,163,115,.28);width:6px;
  transition:width .4s cubic-bezier(.22,.8,.3,1),background .3s ease}
.tg-dot.tg-act{width:22px;background:linear-gradient(90deg,#E2B180,#BA8A59)}
.tg-btn{cursor:pointer;border:none;font:inherit;font-size:13px;font-weight:700;border-radius:12px;
  padding:9px 16px;transition:transform .2s ease,box-shadow .2s ease,opacity .2s ease,background .2s ease}
.tg-btn:active{transform:scale(.97)}
.tg-next{display:inline-flex;align-items:center;gap:7px;color:#0A0706;
  background:linear-gradient(90deg,#D4A373,#BA8A59 55%,#8C6239);box-shadow:0 6px 20px rgba(212,163,115,.25)}
.tg-next:hover{box-shadow:0 8px 26px rgba(212,163,115,.42)}
.tg-next:focus-visible,.tg-back:focus-visible,.tg-skip:focus-visible,.tg-x:focus-visible{outline:2px solid #E2B180;outline-offset:2px}
.tg-back{background:rgba(255,255,255,.06);color:#E8D9C8;border:1px solid rgba(212,163,115,.22)}
.tg-back:hover:not(:disabled){background:rgba(255,255,255,.1)}
.tg-back:disabled{opacity:.35;cursor:default}
.tg-skip{background:none;color:#A89485;font-weight:600;padding:9px 4px}
.tg-skip:hover{color:#E0A96D}
.tg-x{position:absolute;right:12px;top:12px;width:30px;height:30px;border-radius:10px;border:none;cursor:pointer;
  background:transparent;color:#8C7A6B;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s}
.tg-x:hover{background:rgba(255,255,255,.08);color:#E0A96D}
@media (prefers-reduced-motion:reduce){
  .tg-root{transition:none}.tg-step,.tg-li,.tg-icon,.tg-ring{animation:none!important}
  .tg-li{opacity:1}.tg-dot{transition:none}}
`;

interface Anim {
  x: number; y: number; w: number; h: number; r: number; ring: number;
  cx: number; cy: number;
}

export default function GuideTour({ onClose, onTabChange }: GuideTourProps) {
  const [index, setIndex] = useState(0);
  const [on, setOn] = useState(false);

  const blurRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const anim = useRef<Anim | null>(null);
  const indexRef = useRef(0);
  const scrolledFor = useRef(-1);
  const closing = useRef(false);

  const step = GUIDE_STEPS[index];
  const isLast = index === GUIDE_STEPS.length - 1;

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Ochilganda yumshoq paydo boʻladi
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Qadamga mos tabni ochamiz
  useEffect(() => {
    const tab = GUIDE_STEPS[index].tab;
    if (tab) onTabChange(tab);
    scrolledFor.current = -1;
    const id = window.setTimeout(() => nextRef.current?.focus({ preventScroll: true }), 80);
    return () => window.clearTimeout(id);
  }, [index, onTabChange]);

  const finish = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setOn(false);
    onTabChange('translit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(onClose, 420);
  }, [onClose, onTabChange]);

  const next = useCallback(() => {
    if (indexRef.current >= GUIDE_STEPS.length - 1) finish();
    else setIndex((i) => Math.min(GUIDE_STEPS.length - 1, i + 1));
  }, [finish]);

  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // Klaviatura
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); finish(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish, next, back]);

  // Asosiy animatsiya sikli: yoritilgan joy va kartochka silliq harakatlanadi
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < BP_MOBILE;
      const s = GUIDE_STEPS[indexRef.current];

      let hole = { x: vw / 2, y: vh / 2, w: 0, h: 0, r: 0 };
      let ring = 0;
      let found: Element | null = null;
      if (s.target) {
        const el = document.querySelector(`[data-guide="${s.target}"]`);
        if (el) {
          const rc = el.getBoundingClientRect();
          if (rc.width > 0 && rc.height > 0) {
            found = el;
            const br = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
            hole = {
              x: rc.left - PAD, y: rc.top - PAD,
              w: rc.width + PAD * 2, h: rc.height + PAD * 2,
              r: Math.min(30, br + PAD),
            };
            ring = 1;
          }
        }
      }

      // Nishon topilgach, qadam uchun bir marta silliq aylantiramiz
      if (found && scrolledFor.current !== indexRef.current) {
        scrolledFor.current = indexRef.current;
        const rc = found.getBoundingClientRect();
        const inHeader = !!found.closest('header');
        const top = inHeader ? 0 : Math.max(0, window.scrollY + rc.top - (mobile ? 96 : 104));
        if (Math.abs(top - window.scrollY) > 4) {
          window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
        }
      }

      const card = cardRef.current;
      const cw = card ? card.offsetWidth : 0;
      const ch = card ? card.offsetHeight : 0;
      let cx: number;
      let cy: number;
      if (!found) {
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

      let a = anim.current;
      if (!a) {
        a = anim.current = { x: vw / 2, y: vh / 2, w: 0, h: 0, r: 0, ring: 0, cx: (vw - cw) / 2, cy: (vh - ch) / 2 };
      }
      const k = reduced ? 1 : 1 - Math.exp(-dt * 7.5);
      a.x += (hole.x - a.x) * k;
      a.y += (hole.y - a.y) * k;
      a.w += (hole.w - a.w) * k;
      a.h += (hole.h - a.h) * k;
      a.r += (hole.r - a.r) * k;
      a.ring += (ring - a.ring) * (reduced ? 1 : 1 - Math.exp(-dt * 6));
      a.cx += (cx - a.cx) * (reduced ? 1 : 1 - Math.exp(-dt * 6));
      a.cy += (cy - a.cy) * (reduced ? 1 : 1 - Math.exp(-dt * 6));

      const w = Math.max(0, a.w);
      const h = Math.max(0, a.h);
      const r = Math.max(0, Math.min(a.r, w / 2, h / 2));
      if (blurRef.current) {
        const d =
          `M0 0H${vw}V${vh}H0Z` +
          `M${a.x + r} ${a.y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}` +
          `a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}` +
          `v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
        blurRef.current.style.clipPath = `path(evenodd, "${d}")`;
      }
      if (ringRef.current) {
        const rs = ringRef.current.style;
        rs.width = `${w}px`;
        rs.height = `${h}px`;
        rs.borderRadius = `${r}px`;
        rs.transform = `translate3d(${a.x}px, ${a.y}px, 0)`;
        rs.opacity = String(Math.min(1, Math.max(0, a.ring)));
      }
      if (card) {
        card.style.transform = `translate3d(${a.cx}px, ${a.cy}px, 0)`;
        if (mobile) card.style.width = `${vw - 24}px`;
        else card.style.width = '';
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`tg-root${on ? ' tg-on' : ''}`} role="presentation" data-testid="guide-root">
      <style>{STYLES}</style>
      <div className="tg-block" onClick={(e) => e.stopPropagation()} />
      <div ref={blurRef} className="tg-blur" />
      <div ref={ringRef} className="tg-ring" />

      <div
        ref={cardRef}
        className="tg-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tg-title"
        tabIndex={-1}
      >
        <button className="tg-x" onClick={finish} aria-label="Yopish" type="button">
          <X size={16} />
        </button>

        <div key={step.id} className="tg-step">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 26 }}>
            <div className="tg-icon">
              <step.icon size={21} color="#E2B180" strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '.08em', color: '#A89485', fontWeight: 700 }}>
                QOʻLLANMA · {index + 1} / {GUIDE_STEPS.length}
              </div>
              <h3 id="tg-title" style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: '#FBF5F0', lineHeight: 1.25 }}>
                {step.title}
              </h3>
            </div>
          </div>

          <p style={{ margin: '14px 0 0', fontSize: 13.5, lineHeight: 1.6, color: '#E4D6C7' }} aria-live="polite">
            {step.text}
          </p>

          {step.bullets && (
            <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {step.bullets.map((b, i) => (
                <li
                  key={b}
                  className="tg-li"
                  style={{ display: 'flex', gap: 9, fontSize: 12.5, lineHeight: 1.5, color: '#CDB8A5', animationDelay: `${140 + i * 90}ms` }}
                >
                  <span style={{ marginTop: 6, width: 5, height: 5, borderRadius: 99, background: '#D4A373', flex: '0 0 auto' }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, margin: '18px 0 14px' }} aria-hidden="true">
          {GUIDE_STEPS.map((s, i) => (
            <span key={s.id} className={`tg-dot${i === index ? ' tg-act' : ''}`} />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <button className="tg-btn tg-skip" onClick={finish} type="button">
            {isLast ? 'Yopish' : 'Oʻtkazib yuborish'}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="tg-btn tg-back" onClick={back} disabled={index === 0} type="button">
              Orqaga
            </button>
            <button ref={nextRef} className="tg-btn tg-next" onClick={next} type="button">
              {isLast ? 'Tugatish' : 'Keyingisi'}
              {!isLast && <ArrowRight size={15} strokeWidth={2.4} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

