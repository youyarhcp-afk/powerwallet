import type { Metadata, Viewport } from "next";
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

export const metadata: Metadata = {
  title: "PowerWallet — あなたのエネルギーウォレット",
  description:
    "太陽光・蓄電池・EV・家電をひとつに。AIがリアルタイムで最適なエネルギー収益を実現します。2026年4月低圧VPP解禁対応。",
  keywords: ["VPP", "太陽光発電", "蓄電池", "EV", "エネルギー管理", "PowerWallet"],
};

export const viewport: Viewport = {
  themeColor: "#050505",
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
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
