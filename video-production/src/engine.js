// TAHRIR AI film — deterministic motion engine.
// Everything is a pure function of time t (seconds). No CSS animations, timers, Date or Math.random.
(function () {
  const E = {};
  E.clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  E.lerp = (a, b, k) => a + (b - a) * k;
  E.inv = (a, b, v) => (b === a ? (v >= b ? 1 : 0) : E.clamp((v - a) / (b - a)));
  E.smooth = (k) => k * k * (3 - 2 * k);
  E.ease = {
    linear: (k) => k,
    inOutSine: (k) => -(Math.cos(Math.PI * k) - 1) / 2,
    outSine: (k) => Math.sin((k * Math.PI) / 2),
    inOutCubic: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
    outCubic: (k) => 1 - Math.pow(1 - k, 3),
    inCubic: (k) => k * k * k,
    outQuart: (k) => 1 - Math.pow(1 - k, 4),
    inOutQuart: (k) => (k < 0.5 ? 8 * k ** 4 : 1 - Math.pow(-2 * k + 2, 4) / 2),
    outExpo: (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)),
    inOutExpo: (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2),
    // cubic-bezier(.16,.9,.2,1) used by the Qoʻllanma hero/card entrances (approximated)
    guide: (k) => 1 - Math.pow(1 - k, 3.6),
    outBack: (k) => { const c1 = 1.25, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
  };
  // Analytic damped spring step response (0 → 1). Matches framer-motion style springs (stiffness/damping/mass).
  E.spring = (time, stiffness = 210, damping = 30, mass = 0.85) => {
    if (time <= 0) return 0;
    const w0 = Math.sqrt(stiffness / mass);
    const zeta = damping / (2 * Math.sqrt(stiffness * mass));
    if (zeta < 1) {
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      return 1 - Math.exp(-zeta * w0 * time) * (Math.cos(wd * time) + ((zeta * w0) / wd) * Math.sin(wd * time));
    }
    return 1 - Math.exp(-w0 * time) * (1 + w0 * time);
  };
  // progress of t inside [a,b] with easing
  E.p = (t, a, b, ease = E.ease.inOutCubic) => ease(E.inv(a, b, t));
  // window: rises over [a, a+fi], holds, falls over [b-fo, b]
  E.win = (t, a, b, fi = 0.5, fo = 0.5, ease = E.ease.inOutSine) => {
    if (t <= a || t >= b) return 0;
    return Math.min(ease(E.inv(a, a + fi, t)), ease(1 - E.inv(b - fo, b, t)));
  };
  // keyframe track: keys [[t, value(s)], ...]; numbers or arrays; per-segment ease
  E.track = (keys, t, ease = E.ease.inOutCubic) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, v0] = keys[i], [t1, v1, segEase] = keys[i + 1];
      if (t <= t1) {
        const k = (segEase || ease)(E.inv(t0, t1, t));
        return Array.isArray(v0) ? v0.map((x, j) => E.lerp(x, v1[j], k)) : E.lerp(v0, v1, k);
      }
    }
    return keys[keys.length - 1][1];
  };
  // seeded RNG (mulberry32)
  E.rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  // smooth value noise (deterministic, continuous) for organic drift
  E.noise = (x, seed = 1) => {
    const h = (n) => { const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return s - Math.floor(s); };
    const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return E.lerp(h(i), h(i + 1), u) * 2 - 1;
  };
  // Human typing schedule: returns number of visible chars at time t
  E.typing = (text, start, cps = 14, seed = 7) => {
    const r = E.rng(seed), times = [];
    let acc = start;
    for (const ch of Array.from(text)) {
      times.push(acc);
      let d = 1 / cps * (0.6 + r() * 0.85);
      if (ch === ' ') d *= 1.35;
      if (/[.,—]/.test(ch)) d *= 2.2;
      acc += d;
    }
    return { times, end: acc, count: (t) => { let n = 0; while (n < times.length && times[n] <= t) n++; return n; } };
  };
  // Format numbers like Intl uz-UZ (5 000)
  E.fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  E.css = (el, o) => { for (const k in o) { const v = o[k]; if (el.__c && el.__c[k] === v) continue; (el.__c || (el.__c = {}))[k] = v; if (k.startsWith('--')) el.style.setProperty(k, v); else el.style[k] = v; } };
  E.icon = (name, size, extra = '') => `<span class="ic" style="width:${size}px;height:${size}px;${extra}">${(window.ICONS || {})[name] || ''}</span>`;
  E.$ = (s, root = document) => root.querySelector(s);
  E.$$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  // split element text into animated words (Qoʻllanma .tg-w style)
  E.words = (el, text) => {
    el.innerHTML = '';
    const parts = text.split(/(\s+)/);
    const spans = [];
    for (const p of parts) {
      if (/^\s+$/.test(p)) { el.appendChild(document.createTextNode(' ')); continue; }
      if (!p) continue;
      const s = document.createElement('span'); s.className = 'w'; s.textContent = p; el.appendChild(s); spans.push(s);
    }
    el.__words = spans; return spans;
  };
  // word-by-word rise with blur; k0 = start time, stagger, dur. Optional out window.
  E.wordsAt = (el, t, start, stagger = 0.055, dur = 0.6, outAt = null, outDur = 0.35) => {
    const spans = el.__words || [];
    const o = outAt == null ? 1 : 1 - E.p(t, outAt, outAt + outDur, E.ease.inCubic);
    spans.forEach((s, i) => {
      const k = E.ease.guide(E.inv(start + i * stagger, start + i * stagger + dur, t));
      const ko = Math.min(k, o);
      E.css(s, { opacity: ko.toFixed(3), transform: `translateY(${((1 - k) * 0.55 + (1 - o) * -0.25).toFixed(3)}em)`, filter: ko > 0.985 ? 'none' : `blur(${((1 - ko) * 6).toFixed(2)}px)` });
    });
  };
  window.E = E;
})();
