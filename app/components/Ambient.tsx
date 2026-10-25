'use client';

import { useEffect } from 'react';

/**
 * Quiet Library: the original photograph stays at the edges while an
 * opaque, warm focus veil keeps text and document controls undisturbed.
 * No background particles or continuous canvas repainting.
 */
export default function Ambient() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const target = event.target as HTMLElement | null;
      const panel = target?.closest?.('.tahrir-panel, .tahrir-tabs') as HTMLElement | null;
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      panel.style.setProperty('--my', `${event.clientY - rect.top}px`);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  return (
    <div aria-hidden="true" className="tahrir-ambient fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="tahrir-library-photo" />
      <div className="tahrir-library-veil" />
      <div className="tahrir-focus-light" />
      <div className="tahrir-ambient-edge tahrir-ambient-edge-left" />
      <div className="tahrir-ambient-edge tahrir-ambient-edge-right" />
      <div className="tahrir-vignette" />
    </div>
  );
}
