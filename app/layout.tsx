import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/toast";
import { GlobalErrorHandler } from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PowerWallet — あなたのエネルギーウォレット",
  description:
    "太陽光・蓄電池・EV・家電をひとつに。AIがリアルタイムで最適なエネルギー収益を実現します。2026年4月低圧VPP解禁対応。",
  keywords: ["VPP", "太陽光発電", "蓄電池", "EV", "エネルギー管理", "PowerWallet", "仮想発電所", "売電", "蓄電池最適化"],
  manifest: "/manifest.json",
  metadataBase: new URL("https://powerwallet.jp"),
  openGraph: {
    title: "PowerWallet — 電力を、資産に変える。",
    description:
      "太陽光・蓄電池・EVをAIが最適化。VPP参加で毎月収益を自動獲得。2026年4月低圧VPP解禁対応の個人向けエネルギー銀行。",
    url: "https://powerwallet.jp",
    siteName: "PowerWallet",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PowerWallet — あなたのエネルギーウォレット",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PowerWallet — 電力を、資産に変える。",
    description:
      "太陽光・蓄電池・EVをAIが最適化。VPP参加で毎月収益を自動獲得。",
    images: ["/og-image.png"],
    site: "@powerwallet_jp",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PowerWallet",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <GlobalErrorHandler />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
