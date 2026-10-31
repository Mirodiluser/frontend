import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileCheck2, FileText, Languages, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "TahrirAi haqida — o‘zbek matnlari uchun AI imlo va DOCX vositalari",
  description:
    "TAHRIR.AI (TahrirAi) nima? O‘zbek tilidagi imlo xatolarini tekshirish, Kirill ↔ Lotin transliteratsiyasi, DOCX hujjatlar bilan ishlash va fayllarni konvertatsiya qilish haqida.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "TahrirAi haqida | TAHRIR.AI",
    description:
      "O‘zbek tili va Word DOCX hujjatlari uchun imlo tekshiruvi, Kirill–Lotin transliteratsiyasi hamda fayl konverteri.",
    url: "https://tahrirai.uz/about",
  },
};

const features = [
  {
    title: "Kirill ↔ Lotin",
    icon: Languages,
    text: "O‘zbekcha matnlarni kirill va lotin yozuvlari o‘rtasida o‘girish uchun qulay onlayn vosita. Oddiy matn bilan ishlash imkoniyati mavjud.",
  },
  {
    title: "Imlo Tahrirchi",
    icon: FileCheck2,
    text: "Word DOCX hujjatlarida ehtimoliy imlo xatolarini aniqlash va belgilashga yordam beradi. Natijani muallif mustaqil ko‘zdan kechirishi tavsiya etiladi.",
  },
  {
    title: "DOCX Transliteration PRO",
    icon: FileText,
    text: "Word hujjatlarini Kirill ↔ Lotin yo‘nalishida o‘girish uchun alohida vosita. Hujjat tuzilishi va formatlash elementlarini imkon qadar saqlashga mo‘ljallangan.",
  },
  {
    title: "Fayl konverter",
    icon: ShieldCheck,
    text: "Turli hujjat formatlari o‘rtasida konvertatsiya qilish. Natija tanlangan format va asl faylning murakkabligiga bog‘liq.",
  },
];

export default function AboutTahrirAi() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_18%_5%,#965C38_0%,#5A3121_37%,#27180F_100%)] px-4 pb-20 pt-8 text-[#FFF0D9] sm:px-8 sm:pt-14">
      <div className="mx-auto max-w-[980px]">
        <nav aria-label="Navigatsiya" className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="font-serif text-2xl font-bold tracking-wide text-[#F5D4A2]">
            TAHRIR.AI
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-[#EDC08C]/35 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-[#F7DEC0] transition hover:bg-white/[0.13]">
            <ArrowLeft size={16} aria-hidden="true" /> Bosh sahifa
          </Link>
        </nav>

        <header className="mt-14 max-w-[790px] sm:mt-20">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F4C58B]">
            TahrirAi · O‘zbek tili texnologiyalari
          </p>
          <h1 className="mt-5 font-serif text-4xl font-bold leading-tight tracking-tight text-[#FFF0DC] sm:text-6xl">
            TAHRIR.AI — o‘zbek matnlari uchun onlayn yordamchi
          </h1>
          <p className="mt-6 text-base leading-8 text-[#F1D8BB] sm:text-lg">
            <strong>TahrirAi</strong> (TAHRIR.AI yoki Tahrir AI) — o‘zbekcha matn va
            Word DOCX hujjatlari bilan ishlashga mo‘ljallangan veb-platforma.
            Unda <strong>Kirill ↔ Lotin</strong> transliteratsiyasi,{" "}
            <strong>Imlo Tahrirchi</strong>, <strong>DOCX Transliteration PRO</strong>{" "}
            va <strong>Fayl Konverter</strong> vositalari jamlangan.
          </p>
          <Link href="/" className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-[#FFE4B8]/65 bg-[linear-gradient(145deg,#E6B886,#A86B3D_65%,#80502F)] px-6 py-3.5 text-sm font-bold text-[#2C190E] shadow-[inset_0_1px_0_#FFF0D3,0_12px_28px_rgba(22,9,3,.2)] transition hover:brightness-110">
            TahrirAi vositalarini ochish <ArrowRight size={17} aria-hidden="true"/>
          </Link>
        </header>

        <section className="mt-16 sm:mt-20" aria-labelledby="feature-title">
          <h2 id="feature-title" className="font-serif text-3xl font-bold">TAHRIR.AI imkoniyatlari</h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-[#DEBC9B]">
            O‘qituvchilar, talabalar, tadqiqotchilar va o‘zbek tilida hujjat tayyorlovchilar uchun vositalar.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-[22px] border border-[#F3C794]/25 bg-[linear-gradient(145deg,rgba(150,97,58,.44),rgba(62,38,25,.65))] p-6 shadow-[inset_0_1px_0_rgba(255,239,210,.18),0_12px_30px_rgba(21,9,3,.13)] backdrop-blur">
                  <Icon size={23} aria-hidden="true" className="text-[#F5C690]"/>
                  <h3 className="mt-4 text-lg font-bold text-[#FFF0DB]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#E8C9AA]">{feature.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-16 rounded-[24px] border border-[#F2C894]/25 bg-[#29180F]/40 p-6 sm:p-9" aria-labelledby="questions-title">
          <h2 id="questions-title" className="font-serif text-3xl font-bold">Ko‘p beriladigan savollar</h2>
          <dl className="mt-7 space-y-7">
            <div>
              <dt className="text-base font-bold text-[#FFE7C6]">TahrirAi nima?</dt>
              <dd className="mt-2 text-sm leading-7 text-[#E8C6A6]">
                TahrirAi — o‘zbek matnlarining imlosini tekshirish, kirill va lotin yozuvlari o‘rtasida o‘girish va DOCX fayllari bilan ishlash uchun onlayn platforma.
              </dd>
            </div>
            <div>
              <dt className="text-base font-bold text-[#FFE7C6]">Tahrir AI saytining manzili qanday?</dt>
              <dd className="mt-2 text-sm leading-7 text-[#E8C6A6]">
                Platformaning asosiy manzili <Link className="font-semibold text-[#F9D19B] underline underline-offset-4" href="/">tahrirai.uz</Link>.
                Qidiruvda TahrirAi, Tahrir AI yoki TAHRIR.AI deb yozishingiz mumkin.
              </dd>
            </div>
            <div>
              <dt className="text-base font-bold text-[#FFE7C6]">DOCX hujjatlar uchun tekshirish pullikmi?</dt>
              <dd className="mt-2 text-sm leading-7 text-[#E8C6A6]">
                Ayrim DOCX xizmatlari tangalar orqali hisoblanadi. Aniq narx hujjat yuklangach,
                ish boshlanishidan oldin ko‘rsatiladi.
              </dd>
            </div>
            <div>
              <dt className="text-base font-bold text-[#FFE7C6]">Imlo tekshiruvi har doim to‘g‘ri natija beradimi?</dt>
              <dd className="mt-2 text-sm leading-7 text-[#E8C6A6]">
                Avtomatik tekshiruv xatolarga e’tibor qaratishda yordam beradi, lekin
                natijada noto‘g‘ri belgilash yoki ayrim xatolarni o‘tkazib yuborish ehtimoli bor.
                Ayniqsa ilmiy va rasmiy hujjatlarni yakuniy tekshirishda muallif nazorati muhim.
              </dd>
            </div>
          </dl>
        </section>
        <footer className="mt-12 border-t border-[#ECC08B]/20 pt-6 text-sm text-[#DBB68E]">
          <Link href="/" className="font-semibold text-[#F2CD9F] hover:underline">TAHRIR.AI — Bosh sahifa</Link>
          <span className="mx-3" aria-hidden="true">·</span>
          <span>O‘zbek matnlari va Word hujjatlari uchun vositalar</span>
        </footer>
      </div>
    </main>
  );
}
