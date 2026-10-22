'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { Check, Coins, FileText, FileType, RefreshCw, Sparkles } from 'lucide-react';

/** Qadamlar uchun kichik jonli sahnalar (stage). Hammasi CSS + yengil React. */

export function TabsDemo() {
  const tabs: [typeof RefreshCw, string][] = [
    [RefreshCw, 'Kirill ↔ Latin'],
    [Sparkles, 'Imlo'],
    [FileType, 'Konverter'],
  ];
  return (
    <div className="tg-d-tabs" aria-hidden="true">
      <div className="tg-d-pill" />
      {tabs.map(([Icon, label], i) => (
        <div key={label} className="tg-d-tab" style={{ animationDelay: `${[0, 0, 0][i]}s` }}>
          <Icon size={17} strokeWidth={2} />
          {label}
        </div>
      ))}
    </div>
  );
}

const PAIRS: [string, string][] = [
  ['Салом, дунё!', 'Salom, dunyo!'],
  ['Ватан', 'Vatan'],
  ['Китоб', 'Kitob'],
];

export function TranslitDemo() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setN((v) => v + 1), 2300);
    return () => window.clearInterval(id);
  }, []);
  const pair = PAIRS[Math.floor(n / 2) % PAIRS.length];
  const latin = n % 2 === 1;
  const text = latin ? pair[1] : pair[0];
  return (
    <div className="tg-d-tr" aria-hidden="true">
      <div className="tg-d-tag">
        <span style={{ opacity: latin ? 0.45 : 1 }}>{latin ? 'KIRILL' : ''}</span>
        <b>{latin ? 'LOTIN' : 'KIRILL'}</b>
      </div>
      <div className="tg-d-text" key={n}>
        {Array.from(text).map((c, i) => (
          <span key={i} className="tg-d-ch" style={{ animationDelay: `${i * 38}ms`, whiteSpace: 'pre' }}>
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CorrectorDemo() {
  return (
    <div style={{ position: 'relative' }} aria-hidden="true">
      <div className="tg-d-doc">
        <div className="tg-d-sk" style={{ width: '92%' }} />
        <div className="tg-d-sk" style={{ width: '70%' }} />
        <div className="tg-d-txt">
          Men kecha <span className="tg-d-wr">maktbga</span> bordim va{' '}
          <span className="tg-d-wr w2">kitobb</span> oldim.
        </div>
        <div className="tg-d-sk" style={{ width: '58%' }} />
      </div>
      <div className="tg-d-badge">
        <Check size={13} strokeWidth={3} /> 2 xato belgilandi
      </div>
    </div>
  );
}

const FORMATS = ['PDF', 'TXT', 'HTML', 'JPG'];

export function ConverterDemo() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setN((v) => v + 1), 1500);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="tg-d-conv" aria-hidden="true">
      <div className="tg-d-file">
        <FileText size={22} />
        DOCX
      </div>
      <div className="tg-d-flow">
        <i />
        <i />
        <i />
      </div>
      <div className="tg-d-file fl" key={n}>
        <FileType size={22} />
        {FORMATS[n % FORMATS.length]}
      </div>
    </div>
  );
}

export function CoinsDemo() {
  const numRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      const t = (now % 3600) / 3600;
      const p = Math.min(1, t / 0.5);
      const e = 1 - Math.pow(1 - p, 3);
      if (numRef.current) numRef.current.firstChild!.textContent = `+${Math.round(15 * e)}`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="tg-d-coins" aria-hidden="true" style={{ position: 'relative' }}>
      {[0, 0.5, 1].map((d, i) => (
        <span key={i} className="tg-d-drop" style={{ left: 18 + i * 18, animationDelay: `${d}s` }} />
      ))}
      <div className="tg-d-coin">
        <Coins size={28} strokeWidth={2.2} />
      </div>
      <div className="tg-d-num" ref={numRef}>
        <span>+0</span>
        <small>TANGA</small>
      </div>
    </div>
  );
}

export function DoneDemo() {
  return (
    <div className="tg-d-done" aria-hidden="true">
      <svg width="92" height="92" viewBox="0 0 100 100" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle className="r" cx="50" cy="50" r="42" stroke="rgba(247,216,181,.5)" strokeWidth="1.5" />
        <circle className="c" cx="50" cy="50" r="38" stroke="#E2B180" strokeWidth="4" transform="rotate(-90 50 50)" />
        <path className="k" d="M32 52 L45 65 L69 38" stroke="#FFF3E3" strokeWidth="6" />
      </svg>
    </div>
  );
}

export const DEMOS: Record<string, () => ReactElement> = {
  tabs: TabsDemo,
  translit: TranslitDemo,
  corrector: CorrectorDemo,
  converter: ConverterDemo,
  account: CoinsDemo,
  done: DoneDemo,
};
