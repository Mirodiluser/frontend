'use client';

import { useEffect } from 'react';

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
      <svg className="honey-bronze-waves" viewBox="0 0 1440 1010" preserveAspectRatio="xMidYMin slice" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="honey-satin-left" x1="10" y1="90" x2="460" y2="490" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFE2A8" stopOpacity=".84"/>
            <stop offset=".12" stopColor="#B87243" stopOpacity=".88"/>
            <stop offset=".28" stopColor="#68381F" stopOpacity=".90"/>
            <stop offset=".40" stopColor="#D99B65" stopOpacity=".87"/>
            <stop offset=".47" stopColor="#FFE7B2" stopOpacity=".95"/>
            <stop offset=".56" stopColor="#804426" stopOpacity=".94"/>
            <stop offset=".78" stopColor="#A66A42" stopOpacity=".71"/>
            <stop offset="1" stopColor="#4B291B" stopOpacity=".20"/>
          </linearGradient>
          <linearGradient id="honey-satin-right" x1="1080" y1="430" x2="1500" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#5C301A" stopOpacity=".09"/>
            <stop offset=".24" stopColor="#AB6D45" stopOpacity=".76"/>
            <stop offset=".43" stopColor="#FFD997" stopOpacity=".94"/>
            <stop offset=".49" stopColor="#FFF0BD" stopOpacity=".95"/>
            <stop offset=".56" stopColor="#AB6E43" stopOpacity=".86"/>
            <stop offset=".75" stopColor="#67371E" stopOpacity=".85"/>
            <stop offset="1" stopColor="#D39459" stopOpacity=".76"/>
          </linearGradient>
          <linearGradient id="honey-satin-bottom" x1="0" y1="800" x2="1440" y2="800" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#CB8146" stopOpacity=".70"/>
            <stop offset=".2" stopColor="#F9D49B" stopOpacity=".62"/>
            <stop offset=".4" stopColor="#794127" stopOpacity=".56"/>
            <stop offset=".6" stopColor="#AF6C40" stopOpacity=".18"/>
            <stop offset=".82" stopColor="#F0B77E" stopOpacity=".52"/>
            <stop offset="1" stopColor="#5D321F" stopOpacity=".50"/>
          </linearGradient>
          <linearGradient id="honey-gold-line" x1="0" y1="50" x2="1440" y2="420" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F9D399" stopOpacity=".76"/>
            <stop offset=".23" stopColor="#FFF0B9" stopOpacity=".96"/>
            <stop offset=".48" stopColor="#E4A667" stopOpacity=".49"/>
            <stop offset=".76" stopColor="#FFDFA3" stopOpacity=".73"/>
            <stop offset="1" stopColor="#FFDBA7" stopOpacity=".92"/>
          </linearGradient>
          <linearGradient id="honey-feather" x1="-25" y1="15" x2="71" y2="222" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFEEC0"/>
            <stop offset=".21" stopColor="#C9874A"/>
            <stop offset=".39" stopColor="#FFE8AC"/>
            <stop offset=".63" stopColor="#A86237"/>
            <stop offset=".80" stopColor="#E8B16D"/>
            <stop offset="1" stopColor="#65361F"/>
          </linearGradient>
          <filter id="honey-soft-glint" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="3.5"/></filter>
        </defs>
        {/* Three-dimensional ribbons are kept to the edges of the hero. */}
        <path d="M-160 130 C-24 66 50 97 128 218 C209 339 293 362 450 394 L490 467 C303 442 197 471 95 343 C17 246-55 212-160 274Z" fill="#24150E" fillOpacity=".39" transform="translate(7 13)"/>
        <path d="M-160 130 C-24 66 50 97 128 218 C209 339 293 362 450 394 L490 467 C303 442 197 471 95 343 C17 246-55 212-160 274Z" fill="url(#honey-satin-left)"/>
        <path d="M-160 127 C-24 63 50 94 128 215 C209 336 293 359 450 391" stroke="#FFE8B8" strokeWidth="13" strokeOpacity=".51" filter="url(#honey-soft-glint)"/>
        <path d="M-160 125 C-24 61 50 92 128 213 C209 334 293 357 450 389" stroke="url(#honey-gold-line)" strokeWidth="3.4"/>
        {/* Warm metallic reflections travel along the outer crest, never over copy. */}
        <path className="honey-ribbon-glint honey-ribbon-glint-left" d="M-160 125 C-24 61 50 92 128 213 C209 334 293 357 450 389" pathLength="1000" stroke="#FFEDBD" strokeWidth="4.3" strokeLinecap="round" strokeDasharray="132 868" />
        <path d="M-160 152 C-31 92 44 141 119 251 C202 374 297 414 466 432" stroke="#6B3B24" strokeWidth="9" strokeOpacity=".48"/>
        <path d="M-155 264 C-20 206 49 277 113 365 C215 490 320 459 456 474 L497 528 C287 516 195 547 75 414 C-2 326-79 307-155 346Z" fill="url(#honey-satin-left)" fillOpacity=".58"/>
        <path d="M-155 261 C-20 203 49 274 113 362 C215 487 320 456 456 471" stroke="#F7C588" strokeWidth="2.2" strokeOpacity=".69"/>
        <path d="M1590 99 C1450 56 1374 119 1310 230 C1246 338 1208 371 1071 405 L1033 496 C1209 470 1321 418 1395 290 C1462 190 1513 207 1590 247Z" fill="#211309" fillOpacity=".39" transform="translate(-6 16)"/>
        <path d="M1590 99 C1450 56 1374 119 1310 230 C1246 338 1208 371 1071 405 L1033 496 C1209 470 1321 418 1395 290 C1462 190 1513 207 1590 247Z" fill="url(#honey-satin-right)"/>
        <path d="M1590 96 C1450 53 1374 116 1310 227 C1246 335 1208 368 1071 402" stroke="#FFE9BE" strokeWidth="14" strokeOpacity=".41" filter="url(#honey-soft-glint)"/>
        <path d="M1590 94 C1450 51 1374 114 1310 225 C1246 333 1208 366 1071 400" stroke="url(#honey-gold-line)" strokeWidth="3.2"/>
        <path className="honey-ribbon-glint honey-ribbon-glint-right" d="M1590 94 C1450 51 1374 114 1310 225 C1246 333 1208 366 1071 400" pathLength="1000" stroke="#FFE7B1" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="126 874" />
        <path d="M1590 201 C1470 171 1403 240 1330 345 C1254 448 1211 476 1098 491 L1064 547 C1238 533 1377 488 1459 361 C1518 271 1551 291 1590 310Z" fill="url(#honey-satin-right)" opacity=".56"/>
        <path d="M1590 200 C1470 170 1403 239 1330 344 C1254 447 1211 475 1098 490" stroke="#FFE2AA" strokeWidth="2" strokeOpacity=".73"/>
        {/* The lower ribbon adds depth underneath the panel without covering controls. */}
        <path d="M-140 842 C144 698 338 920 594 803 C853 680 1140 706 1570 792 L1570 933 C1128 851 912 825 665 899 C330 1008 139 814-140 981Z" fill="url(#honey-satin-bottom)" opacity=".70"/>
        <path d="M-140 838 C144 694 338 916 594 799 C853 676 1140 702 1570 788" stroke="#FFE0A8" strokeOpacity=".38" strokeWidth="13" filter="url(#honey-soft-glint)"/>
        <path d="M-140 834 C144 690 338 912 594 795 C853 672 1140 698 1570 784" stroke="url(#honey-gold-line)" strokeOpacity=".64" strokeWidth="2.7"/>
        <path className="honey-ribbon-glint honey-ribbon-glint-low" d="M-140 834 C144 690 338 912 594 795 C853 672 1140 698 1570 784" pathLength="1000" stroke="#F9D19A" strokeWidth="2.7" strokeLinecap="round" strokeDasharray="83 917" />
        {/* A small embossed gold feather, not a flat outline icon. */}
        <g className="honey-bronze-plume" transform="translate(1242 157) rotate(22 35 115)">
          <path d="M10 214 C-53 141 -28 36 67 -8 C86 86 72 164 10 214Z" fill="#231309" opacity=".25" transform="translate(8 9)"/>
          <path d="M10 214 C-53 141 -28 36 67 -8 C86 86 72 164 10 214Z" fill="url(#honey-feather)" stroke="#FFE0A3" strokeWidth="1.8"/>
          <path d="M10 214 C-10 136 9 57 67 -8" stroke="#FFF0BF" strokeOpacity=".91" strokeWidth="2.7" strokeLinecap="round"/>
          <path d="M-10 147 L40 102 M-16 122 L52 80 M-10 96 L60 50 M5 178 L63 139 M22 160 L72 113" stroke="#6D3C24" strokeWidth="1.5" strokeOpacity=".58"/>
          <path d="M-11 145 L40 99 M-15 119 L52 77 M-9 93 L60 47" stroke="#FFF0C4" strokeOpacity=".71" strokeWidth="1"/>
          <path d="M10 214 L-12 251" stroke="#E5B578" strokeWidth="3.5" strokeLinecap="round"/>
        </g>
      </svg>
      <div className="honey-bronze-vignette" />
    </div>
  );
}
