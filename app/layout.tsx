import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'うちの区ちゃん診断図鑑',
  description:
    '東京23区をオープンデータで性格分類し擬人化。10問の診断で、あなたに一番似ている区ちゃんに出会える図鑑。',
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
