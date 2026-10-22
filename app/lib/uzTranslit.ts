/**
 * Oʻzbek tili: Kirill ⇄ Lotin transliteratsiyasi (aniq, deterministik, serversiz).
 *
 * MUHIM: bu fayl yagona manba. Backenddagi `uzTranslit.js` shu fayldan esbuild bilan
 * generatsiya qilinadi (backend/tools/sync-translit.md ga qarang) — qoʻlda tahrirlamang.
 *
 * Qoidalar (2021-yil rasmiy lotin alifbosi):
 *  - oʻ, gʻ — U+02BB (ʻ), tutuq belgisi — U+02BC (ʼ)
 *  - e: soʻz boshida va unlidan keyin «э», undoshdan keyin «е»; ye → «е» (undoshdan keyin «ье»)
 *  - ц: unlidan keyin «ts», boshqa joyda «s»
 *  - BOSH HARFLAR: SHAHAR → ШАҲАР, ШАҲАР → SHAHAR, Шаҳар → Shahar
 */

export interface LatinAnalysis {
  /** Kirill natijasi */
  result: string;
  /** Qoidalar bilan aniq hal qilib boʻlmaydigan soʻzlar (asl yozilishi, takrorsiz) */
  uncertain: string[];
}

/** Soʻzning kalit shakli: kichik harf, apostroflar bir xil. AI tuzatmalari shu kalit boʻyicha qidiriladi. */
export function wordKey(word: string): string {
  return word.toLowerCase().replace(APOS_ALL, "'");
}

const APOS_CHARS = "'`´ʻʼ‘’ʹ";
const APOS_ALL = new RegExp(`[${APOS_CHARS}]`, 'g');
const isApos = (c: string | undefined) => !!c && APOS_CHARS.includes(c);
/** U+02BC — aniq tutuq belgisi (ъ). Qolgan apostroflar o/g dan keyin oʻ/gʻ boʻladi. */
const isTutuq = (c: string | undefined) => c === 'ʼ';

const PROTECTED = new RegExp(
  [
    'https?:\\/\\/[^\\s]+',
    'www\\.[^\\s]+',
    '[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+',
    '[@#][A-Za-z0-9_]+',
  ].join('|'),
  'g',
);

// Lotin soʻzi: harflar, ichida apostrof; oxiridagi apostrof faqat o/g dan keyin (tog', boʻ)
const LATIN_WORD = new RegExp(
  `[A-Za-z]+(?:[${APOS_CHARS}][A-Za-z]+)*(?:(?<=[ogOG])[${APOS_CHARS}](?!ʼ))?`,
  'g',
);
const CYR_WORD = /[Ѐ-ӿ]+/g;

const isUpper = (c: string | undefined) => !!c && c !== c.toLowerCase();
const CYR_VOWELS = 'аеёиоуўэюя';
const CYR_CONS = 'бвгджзйклмнпрстфхцчшқғҳ';

/** Rasmiy yozuvda -tsiya, -tsion kabi qoʻshimcha/boʻlaklar: bu yerda "ts" aniq «ц» */
const TS_SAFE = /^ts(?:iya|iy|ion|ient|ikl|irk|ink|ement|itat|ex|el|ent|enz|ik|ert|iv)/;

/**
 * Lotinda «s» bilan yoziladigan, lekin kirillda «ц» boʻladigan oʻzlashma soʻzlar
 * (sivilizatsiya → цивилизация, sirk → цирк, funksiya → функция, konferensiya → конференция).
 * «s» → «ц» faqat shu aniq qoliplarda; oddiy soʻzlar (sirka, inson, versiya...) oʻzgarmaydi.
 */
const S_TO_TS_START = /^(?:sivil|sirk(?![ao])|sikl|sitat|sifr|sement|sentr|sentner|seremon|sellyul|sezar)/;
const S_TO_TS_MID: RegExp[] = [/(?<=k)s(?=iya|ion|ial)/g, /(?<=prin)s(?=ip)/g, /(?<=kon)s(?=ert)/g, /(?<=en)s(?=iya|ial)/g, /(?<=fran)s(?=iya)/g];
/** -ksiya yunoncha (-ксия): ц emas, с */
const KS_GREEK = /(?:aleks|anoks|anorek|apopleks|asfiks|ataks|ataraks|apraks|epitaks|oks|kaxeks|refleks|fleks|xronaks)(?=iya)/;


function applyCase(src: string, out: string): string {
  return isUpper(src) ? out.toUpperCase() : out;
}

/* ============================================================
 *  LOTIN → KIRILL
 * ============================================================ */
function latinWord(word: string, uncertain: string[]): string {
  const a = Array.from(word);
  const lower = word.toLowerCase().replace(APOS_ALL, "'");
  let out = '';
  let flagged = false;
  // «s» → «ц» boʻladigan joylar (indeks)
  const sToTs = new Set<number>();
  if (S_TO_TS_START.test(lower)) sToTs.add(0);
  for (const re of S_TO_TS_MID) {
    for (const m of lower.matchAll(re)) {
      if (re === S_TO_TS_MID[0] && KS_GREEK.test(lower)) continue;
      sToTs.add(m.index as number);
    }
  }
  const lastOut = () => out[out.length - 1];
  const prevIsVowelOrStart = () => {
    const p = lastOut();
    return !p || CYR_VOWELS.includes(p.toLowerCase());
  };
  const prevIsCons = () => {
    const p = lastOut();
    return !!p && CYR_CONS.includes(p.toLowerCase());
  };

  for (let i = 0; i < a.length; ) {
    const c = a[i];
    const l = c.toLowerCase();
    const n = (a[i + 1] || '').toLowerCase();
    const n2 = a[i + 2];
    const up = isUpper(c);
    const emit = (s: string) => { out += up ? s.toUpperCase() : s; };

    // oʻ, gʻ  (U+02BC bu yerda tutuq — ъ)
    if ((l === 'o' || l === 'g') && isApos(a[i + 1]) && !isTutuq(a[i + 1])) {
      emit(l === 'o' ? 'ў' : 'ғ');
      i += 2;
      continue;
    }
    // yoʻl → й + ў  (y + oʻ)
    if (l === 'y' && n === 'o' && isApos(n2) && !isTutuq(n2)) { emit('й'); i++; continue; }
    if (l === 's' && sToTs.has(i)) { emit('ц'); i++; continue; }
    if (l === 's' && n === 'h') { emit('ш'); i += 2; continue; }
    if (l === 'c' && n === 'h') { emit('ч'); i += 2; continue; }
    if (l === 'y' && (n === 'o' || n === 'u' || n === 'a')) {
      emit(n === 'o' ? 'ё' : n === 'u' ? 'ю' : 'я');
      i += 2;
      continue;
    }
    if (l === 'y' && n === 'e') {
      if (prevIsCons()) { emit('ь'); out += isUpper(a[i + 1]) ? 'Е' : 'е'; }
      else emit('е');
      i += 2;
      continue;
    }
    if (l === 't' && n === 's') {
      if (TS_SAFE.test(lower.slice(i))) { emit('ц'); i += 2; continue; }
      flagged = true; // т+с yoki ц — shubhali
    }
    if (l === 'e') {
      const cy = prevIsVowelOrStart() ? 'э' : 'е';
      out += up ? cy.toUpperCase() : cy;
      i++;
      continue;
    }
    if (isApos(c)) { out += 'ъ'; i++; continue; } // soʻz ichidagi apostrof — tutuq
    const map: Record<string, string> = {
      a: 'а', b: 'б', d: 'д', f: 'ф', g: 'г', h: 'ҳ', i: 'и', j: 'ж', k: 'к', l: 'л', m: 'м',
      n: 'н', o: 'о', p: 'п', q: 'қ', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', x: 'х', y: 'й', z: 'з',
    };
    if (map[l]) emit(map[l]);
    else out += c; // c, w va boshqa notanish harflar oʻzgarmaydi
    i++;
  }
  if (flagged) uncertain.push(word);
  return out;
}

function caseLike(src: string, cyr: string): string {
  if (!cyr) return cyr;
  const letters = Array.from(src).filter((ch) => /[A-Za-z]/.test(ch));
  if (letters.length > 1 && letters.every(isUpper)) return cyr.toUpperCase();
  if (isUpper(src[0])) return cyr[0].toUpperCase() + cyr.slice(1);
  return cyr;
}

/** Lotin → Kirill. `overrides` — kalit (wordKey) → kirill; AI tomonidan aniqlangan soʻzlar uchun. */
export function analyzeLatin(text: string, overrides?: Record<string, string>): LatinAnalysis {
  const uncertain: string[] = [];
  const seen = new Set<string>();
  if (!text) return { result: '', uncertain };

  const convert = (chunk: string) =>
    chunk.replace(LATIN_WORD, (w, offset: number, whole: string) => {
      // Harf+raqam (mp3, A4, x2): oʻzgartirmaymiz
      if (/\d/.test(whole[offset + w.length] || '')) return w;
      const ov = overrides?.[wordKey(w)];
      if (ov) return caseLike(w, ov);
      const before = uncertain.length;
      const r = latinWord(w, uncertain);
      if (uncertain.length > before) {
        const k = wordKey(w);
        if (seen.has(k)) uncertain.pop();
        else seen.add(k);
      }
      return r;
    });

  let result = '';
  let last = 0;
  for (const m of text.matchAll(PROTECTED)) {
    result += convert(text.slice(last, m.index)) + m[0];
    last = (m.index as number) + m[0].length;
  }
  result += convert(text.slice(last));
  return { result, uncertain };
}

export function latinToCyrillic(text: string, overrides?: Record<string, string>): string {
  return analyzeLatin(text, overrides).result;
}

/* ============================================================
 *  KIRILL → LOTIN
 * ============================================================ */
const C2L: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l',
  м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ъ: 'ʼ',
  ь: '', қ: 'q', ҳ: 'h', ы: 'i', э: 'e',
  ё: 'yo', ю: 'yu', я: 'ya', ч: 'ch', ш: 'sh', щ: 'shch', ў: 'oʻ', ғ: 'gʻ',
};

function cyrillicWord(word: string): string {
  const a = Array.from(word);
  let out = '';
  for (let i = 0; i < a.length; i++) {
    const c = a[i];
    const l = c.toLowerCase();
    const prev = (a[i - 1] || '').toLowerCase();
    const up = isUpper(c);
    let r: string | undefined;
    if (l === 'е') r = !prev || CYR_VOWELS.includes(prev) || prev === 'ь' ? 'ye' : 'e';
    else if (l === 'ц') r = prev && (CYR_VOWELS.includes(prev) || prev === 'л') ? 'ts' : 's';
    else r = C2L[l];
    if (r === undefined) { out += c; continue; }
    if (up && r) {
      // Qoʻshni harf ham katta boʻlsa (ШАҲАР, ЁШ) — butun soʻz bosh harf: SHAHAR, YOSH
      const capRun = r.length > 1 && (isUpper(a[i + 1]) || isUpper(a[i - 1]));
      out += capRun ? r.toUpperCase() : r[0].toUpperCase() + r.slice(1);
    } else out += r;
  }
  return out;
}

export function cyrillicToLatin(text: string): string {
  if (!text) return '';
  let result = '';
  let last = 0;
  for (const m of text.matchAll(PROTECTED)) {
    result += text.slice(last, m.index).replace(CYR_WORD, cyrillicWord) + m[0];
    last = (m.index as number) + m[0].length;
  }
  result += text.slice(last).replace(CYR_WORD, cyrillicWord);
  return result;
}

/** Matndagi soʻzlar soni (AI limiti uchun). */
export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
