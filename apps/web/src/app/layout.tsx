import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FrameworkProvider } from "@/components/Framework";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Kola UI — composants prêts à copier",
    template: "%s · Kola UI",
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: "Kola UI",
  keywords: ["composants", "UI", "Flutter", "React", "Vue", "HTML", "Tailwind", "Mobile Money", "MTN MoMo", "Orange Money", "FCFA", "Cameroun", "+237"],
  // Aperçu quand on partage le lien (WhatsApp, LinkedIn, Facebook…). L'image vient de app/opengraph-image.png.
  openGraph: {
    type: "website",
    siteName: "Kola UI",
    locale: "fr_FR",
    url: "/",
    title: "Kola UI — composants prêts à copier",
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: "Kola UI — composants prêts à copier", description: SITE_DESCRIPTION },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${bricolage.variable} ${plex.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <FrameworkProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </FrameworkProvider>
        {/* Statistiques de visite Vercel (sans cookies) : à activer dans le tableau de bord Vercel */}
        <Analytics />
      </body>
    </html>
  );
}
