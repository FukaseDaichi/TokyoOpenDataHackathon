import type { Metadata, Viewport } from 'next';
import './globals.css';
import './zukan.css';

export const metadata: Metadata = {
  title: 'うちの区ちゃん',
  description:
    '東京23区をオープンデータで性格分類し擬人化。10問の診断で、あなたに一番似ている区ちゃんに出会える図鑑。',
  applicationName: 'うちの区ちゃん',
  manifest: '/favicon/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: '48x48' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
