'use client';

import { useEffect } from 'react';
import { Feather } from 'lucide-react';

/**
 * Honey Bronze Luxe — atmospheric metallic edges, with no photo, canvas
 * particles, white fog or animated light underneath the readable text.
 */
export default function Ambient() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const target = event.target as HTMLElement | null;
      const panel = target?.closest?.('.tahrir-panel, .tahrir-tabs, .tahrir-workspace-shell') as HTMLElement | null;
      if (!panel) return;
      const bounds = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
      panel.style.setProperty('--my', `${event.clientY - bounds.top}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div aria-hidden="true" className="tahrir-ambient fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="honey-bronze-background" />
      <div className="honey-bronze-left-light" />
      <div className="honey-bronze-right-light" />
      <svg className="honey-bronze-waves" viewBox="0 0 1440 920" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="honey-ribbon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5f361e" stopOpacity=".08" />
            <stop offset=".22" stopColor="#d29a62" stopOpacity=".53" />
            <stop offset=".43" stopColor="#f4cb91" stopOpacity=".23" />
            <stop offset=".65" stopColor="#b87946" stopOpacity=".26" />
            <stop offset="1" stopColor="#f8d49a" stopOpacity=".44" />
          </linearGradient>
          <linearGradient id="honey-fine" x1="0" y1="0" x2="1" y2=".25">
            <stop offset="0" stopColor="#c38855" stopOpacity="0" />
            <stop offset=".38" stopColor="#f4cb91" stopOpacity=".38" />
            <stop offset=".72" stopColor="#d3a06f" stopOpacity=".15" />
            <stop offset="1" stopColor="#f2cf98" stopOpacity=".22" />
          </linearGradient>
        </defs>
        <path d="M-140 230 C 100 128, 230 492, 485 410 S 1050 192, 1610 385" stroke="url(#honey-ribbon)" strokeWidth="42" opacity=".45"/>
        <path d="M-120 255 C 120 158, 250 520, 490 435 S 1110 218, 1610 399" stroke="url(#honey-fine)" strokeWidth="2.2" opacity=".85"/>
        <path d="M-230 832 C 138 650, 329 912, 640 795 S 1120 668, 1570 763" stroke="url(#honey-ribbon)" strokeWidth="64" opacity=".38"/>
        <path d="M-220 802 C 130 650, 345 883, 633 778 S 1110 649, 1590 730" stroke="url(#honey-fine)" strokeWidth="2" opacity=".67"/>
        <path d="M1200 -140 C 1045 170, 1478 254, 1550 518" stroke="url(#honey-fine)" strokeWidth="3" opacity=".42"/>
      </svg>
      <div className="honey-bronze-quill"><Feather strokeWidth={1.05} /></div>
      <div className="honey-bronze-vignette" />
    </div>
  );
}
