import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Oʻzbekcha imlo tekshirish — Word DOCX | TAHRIR AI",
  description: "Oʻzbekcha imlo xatolarini Word DOCX hujjatida tekshirish: faylni yuklash, belgilangan xatolarni koʻrish, tahrirlangan hujjatni olish. TAHRIR AI.",
  alternates: { canonical: "/imlo-tekshirish" },
  openGraph: {
    title: "Oʻzbekcha imlo tekshirish — Word DOCX | TAHRIR AI",
    description: "Oʻzbekcha imlo xatolarini Word DOCX hujjatida tekshirish: faylni yuklash, belgilangan xatolarni koʻrish, tahrirlangan hujjatni olish. TAHRIR AI.",
    url: "https://tahrirai.uz/imlo-tekshirish",
  },
};
const sections = [["Imlo Tahrirchi qanday ishlaydi?","Tahrir qilmoqchi boʻlgan .docx hujjatingizni tanlang. Xizmat sahifalar sonini aniqlab, ish boshlanishidan oldin narxni koʻrsatadi. Tekshiruvdan soʻng xato deb topilgan soʻzlar hujjat ichida belgilangan natijani yuklab olishingiz mumkin."],["Kimlar uchun foydali?","Maqola, referat, kurs ishi, dissertatsiya yoki boshqa Word hujjatini oʻzbek tilida tayyorlaydigan foydalanuvchilar uchun. Tekshiruv natijasi tahrir jarayonida yordam beradi, lekin avtomatik tizim barcha xatolarni mukammal topishi kafolatlanmaydi."],["Qaysi fayl formatini yuborish mumkin?","Imlo Tahrirchi Word DOCX formatidagi fayllar bilan ishlaydi. PDF yoki boshqa formatdagi hujjatlarni tekshirishdan oldin DOCX shaklida tayyorlash kerak. Tayyor natijani yuklab olib, Word dasturida koʻrib chiqishingiz mumkin."],["Maxfiylik haqida","Hujjatlar doimiy fayllar arxivi sifatida saqlanmaydi. Katta fayllar uchun vaqtinchalik server fayllari yaratilishi mumkin; ular vazifa tugagach yoki belgilangan muddatda oʻchiriladi. AI tekshiruvlarida matn qismlari tashqi AI xizmatlariga yuborilishi mumkin."]];
export default function FeaturePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_18%_5%,#965C38_0%,#5A3121_37%,#27180F_100%)] px-4 py-10 text-[#FFF0D9] sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <nav className="flex items-center justify-between gap-3">
          <Link href="/" className="font-serif text-2xl font-bold tracking-wide text-[#F5D4A2]">TAHRIR AI</Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-[#EDC08C]/35 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-[#F7DEC0] transition hover:bg-white/[0.13]"><ArrowLeft size={16} /> Bosh sahifa</Link>
        </nav>
        <header className="mt-16 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F4C58B]">TAHRIR AI · Oʻzbek tili vositalari</p>
          <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-[#FFF0DC] sm:text-5xl">Oʻzbekcha imlo tekshirish</h1>
          <p className="mt-6 text-base leading-8 text-[#F1D8BB] sm:text-lg">TAHRIR AI — oʻzbek tilidagi Word DOCX hujjatlarida imlo xatolarini topishga va ularni koʻrib chiqishga yordam beradigan onlayn vosita.</p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E6B886] to-[#A86B3D] px-6 py-3 font-bold text-[#2C190E] shadow-lg transition hover:brightness-110">
            Vositaning oʻziga oʻtish <ArrowRight size={17}/>
          </Link>
        </header>
        <div className="mt-16 grid gap-5 sm:mt-20">
          {sections.map(([heading,content])=>(
            <section key={heading} className="rounded-2xl border border-[#F3C794]/25 bg-[#3D271B]/70 p-6 sm:p-8">
              <div className="mb-3 flex items-center gap-3 text-[#F5CB91]"><FileText size={20}/><h2 className="text-xl font-bold text-[#FFE7C6]">{heading}</h2></div>
              <p className="text-sm leading-8 text-[#E9CBB0] sm:text-base">{content}</p>
            </section>
          ))}
        </div>
        <aside className="mt-10 flex items-start gap-3 rounded-xl border border-[#E9C791]/30 bg-[#21170F]/60 p-5 text-sm leading-7 text-[#E5C8AA]"><ShieldCheck size={23} className="mt-1 shrink-0 text-[#F5CB91]"/> Natijalarni tekshirish foydali: avtomatik ishlov berish har bir hujjat yoki matn uchun mukammal natijani kafolatlamaydi.</aside>
        <footer className="mt-12 flex flex-wrap gap-5 border-t border-[#ECC08B]/20 pt-6 text-sm text-[#E3BE98]">
          <Link href="/" className="hover:underline">Bosh sahifa</Link>
          <Link href="/about" className="hover:underline">TAHRIR AI haqida</Link>
          <Link href="/imlo-tekshirish" className="hover:underline">Imlo tekshirish</Link>
          <Link href="/kirill-lotin" className="hover:underline">Kirill–lotin</Link>
        </footer>
      </div>
    </main>
  );
}
