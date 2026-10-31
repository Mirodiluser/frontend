import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://tahrirai.uz";
const siteTitle = "Tahrir AI (TahrirAi) — O‘zbek imlo tekshiruvi va DOCX";
const siteDescription =
  "Tahrir AI (TAHRIR.AI, TahrirAi) — o‘zbek tilidagi matn va Word DOCX hujjatlari uchun imlo tekshiruvi, kirill-lotin transliteratsiyasi va fayl konverteri.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | TAHRIR.AI",
  },
  applicationName: "TAHRIR.AI",
  description: siteDescription,
  keywords: [
    "TahrirAi",
    "Tahrir AI",
    "TAHRIR.AI",
    "tahrirai.uz",
    "o‘zbek imlo tekshiruvi",
    "imlo tahrirchi",
    "kirill lotin",
    "kirill lotin o‘girish",
    "lotin kirill",
    "DOCX transliteratsiya",
    "uzbek spelling checker",
    "hujjat tahrirlash",
    "Word DOCX",
    "fayl konverter",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: siteUrl,
    siteName: "TAHRIR.AI",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
  category: "technology",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": siteUrl + "/#website",
      url: siteUrl + "/",
      name: "TAHRIR.AI",
      alternateName: ["Tahrir AI", "TahrirAi", "TAHRIRAI", "TAHRIR.AI"],
      description: siteDescription,
      inLanguage: "uz",
    },
    {
      "@type": "WebApplication",
      "@id": siteUrl + "/#app",
      name: "TAHRIR.AI",
      alternateName: ["TahrirAi", "Tahrir AI"],
      url: siteUrl + "/",
      description: siteDescription,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      inLanguage: "uz",
      featureList: [
        "O‘zbekcha matnning imlo xatolarini tekshirish",
        "Kirill va lotin yozuvlari orasida transliteratsiya",
        "Word DOCX hujjatlarini transliteratsiya qilish",
        "Hujjat va fayllarni konvertatsiya qilish",
      ],
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
