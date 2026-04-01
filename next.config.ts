import type { NextConfig } from "next";

/**
 * PowerWallet — Next.js 設定
 * セキュリティ強化・パフォーマンス最適化
 */

// CSP ディレクティブ構築
const ContentSecurityPolicy = [
  // デフォルト: 自サイトのみ
  "default-src 'self'",
  // スクリプト: 自サイト + Next.js インラインスクリプト用 unsafe-inline（本番はnonce推奨）
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
  // スタイル: 自サイト + Googleフォント
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // フォント
  "font-src 'self' https://fonts.gstatic.com",
  // 画像: 自サイト + data URIs + Supabase Storage
  "img-src 'self' data: blob: https://*.supabase.co",
  // 接続先: 自サイト + Supabase + Open-Meteo + Stripe
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.open-meteo.com https://api.stripe.com https://js.stripe.com",
  // iFrame: Stripe Checkout用
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  // フォーム: 自サイトのみ
  "form-action 'self'",
  // アップグレード: HTTPSを強制
  "upgrade-insecure-requests",
].join("; ")

const nextConfig: NextConfig = {
  // 本番ビルド最適化
  compress: true,

  // 画像最適化（Supabase StorageのURLを許可）
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  // セキュリティヘッダー
  async headers() {
    return [
      {
        // 全ルートに適用
        source: "/(.*)",
        headers: [
          // クリックジャッキング防止
          { key: "X-Frame-Options", value: "DENY" },
          // MIMEタイプスニッフィング防止
          { key: "X-Content-Type-Options", value: "nosniff" },
          // XSSフィルター（レガシーブラウザ対応）
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // リファラーポリシー
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // HSTS（1年間 + サブドメイン含む）
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // Permissions Policy（不要なブラウザAPIを制限）
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=(self)",   // 所在地入力で必要な場合に備えてselfは許可
              "interest-cohort=()",
              "payment=(self https://js.stripe.com)",
            ].join(", "),
          },
          // CSP
          { key: "Content-Security-Policy", value: ContentSecurityPolicy },
        ],
      },
      {
        // APIルートには追加でキャッシュ制御
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
      {
        // 静的アセットは長期キャッシュ
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // manifest.jsonはキャッシュ短め
        source: "/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600" },
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },
    ];
  },

  // Webpack設定（バンドルサイズ最適化）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack(config: any, { isServer }: { isServer: boolean }) {
    if (!isServer) {
      // クライアントバンドルからNode.js専用モジュールを除外
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    return config
  },
};

export default nextConfig;
