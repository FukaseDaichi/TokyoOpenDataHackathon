import type { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import FirstLoad from '../src/ui/FirstLoad';
import './globals.css';
import './zukan.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  title: 'うちの区ちゃん｜23区タイプ診断（東京23区を擬人化）',
  description:
    'オープンデータでつくった東京23区タイプ診断。10問・約1分で、あなたに一番似ている区ちゃんが見つかります。',
  applicationName: 'うちの区ちゃん',
  ...(SITE_URL && { metadataBase: new URL(SITE_URL) }),
  openGraph: {
    type: 'website',
    siteName: 'うちの区ちゃん',
    locale: 'ja_JP',
    title: 'うちの区ちゃん｜23区タイプ診断',
    description:
      'オープンデータでつくった東京23区タイプ診断。10問・約1分で、あなたに一番似ている区ちゃんが見つかります。',
    images: [{ url: '/og/home.jpg', width: 1200, height: 630, alt: 'うちの区ちゃん — 東京23区擬人化図鑑' }],
  },
  twitter: { card: 'summary_large_image' },
  manifest: '/favicon/site.webmanifest',
  icons: {
    // favicon.svg はベクターでなくbase64 PNG埋め込みの2.5MBファイルだったため除外した（ico/pngで十分）
    icon: [
      { url: '/favicon/favicon.ico', sizes: '48x48' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon/favicon.ico',
    apple: [
      {
        url: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  appleWebApp: {
    title: 'うちの区ちゃん',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// 描画前に実行する初回判定スクリプト。
// - JS有効の印（uk-js）を付け、画像フェードイン等のJS前提の演出をCSS側でゲートする
// - 訪問済みなら uk-revisit を付け、ロード画面をCSSで即非表示にする
// - ハイドレーション失敗時もロード画面が残り続けないよう4秒で強制フェードする
const FIRST_LOAD_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('uk-js');try{if(sessionStorage.getItem('uk-visited'))d.classList.add('uk-revisit')}catch(e){}setTimeout(function(){var el=document.getElementById('first-load');if(el)el.classList.add('uk-fl-hide')},4000)})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: FIRST_LOAD_SCRIPT }} />
      </head>
      <body>
        {/* 初回ロード演出。静的HTMLに含めることでJSロード前から画面を覆う。
            閉じる処理は src/ui/FirstLoad.tsx（本命）と上記スクリプトの4秒フォールバック */}
        <div id="first-load" aria-hidden="true">
          <div className="uk-fl-inner">
            <div className="uk-fl-book">
              <span className="uk-fl-page uk-fl-page-left" />
              <span className="uk-fl-page uk-fl-page-right" />
              <span className="uk-fl-page uk-fl-page-flip" />
            </div>
            <p className="uk-fl-text">うちの区ちゃん図鑑をひらいています…</p>
            <p className="uk-fl-dots">
              <span />
              <span />
              <span />
            </p>
          </div>
        </div>
        <FirstLoad />
        {children}
        {/* GA4。NEXT_PUBLIC_GA_ID未設定時はスクリプト自体を読み込まない */}
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
