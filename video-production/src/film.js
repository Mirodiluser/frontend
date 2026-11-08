// TAHRIR AI — cinematic product film. Timeline + scene states. Pure function of t.
(function () {
  const { clamp, lerp, inv, p, win, track, spring, ease: Ez, css, $, $$, words, wordsAt, rng, noise, fmt } = E;
  const G = window.GEN;
  const R = (id) => document.getElementById(id);
  const DURATION = 268, FPS = 60;
  const EV = []; // audio events
  const ev = (t, type, o = {}) => EV.push(Object.assign({ t: +t.toFixed(3), type }, o));

  // ---------------- boot: icons ----------------
  for (const el of $$('i[data-i]')) {
    const s = +el.dataset.s || 16, sp = document.createElement('span');
    sp.className = 'ic ' + (el.className || ''); sp.style.width = sp.style.height = s + 'px';
    sp.innerHTML = ICONS[el.dataset.i] || ''; if (el.id) sp.id = el.id; el.replaceWith(sp);
  }
  const setIc = (el, name, size) => { const k = name + size; if (el.__ic === k) return; el.__ic = k; el.innerHTML = name ? E.icon(name, size) : ''; };
  R('hbQuill').innerHTML = E.icon('feather', 118);
  R('brandMark').firstElementChild.innerHTML = E.icon('feather', 20);
  R('opMarkIc').innerHTML = E.icon('feather', 70); R('fnMarkIc').innerHTML = E.icon('feather', 70);
  R('pvShieldIc').innerHTML = E.icon('shield-check', 54);
  R('ffIc').innerHTML = E.icon('fast-forward', 16);

  // trash chip (shown when input has text — real UI)
  const trClear = document.createElement('span'); trClear.className = 'chip'; trClear.id = 'trClear'; trClear.innerHTML = E.icon('trash-2', 14);
  R('trPaste').after(trClear);

  // ---------------- documents ----------------
  const docHTML = (d) => `
    <div class="d-title">${d.title}</div><div class="d-sub">${d.sub}</div><div class="d-rule"></div>
    <p class="d-p">${d.p1.map((l) => `<span class="ln">${l}</span>`).join('')}</p>
    <p class="d-p"><span class="ln"><b>${d.lead}</b> ${d.p2[0]}</span><span class="ln">${d.p2[1]}</span></p>
    <p class="d-lh">${d.lh}</p>${d.li.map((l) => `<div class="d-li">${l}</div>`).join('')}
    <p class="d-cap">${d.cap}</p>
    <table class="d-tab"><tr>${d.th.map((h) => `<th>${h}</th>`).join('')}</tr>${d.tr.map((r) => `<tr><td>${r[0]}</td><td class="n">${r[1]}</td><td class="n">${r[2]}</td></tr>`).join('')}</table>
    <p class="d-p" style="margin-top:22px">${d.p3.map((l) => `<span class="ln"><i>${l}</i></span>`).join('')}</p>`;
  R('docCyr').innerHTML = docHTML(G.docCyr);
  R('docLat').innerHTML = docHTML(G.docLat);
  const hl = (w, i) => `<span class="hlw" id="hl${i}"><span class="hlbg"></span>${w}</span>`;
  R('docImlo').innerHTML = `
    <div class="d-title">Maktab hayotidan lavhalar</div><div class="d-sub">Referat · namuna hujjat</div><div class="d-rule"></div>
    <p class="d-p imlo"><span class="ln">Bugun oʻquvchilar ${hl('maktbga', 0)} bordilar va yangi ${hl('kitobb', 1)} haqida</span><span class="ln">suhbatlashdilar. Oʻqituvchi darsni qiziqarli savollar bilan boshladi.</span><span class="ln">Har bir oʻquvchi oʻz fikrini erkin bayon qildi.</span></p>
    <p class="d-p imlo"><span class="ln">Dars soʻngida sinf rahbari kelgusi haftada boʻladigan tadbirlar</span><span class="ln">haqida maʼlumot berdi. Oʻquvchilar ularni katta qiziqish bilan</span><span class="ln">${hl('muhokma', 2)} qildilar.</span></p>
    <p class="d-lh" style="font-weight:700;margin-top:18px">Kitob — bilim manbai</p>
    <p class="d-p imlo"><span class="ln">Maktab kutubxonasida har oy yangi adabiyotlar koʻrgazmasi</span><span class="ln">tashkil etiladi. Oʻquvchilar oʻzlariga yoqqan asarlarni tanlab,</span><span class="ln">ular haqida qisqa taqriz yozadilar.</span></p>
    <p class="d-p imlo"><span class="ln">Bunday uchrashuvlar bolalarda kitobga boʻlgan mehrni oshiradi va</span><span class="ln">ularni mustaqil fikrlashga oʻrgatadi. Bu tajriba bolalarning nutq</span><span class="ln">madaniyatini ham rivojlantiradi.</span></p>`;
  // second document window for comparisons
  const docWin2 = R('docWin').cloneNode(true); docWin2.id = 'docWin2';
  docWin2.querySelectorAll('[id]').forEach((n) => (n.id = n.id + '_2'));
  R('docWin').before(docWin2);
  const W2 = (id) => R(id + '_2');

  // fake QR (blurred, non-scannable demo pattern)
  { const r = rng(42); let h = ''; for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) { const f = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13); const on = f ? ((x % 6 === 0 || y % 6 === 0 || (x % 7 > 1 && x % 7 < 5 && y % 7 > 1 && y % 7 < 5)) && !(x > 13 && (x - 14) % 6 !== 0 && y % 6 !== 0 && !((x - 14) > 1 && (x - 14) < 5 && y > 1 && y < 5))) : r() > 0.5; if (on) h += `<rect x="${x}" y="${y}" width="1" height="1"/>`; } R('qrFake').innerHTML = `<svg viewBox="0 0 21 21" width="100%" height="100%" fill="#1a120c" shape-rendering="crispEdges">${h}</svg>`; }

  // dust particles (Qoʻllanma .tg-dust) — deterministic
  const DUST = []; { const r = rng(9); for (let i = 0; i < 46; i++) { const d = document.createElement('i'); const s = 2 + r() * 5; d.style.width = d.style.height = s + 'px'; R('dust').appendChild(d); DUST.push({ el: d, x: r() * 1920, sp: 18 + r() * 34, ph: r() * 1200, dx: (r() - 0.5) * 120, o: 0.25 + r() * 0.45 }); } }
  // film grain (deterministic noise tile)
  { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const im = x.createImageData(256, 256); const r = rng(5); for (let i = 0; i < im.data.length; i += 4) { const v = 110 + r() * 145; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); R('grain').style.backgroundImage = `url(${c.toDataURL()})`; }

  // depth fragments (opening & finale) live in world space
  const FR = [
    { html: '<span class="k">KIRILL</span>Ўзбек тили — халқимизнинг', x: 330, y: 250, z: 0.55, r: -5 },
    { html: '<span class="k">LOTIN</span>Oʻzbek tili — xalqimizning', x: 1570, y: 300, z: 0.7, r: 4 },
    { html: E.icon('file-text', 18) + ' maqola.docx', cls: 'dark chipf', x: 420, y: 820, z: 0.8, r: 3 },
    { html: E.icon('refresh-cw', 16) + ' Kirill ↔ Latin', cls: 'dark chipf', x: 1500, y: 800, z: 0.6, r: -3 },
    { html: '<span class="k">IMLO</span>yangi <span style="background:#FFE14D;border-radius:3px;padding:0 3px">kitobb</span> haqida', x: 230, y: 540, z: 0.42, r: 6 },
    { html: E.icon('wallet', 16) + ' 5&nbsp;000 soʻm', cls: 'dark chipf', x: 1700, y: 560, z: 0.45, r: 5 },
    { html: E.icon('file-type', 16) + ' DOCX → PDF', cls: 'dark chipf', x: 980, y: 930, z: 0.5, r: -2 },
    { html: '<span class="k">MATN</span>Mukammal grammatika', x: 960, y: 150, z: 0.38, r: -2 },
  ].map((f, i) => { const d = document.createElement('div'); d.className = 'frag ' + (f.cls || ''); d.innerHTML = f.html; R('frags').appendChild(d); return Object.assign(f, { el: d, i }); });

  // privacy items
  const PV = [
    ['Hujjatlar faqat siz tanlagan vazifani bajarish uchun qayta ishlanadi.', ''],
    ['Hujjatlar ommaviy tarqatish uchun moʻljallanmagan.', ''],
    ['Yuklangan hujjatlarning doimiy arxivi yaratilmaydi.', ''],
    ['Katta hujjatlarda vaqtinchalik texnik fayllar yaratilishi mumkin.', 'Ular vazifa tugagach yoki belgilangan muddatda (45 daqiqagacha) oʻchiriladi.'],
    ['Hisob ishlashi uchun zarur foydalanuvchi va toʻlov maʼlumotlari saqlanadi.', ''],
    ['AI tekshiruvida matnning ayrim qismlari tashqi AI xizmatida qayta ishlanishi mumkin.', ''],
  ];
  const PVI = ['file-check', 'lock', 'database', 'hourglass', 'user-check', 'sparkles'];
  const pvEls = PV.map((it, i) => { const d = document.createElement('div'); d.className = 'pv-it'; d.innerHTML = `<span class="n">${E.icon(PVI[i], 18)}</span><div><p>${it[0]}</p>${it[1] ? `<small>${it[1]}</small>` : ''}</div>`; R('pvItems').appendChild(d); return d; });
  { let s = ''; for (let i = 0; i < 4; i++) s += `<circle id="pvc${i}" cx="0" cy="0" r="${150 + i * 62}" fill="none" stroke="rgba(230,193,110,${0.34 - i * 0.06})" stroke-width="${i === 0 ? 1.6 : 1}" stroke-dasharray="${i % 2 ? '3 9' : ''}"/>`; for (let i = 0; i < 6; i++) s += `<path id="pvl${i}" fill="none" stroke="rgba(230,193,110,.4)" stroke-width="1.2"/>`; R('pvSvg').innerHTML = s; }
  // converter formats
  const FMTS = ['DOCX', 'DOC', 'TXT', 'PDF', 'ODT', 'RTF', 'HTML', 'JPG', 'PNG', 'WebP'];
  const fmtEls = FMTS.map((f) => { const d = document.createElement('div'); d.className = 'cvf'; d.textContent = f; R('cvFormats').appendChild(d); return d; });

  // titles split into letters
  const letters = (el, txt) => { el.innerHTML = Array.from(txt).map((c, i) => c === ' ' ? '<span class="ch">&nbsp;</span>' : `<span class="ch${i >= 7 ? ' ai' : ''}">${c}</span>`).join(''); return $$('.ch', el); };
  const opLetters = letters(R('opTitle'), 'TAHRIR AI'), fnLetters = letters(R('fnTitle'), 'TAHRIR AI');
  words(R('opSub'), R('opSub').textContent); words(R('fnSub'), R('fnSub').textContent);
  const heroWords = $$('.hw');

  // ---------------- geometry ----------------
  const STAGE = R('stage');
  let SC = 1;
  const rectS = (el) => { const r = el.getBoundingClientRect(); return { x: r.left / SC, y: r.top / SC, w: r.width / SC, h: r.height / SC, get cx() { return this.x + this.w / 2; }, get cy() { return this.y + this.h / 2; } }; };
  const el = (s) => (typeof s === 'string' ? (s[0] === '#' ? R(s.slice(1)) : $(s)) : s);

  // ---------------- camera ----------------
  const cam = { x: 960, y: 540, z: 1, rz: 0 };
  const toScreen = (x, y) => ({ x: 960 + (x - cam.x) * cam.z, y: 540 + (y - cam.y) * cam.z });
  const rectScreen = (r) => { const a = toScreen(r.x, r.y); return { x: a.x, y: a.y, w: r.w * cam.z, h: r.h * cam.z, cx: a.x + r.w * cam.z / 2, cy: a.y + r.h * cam.z / 2 }; };

  // CAMERA KEYS: [time, target]; target = {x,y,z} or {sel, z, dx, dy}; optional ease as 3rd
  const C = (t, o, e) => [t, o, e];
  const CAM = [
    C(0, { x: 960, y: 540, z: 1 }), C(10.5, { x: 960, y: 530, z: 1.07 }, Ez.inOutSine),
    C(13.2, { x: 960, y: 540, z: 1.0 }, Ez.inOutCubic), C(15.6, { x: 960, y: 548, z: 1.02 }, Ez.inOutSine),
    C(17.4, { sel: '#tabs', z: 1.42, dy: 70 }), C(20.0, { sel: '#tabs', z: 1.46, dy: 72 }, Ez.inOutSine),
    C(22.0, { sel: '#dxp', z: 1.3 }), C(23.6, { sel: '#dxp', z: 1.33 }, Ez.inOutSine),
    C(25.4, { sel: '#tabCo', z: 1.6, dy: 60 }), C(27.2, { sel: '#tabCo', z: 1.63, dy: 62 }, Ez.inOutSine),
    C(28.8, { sel: '#tabCv', z: 1.6, dy: 60 }), C(30.8, { sel: '#tabCv', z: 1.62, dy: 62 }, Ez.inOutSine),
    C(32.8, { sel: '#accWrap', z: 1.65, dx: -120, dy: 150 }), C(35.4, { sel: '#accWrap', z: 1.7, dx: -120, dy: 150 }, Ez.inOutSine),
    // CH3 auth (rail on the left; browser framed right)
    C(37.6, { x: 760, y: 470, z: 1.12 }), C(38.4, { x: 760, y: 480, z: 1.12 }, Ez.inOutSine),
    C(40.0, { sel: '#auth', z: 1.38, dx: -150 }), C(52.6, { sel: '#auth', z: 1.42, dx: -150 }, Ez.inOutSine),
    C(55.6, { sel: '#accWrap', z: 1.65, dx: -170, dy: 120 }), C(57.4, { sel: '#accWrap', z: 1.68, dx: -170, dy: 120 }, Ez.inOutSine),
    C(59.6, { sel: '#auth', z: 1.36, dx: -150 }), C(64.4, { sel: '#auth', z: 1.4, dx: -150 }, Ez.inOutSine),
    C(66.2, { sel: '#accWrap', z: 1.62, dx: -170, dy: 120 }), C(69.4, { sel: '#accWrap', z: 1.66, dx: -170, dy: 120 }, Ez.inOutSine),
    // CH4 translit
    C(72.0, { sel: '#tabs', z: 1.45, dy: 40 }), C(73.4, { sel: '#tcTr', z: 1.32, dy: -150 }),
    C(84.0, { sel: '#tcTr', z: 1.36, dy: -150 }, Ez.inOutSine), C(86.0, { sel: '#tcTr', z: 1.36, dy: -150 }, Ez.inOutSine),
    C(93.4, { sel: '#trOut', z: 1.5, dy: 20 }), C(97.0, { sel: '#trOut', z: 1.52, dy: 20 }, Ez.inOutSine),
    // CH5 docx pro (card on the left)
    C(100.0, { sel: '#dxp', z: 1.3, dx: -200 }), C(108.0, { sel: '#dxp', z: 1.36, dx: -200 }, Ez.inOutSine),
    C(126.0, { sel: '#dxp', z: 1.25, dx: -200 }, Ez.inOutSine),
    // CH6 imlo (card on the right)
    C(128.4, { sel: '#tabs', z: 1.42, dx: 150, dy: 40 }), C(129.6, { sel: '#coDrop', z: 1.28, dx: 210, dy: 20 }),
    C(136.4, { sel: '#coDrop', z: 1.33, dx: 210, dy: 20 }, Ez.inOutSine), C(156.0, { sel: '#coDrop', z: 1.3, dx: 210, dy: 40 }, Ez.inOutSine),
    C(158.8, { sel: '#coDrop', z: 1.34, dx: 210, dy: 40 }, Ez.inOutSine),
    // CH7 converter
    C(160.4, { sel: '#tabs', z: 1.45, dy: 40 }), C(161.6, { sel: '#cvDrop', z: 1.35, dy: 30 }),
    C(166.4, { sel: '#cvDrop', z: 1.4, dy: 40 }, Ez.inOutSine), C(180.0, { sel: '#cvDrop', z: 1.3, dy: 40 }, Ez.inOutSine),
    // CH8 balance
    C(183.0, { sel: '#accWrap', z: 1.75, dx: -80, dy: 150 }), C(186.6, { sel: '#accWrap', z: 1.8, dx: -40, dy: 150 }, Ez.inOutSine),
    C(188.4, { sel: '#shop', z: 1.32, dx: -170 }), C(193.6, { sel: '#shop', z: 1.36, dx: -170 }, Ez.inOutSine),
    // CH9 payment
    C(195.4, { sel: '#pay', z: 1.12, dx: -190 }), C(198.6, { sel: '#pay', z: 1.16, dx: -190 }, Ez.inOutSine),
    C(200.0, { sel: '#pay', z: 1.0, dx: 60 }), C(204.0, { sel: '#pay', z: 1.02, dx: 60 }, Ez.inOutSine),
    C(205.6, { sel: '#pay', z: 1.14, dx: -190 }), C(218.4, { sel: '#pay', z: 1.2, dx: -190 }, Ez.inOutSine),
    C(219.4, { sel: '#succ', z: 1.4, dx: -150 }), C(221.8, { sel: '#succ', z: 1.42, dx: -150 }, Ez.inOutSine),
    C(223.6, { sel: '#accWrap', z: 1.85, dx: -60, dy: 110 }), C(229.0, { sel: '#accWrap', z: 1.7, dx: -60, dy: 110 }, Ez.inOutSine),
    // CH10 privacy / CH11 finale
    C(232.0, { x: 960, y: 540, z: 0.9 }), C(253.0, { x: 960, y: 540, z: 0.86 }, Ez.inOutSine),
    C(268.0, { x: 960, y: 540, z: 0.8 }, Ez.inOutSine),
  ];
  const camResolve = (o) => { if (!o.sel) return o; const r = rectS(el(o.sel)); return { x: r.cx + (o.dx || 0), y: r.cy + (o.dy || 0), z: o.z }; };
  function cameraAt(t) {
    let i = 0; while (i < CAM.length - 2 && t >= CAM[i + 1][0]) i++;
    const [t0, a] = CAM[i], [t1, b, e] = CAM[i + 1];
    const k = (e || Ez.inOutCubic)(inv(t0, t1, t));
    const A = camResolve(a), B = camResolve(b);
    // zoom interpolated in log space → perceptually even dolly
    const z = Math.exp(lerp(Math.log(A.z), Math.log(B.z), k));
    let x = lerp(A.x, B.x, k), y = lerp(A.y, B.y, k);
    // keep the frame inside the browser window while it is the subject (never reveal its edges when zoomed)
    const ck = win(t, 14.6, 229.4, 1.0, 0.8);
    if (ck > 0) {
      const fit = (c, half, lo, hi) => (hi - lo <= 2 * half ? (lo + hi) / 2 : clamp(c, lo + half, hi - half));
      const bx = fit(x, 960 / z, 240 - 14, 1680 + 14), by = fit(y, 540 / z, 60 - 14, 1020 + 14);
      const wideX = 1440 + 28 <= 1920 / z, wideY = 960 + 28 <= 1080 / z;
      x = lerp(x, wideX ? x : bx, ck); y = lerp(y, wideY ? y : by, ck);
    }
    return { x: x + noise(t * 0.16, 1) * 7, y: y + noise(t * 0.13, 2) * 5, z: z * (1 + noise(t * 0.09, 4) * 0.006), rz: noise(t * 0.11, 3) * 0.22 };
  }

  // ---------------- cursor ----------------
  // keys: [arrive, travel, target] ; target selector | {sx,sy} (screen) | {sel, ox, oy}
  const CUR = [];
  const mv = (arrive, travel, target) => CUR.push({ t: arrive, d: travel, target });
  const CLICKS = [];
  const click = (t, kind = 'click') => { CLICKS.push(t); ev(t, kind); };
  const CURVIS = [];
  const curOn = (a, b) => CURVIS.push([a, b]);
  function curTarget(tg) {
    if (tg.sx != null) return { x: tg.sx, y: tg.sy };
    const sel = typeof tg === 'string' ? tg : tg.sel;
    const r = rectS(el(sel));
    return { x: r.x + r.w * (tg.ox ?? 0.5), y: r.y + r.h * (tg.oy ?? 0.5) };
  }
  function cursorAt(t) {
    let i = -1; while (i < CUR.length - 1 && t >= CUR[i + 1].t - CUR[i + 1].d) i++;
    if (i < 0) return curTarget(CUR[0].target);
    const k = CUR[i];
    const to = curTarget(k.target);
    const start = k.t - k.d;
    if (t >= k.t || i === 0) return to;
    const from = curTarget(CUR[i - 1].target);
    const u = Ez.inOutCubic(inv(start, k.t, t));
    // gentle arc (magnetic, natural hand motion) + slight overshoot settle
    const dx = to.x - from.x, dy = to.y - from.y, L = Math.hypot(dx, dy) || 1;
    const arc = Math.sin(u * Math.PI) * Math.min(60, L * 0.12);
    return { x: lerp(from.x, to.x, u) + (-dy / L) * arc, y: lerp(from.y, to.y, u) + (dx / L) * arc };
  }

  // ---------------- focus ring ----------------
  const FOC = []; // {t, d, sel, pad, r}
  const foc = (t, sel, o = {}) => FOC.push(Object.assign({ t, d: 0.75, sel, pad: 10, r: 18 }, o));
  const FOCVIS = [];
  const focOn = (a, b) => FOCVIS.push([a, b]);
  function focusRect(f) { const r = rectS(el(f.sel)); const pd = f.pad * Math.min(1.6, cam.z); return { x: r.x - pd, y: r.y - pd, w: r.w + pd * 2, h: r.h + pd * 2, r: f.r * Math.min(1.5, cam.z) }; }

  // ---------------- guide card / rail / caption ----------------
  const GC = []; // {t, kick, title, text, pos:{x,y}|{near,side}, seg:[i,n]}
  const gcard = (t, o) => GC.push(Object.assign({ t }, o));
  const GVIS = []; const gOn = (a, b) => GVIS.push([a, b]);
  const RAILS = []; // {t0,t1,kick,title,items,steps:[[t,i]],x,y}
  const CAPS = []; // {t0,t1,k,text,x,y}
  const cap = (t0, t1, k, text, o = {}) => CAPS.push(Object.assign({ t0, t1, k, text }, o));

  // ================== TIMELINE (authoring) ==================
  // CH2 tour
  curOn(36.0, 69.8);
  mv(36.0, 0.01, { sx: 1560, sy: 980 });
  focOn(16.6, 35.2);
  foc(16.6, '#tabTr', { d: 0.01 }); foc(21.2, '#dxp', { pad: 8, r: 26, d: 1.1 }); foc(24.6, '#tabCo', { d: 1.0 }); foc(28.0, '#tabCv', { d: 0.9 }); foc(31.6, '#accWrap', { d: 1.0, pad: 8, r: 14 });
  gOn(17.0, 35.0);
  gcard(17.0, { kick: '01 / 05 · Vositalar', title: 'Kirill ↔ Latin', text: 'Matnni Kirill va Lotin alifbolari oʻrtasida bir zumda oʻgiradi.', near: 'focus', side: 'below', seg: [0, 5] });
  gcard(21.4, { kick: '02 / 05 · Vositalar', title: 'DOCX Transliteration PRO', text: 'Word hujjatini shriftlar, jadvallar va tuzilishini saqlagan holda oʻgiradi.', near: 'focus', side: 'above', seg: [1, 5] });
  gcard(24.8, { kick: '03 / 05 · Vositalar', title: 'Imlo Tahrirchi', text: 'Word hujjatidagi taxminiy imlo xatolarini sariq rang bilan belgilaydi.', near: 'focus', side: 'below', seg: [2, 5] });
  gcard(28.2, { kick: '04 / 05 · Vositalar', title: 'Fayl Konverter', text: 'Fayllarni PDF, Word yoki matn formatiga bepul oʻtkazadi.', near: 'focus', side: 'below', seg: [3, 5] });
  gcard(31.8, { kick: '05 / 05 · Hisob', title: 'Shaxsiy hisob va balans', text: 'Pullik xizmatlar soʻmdagi shaxsiy balans orqali hisoblanadi.', near: 'focus', side: 'below', seg: [4, 5] });

  // CH3 auth
  const RAIL_REG = { kick: 'Roʻyxatdan oʻtish', title: 'Yangi hisob ochish', items: ['«Kirish» tugmasini bosing', '«Roʻyxatdan oʻtish» ni tanlang', 'Ismingizni kiriting', 'Email yoki telefon raqamingiz', 'Parol yarating — kamida 6 ta belgi', '«Roʻyxatdan oʻtish» tugmasini bosing'] };
  const RAIL_LOG = { kick: 'Keyingi safar', title: 'Hisobga kirish', items: ['«Kirish» tugmasini bosing', 'Email yoki telefon va parolni kiriting', '«Tizimga kirish» tugmasini bosing'] };
  RAILS.push(Object.assign({ t0: 36.0, t1: 56.6, steps: [[36.2, 0], [40.4, 1], [42.8, 2], [46.2, 3], [49.4, 4], [52.0, 5], [54.6, 6]] }, RAIL_REG));
  RAILS.push(Object.assign({ t0: 57.2, t1: 69.0, steps: [[57.4, 0], [60.0, 1], [63.4, 2], [65.2, 3]] }, RAIL_LOG));
  mv(37.6, 1.4, '#navLogin'); click(38.3);
  mv(41.4, 1.4, '#authSw'); click(41.8);
  mv(43.3, 1.2, { sel: '#iName', ox: 0.3 }); click(43.5);
  mv(46.5, 1.0, { sel: '#iId', ox: 0.3 }); click(46.7);
  mv(49.7, 1.0, { sel: '#iPw', ox: 0.3 }); click(49.9);
  mv(52.3, 0.9, '#authBtn'); click(52.6);
  mv(55.8, 1.6, { sel: '#navAcc', ox: 0.5, oy: 1.4 });
  mv(58.6, 1.2, '#navLogin'); click(58.9);
  mv(60.4, 1.2, { sel: '#iId', ox: 0.3 }); click(60.6);
  mv(62.3, 0.9, { sel: '#iPw', ox: 0.3 }); click(62.5);
  mv(63.9, 0.8, '#authBtn'); click(64.1);
  mv(66.6, 1.4, { sel: '#navAcc', ox: 0.5, oy: 1.5 });
  focOn(53.0, 68.6); foc(53.0, '#authBtn', { d: 0.01, pad: 6, r: 14 }); foc(55.2, '#navAcc', { d: 0.8, pad: 6, r: 14 }); foc(57.6, '#navLogin', { d: 0.8, pad: 6, r: 14 }); foc(65.4, '#navAcc', { d: 0.8, pad: 6, r: 14 });
  cap(56.9, 58.8, 'Keyingi safar', 'Hisobingizga qayta kirish', { y: 1000 });
  const T = {
    authOpen: 38.4, toReg: 41.9, nameType: E.typing('Demo Foydalanuvchi', 43.7, 12, 3), idType: E.typing('demo@example.com', 46.9, 11, 4), pwType: E.typing('••••••••', 50.1, 7, 5),
    regSubmit: 52.6, regDone: 53.9, flashOut: 57.0, authOpen2: 59.0, id2Type: E.typing('demo@example.com', 60.8, 14, 6), pw2Type: E.typing('••••••••', 62.7, 9, 7), loginSubmit: 64.1, loginDone: 64.9,
  };

  // CH4 translit
  curOn(70.4, 99.0);
  mv(72.0, 1.2, '#tabTr'); click(72.3, 'click');
  mv(74.4, 1.2, '#dirSwap');
  mv(75.8, 1.0, { sel: '#trIn', ox: 0.32, oy: 0.36 }); click(76.0);
  mv(81.8, 1.0, '#trCopy'); click(82.4);
  mv(85.4, 1.0, '#dirSwap'); click(85.8);
  mv(88.6, 0.8, '#trClear'); click(89.0);
  mv(90.4, 1.0, { sel: '#trIn', ox: 0.6, oy: 0.55 });
  mv(94.0, 1.0, '#aiBtn'); click(94.4);
  mv(97.6, 1.4, { sel: '#trOut', ox: 0.8, oy: 0.86 });
  focOn(72.6, 98.4); foc(72.6, '#dirRow', { d: 0.01, pad: 8, r: 16 }); foc(76.0, '#trIn', { d: 0.8, pad: 6, r: 24 }); foc(79.4, '#trOut', { d: 0.8, pad: 6, r: 24 }); foc(85.6, '#dirRow', { d: 0.8, pad: 8, r: 16 }); foc(88.8, '#trIn', { d: 0.8, pad: 6, r: 24 }); foc(93.2, '#aiStrip', { d: 0.8, pad: 8, r: 14 }); foc(96.0, '#trOut', { d: 0.8, pad: 6, r: 24 });
  cap(72.8, 75.6, '1', 'Yoʻnalishni tanlang: Kirill → Lotin');
  cap(75.8, 79.2, '2', 'Matnni kiriting yoki «Qoʻyish» orqali joylang');
  cap(79.4, 81.8, '3', 'Natija avtomatik chiqadi');
  cap(82.0, 85.0, '4', '«Nusxa olish» — tayyor matnni nusxalang');
  cap(85.4, 88.4, '5', 'Teskari yoʻnalish: Lotin → Kirill');
  cap(88.6, 93.0, '6', 'Yangi matn kiritamiz');
  cap(93.2, 98.8, 'AI', 'Shubhali soʻz chiqsa — «AI bilan aniqlash»');
  const TR = { typeA: E.typing(G.trA, 76.3, 13, 11), copy: 82.4, swap: 85.8, clear: 89.0, typeB: E.typing(G.trB, 89.4, 13, 12), aiShow: 93.0, aiClick: 94.4, aiDone: 95.8 };

  // CH5 docx pro
  curOn(100.2, 126.0);
  mv(101.4, 1.0, '#dxC2L'); click(101.6);
  mv(103.2, 1.0, { sel: '#dxDrop', ox: 0.55 }); click(103.4);
  mv(107.8, 1.4, '#dxSubmit'); click(108.0);
  focOn(100.4, 108.6); foc(100.4, '#dxC2L', { d: 0.01, pad: 6, r: 14 }); foc(102.8, '#dxDrop', { d: 0.8, pad: 6, r: 20 }); foc(106.2, '#dxPrice', { d: 0.8, pad: 6, r: 14 }); foc(107.6, '#dxSubmit', { d: 0.6, pad: 6, r: 16 });
  gOn(100.4, 117.4); gOn(123.4, 126.4);
  gcard(100.4, { kick: 'DOCX Transliteration PRO · 1', title: 'Yoʻnalishni tanlang', text: 'Kirill → Lotin yoki Lotin → Kirill.', pos: { x: 80, y: 360 } });
  gcard(102.8, { kick: 'DOCX Transliteration PRO · 2', title: '.DOCX faylni yuklang', text: 'Hujjatni tashlang yoki faylni tanlang — 25 MB gacha.', pos: { x: 80, y: 360 } });
  gcard(105.6, { kick: 'DOCX Transliteration PRO · 3', title: 'Narx avtomatik hisoblanadi', text: 'Toʻlov soʻmdagi balansdan amalga oshiriladi. Fayl yuborilmasa, mablagʻ yechilmaydi.', pos: { x: 80, y: 360 } });
  gcard(108.0, { kick: 'DOCX Transliteration PRO · 4', title: 'Hujjat oʻgirilmoqda', text: 'Matn Lotinga oʻtadi, sahifa tuzilishi esa saqlanadi.', pos: { x: 80, y: 360 } });
  gcard(123.8, { kick: 'DOCX Transliteration PRO · 5', title: 'Tayyor DOCX yuklab olinadi', text: 'Fayl nomi: lotin_maqola_kirill.docx', pos: { x: 80, y: 360 } });
  const DX = { sel: 101.6, pick: 103.4, tokIn: [103.6, 105.0], quote: [105.2, 106.4], submit: 108.0, morph: [108.3, 110.3], scan: [110.6, 116.8], compare: [117.6, 120.0], hold: 123.4, out: [123.6, 125.8] };

  // CH6 imlo
  curOn(127.0, 159.6);
  mv(128.6, 1.4, '#tabCo'); click(128.8);
  mv(130.4, 1.2, { sx: 300, sy: 880 }); ev(130.6, 'grab');
  mv(132.2, 1.6, '#coDrop'); ev(132.3, 'drop');
  mv(135.4, 1.2, '#coStart'); click(135.6);
  mv(157.2, 1.4, '#coJobDl'); click(157.4);
  focOn(129.0, 136.2); foc(129.0, '#tabCo', { d: 0.01 }); foc(131.0, '#coDrop', { d: 0.9, pad: 6, r: 22 }); foc(134.0, '#coPrice', { d: 0.7, pad: 6, r: 12 }); foc(135.2, '#coStart', { d: 0.6, pad: 6, r: 18 });
  focOn(156.4, 158.8); foc(156.4, '#coJob', { d: 0.01, pad: 6, r: 18 });
  gOn(129.2, 142.4); gOn(155.2, 159.6);
  const GX = 1410;
  gcard(129.2, { kick: 'Imlo Tahrirchi · 1', title: 'Word hujjatini yuklang', text: 'Faqat .DOCX fayli qabul qilinadi. Dissertatsiya, maqola, referat.', pos: { x: GX, y: 330 } });
  gcard(132.6, { kick: 'Imlo Tahrirchi · 2', title: 'Hujjat parametrlari aniqlanadi', text: 'Sahifalar soni avtomatik hisoblanadi va xizmat narxi koʻrsatiladi.', pos: { x: GX, y: 330 } });
  gcard(135.6, { kick: 'Imlo Tahrirchi · 3', title: 'Tekshiruv boshlanadi', text: 'Hujjat serverda navbat bilan tekshiriladi.', pos: { x: GX, y: 330 } });
  cap(142.8, 149.0, 'Natija', 'Taxminiy xato soʻzlar sariq rang bilan belgilanadi');
  cap(149.2, 154.6, 'Muhim', 'Matn avtomatik oʻzgartirilmaydi — qolgan qismi oʻz holicha qoladi');
  cap(117.8, 123.4, 'Namuna hujjat', 'Sarlavha, roʻyxat va jadval oʻz joyida qoladi');
  gcard(155.4, { kick: 'Imlo Tahrirchi · 5', title: 'Tayyor DOCX ni yuklab oling', text: 'Fayl nomi: tahrirlangan_referat_maktab.docx', pos: { x: GX, y: 330 } });
  const CO = { tab: 128.8, tokAppear: 129.8, grab: 130.6, drop: 132.3, count: [132.5, 134.0], start: 135.6, job: 136.4, morph: [136.6, 138.4], scan: [138.6, 142.4], ready: 142.4, hls: [[142.8, 144.4, 0], [145.0, 146.6, 1], [147.2, 148.8, 2]], full: [149.2, 151.0], cmp: [151.2, 154.4], back: [154.6, 156.2], dl: 157.4 };

  // CH7 converter
  curOn(159.6, 180.4);
  mv(160.2, 1.2, '#tabCv'); click(160.4);
  mv(161.6, 1.0, { sel: '#cvDrop', oy: 0.35 }); click(161.8);
  mv(164.6, 1.2, '#fmPdf'); click(164.8);
  mv(166.2, 1.0, '#cvGo'); click(166.4);
  mv(170.0, 2.0, { sx: 1500, sy: 960 });
  focOn(161.2, 166.8); foc(161.2, '#cvDrop', { d: 0.01, pad: 6, r: 20 }); foc(164.0, '#fmPdf', { d: 0.7, pad: 5, r: 12 }); foc(166.0, '#cvGo', { d: 0.5, pad: 6, r: 18 });
  cap(160.8, 163.6, '1', 'Faylni yuklang');
  cap(163.8, 166.2, '2', 'Chiqish formatini tanlang: PDF');
  cap(166.4, 171.6, '3', '«Oʻgirish va Yuklab olish»');
  cap(172.0, 176.0, 'Formatlar', 'DOCX, DOC, TXT, PDF, ODT, RTF, HTML va rasmlar');
  cap(176.2, 180.2, 'PDF → Word', 'Natija tanlangan format va rejimga bogʻliq');
  const CV = { tab: 160.4, pick: 161.8, tokIn: [162.0, 163.2], fmt: 164.8, go: 166.4, emerge: [166.8, 168.2], flip: [168.8, 170.4], dl: [170.6, 171.8], fmts: [172.0, 176.2], mode: [176.2, 180.0], out: [179.8, 181.0] };

  // CH8 balance
  curOn(181.6, 230.0);
  focOn(182.8, 186.8); foc(182.8, '#navBal', { d: 0.01, pad: 6, r: 12 }); foc(185.0, '#navShop', { d: 0.7, pad: 6, r: 14 });
  gOn(183.0, 187.4);
  gcard(183.0, { kick: 'Hisob va balans', title: 'Joriy balans shu yerda', text: 'Imlo Tahrirchi va DOCX PRO xizmatlari soʻmdagi balansdan hisoblanadi.', near: 'focus', side: 'below-left' });
  gcard(185.0, { kick: 'Hisob va balans', title: '«Hisobni toʻldirish»', text: 'Balansni toʻldirish oynasini ochadi.', near: 'focus', side: 'below-left' });
  mv(186.6, 1.4, '#navShop'); click(187.0);
  mv(189.9, 1.4, { sel: '#amtInp', ox: 0.3 }); click(190.2);
  mv(192.8, 1.0, '#payBtn'); click(193.0);
  // CH9 payment
  const RAIL_PAY = { kick: 'Toʻlov tizimi', title: 'Bosqichma-bosqich', items: ['Summani kiriting', '«Toʻlovga oʻtish» tugmasini bosing', 'Buyurtma yaratiladi', 'Summa va karta raqamini nusxalang', 'Bank ilovasida oʻtkazma qiling', 'Saytga qayting', '«Men toʻladim» tugmasini bosing', 'Administrator tushumni tekshiradi', 'Toʻlov tasdiqlanadi', 'Balans yangilanadi'] };
  RAILS.push(Object.assign({ t0: 188.0, t1: 225.2, steps: [[188.2, 0], [192.4, 1], [193.4, 2], [195.4, 3], [199.0, 4], [204.4, 5], [207.8, 6], [210.4, 7], [216.6, 8], [219.2, 9], [224.4, 10]] }, RAIL_PAY));
  focOn(188.6, 192.0); foc(188.6, '.bal-card', { d: 0.01, pad: 6, r: 18 }); foc(190.0, '#amtInp', { d: 0.7, pad: 6, r: 14 }); foc(191.6, '.sumrow', { d: 0.6, pad: 6, r: 14 });
  focOn(195.2, 198.8); foc(195.2, '#pcAmt', { d: 0.01, pad: 6, r: 18 }); foc(197.0, '#pcCard', { d: 0.7, pad: 6, r: 18 });
  focOn(205.0, 210.2); foc(205.0, '#payDelay', { d: 0.01, pad: 6, r: 18 });
  focOn(222.6, 224.6); foc(222.6, '#navBal', { d: 0.01, pad: 6, r: 12 });
  mv(196.2, 1.0, '#cpAmt'); click(196.4);
  mv(197.8, 0.9, '#cpCard'); click(198.0);
  mv(202.0, 1.6, '.ph-btn'); click(202.2);
  mv(205.6, 1.6, { sel: '#payDelay', ox: 0.75, oy: 1.2 });
  mv(209.4, 1.0, '#paidBtn'); click(209.6);
  mv(212.0, 1.6, { sel: '#pay', ox: 0.85, oy: 0.95 });
  mv(221.6, 1.4, '#succBtn'); click(221.8);
  mv(224.0, 1.6, { sel: '#navBal', ox: 0.5, oy: 1.6 });
  const PY = { shopOpen: 187.1, amtType: E.typing('5000', 190.5, 5, 9), payClick: 193.0, payOpen: 194.2, cpAmt: 196.4, cpCard: 198.0, bank: [198.8, 204.6], ffA: [205.0, 207.6], btn: 207.6, paid: 209.6, review: 210.3, ffB: [213.0, 216.4], ok: 216.6, close: 218.6, succ: 218.8, succClose: 221.8, count: [222.6, 224.0], declined: [224.6, 229.2] };
  cap(193.2, 194.6, 'Buyurtma', 'Toʻlov buyurtmasi yaratilmoqda', { y: 1000 });
  cap(199.0, 204.4, 'Bank', 'Click, Payme yoki karta orqali aynan koʻrsatilgan summani oʻtkazing', { y: 1000 });
  cap(210.6, 216.4, 'Tekshiruv', 'Mablagʻ faqat administrator tasdiqlagach qoʻshiladi', { y: 1000 });
  cap(224.8, 229.0, 'Muammo boʻlsa', 'Qoʻllab-quvvatlash xizmati yordam beradi', { y: 1000 });

  // sound design cues that are not clicks
  [[0.4, 'tone', { n: 'open' }], [3.3, 'shimmer'], [5.0, 'glass'], [5.3, 'reveal'], [10.8, 'whoosh', { d: 2.2, pan: 0 }], [12.0, 'swell'], [15.6, 'whoosh', { d: 1.6, pan: -0.2 }], [20.6, 'whoosh', { d: 1.4, pan: 0.3 }], [24.0, 'whoosh', { d: 1.2, pan: -0.3 }], [31.2, 'whoosh', { d: 1.4, pan: 0.4 }],
    [38.45, 'glass'], [41.95, 'glass', { soft: 1 }], [53.9, 'confirm'], [54.4, 'whoosh', { d: 1.2, pan: 0.4 }], [57.0, 'tone', { n: 'flash' }], [59.05, 'glass'], [64.9, 'confirm'],
    [69.6, 'whoosh', { d: 2.0, pan: -0.2 }], [80.4, 'sweep'], [85.9, 'swoosh'], [93.0, 'glass', { soft: 1 }], [95.8, 'shimmer'], [96.0, 'confirm', { soft: 1 }], [97.6, 'whoosh', { d: 2.0, pan: 0.1 }],
    [103.6, 'whoosh', { d: 1.2, pan: 0.6 }], [105.0, 'drop'], [108.3, 'swell'], [109.0, 'paper'], [110.6, 'scan', { d: 6.2 }], [116.9, 'confirm', { soft: 1 }], [117.6, 'paper'], [123.6, 'whoosh', { d: 2.0, pan: 0.5 }], [125.0, 'confirm'],
    [126.8, 'whoosh', { d: 1.6, pan: -0.2 }], [129.8, 'glass', { soft: 1 }], [134.0, 'tone', { n: 'price' }], [136.6, 'swell'], [137.2, 'paper'], [138.6, 'scan', { d: 3.8 }], [142.4, 'confirm', { soft: 1 }], [144.0, 'mark'], [146.2, 'mark'], [148.4, 'mark'], [149.2, 'whoosh', { d: 1.6, pan: 0 }], [151.2, 'paper'], [154.6, 'whoosh', { d: 1.4, pan: 0.2 }], [157.6, 'whoosh', { d: 1.2, pan: 0.6 }],
    [162.0, 'whoosh', { d: 1.0, pan: -0.5 }], [163.2, 'drop'], [166.8, 'swell'], [168.0, 'sweep'], [168.8, 'swoosh'], [170.4, 'confirm', { soft: 1 }], [172.0, 'shimmer'], [176.2, 'glass'], [180.4, 'whoosh', { d: 2.2, pan: 0.3 }],
    [187.1, 'glass'], [193.9, 'tone', { n: 'order' }], [194.2, 'glass'], [198.8, 'whoosh', { d: 1.2, pan: 0.6 }], [204.0, 'whoosh', { d: 1.0, pan: -0.6 }], [205.0, 'tick', { d: 2.6 }], [207.6, 'shimmer'], [210.3, 'glass', { soft: 1 }], [213.0, 'tick', { d: 3.4 }], [216.6, 'confirm', { big: 1 }], [218.8, 'glass'], [222.6, 'count', { d: 1.4 }], [224.6, 'swell'],
    [229.4, 'whoosh', { d: 2.6, pan: 0 }], [230.8, 'swell'], [232.6, 'shimmer'], [234.2, 'reveal'], [237.2, 'reveal'], [240.2, 'reveal'], [243.2, 'reveal'], [246.2, 'reveal'], [249.2, 'reveal'],
    [251.8, 'whoosh', { d: 3.0, pan: 0 }], [253.8, 'glass'], [254.8, 'reveal'], [258.5, 'shimmer']].forEach(([t, k, o]) => ev(t, k, o));
  // typing → soft key taps
  const taps = (ty, n) => { ty.times.slice(0, n).forEach((tt) => ev(tt, 'key')); };
  taps(T.nameType, 99); taps(T.idType, 99); taps(T.pwType, 99); taps(T.id2Type, 99); taps(T.pw2Type, 99); taps(TR.typeA, 999); taps(TR.typeB, 999); taps(PY.amtType, 9);

  // chapters
  const CH = [[13.4, 36.0, '02', 'Platforma bilan tanishuv'], [36.0, 70.0, '03', 'Roʻyxatdan oʻtish va kirish'], [70.0, 100.0, '04', 'Kirill ↔ Latin'], [100.0, 127.0, '05', 'DOCX Transliteration PRO'], [127.0, 159.4, '06', 'Imlo Tahrirchi'], [159.4, 181.0, '07', 'Fayl Konverter'], [181.0, 192.6, '08', 'Hisob va balans'], [192.6, 229.6, '09', 'Toʻlov tizimi'], [229.6, 252.4, '10', 'Maxfiylik va xavfsizlik']];
  R('chSeg').innerHTML = CH.map(() => '<i></i>').join('');
  const chSegs = $$('#chSeg i');

  // ================== STATE FUNCTIONS ==================
  const loggedK = (t) => {
    const a = p(t, 54.0, 54.8, Ez.outCubic) * (1 - p(t, 57.0, 57.6, Ez.inOutSine)) + p(t, 64.9, 65.6, Ez.outCubic);
    return clamp(a);
  };
  const scrollY = (t) => track([[0, 0], [15.8, 0], [17.4, 300, Ez.inOutQuart], [20.4, 300], [22.0, 560, Ez.inOutQuart], [23.8, 560], [25.0, 300, Ez.inOutQuart], [30.6, 300], [32.2, 0, Ez.inOutQuart], [69.6, 0], [71.6, 300, Ez.inOutQuart], [97.4, 300], [99.6, 560, Ez.inOutQuart], [126.4, 560], [128.0, 300, Ez.inOutQuart], [181.0, 300], [182.6, 0, Ez.inOutQuart]], t, Ez.linear);
  const tabAt = (t) => (t < CO.tab ? 0 : t < CV.tab ? 1 : 2);
  const tabSwitchT = (t) => (t < CO.tab ? -1 : t < CV.tab ? CO.tab : CV.tab);

  // ================== RENDER ==================
  let lastT = -1;
  function renderAt(t) {
    SC = STAGE.getBoundingClientRect().width / 1920;
    const world = R('world');
    css(world, { transform: 'none', filter: 'none' });

    // ---------- background ----------
    css($('.bg-blob.b1'), { transform: `translate3d(${noise(t * 0.05, 11) * 220}px,${noise(t * 0.04, 12) * 140}px,0) scale(${1 + noise(t * 0.03, 13) * 0.12})` });
    css($('.bg-blob.b2'), { transform: `translate3d(${noise(t * 0.045, 14) * 200}px,${noise(t * 0.05, 15) * 120}px,0)` });
    css($('.bg-blob.b3'), { transform: `translate3d(${noise(t * 0.04, 16) * 260}px,${noise(t * 0.035, 17) * 180}px,0) scale(${1 + noise(t * 0.03, 18) * 0.15})` });
    $$('.bg-lines path').forEach((pp, i) => css(pp, { strokeDasharray: '2400', strokeDashoffset: String(2400 - ((t * 60 * (i + 1) * 0.35) % 4800)), opacity: String(0.6 + 0.4 * Math.sin(t * 0.3 + i)) }));
    for (const d of DUST) {
      const life = 1080 + 160; const y = 1100 - ((t * d.sp + d.ph) % life);
      const k = 1 - (y + 60) / life; const o = d.o * Math.min(1, k * 8, (1 - k) * 8);
      css(d.el, { transform: `translate3d(${d.x + d.dx * k + Math.sin(t * 0.5 + d.ph) * 10}px,${y}px,0)`, opacity: o.toFixed(3) });
    }
    css(R('grain'), { display: 'none' });

    // ---------- browser assembly / recession ----------
    const bIn = p(t, 11.0, 14.4, Ez.guide);
    const bOut = p(t, 229.6, 232.6, Ez.inOutCubic);
    const bTilt = noise(t * 0.07, 21) * 1.2;
    css(R('browser'), {
      opacity: (bIn * (1 - p(t, 231.2, 232.8))).toFixed(3),
      transform: `perspective(2400px) translate3d(0,${(1 - bIn) * 120 + bOut * 40}px,0) rotateX(${(1 - bIn) * 16 + bOut * 8}deg) rotateY(${bTilt}deg) scale(${(0.86 + bIn * 0.14) * (1 - bOut * 0.18)})`,
      filter: bIn < 0.999 || bOut > 0 ? `blur(${((1 - bIn) * 12 + bOut * 8).toFixed(2)}px)` : 'none',
    });
    // site layers rise one after another
    const layer = (node, a, b, dy = 26) => { const k = p(t, a, b, Ez.guide); css(node, { opacity: k.toFixed(3), transform: `translateY(${((1 - k) * dy).toFixed(2)}px)` }); };
    const sy = scrollY(t);
    css(R('site'), { transform: `translateY(${-sy}px)` });
    // header is sticky
    const hk = p(t, 12.2, 13.4, Ez.guide);
    css(R('hdr'), { opacity: hk.toFixed(3), transform: `translateY(${(sy + (1 - hk) * -30).toFixed(2)}px)` });
    layer(R('eyebrow'), 12.6, 13.6, 14);
    heroWords.forEach((w, i) => { const a = 12.8 + i * 0.13; const k = p(t, a, a + 0.8, Ez.guide); css(w, { opacity: k.toFixed(3), transform: `translateY(${((1 - k) * 0.33).toFixed(3)}em)`, backgroundPosition: w.classList.contains('it') ? `${130 - 190 * p(t, 14.4, 16.6, Ez.inOutSine)}% 0` : '' }); });
    layer(R('lead'), 13.4, 14.4, 18); layer(R('aboutPill'), 13.7, 14.6, 14);
    { const k = p(t, 13.6, 15.2, Ez.guide); css(R('shell'), { opacity: k.toFixed(3), transform: `perspective(1600px) translateY(${((1 - k) * 60).toFixed(2)}px) rotateX(${((1 - k) * 14).toFixed(2)}deg)` }); }
    layer($('.guar'), 14.6, 15.6, 10);
    css(R('hbQuill'), { transform: `rotate(${-24 + noise(t * 0.2, 31) * 4}deg) translateY(${noise(t * 0.15, 32) * 6}px)` });

    // ---------- header account state ----------
    const lk = loggedK(t);
    const NW = R('navLogin').__w || (R('navLogin').__w = R('navLogin').offsetWidth);
    const BW = R('navBal').__w || (R('navBal').__w = R('navBal').offsetWidth);
    const AW = R('navAcc').__w || (R('navAcc').__w = R('navAcc').offsetWidth);
    css(R('navLogin'), { maxWidth: `${(NW * (1 - lk)).toFixed(1)}px`, opacity: (1 - lk).toFixed(3), overflow: 'hidden', padding: lk > 0.98 ? '0' : '', marginRight: `${-14 * lk}px` });
    css(R('navBal'), { maxWidth: `${(BW * lk).toFixed(1)}px`, opacity: lk.toFixed(3), overflow: 'hidden', padding: lk < 0.02 ? '0' : '', marginRight: `${-14 * (1 - lk)}px` });
    css(R('navAcc'), { maxWidth: `${(AW * lk).toFixed(1)}px`, opacity: lk.toFixed(3), overflow: 'hidden', padding: lk < 0.02 ? '0' : '', border: lk < 0.02 ? '0' : '' });
    const hovLogin = (t > 37.2 && t < 38.5) || (t > 58.2 && t < 59.0);
    R('navLogin').classList.toggle('hov', hovLogin);
    const balV = t < PY.count[0] ? 0 : t > PY.count[1] ? 5000 : Math.round(5000 * Ez.inOutCubic(inv(PY.count[0], PY.count[1], t)) / 100) * 100;
    R('navBalTxt').textContent = fmt(balV) + ' soʻm';
    R('shopBal').innerHTML = `${fmt(balV)} <small>soʻm</small>`;
    // nav press feedback
    const press = (node, tc) => { const k = win(t, tc - 0.08, tc + 0.22, 0.08, 0.2); css(node, { transform: `scale(${1 - 0.04 * k})` }); };
    press(R('navLogin'), t < 50 ? 38.3 : 58.9); press(R('navShop'), 187.0);

    // ---------- tabs ----------
    const tabs = [R('tabTr'), R('tabCo'), R('tabCv')];
    const ta = tabAt(t), ts = tabSwitchT(t);
    tabs.forEach((n, i) => n.classList.toggle('on', i === ta));
    { const from = ta === 0 ? 0 : ta - 1, a = tabs[from], b = tabs[ta];
      const k = ts < 0 ? 1 : clamp(spring(t - ts, 310, 32, 0.75), -0.2, 1.2);
      const x = lerp(a.offsetLeft, b.offsetLeft, k), w = lerp(a.offsetWidth, b.offsetWidth, k);
      css(R('tabPill'), { left: x.toFixed(2) + 'px', width: w.toFixed(2) + 'px' }); }
    // tab content cross-fade + height spring
    const tcs = [R('tcTr'), R('tcCo'), R('tcCv')];
    tcs.forEach((n, i) => {
      let o = 0, y = 12;
      if (i === ta) { const k = ts < 0 ? 1 : Ez.outCubic(inv(ts + 0.12, ts + 0.5, t)); o = k; y = (1 - k) * 12; }
      else if (ts >= 0 && i === ta - 1) { const k = Ez.inCubic(inv(ts, ts + 0.14, t)); o = 1 - k; y = -7 * k; }
      css(n, { opacity: o.toFixed(3), transform: `translateY(${y.toFixed(2)}px) scale(${(0.994 + 0.006 * o).toFixed(4)})`, visibility: o > 0.002 ? 'visible' : 'hidden' });
    });
    { const hA = tcs[Math.max(0, ta - (ts >= 0 ? 1 : 0))].offsetHeight, hB = tcs[ta].offsetHeight; const k = ts < 0 ? 1 : clamp(spring(t - ts, 210, 30, 0.85), 0, 1.05); css(R('tabContent'), { height: lerp(hA, hB, k).toFixed(1) + 'px' }); }

    // ---------- Kirill ↔ Latin ----------
    css(R('trGate'), { opacity: (1 - lk).toFixed(3), visibility: lk > 0.995 ? 'hidden' : 'visible' });
    const dirLat2Cyr = t >= TR.swap + 0.1;
    R('dirL').classList.toggle('on', !dirLat2Cyr); R('dirR').classList.toggle('on', dirLat2Cyr);
    R('dirL').textContent = 'KIRILL'; R('dirR').textContent = 'LOTIN';
    css(R('dirSwap'), { transform: `rotate(${180 * Ez.inOutCubic(inv(TR.swap, TR.swap + 0.55, t)) + (t > 73.4 && t < 75.4 ? 8 * Math.sin((t - 73.4) * 3) : 0)}deg) scale(${1 + 0.1 * win(t, 73.6, 75.2, 0.3, 0.3)})` });
    R('trInLab').textContent = dirLat2Cyr ? 'LOTIN MATNI' : 'KIRILL MATNI';
    R('trOutLab').textContent = dirLat2Cyr ? 'KIRILL NATIJASI' : 'LOTIN NATIJASI';
    let inTxt = '', outTxt = '', caretOn = false, outAppear = null, wc = 0, aiHL = 0;
    if (t >= TR.typeA.times[0] && t < TR.swap + 0.1) { const n = TR.typeA.count(t); inTxt = G.trA.slice(0, n); outTxt = G.trAPrefix[n]; wc = G.wordsA[n]; caretOn = t < TR.copy; outAppear = (i) => { let k = 0; while (k < G.trAPrefix.length && G.trAPrefix[k].length <= i) k++; return k === 0 ? 0 : TR.typeA.times[k - 1] + 0.05; }; }
    else if (t >= TR.swap + 0.1 && t < TR.clear) { inTxt = G.trAOut; outTxt = G.trABack; wc = 6; outAppear = (i) => TR.swap + 0.25 + i * 0.012; }
    else if (t >= TR.clear && t < TR.typeB.times[0]) { inTxt = ''; outTxt = ''; caretOn = true; }
    else if (t >= TR.typeB.times[0]) { const n = TR.typeB.count(t); inTxt = G.trB.slice(0, n); outTxt = t >= TR.aiDone ? G.trBAi : G.trBPrefix[n]; wc = G.wordsB[n]; caretOn = t < TR.aiShow; outAppear = (i) => { if (t >= TR.aiDone && i < 7) return TR.aiDone; let k = 0; while (k < G.trBPrefix.length && G.trBPrefix[k].length <= i) k++; return k === 0 ? 0 : TR.typeB.times[k - 1] + 0.05; }; aiHL = t >= TR.aiDone ? win(t, TR.aiDone, TR.aiDone + 3.2, 0.3, 1.2) : 0; }
    if (t > 75.8 && t < 76.3) caretOn = true;
    const blink = caretOn && Math.floor(t * 1.9) % 2 === 0;
    { const key = inTxt + '|' + (blink ? 1 : 0);
      if (R('trInText').__k !== key) { R('trInText').__k = key; R('trInText').innerHTML = inTxt ? `${inTxt}${blink ? '<span class="caret"></span>' : ''}` : `${blink ? '<span class="caret"></span>' : ''}<span class="ph" id="trInPh">${dirLat2Cyr ? 'Lotin alifbosidagi matnni bu yerga kiriting...' : 'Kirill alifbosidagi matnni bu yerga kiriting...'}</span>`; } }
    R('trCount').textContent = `${inTxt.length} belgi (${wc} soʻz)`;
    css(trClear, { display: inTxt ? '' : 'none' });
    { const out = R('trOutText'); const key = outTxt + '|' + (t >= TR.aiDone);
      if (out.__k !== key) { out.__k = key; out.innerHTML = outTxt ? Array.from(outTxt).map((c, i) => `<span class="ch${t >= TR.aiDone && i < 6 ? ' aiw' : ''}">${c === ' ' ? ' ' : c}</span>`).join('') : '<span class="ph it">Natija bu yerda aks etadi...</span>'; out.__ch = $$('.ch', out); }
      (out.__ch || []).forEach((s, i) => { const a = outAppear ? outAppear(i) : 0; const k = Ez.guide(inv(a, a + 0.5, t)); css(s, { opacity: k.toFixed(3), transform: k > 0.999 ? 'none' : `perspective(400px) rotateX(${((1 - k) * 80).toFixed(1)}deg) translateY(${((1 - k) * 6).toFixed(1)}px)`, filter: k > 0.99 ? 'none' : `blur(${((1 - k) * 4).toFixed(1)}px)`, background: s.classList.contains('aiw') ? `rgba(230,193,110,${(0.45 * aiHL).toFixed(3)})` : '' }); }); }
    // copy button
    { const copied = t >= TR.copy && t < TR.copy + 2.0; css(R('trCopy'), { opacity: outTxt ? '1' : '0', transform: `scale(${1 - 0.05 * win(t, TR.copy - 0.08, TR.copy + 0.25, 0.08, 0.17)})` }); setIc(R('trCopyIc'), copied ? 'check' : 'copy', 14); R('trCopyTx').textContent = copied ? 'Nusxalandi!' : 'Nusxa olish'; css(R('trCopyIc'), { color: copied ? '#047857' : '' }); }
    // light sweeps across result
    { const s1 = inv(TR.typeA.end - 0.1, TR.typeA.end + 0.9, t), s2 = inv(TR.aiDone, TR.aiDone + 0.9, t), s3 = inv(TR.swap + 0.2, TR.swap + 1.0, t); const s = s2 > 0 && s2 < 1 ? s2 : s3 > 0 && s3 < 1 ? s3 : s1; css(R('trSweep'), { opacity: s > 0 && s < 1 ? '1' : '0', left: `${-160 + Ez.inOutSine(s) * 620}px` }); }
    // AI strip
    { const k = t < TR.aiDone ? p(t, TR.aiShow, TR.aiShow + 0.5, Ez.guide) : 1 - p(t, TR.aiDone + 0.2, TR.aiDone + 0.7); css(R('aiStrip'), { opacity: k.toFixed(3), transform: `translateY(${((1 - k) * 8).toFixed(1)}px)` }); setIc(R('aiBtnIc'), t >= TR.aiClick && t < TR.aiDone ? 'loader-circle' : 'sparkles', 14); css(R('aiBtnIc'), { transform: t >= TR.aiClick && t < TR.aiDone ? `rotate(${t * 400}deg)` : 'none' }); }

    // ---------- DOCX PRO ----------
    R('dxC2L').classList.add('sel');
    css(R('dxC2L'), { transform: `scale(${1 - 0.03 * win(t, DX.sel - 0.08, DX.sel + 0.22, 0.08, 0.2)})` });
    const dxHas = t >= DX.tokIn[1];
    R('dxDrop').classList.toggle('hl', (t > 102.6 && t < 105.4));
    setIc(R('dxUpIc'), dxHas ? 'circle-check' : 'file-up', 24);
    css(R('dxEmpty'), { opacity: dxHas ? '0' : '1' }); css(R('dxFile'), { opacity: p(t, DX.tokIn[1], DX.tokIn[1] + 0.4).toFixed(3) }); css(R('dxRm'), { opacity: p(t, DX.tokIn[1], DX.tokIn[1] + 0.4).toFixed(3) });
    { const k = p(t, DX.quote[0], DX.quote[0] + 0.4, Ez.guide) * (1 - p(t, 126.0, 126.6)); css(R('dxPrice'), { opacity: k.toFixed(3) });
      const done = t >= DX.quote[1]; setIc(R('dxPriceIc'), done ? 'coins' : 'loader-circle', done ? 18 : 16); css(R('dxPriceIc'), { transform: done ? 'none' : `rotate(${t * 400}deg)`, color: '#955D2D' });
      const key = done ? 1 : 0; if (R('dxPriceTx').__k !== key) { R('dxPriceTx').__k = key; R('dxPriceTx').innerHTML = done ? 'Narxi: <span class="masked"></span>' : 'Narx hisoblanmoqda...'; } }
    { const working = t >= DX.submit && t < DX.out[0]; setIc(R('dxSubIc'), working ? 'loader' : 'sparkles', 17); css(R('dxSubIc'), { transform: working ? `rotate(${t * 360}deg)` : 'none' }); R('dxSubTx').textContent = working ? 'Hujjat oʻgirilmoqda...' : 'DOCX o‘girish'; css(R('dxSubArr'), { display: working ? 'none' : '' }); css(R('dxSubmit'), { transform: `translateY(${-2 * win(t, 107.4, 108.1, 0.3, 0.2)}px) scale(${1 - 0.02 * win(t, DX.submit - 0.08, DX.submit + 0.2, 0.08, 0.15)})` }); }
    $$('.masked').forEach((m) => css(m, { backgroundPosition: `${(t * 60) % 200}% 0` }));

    // ---------- Imlo ----------
    const coHas = t >= CO.drop + 0.1;
    R('coDrop').classList.toggle('hl', t > 131.4 && t < CO.drop + 0.15);
    css(R('coEmpty'), { display: coHas ? 'none' : '' }); css(R('coFile'), { display: coHas ? '' : 'none', opacity: p(t, CO.drop, CO.drop + 0.4).toFixed(3) });
    css(R('coCount'), { display: t >= CO.count[0] && t < CO.count[1] ? '' : 'none' }); css(R('coSpin'), { transform: `rotate(${t * 400}deg)` });
    css(R('coPrice'), { display: t >= CO.count[1] ? '' : 'none', opacity: p(t, CO.count[1], CO.count[1] + 0.4).toFixed(3) });
    { const jobOn = t >= CO.job; css(R('coJob'), { display: jobOn ? '' : 'none', opacity: p(t, CO.job, CO.job + 0.4).toFixed(3) });
      const prog = Math.round(100 * Ez.inOutSine(inv(CO.scan[0] - 0.6, CO.ready, t)));
      const ready = t >= CO.ready; R('coJobT').textContent = ready ? 'Hujjat tayyor' : t < CO.job + 0.5 ? 'Navbatda' : 'Hujjat tekshirilmoqda'; R('coJobP').textContent = prog + '%';
      css(R('coJobBar'), { width: prog + '%' });
      R('coJobNote').textContent = ready ? 'Tayyor DOCX-ni yuklab oling — toʻlov faqat yuborish tugagach hisoblanadi.' : 'Tekshiruv fon rejimida davom etadi. Jarayon muvaffaqiyatsiz boʻlsa, mablagʻ yechilmaydi.';
      css(R('coJobDl'), { display: ready ? '' : 'none', transform: `scale(${1 - 0.03 * win(t, CO.dl - 0.08, CO.dl + 0.22, 0.08, 0.15)})` });
      const busy = t >= CO.start && t < CO.job; css(R('coStart'), { display: jobOn ? 'none' : '' }); R('coStart').classList.toggle('dis', !coHas || t < CO.count[1]);
      setIc(R('coStartIc'), busy ? 'loader' : '', 16); css(R('coStartIc'), { transform: `rotate(${t * 360}deg)` }); R('coStartTx').textContent = busy ? 'Gemini AI tahlil qilmoqda...' : 'Tekshirishni boshlash'; css(R('coStartArr'), { display: busy ? 'none' : '' }); }

    // ---------- Converter ----------
    const cvHas = t >= CV.tokIn[1];
    R('cvDrop').classList.toggle('hl', t > 161.4 && t < CV.tokIn[1] + 0.1);
    css(R('cvEmpty'), { display: cvHas ? 'none' : '' }); css(R('cvFile'), { display: cvHas ? '' : 'none', opacity: p(t, CV.tokIn[1], CV.tokIn[1] + 0.4).toFixed(3) });
    R('fmPdf').classList.toggle('sel', t >= CV.fmt); R('fmDocx').classList.toggle('sel', t < CV.fmt); // default target 'docx'
    { const busy = t >= CV.go && t < CV.dl[0]; R('cvGo').classList.toggle('dis', !cvHas); setIc(R('cvGoIc'), busy ? 'loader' : '', 16); css(R('cvGoIc'), { transform: `rotate(${t * 360}deg)` }); R('cvGoTx').textContent = busy ? 'Oʻgirilmoqda...' : 'Oʻgirish va Yuklab olish'; css(R('cvGoArr'), { display: busy ? 'none' : '' }); }

    // ---------- toasts ----------
    const toastK = (a, b) => win(t, a, b, 0.35, 0.4, Ez.outCubic);
    [[R('toastReg'), 54.4, 57.0], [R('toastLogin'), 65.2, 68.6], [R('toastDocx'), 124.8, 128.4]].forEach(([n, a, b]) => { const k = toastK(a, b); css(n, { opacity: k.toFixed(3), transform: `translateX(${((1 - k) * 40).toFixed(1)}px) scale(${(0.95 + 0.05 * k).toFixed(3)})` }); });
    // AI toast reuses DOCX toast element? keep separate: show via caption in film instead (real toast text)
    // ---------- modals ----------
    const modal = (back, box, a, b, spr = [230, 27]) => {
      const kin = a == null ? 0 : clamp(spring(t - a, spr[0], spr[1], 1), 0, 1.2), kout = b == null ? 0 : Ez.inCubic(inv(b, b + 0.28, t));
      const on = t >= a && t < b + 0.3;
      const ko = Math.min(1, kin) * (1 - kout);
      css(back, { opacity: on ? Math.min(1, inv(a, a + 0.25, t) * (1 - kout)).toFixed(3) : '0', visibility: on ? 'visible' : 'hidden' });
      css(box, { transform: `translateY(${((1 - kin) * 24 + kout * 15).toFixed(2)}px) scale(${(0.94 + 0.06 * Math.min(kin, 1.03) - kout * 0.06).toFixed(4)})`, opacity: ko.toFixed(3) });
    };
    // auth: two sessions
    const authA = t < 56 ? T.authOpen : T.authOpen2, authB = t < 56 ? T.regDone : T.loginDone;
    modal(R('authBack'), R('auth'), authA, authB, [300, 26]);
    const reg = t >= T.toReg && t < 56;
    { const k = t < 56 ? p(t, T.toReg, T.toReg + 0.6, Ez.guide) : 0;
      css(R('fName'), { maxHeight: `${(k * 72).toFixed(1)}px`, opacity: k.toFixed(3), marginBottom: `${12 * k}px` });
      const sw = (n, a, b) => { if (n.textContent !== (reg ? b : a)) n.textContent = reg ? b : a; };
      sw(R('authTitle'), 'Akkauntga kirish', 'Yangi hisob ochish'); sw(R('authSub'), 'Balansingiz va xizmatlardan foydalanishni boshqaring', 'Hoziroq roʻyxatdan oʻting!');
      sw(R('authQ'), 'Akkauntingiz yoʻqmi?', 'Allaqachon hisobingiz bormi?'); sw(R('authSw'), 'Roʻyxatdan oʻtish', 'Tizimga kirish');
      const fl = win(t, T.toReg - 0.05, T.toReg + 0.5, 0.15, 0.35); css($('.auth-top'), { opacity: (1 - 0.6 * fl).toFixed(3), filter: fl > 0.01 ? `blur(${(fl * 3).toFixed(2)}px)` : 'none' });
    }
    const fieldState = (vEl, pEl, iEl, ty, focusA, focusB, text, done) => {
      const n = ty ? ty.count(t) : 0; const v = Array.from(text).slice(0, n).join('');
      vEl.textContent = v; css(pEl, { display: v ? 'none' : '' });
      const f = t >= focusA && t < focusB; iEl.classList.toggle('focus', f);
      css($('.caret', iEl), { opacity: f && Math.floor(t * 1.9) % 2 === 0 ? '1' : '0' });
    };
    if (t < 56) {
      fieldState(R('vName'), R('pName'), R('iName'), T.nameType, 43.5, 46.7, 'Demo Foydalanuvchi');
      fieldState(R('vId'), R('pId'), R('iId'), T.idType, 46.7, 49.9, 'demo@example.com');
      fieldState(R('vPw'), R('pPw'), R('iPw'), T.pwType, 49.9, 52.6, '••••••••');
    } else {
      fieldState(R('vId'), R('pId'), R('iId'), T.id2Type, 60.6, 62.5, 'demo@example.com');
      fieldState(R('vPw'), R('pPw'), R('iPw'), T.pw2Type, 62.5, 64.1, '••••••••');
    }
    { const sub = t < 56 ? T.regSubmit : T.loginSubmit, done = t < 56 ? T.regDone : T.loginDone; const busy = t >= sub && t < done;
      setIc(R('authBtnIc'), busy ? 'loader' : '', 16); css(R('authBtnIc'), { transform: `rotate(${t * 360}deg)` });
      R('authBtnTx').textContent = busy ? 'Yuklanmoqda...' : (reg ? 'Roʻyxatdan oʻtish' : 'Tizimga kirish'); css(R('authBtnArr'), { display: busy ? 'none' : '' });
      css(R('authBtn'), { transform: `scale(${1 - 0.03 * win(t, sub - 0.08, sub + 0.22, 0.08, 0.15)})`, opacity: busy ? '.8' : '1' }); }
    // shop
    modal(R('shopBack'), R('shop'), PY.shopOpen, PY.payOpen - 0.2, [240, 26]);
    { const n = PY.amtType.count(t); const v = '5000'.slice(0, n); R('amtVal').textContent = v; css(R('amtPh'), { display: v ? 'none' : '' });
      const f = t >= 190.2 && t < 193.0; R('amtInp').classList.toggle('focus', f); css($('.caret', R('amtInp')), { opacity: f && Math.floor(t * 1.9) % 2 === 0 ? '1' : '0' });
      R('sumVal').textContent = v ? fmt(+v) + ' soʻm' : '— soʻm'; R('payBtn').classList.toggle('dis', !v);
      const busy = t >= PY.payClick && t < PY.payOpen; setIc(R('payBtnIc'), busy ? 'loader' : 'arrow-right', 16); css(R('payBtnIc'), { transform: busy ? `rotate(${t * 360}deg)` : 'none' });
      css(R('payBtn'), { transform: `scale(${1 - 0.03 * win(t, PY.payClick - 0.08, PY.payClick + 0.2, 0.08, 0.15)})` }); }
    // payment experience
    modal(R('payBack'), R('pay'), PY.payOpen, PY.close, [230, 27]);
    { // elapsed seconds since order creation, with two clearly-marked accelerated waits
      const real = Math.max(0, t - PY.payOpen);
      let el2 = real; const fa = PY.ffA, fb = PY.ffB;
      if (t > fa[0]) { const base = fa[0] - PY.payOpen; el2 = base + (25 - base) * Ez.inOutSine(inv(fa[0], fa[1], t)) + Math.max(0, t - fa[1]); }
      if (t > fb[0]) { const before = 25 + (fb[0] - fa[1]); el2 = before + 120 * Ez.inOutSine(inv(fb[0], fb[1], t)) + Math.max(0, t - fb[1]); }
      const left = Math.max(0, 1800 - Math.floor(el2)); R('payClock').textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0');
      R('payDelayN').textContent = String(Math.max(0, 25 - Math.floor(el2)));
      const st = t < PY.review ? 'PENDING' : t < PY.ok ? 'REVIEW' : 'PAID';
      R('payTitle').textContent = { PENDING: 'Toʻlov kutilmoqda', REVIEW: 'Toʻlov tekshirilmoqda', PAID: 'Toʻlov tasdiqlandi' }[st];
      R('payFoot').textContent = st === 'PAID' ? 'Yordam kerakmi? Biz bilan bogʻlaning.' : 'Holat avtomatik tekshiriladi. Oynani yopish buyurtmani bekor qilmaydi.';
      const kp = 1 - p(t, PY.review - 0.05, PY.review + 0.3, Ez.inCubic), kr = p(t, PY.review, PY.review + 0.5, Ez.guide) * (1 - p(t, PY.ok - 0.05, PY.ok + 0.3, Ez.inCubic)), kd = p(t, PY.ok, PY.ok + 0.6, Ez.guide);
      css(R('payPending'), { opacity: kp.toFixed(3), visibility: kp > 0.001 ? 'visible' : 'hidden', transform: `translateY(${(-10 * (1 - kp)).toFixed(1)}px)` });
      css(R('payReview'), { opacity: kr.toFixed(3), transform: `translateY(${(14 * (1 - Math.min(1, kr * 1.2))).toFixed(1)}px)` });
      css(R('payPaid'), { opacity: kd.toFixed(3), transform: `scale(${(0.92 + 0.08 * kd).toFixed(3)})` });
      css(R('pdIc'), { transform: `scale(${(0.6 + 0.4 * clamp(spring(t - PY.ok - 0.1, 200, 18, 1), 0, 1.2)).toFixed(3)})` });
      // rings / spinners
      const pk = ((t - PY.review) % 1.4) / 1.4; css(R('rvPing'), { transform: `scale(${1 + pk * 0.45})`, opacity: (0.8 * (1 - pk)).toFixed(3) });
      css(R('rvSpin'), { transform: `rotate(${t * 360}deg)` }); css(R('paySpin'), { transform: `rotate(${t * 360}deg)` });
      const kb = clamp(spring(t - PY.btn, 260, 22, 1), 0, 1.1);
      css(R('payDelay'), { opacity: (1 - p(t, PY.btn - 0.2, PY.btn + 0.1)).toFixed(3) });
      css(R('paidBtn'), { opacity: Math.min(1, kb).toFixed(3), transform: `translateY(${((1 - kb) * 12).toFixed(1)}px) scale(${(0.98 + 0.02 * Math.min(kb, 1) - 0.015 * win(t, PY.paid - 0.08, PY.paid + 0.2, 0.08, 0.15)).toFixed(4)})` });
      const busyP = t >= PY.paid && t < PY.review; setIc(R('paidBtnIc'), busyP ? 'loader-circle' : 'check-check', 20); css(R('paidBtnIc'), { transform: busyP ? `rotate(${t * 400}deg)` : 'none' });
      setIc(R('cpAmt'), t >= PY.cpAmt && t < PY.cpAmt + 1.8 ? 'check' : 'copy', 16); setIc(R('cpCard'), t >= PY.cpCard && t < PY.cpCard + 1.8 ? 'check' : 'copy', 16);
      css(R('cpAmt'), { background: t >= PY.cpAmt && t < PY.cpAmt + 1.8 ? 'rgba(199,154,62,.18)' : '' }); css(R('cpCard'), { background: t >= PY.cpCard && t < PY.cpCard + 1.8 ? 'rgba(199,154,62,.18)' : '' });
    }
    modal(R('succBack'), R('succ'), PY.succ, PY.succClose, [220, 20]);
    css(R('succBtn'), { transform: `scale(${1 - 0.03 * win(t, PY.succClose - 0.08, PY.succClose + 0.2, 0.08, 0.15)})` });

    // ================= CAMERA =================
    Object.assign(cam, cameraAt(t));
    // depth-of-field when hero FX objects are in front
    const dof = Math.max(
      win(t, DX.morph[0], DX.out[1], 1.2, 1.0), win(t, CO.morph[0], CO.back[1], 1.0, 1.0), win(t, CV.emerge[0], CV.out[1], 1.0, 0.8),
      win(t, PY.bank[0], PY.bank[1], 0.8, 0.8) * 0.6, win(t, PY.declined[0], PY.declined[1] + 0.6, 0.6, 0.8) * 0.8, win(t, 229.4, 251.4, 2.6, 0.8));
    css(world, { transform: `translate(960px,540px) rotate(${cam.rz.toFixed(3)}deg) scale(${cam.z.toFixed(5)}) translate(${(-cam.x).toFixed(3)}px,${(-cam.y).toFixed(3)}px)`, filter: dof > 0.005 ? `blur(${(dof * 9).toFixed(2)}px) brightness(${(1 - dof * 0.35).toFixed(3)})` : 'none' });

    // fragments (world space, parallax by depth)
    const fragK = win(t, 6.4, 14.0, 2.2, 2.6) ;
    const fragFin = p(t, 250.8, 252.0, Ez.guide) * (1 - p(t, 253.5, 254.2, Ez.inCubic));
    for (const f of FR) {
      const par = 1 - f.z; // farther → moves less with the camera
      let x = f.x + (cam.x - 960) * par + noise(t * 0.12, 40 + f.i) * 26, y = f.y + (cam.y - 540) * par + noise(t * 0.1, 50 + f.i) * 20;
      let s = 0.62 + f.z * 0.5, o = fragK * (0.35 + f.z * 0.6), r = f.r + noise(t * 0.1, 60 + f.i) * 2, bl = (1 - f.z) * 5;
      if (fragFin > 0) { // finale: fragments return, then spiral into the centre
        const conv = Ez.inOutCubic(inv(251.9, 254.0, t));
        const tx = cam.x, ty = cam.y + (290 - 540) / cam.z; // the brand mark position, in world space
        const a0 = Math.atan2(f.y - 540, f.x - 960), rad = (1 - conv) * Math.hypot(f.x - 960, f.y - 540) / cam.z;
        x = tx + Math.cos(a0 + conv * 1.1) * rad; y = ty + Math.sin(a0 + conv * 1.1) * rad;
        s *= 1 - conv * 0.7; o = fragFin * (0.7 + f.z * 0.3) * (1 - p(t, 253.4, 254.1)); bl = (1 - f.z) * 2.5 + conv * 1.5;
      }
      css(f.el, { transform: `translate(-50%,-50%) translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`, opacity: o.toFixed(3), filter: bl > 0.1 ? `blur(${bl.toFixed(2)}px)` : 'none', visibility: o > 0.002 ? 'visible' : 'hidden' });
    }

    // ================= FX LAYERS =================
    renderOpening(t); renderDocs(t); renderToken(t); renderConverter(t); renderPayFx(t); renderPrivacy(t); renderFinale(t);

    // ================= UI OVERLAY =================
    renderFocus(t); renderGuide(t); renderRails(t); renderCaption(t); renderChapter(t); renderCursor(t);
    css(R('demoBadge'), { opacity: (0.9 * win(t, 14.0, 252.0, 1.0, 1.0)).toFixed(3) });
    css(R('ffwd'), { opacity: Math.max(win(t, PY.ffA[0] - 0.2, PY.ffA[1] + 0.3, 0.3, 0.3), win(t, PY.ffB[0] - 0.2, PY.ffB[1] + 0.3, 0.3, 0.3)).toFixed(3), transform: 'translate(1430px,140px)' });
    { const fo = Math.max(1 - p(t, 0.0, 1.4, Ez.inOutSine), p(t, 265.6, 267.9, Ez.inOutSine)); css(R('fade'), { opacity: fo.toFixed(3), display: fo > 0.001 ? '' : 'none' }); }
    lastT = t;
  }

  // ---------------- opening ----------------
  const opStroke = R('opStroke'), opL = opStroke.getTotalLength();
  const qs = ['opQ1', 'opQ2', 'opQ3'].map((id) => { const n = R(id); return { n, L: n.getTotalLength() }; });
  const opLine = R('opLine');
  function renderOpening(t) {
    const on = t < 14.2; css(R('open'), { visibility: on ? 'visible' : 'hidden' }); if (!on) return;
    const draw = Ez.inOutSine(inv(0.6, 4.4, t)); const fadeS = 1 - p(t, 4.6, 6.0);
    css(opStroke, { strokeDasharray: `${opL}`, strokeDashoffset: `${(opL * (1 - draw)).toFixed(2)}`, opacity: fadeS.toFixed(3) });
    qs.forEach((q, i) => { const k = Ez.inOutSine(inv(3.0 + i * 0.35, 4.6 + i * 0.35, t)); css(q.n, { strokeDasharray: `${q.L}`, strokeDashoffset: `${(q.L * (1 - k)).toFixed(2)}`, opacity: (1 - p(t, 5.0, 6.0)).toFixed(3) }); });
    css(R('opQuill'), { transform: `translate(960px,${470 - 8 * Ez.inOutSine(inv(3, 6, t))}px) rotate(${-4 + 8 * Ez.inOutSine(inv(2, 7, t))}deg)` });
    // the drawn quill condenses into the brand mark, which then travels to the site header
    const mk = clamp(spring(t - 4.9, 160, 16, 1), 0, 1.15);
    const toHdr = Ez.inOutCubic(inv(11.0, 13.3, t));
    const hdr = rectS(R('brandMark'));
    const x0 = 960 - 75, y0 = 300 - 75;
    const s = (0.3 + 0.7 * mk) * lerp(1, hdr.w / 150, toHdr);
    const x = lerp(x0, hdr.cx - 75, toHdr), y = lerp(y0, hdr.cy - 75, toHdr);
    css(R('opMark'), { opacity: (Math.min(1, mk * 1.3) * (1 - p(t, 13.1, 13.5))).toFixed(3), transform: `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) scale(${s.toFixed(4)}) rotate(${((1 - Math.min(mk, 1)) * -24).toFixed(2)}deg)` });
    css(R('opMarkIc'), { transform: `rotate(${noise(t * 0.4, 70) * 8}deg)` });
    // title letters (Qoʻllanma tg-letter)
    const out = p(t, 10.2, 11.2, Ez.inCubic);
    opLetters.forEach((c, i) => { const a = 5.3 + i * 0.075; const k = Ez.guide(inv(a, a + 0.95, t)); css(c, { opacity: (k * (1 - out)).toFixed(3), transform: `perspective(600px) translateY(${((1 - k) * 34 - out * 20).toFixed(1)}px) rotateX(${((1 - k) * -70).toFixed(1)}deg)`, filter: k > 0.99 && out < 0.01 ? 'none' : `blur(${((1 - k) * 10 + out * 10).toFixed(2)}px)`, backgroundPosition: c.classList.contains('ai') ? `${130 - 240 * Ez.inOutSine(inv(6.6, 9.8, t))}% 0` : '' }); });
    const push = 1 + 0.05 * Ez.inOutSine(inv(5, 11, t));
    css(R('opTitle'), { transform: `translateY(${470}px) scale(${push.toFixed(4)})` });
    wordsAt(R('opSub'), t, 6.9, 0.07, 0.7, 10.0, 0.6);
    css(R('opSub'), { transform: `translateY(${640}px) scale(${push.toFixed(4)})` });
    css(opLine, { opacity: (0.7 * win(t, 7.4, 10.6, 1.2, 0.8)).toFixed(3), transform: `scaleX(${Ez.inOutSine(inv(7.4, 9.0, t))})`, transformOrigin: '960px 760px' });
  }

  // ---------------- documents ----------------
  function placeDoc(node, shadow, x, y, s, rot = 0, op = 1, ry = 0) {
    css(node, { transform: `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) perspective(1800px) rotateY(${ry.toFixed(2)}deg) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(4)})`, opacity: op.toFixed(3) });
    if (shadow) css(shadow, { transform: `translate(${(x + 30 * s).toFixed(2)}px,${(y + 60 * s).toFixed(2)}px) scale(${s.toFixed(4)})`, opacity: (op * 0.9).toFixed(3) });
  }
  const DOC_H = 1100, DOC_W = 820;
  function renderDocs(t) {
    const dxOn = t >= DX.morph[0] && t < DX.out[1], coOn = t >= CO.morph[0] && t < CO.back[1];
    const on = dxOn || coOn; css(R('docStage'), { visibility: on ? 'visible' : 'hidden' }); if (!on) { css(docWin2, { visibility: 'hidden' }); return; }
    const D1 = R('docWin'), D2 = R('docWin2');
    const center = (s) => ({ x: 960 - DOC_W * s / 2, y: 540 - DOC_H * s / 2 });
    const fit = 0.92;
    if (dxOn) {
      R('docName').textContent = 'maqola_kirill.docx';
      css(R('docImlo'), { display: 'none' }); css(R('docCyr'), { display: '' }); css(R('docLat'), { display: '' });
      // morph out of the drop zone
      const src = rectS(R('dxUpIc'));
      const m = Ez.inOutCubic(inv(DX.morph[0], DX.morph[1], t));
      const c = center(fit);
      let x = lerp(src.x, c.x, m), y = lerp(src.y, c.y, m), s = lerp(src.w / DOC_W, fit, m), rot = (1 - m) * -4, op = Math.min(1, m * 3);
      // gentle push while scanning + micro parallax
      const scanK = inv(DX.scan[0], DX.scan[1], t);
      if (t > DX.morph[1]) { const pk = Ez.inOutSine(inv(DX.morph[1], DX.scan[1], t)); s = fit * (1 + 0.04 * pk); const cc = center(s); x = cc.x + noise(t * 0.3, 80) * 4; y = cc.y + noise(t * 0.25, 81) * 3; rot = noise(t * 0.2, 82) * 0.3; }
      // split into AVVAL / KEYIN
      const cmp = Ez.inOutCubic(inv(DX.compare[0], DX.compare[1], t));
      const outK = Ez.inOutCubic(inv(DX.out[0], DX.out[1] - 0.6, t));
      const cs = 0.6; const cR = { x: 1330 - DOC_W * cs / 2, y: 560 - DOC_H * cs / 2 }, cL = { x: 590 - DOC_W * cs / 2, y: 560 - DOC_H * cs / 2 };
      if (cmp > 0) { const ry = -6 * cmp + noise(t * 0.2, 83) * 1.5; x = lerp(x, cR.x, cmp); y = lerp(y, cR.y, cmp); s = lerp(s, cs, cmp); rot = lerp(rot, 0, cmp); placeDoc(D1, R('docShadow'), x, y, s, rot, op, ry); }
      else placeDoc(D1, R('docShadow'), x, y, s, rot, op);
      if (outK > 0) { const tok = { x: 1560, y: 860 }; const ss = lerp(cs, 0.12, outK); placeDoc(D1, R('docShadow'), lerp(cR.x, tok.x, outK), lerp(cR.y, tok.y, outK), ss, 0, 1 - p(t, DX.out[1] - 1.0, DX.out[1] - 0.6)); }
      // second (original) document
      const k2 = cmp * (1 - Ez.inCubic(inv(DX.out[0], DX.out[0] + 0.8, t)));
      css(D2, { visibility: k2 > 0.002 ? 'visible' : 'hidden' });
      if (k2 > 0.002) { W2('docName').textContent = 'maqola_kirill.docx'; W2('docTag').textContent = 'Asl hujjat'; css(W2('docLat'), { display: 'none' }); css(W2('docImlo'), { display: 'none' }); css(W2('docCyr'), { display: '', webkitMaskImage: 'none' }); css(W2('scanline'), { opacity: '0' });
        placeDoc(D2, null, lerp(cR.x, cL.x, cmp), lerp(cR.y, cL.y, cmp) + (1 - cmp) * 10, cs, 0, k2, 6 * cmp + noise(t * 0.2, 84) * 1.5); }
      // scan reveal: Latin above the line, Cyrillic below (soft 46px band)
      const yLine = 60 + (1000 - 60) * Ez.inOutSine(scanK);
      const band = 46;
      const yy = t < DX.scan[0] ? -band : t > DX.scan[1] ? 1200 : yLine;
      css(R('docLat'), { webkitMaskImage: `linear-gradient(to bottom,#000 ${yy - band}px,transparent ${yy + 4}px)` });
      css(R('docCyr'), { webkitMaskImage: `linear-gradient(to bottom,transparent ${yy - 4}px,#000 ${yy + band}px)` });
      css(R('scanline'), { top: `${yy}px`, opacity: win(t, DX.scan[0], DX.scan[1] + 0.2, 0.3, 0.4).toFixed(3) });
      R('docTag').textContent = t < DX.scan[0] ? 'Kirill · asl hujjat' : t < DX.scan[1] ? 'Oʻgirilmoqda…' : 'Lotin · tayyor';
      // labels
      const lk = win(t, DX.compare[0] + 0.8, DX.out[0] + 0.3, 0.6, 0.4);
      css(R('cmpA'), { opacity: lk.toFixed(3), transform: `translate(${590 - 96}px,${150 - (1 - lk) * 14}px)` });
      css(R('cmpB'), { opacity: lk.toFixed(3), transform: `translate(${1330 - 90}px,${150 - (1 - lk) * 14}px)` });
      R('cmpA').innerHTML = '<b>AVVAL</b><span>Кирилл</span>'; R('cmpB').innerHTML = '<b>KEYIN</b><span>Lotin</span>';
    } else {
      R('docName').textContent = 'referat_maktab.docx';
      css(R('docImlo'), { display: '', webkitMaskImage: 'none' }); css(R('docCyr'), { display: 'none' }); css(R('docLat'), { display: 'none' });
      const src = rectS(R('coJob'));
      const m = Ez.inOutCubic(inv(CO.morph[0], CO.morph[1], t));
      const c = center(fit);
      let x = lerp(src.cx - 40, c.x, m), y = lerp(src.cy - 50, c.y, m), s = lerp(0.1, fit, m), rot = (1 - m) * 4, op = Math.min(1, m * 3);
      // zoom onto each highlighted word, then the full page
      let fx = 0, fy = 0, fz = 1; // focus point in paper coords
      const hlPos = (i) => { const n = R('hl' + i); return { x: n.offsetLeft + n.offsetWidth / 2 + 84 * 0, y: n.offsetTop + n.offsetHeight / 2 }; };
      const keys = [[CO.ready, null]];
      const stops = CO.hls.map(([a, b, i]) => [a, b, i]);
      let foc = null;
      for (const [a, b, i] of stops) if (t >= a - 1.2) foc = { a, b, i };
      const zIn = Ez.inOutCubic(inv(CO.hls[0][0] - 0.6, CO.hls[0][0] + 0.8, t)) * (1 - Ez.inOutCubic(inv(CO.full[0], CO.full[1], t)));
      if (zIn > 0) {
        // interpolate focus between words
        const P = CO.hls.map(([a, b, i]) => [a, hlPos(i)]);
        let px = P[0][1].x, py = P[0][1].y;
        for (let j = 1; j < P.length; j++) { const kk = Ez.inOutCubic(inv(P[j][0] - 1.0, P[j][0] + 0.2, t)); px = lerp(px, P[j][1].x, kk); py = lerp(py, P[j][1].y, kk); }
        const zz = lerp(fit, 1.95, zIn);
        // paper point (px,py) in doc-window coords (+40 bar) should sit at screen (960,560)
        const tx = 960 - (px) * zz, ty = 560 - (py + 40) * zz;
        x = lerp(c.x, tx, zIn); y = lerp(c.y, ty, zIn); s = zz; rot = 0;
      }
      const cmp = Ez.inOutCubic(inv(CO.cmp[0], CO.cmp[0] + 1.2, t));
      const back = Ez.inOutCubic(inv(CO.back[0], CO.back[1], t));
      const cs = 0.58;
      const cR = { x: 1080 - DOC_W * cs / 2, y: 540 - DOC_H * cs / 2 }, cL = { x: 620 - DOC_W * cs / 2, y: 520 - DOC_H * cs / 2 };
      if (cmp > 0) { x = lerp(x, cR.x, cmp); y = lerp(y, cR.y, cmp); s = lerp(s, cs, cmp); rot = lerp(rot, 3, cmp); }
      if (back > 0) { const d = rectS(R('coJob')); x = lerp(x, d.cx - 30, back); y = lerp(y, d.cy - 40, back); s = lerp(s, 0.07, back); op = 1 - p(t, CO.back[1] - 0.4, CO.back[1]); }
      placeDoc(D1, R('docShadow'), x, y, s, rot, op);
      // uploaded (clean) version behind
      const k2 = cmp * (1 - back);
      css(D2, { visibility: k2 > 0.002 ? 'visible' : 'hidden' });
      if (k2 > 0.002) { W2('docName').textContent = 'referat_maktab.docx'; W2('docTag').textContent = 'Yuklangan'; css(W2('docLat'), { display: 'none' }); css(W2('docCyr'), { display: 'none' }); css(W2('docImlo'), { display: '' }); css(W2('scanline'), { opacity: '0' }); $$('.hlbg', D2).forEach((h) => css(h, { transform: 'scaleX(0)' }));
        placeDoc(D2, null, lerp(cR.x, cL.x, cmp), lerp(cR.y, cL.y, cmp), cs * (0.96 + 0.04 * cmp), -3 * cmp, k2 * 0.98); }
      // highlights
      CO.hls.forEach(([a, b, i]) => { const k = Ez.outCubic(inv(a + 1.0, a + 1.5, t)); css($('.hlbg', R('hl' + i)), { transform: `scaleX(${k.toFixed(3)})`, boxShadow: k > 0 ? `0 0 ${(12 * win(t, a + 1.0, b + 0.6, 0.2, 0.6)).toFixed(1)}px rgba(255,214,60,.6)` : 'none' }); });
      // processing scan
      const scanK = inv(CO.scan[0], CO.scan[1], t);
      css(R('scanline'), { top: `${60 + 940 * Ez.inOutSine(scanK)}px`, opacity: win(t, CO.scan[0], CO.scan[1] + 0.2, 0.3, 0.4).toFixed(3) });
      const pr = Math.round(100 * Ez.inOutSine(inv(CO.scan[0] - 0.6, CO.ready, t)));
      R('docTag').textContent = t < CO.scan[0] ? 'Yuklangan hujjat' : t < CO.ready ? `Tekshirilmoqda · ${pr}%` : 'Natija · 3 ta soʻz belgilandi';
      const lk = win(t, CO.cmp[0] + 0.8, CO.back[0] + 0.3, 0.6, 0.4);
      R('cmpA').innerHTML = '<b>YUKLANGAN</b><span>asl hujjat</span>'; R('cmpB').innerHTML = '<b>QAYTARILGAN</b><span>xatolar belgilangan</span>';
      css(R('cmpA'), { opacity: lk.toFixed(3), transform: `translate(${620 - 150}px,${130 - (1 - lk) * 14}px)` });
      css(R('cmpB'), { opacity: lk.toFixed(3), transform: `translate(${1080 - 170}px,${150 - (1 - lk) * 14}px)` });
    }
  }

  // ---------------- file token ----------------
  function renderToken(t) {
    const tk = R('ftoken');
    const show = (name, size, ic, dl) => { R('ftName').textContent = name; R('ftSize').textContent = size; R('ftIc').textContent = ic; setIc(R('ftDl'), dl ? 'download' : '', 18); css(R('ftDl'), { display: dl ? '' : 'none' }); };
    let vis = false, x = 0, y = 0, s = 1, o = 1, r = 0;
    if (t >= DX.tokIn[0] - 0.3 && t < DX.tokIn[1] + 0.3) { // picked file flies into DOCX PRO dropzone
      show('maqola_kirill.docx', '48 KB', 'DOCX', false); vis = true;
      const k = Ez.inOutCubic(inv(DX.tokIn[0], DX.tokIn[1], t)); const d = rectS(R('dxUpIc'));
      x = lerp(1560, d.cx - 30, k); y = lerp(1020, d.cy - 30, k); s = lerp(1.1, 0.5, k); o = Math.min(p(t, DX.tokIn[0] - 0.3, DX.tokIn[0] + 0.1), 1 - p(t, DX.tokIn[1] - 0.15, DX.tokIn[1] + 0.2)); r = (1 - k) * 6;
    } else if (t >= DX.out[1] - 1.0 && t < DX.out[1] + 1.4) { // downloaded result
      show('lotin_maqola_kirill.docx', '49 KB · tayyor', 'DOCX', true); vis = true;
      const k = Ez.outCubic(inv(DX.out[1] - 1.0, DX.out[1] - 0.2, t)); const k2 = Ez.inOutCubic(inv(DX.out[1] + 0.2, DX.out[1] + 1.3, t));
      x = 1470 + k2 * 260; y = 820 - k2 * 700; s = (0.7 + 0.3 * k) * (1 - 0.5 * k2); o = k * (1 - k2);
    } else if (t >= CO.tokAppear - 0.3 && t < CO.drop + 0.4) { // drag & drop into Imlo
      show('referat_maktab.docx', '36 KB', 'DOCX', false); vis = true;
      const cur = cursorAt(t); const ap = Ez.guide(inv(CO.tokAppear, CO.tokAppear + 0.6, t));
      const held = t >= CO.grab ? 1 : 0; const lift = p(t, CO.grab, CO.grab + 0.3, Ez.outCubic);
      x = held ? cur.x - 24 : 300 - 40; y = held ? cur.y - 30 : 880 - 30 - (1 - ap) * 30; s = (0.9 + 0.1 * lift) * (1 - 0.6 * p(t, CO.drop, CO.drop + 0.35)); o = ap * (1 - p(t, CO.drop + 0.05, CO.drop + 0.35)); r = held ? -3 * lift + noise(t * 2, 90) * 1.5 : 0;
    } else if (t >= CO.dl && t < CO.dl + 1.8) {
      show('tahrirlangan_referat_maktab.docx', 'tayyor', 'DOCX', true); vis = true;
      const d = rectS(R('coJobDl')); const k = Ez.outCubic(inv(CO.dl, CO.dl + 0.5, t)); const k2 = Ez.inOutCubic(inv(CO.dl + 0.6, CO.dl + 1.7, t));
      x = d.cx - 150 + k2 * 520; y = d.y - 70 * k - k2 * 560; s = 0.8 + 0.2 * k; o = k * (1 - k2);
    } else if (t >= CV.tokIn[0] - 0.3 && t < CV.tokIn[1] + 0.3) {
      show('hisobot.docx', '124 KB', 'DOCX', false); vis = true;
      const k = Ez.inOutCubic(inv(CV.tokIn[0], CV.tokIn[1], t)); const d = rectS(R('cvDrop'));
      x = lerp(220, d.cx - 120, k); y = lerp(1020, d.cy - 40, k); s = lerp(1.1, 0.6, k); o = Math.min(p(t, CV.tokIn[0] - 0.3, CV.tokIn[0] + 0.1), 1 - p(t, CV.tokIn[1] - 0.15, CV.tokIn[1] + 0.2)); r = (1 - k) * -6;
    } else if (t >= CV.dl[0] && t < CV.dl[1] + 0.6) {
      show('hisobot.pdf', 'tayyor', 'PDF', true); vis = true;
      const k = Ez.outCubic(inv(CV.dl[0], CV.dl[0] + 0.5, t)); const k2 = Ez.inOutCubic(inv(CV.dl[1] - 0.4, CV.dl[1] + 0.6, t));
      x = 840 + k2 * 640; y = 860 - k2 * 700; s = 0.9 + 0.1 * k - 0.4 * k2; o = k * (1 - k2);
    }
    css(tk, { visibility: vis && o > 0.002 ? 'visible' : 'hidden', opacity: o.toFixed(3), transform: `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`, transformOrigin: '0 0' });
  }

  // ---------------- converter ----------------
  function renderConverter(t) {
    const on = t >= CV.emerge[0] && t < CV.out[1]; css(R('cvStage'), { visibility: on ? 'visible' : 'hidden' }); if (!on) return;
    const src = rectS(R('cvDrop'));
    const em = Ez.inOutCubic(inv(CV.emerge[0], CV.emerge[1], t)); const fl = Ez.inOutCubic(inv(CV.flip[0], CV.flip[1], t));
    const out = Ez.inCubic(inv(CV.out[0], CV.out[1], t));
    const cx = 960 - 125, cy = 540 - 175;
    const fm = p(t, CV.fmts[0], CV.fmts[0] + 1.0, Ez.inOutCubic), md = p(t, CV.mode[0], CV.mode[0] + 0.9, Ez.inOutCubic);
    const shiftX = -260 * md, sc = 1 - 0.2 * md;
    const x = lerp(src.cx - 125, cx, em) + shiftX, y = lerp(src.cy - 160, cy, em) + noise(t * 0.4, 91) * 4;
    const base = lerp(0.3, 1, em) * sc * (1 - out * 0.6);
    const tilt = noise(t * 0.3, 92) * 4;
    css(R('cvA'), { opacity: (Math.min(1, em * 2) * (1 - out)).toFixed(3), transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) perspective(1200px) rotateY(${(fl * 180 + tilt).toFixed(2)}deg) scale(${base.toFixed(4)})` });
    css(R('cvB'), { opacity: (fl > 0.5 ? 1 : 0) * (1 - out), transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) perspective(1200px) rotateY(${(-180 + fl * 180 + tilt).toFixed(2)}deg) scale(${base.toFixed(4)})` });
    const bk = inv(CV.flip[0] - 0.8, CV.flip[1], t);
    css(R('cvBeam'), { opacity: (bk > 0 && bk < 1 ? Math.sin(bk * Math.PI) : 0).toFixed(3), transform: `translate(${(x - 45).toFixed(1)}px,${(y + 20 + 300 * Ez.inOutSine(bk)).toFixed(1)}px)` });
    // input formats arranged on an arc around the card
    fmtEls.forEach((n, i) => { const a = (-160 + i * (140 / (FMTS.length - 1))) * Math.PI / 180; const k = Ez.guide(inv(CV.fmts[0] + i * 0.08, CV.fmts[0] + 0.7 + i * 0.08, t)) * (1 - p(t, CV.mode[0], CV.mode[0] + 0.6)); const rad = 430 + 20 * Math.sin(t * 0.6 + i);
      const fx = 960 + Math.cos(a) * rad * 1.15, fy = 600 + Math.sin(a) * rad * 0.62 + (1 - k) * 30; css(n, { opacity: k.toFixed(3), transform: `translate(-50%,-50%) translate(${fx.toFixed(1)}px,${fy.toFixed(1)}px) scale(${(0.8 + 0.2 * k).toFixed(3)})`, background: FMTS[i] === 'DOCX' ? 'rgba(199,154,62,.9)' : '' }); });
    css(R('cvMode'), { opacity: (md * (1 - out)).toFixed(3), transform: `translate(${(1010 + (1 - md) * 40).toFixed(1)}px,${(380).toFixed(1)}px)` });
  }

  // ---------------- payment fx ----------------
  function renderPayFx(t) {
    const bk = win(t, PY.bank[0], PY.bank[1], 0.9, 0.8, Ez.inOutCubic);
    css(R('bankHint'), { visibility: bk > 0.002 ? 'visible' : 'hidden', opacity: bk.toFixed(3), transform: `translate(${(1440 + (1 - bk) * 160).toFixed(1)}px,${(260 + noise(t * 0.4, 95) * 6).toFixed(1)}px) rotate(${(-2 + (1 - bk) * 6).toFixed(2)}deg)` });
    css($('.ph-btn'), { transform: `scale(${1 - 0.04 * win(t, 202.1, 202.6, 0.08, 0.3)})` });
    const dk = win(t, PY.declined[0], PY.declined[1], 0.7, 0.7, Ez.inOutCubic);
    css(R('declined'), { visibility: dk > 0.002 ? 'visible' : 'hidden', opacity: dk.toFixed(3), transform: `translate(${(700).toFixed(1)}px,${(400 + (1 - dk) * 30).toFixed(1)}px) scale(${(0.96 + 0.04 * dk).toFixed(3)})` });
  }

  // ---------------- privacy ----------------
  function renderPrivacy(t) {
    const on = t >= 229.8 && t < 256.0; css(R('privacy'), { visibility: on ? 'visible' : 'hidden' }); if (!on) return;
    const k = p(t, 230.4, 232.6, Ez.guide); const out = p(t, 250.2, 252.2, Ez.inOutCubic);
    const CX = 470, CY = 600;
    css(R('pvCore'), { opacity: (k * (1 - out)).toFixed(3), transform: `translate(${CX - 150}px,${(CY - 190 + (1 - k) * 40).toFixed(1)}px) scale(${((0.85 + 0.15 * k) * (1 - 0.5 * out)).toFixed(4)})` });
    css(R('pvShield'), { transform: `scale(${clamp(spring(t - 231.4, 180, 16, 1), 0, 1.2).toFixed(3)})` });
    for (let i = 0; i < 4; i++) { const c = R('pvc' + i); const L = 2 * Math.PI * (150 + i * 62); const d = Ez.inOutSine(inv(230.8 + i * 0.3, 232.6 + i * 0.3, t)); css(c, { cx: CX, cy: CY, opacity: ((1 - out) * (0.9 - 0.15 * i)).toFixed(3), strokeDasharray: i % 2 ? '3 9' : `${L}`, strokeDashoffset: i % 2 ? `${(-t * 14).toFixed(1)}` : `${(L * (1 - d)).toFixed(1)}`, transform: `rotate(${(t * (i % 2 ? -4 : 3)).toFixed(2)}deg)`, transformOrigin: `${CX}px ${CY}px` }); }
    css(R('pvTitle'), { opacity: (p(t, 232.6, 233.6, Ez.guide) * (1 - out)).toFixed(3), transform: `translate(${CX - 250}px,${(150 + (1 - p(t, 232.6, 233.6, Ez.guide)) * 20).toFixed(1)}px)` });
    const IX = 1150;
    pvEls.forEach((n, i) => { const a = 234.2 + i * 3.0; const kk = Ez.guide(inv(a, a + 0.9, t)); const y = 150 + i * 132; css(n, { opacity: (kk * (1 - out)).toFixed(3), transform: `translate(${(IX + (1 - kk) * 40).toFixed(1)}px,${y}px)`, filter: kk > 0.99 ? 'none' : `blur(${((1 - kk) * 6).toFixed(2)}px)`, borderColor: `rgba(230,193,110,${(0.26 + 0.4 * win(t, a, a + 3.0, 0.4, 0.8)).toFixed(3)})` });
      const L = R('pvl' + i); const ex = IX - 6, ey = y + 34; const sx = CX + 160, sy = CY - 40 + i * 16; const dk = Ez.inOutSine(inv(a - 0.3, a + 0.6, t));
      L.setAttribute('d', `M ${sx} ${sy} C ${sx + 220} ${sy}, ${ex - 260} ${ey}, ${ex} ${ey}`); const len = 900; css(L, { strokeDasharray: `${len}`, strokeDashoffset: `${(len * (1 - dk)).toFixed(1)}`, opacity: ((1 - out) * (0.35 + 0.45 * win(t, a, a + 3.0, 0.4, 0.8))).toFixed(3) }); });
  }

  // ---------------- finale ----------------
  function renderFinale(t) {
    const on = t >= 251.6; css(R('finale'), { visibility: on ? 'visible' : 'hidden' }); if (!on) return;
    const mk = clamp(spring(t - 253.3, 150, 15, 1), 0, 1.15);
    const pull = 1.06 - 0.06 * Ez.inOutSine(inv(253.3, 266, t));
    css(R('fnMark'), { opacity: Math.min(1, mk * 1.4).toFixed(3), transform: `translate(${960 - 75}px,${(290 - 75)}px) scale(${((0.2 + 0.8 * mk) * pull).toFixed(4)})`, boxShadow: `0 30px 80px rgba(0,0,0,.5),0 0 ${(60 + 40 * win(t, 253.7, 258, 0.6, 2)).toFixed(0)}px rgba(246,185,103,${(0.25 + 0.2 * win(t, 253.7, 258, 0.6, 2)).toFixed(3)})` });
    fnLetters.forEach((c, i) => { const a = 254.8 + i * 0.075; const k = Ez.guide(inv(a, a + 0.95, t)); css(c, { opacity: k.toFixed(3), transform: `perspective(600px) translateY(${((1 - k) * 34).toFixed(1)}px) rotateX(${((1 - k) * -70).toFixed(1)}deg)`, filter: k > 0.99 ? 'none' : `blur(${((1 - k) * 10).toFixed(2)}px)`, backgroundPosition: c.classList.contains('ai') ? `${130 - 240 * Ez.inOutSine(inv(256.4, 259.6, t))}% 0` : '' }); });
    css(R('fnTitle'), { transform: `translateY(${460}px) scale(${pull.toFixed(4)})` });
    wordsAt(R('fnSub'), t, 256.4, 0.07, 0.7);
    css(R('fnSub'), { transform: `translateY(${625}px) scale(${pull.toFixed(4)})` });
    const u = p(t, 258.4, 259.8, Ez.guide);
    css(R('fnUrl'), { opacity: u.toFixed(3), letterSpacing: `${(0.6 - 0.28 * u).toFixed(3)}em`, transform: `translateY(${(712 + (1 - u) * 10).toFixed(1)}px)` });
  }

  // ---------------- overlay renderers ----------------
  function renderFocus(t) {
    let vis = 0; for (const [a, b] of FOCVIS) vis = Math.max(vis, win(t, a, b, 0.45, 0.45));
    const node = R('focus');
    if (vis < 0.002) { css(node, { opacity: '0' }); node.__r = null; return; }
    let i = -1; while (i < FOC.length - 1 && t >= FOC[i + 1].t) i++;
    if (i < 0) i = 0;
    const cur = focusRect(FOC[i]);
    let r = cur;
    if (i > 0 && t < FOC[i].t + FOC[i].d) { const prev = focusRect(FOC[i - 1]); const k = clamp(spring(t - FOC[i].t, 170, 22, 1), 0, 1.08); r = { x: lerp(prev.x, cur.x, k), y: lerp(prev.y, cur.y, k), w: lerp(prev.w, cur.w, k), h: lerp(prev.h, cur.h, k), r: lerp(prev.r, cur.r, Math.min(k, 1)) }; }
    const breathe = 0.82 + 0.18 * Math.sin(t * 1.85);
    css(node, { opacity: (vis * breathe).toFixed(3), transform: `translate(${r.x.toFixed(2)}px,${r.y.toFixed(2)}px)`, width: r.w.toFixed(2) + 'px', height: r.h.toFixed(2) + 'px', borderRadius: r.r.toFixed(1) + 'px' });
    css(R('fRing'), { '--a': `${((t * 95) % 360).toFixed(1)}deg` });
    const sk = inv(FOC[i].t + 0.3, FOC[i].t + 1.5, t); css(R('fScan'), { '--sx': `${(-40 + 160 * Ez.inOutCubic(sk)).toFixed(1)}%`, opacity: sk > 0 && sk < 1 ? '1' : '0' });
  }
  let gIdx = -2;
  function renderGuide(t) {
    let vis = 0; for (const [a, b] of GVIS) vis = Math.max(vis, win(t, a, b, 0.6, 0.45, Ez.guide));
    const node = R('guide');
    if (vis < 0.002) { css(node, { opacity: '0' }); return; }
    let i = -1; while (i < GC.length - 1 && t >= GC[i + 1].t - 0.3) i++;
    if (i < 0) i = 0;
    const g = GC[i];
    if (gIdx !== i) { gIdx = i; R('gKick').textContent = g.kick; words(R('gTitle'), g.title); words(R('gText'), g.text); R('gSeg').innerHTML = g.seg ? Array.from({ length: g.seg[1] }, () => '<i><b></b></i>').join('') : ''; css(R('gSeg'), { display: g.seg ? '' : 'none' }); }
    const pos = (gg) => {
      if (gg.pos) return gg.pos;
      const f = R('focus'); const tr = f.style.transform.match(/translate\(([-\d.]+)px,([-\d.]+)px\)/); const fx = tr ? +tr[1] : 960, fy = tr ? +tr[2] : 540, fw = parseFloat(f.style.width) || 100, fh = parseFloat(f.style.height) || 60;
      let x = fx + fw / 2 - 215, y = gg.side === 'above' ? fy - 260 : fy + fh + 28;
      if (gg.side === 'below-left') { x = fx + fw - 430; }
      return { x: clamp(x, 60, 1920 - 490), y: clamp(y, 110, 1080 - 280) };
    };
    const P = pos(g); let x = P.x, y = P.y;
    if (i > 0 && GC[i - 1] && t < g.t + 0.9 && GVIS.some(([a, b]) => GC[i - 1].t >= a && g.t <= b)) { const Q = pos(GC[i - 1]); const k = clamp(spring(t - (g.t - 0.3), 160, 22, 1), 0, 1.06); x = lerp(Q.x, P.x, k); y = lerp(Q.y, P.y, k); }
    const vk = Ez.guide(vis);
    css(node, { opacity: vis.toFixed(3), transform: `translate(${x.toFixed(2)}px,${(y + (1 - vk) * 30).toFixed(2)}px) perspective(900px) rotateX(${(noise(t * 0.3, 100) * 2).toFixed(2)}deg) rotateY(${(noise(t * 0.25, 101) * 3).toFixed(2)}deg) scale(${(0.94 + 0.06 * vk).toFixed(4)})` });
    const swap = g.t; const outPrev = 1 - p(t, swap - 0.3, swap, Ez.inCubic);
    css(R('gKick'), { opacity: (t < swap ? outPrev : p(t, swap, swap + 0.4)).toFixed(3) });
    wordsAt(R('gTitle'), t, swap, 0.05, 0.6); wordsAt(R('gText'), t, swap + 0.18, 0.025, 0.55);
    if (g.seg) $$('#gSeg b').forEach((b, j) => css(b, { transform: `scaleX(${j < g.seg[0] ? 1 : j === g.seg[0] ? Ez.outCubic(inv(swap, swap + 0.7, t)) : 0})` }));
  }
  let railKey = '';
  function renderRails(t) {
    const node = R('rail');
    const rl = RAILS.find((r) => t >= r.t0 - 0.1 && t < r.t1 + 0.6);
    if (!rl) { css(node, { opacity: '0' }); return; }
    const vis = win(t, rl.t0, rl.t1, 0.7, 0.55, Ez.guide);
    if (railKey !== rl.title) { railKey = rl.title; R('rKick').textContent = rl.kick; R('rTitle').textContent = rl.title; R('rList').innerHTML = rl.items.map((s, i) => `<div class="r-it"><span class="r-num">${i + 1}</span><span class="r-tx">${s}</span></div>`).join(''); }
    let cur = 0; for (const [tt, i] of rl.steps) if (t >= tt) cur = i;
    const its = $$('.r-it', node);
    its.forEach((n, i) => { n.classList.toggle('cur', i === cur); n.classList.toggle('done', i < cur); const a = rl.t0 + 0.3 + i * 0.07; const k = Ez.guide(inv(a, a + 0.6, t)); css(n, { opacity: k.toFixed(3), transform: `translateX(${((1 - k) * -14).toFixed(1)}px)` }); });
    // long lists scroll so the current step stays in view
    const maxVis = 7; const itemH = 52; const listH = Math.min(its.length, maxVis) * itemH;
    css(R('rList'), { height: listH + 'px' });
    let off = 0; for (const [tt, i] of rl.steps) { const target = clamp(i - 3, 0, Math.max(0, its.length - maxVis)) * itemH; const k = Ez.inOutCubic(inv(tt, tt + 0.6, t)); off = lerp(off, target, k); }
    its.forEach((n) => (n.style.top = ''));
    css(R('rList').firstElementChild ? R('rList') : node, {});
    its.forEach((n) => css(n, { transform: `translate(0,${(-off).toFixed(1)}px)` }));
    const vk = Ez.guide(vis);
    css(node, { opacity: vis.toFixed(3), transform: `translate(${(60 - (1 - vk) * 30).toFixed(1)}px,${(170 + noise(t * 0.2, 110) * 4).toFixed(1)}px)` });
  }
  let capIdx = -1;
  function renderCaption(t) {
    const node = R('caption');
    const c = CAPS.find((c) => t >= c.t0 && t < c.t1 + 0.01);
    if (!c) { css(node, { opacity: '0' }); return; }
    const ci = CAPS.indexOf(c);
    if (capIdx !== ci) { capIdx = ci; R('cK').textContent = c.k; words(R('cT'), c.text); }
    const k = win(t, c.t0, c.t1, 0.4, 0.35, Ez.guide);
    wordsAt(R('cT'), t, c.t0 + 0.05, 0.04, 0.5);
    const w = node.offsetWidth;
    css(node, { opacity: k.toFixed(3), transform: `translate(${(960 - w / 2).toFixed(1)}px,${((c.y || 984) + (1 - k) * 16).toFixed(1)}px)` });
  }
  let chKey = '';
  function renderChapter(t) {
    const c = CH.find((c) => t >= c[0] && t < c[1]);
    if (!c) { css(R('chapter'), { opacity: '0' }); return; }
    if (chKey !== c[2]) { chKey = c[2]; R('chNum').textContent = c[2]; R('chName').textContent = c[3]; chSegs.forEach((s, i) => s.classList.toggle('on', i <= CH.indexOf(c))); }
    css(R('chapter'), { opacity: (0.92 * win(t, c[0], c[1], 0.6, 0.5)).toFixed(3) });
  }
  function renderCursor(t) {
    let vis = 0; for (const [a, b] of CURVIS) vis = Math.max(vis, win(t, a, b, 0.35, 0.35));
    const node = R('cursor');
    if (vis < 0.002) { css(node, { opacity: '0' }); R('ripples').innerHTML = ''; return; }
    const pnt = cursorAt(t);
    let pr = 0; for (const c of CLICKS) pr = Math.max(pr, win(t, c - 0.1, c + 0.18, 0.1, 0.16));
    const drag = t >= CO.grab && t < CO.drop ? 0.08 : 0;
    css(node, { opacity: vis.toFixed(3), transform: `translate(${(pnt.x - 4).toFixed(2)}px,${(pnt.y - 3).toFixed(2)}px)` });
    css($('svg', node), { transform: `scale(${(1 - 0.2 * pr - drag).toFixed(3)})` });
    // ripples
    const rs = CLICKS.filter((c) => t >= c && t < c + 0.75);
    const host = R('ripples');
    while (host.children.length < rs.length) { const d = document.createElement('div'); d.className = 'ripple'; host.appendChild(d); }
    while (host.children.length > rs.length) host.lastChild.remove();
    rs.forEach((c, i) => { const k = Ez.outCubic(inv(c, c + 0.75, t)); css(host.children[i], { transform: `translate(${pnt.x.toFixed(1)}px,${pnt.y.toFixed(1)}px) scale(${(0.2 + 2.4 * k).toFixed(3)})`, opacity: (1 - k).toFixed(3) }); });
  }

  // export
  CUR.sort((a, b) => a.t - b.t); FOC.sort((a, b) => a.t - b.t); GC.sort((a, b) => a.t - b.t);
  EV.sort((a, b) => a.t - b.t);
  window.FILM = { DURATION, FPS, renderAt, events: EV, chapters: CH };
})();
