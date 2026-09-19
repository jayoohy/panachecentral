import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { Preloader } from "@/components/layout/Preloader";
import { PRELOAD_INIT_SCRIPT } from "@/lib/preloader";
import { Providers } from "./providers";

// Brand guide: headlines/section titles use a serif logo-family typeface,
// body/nav/buttons use a clean sans-serif. The Stitch design system pairs Playfair Display
// (italic accents on headlines) with DM Sans.
const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Panache Central | Fine Jewelry, Made to Last", template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/logo/site.webmanifest",
  icons: {
    icon: [
      { url: "/logo/favicon.svg", type: "image/svg+xml" },
      { url: "/logo/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/logo/favicon.ico" },
    ],
    apple: "/logo/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NG",
    title: "Panache Central | Fine Jewelry, Made to Last",
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0A0A0A" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the head script sets data-preload on <html> before React hydrates.
    <html lang="en" className={`${playfairDisplay.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRELOAD_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col bg-onyx font-sans text-bone antialiased">
        <Preloader />
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
