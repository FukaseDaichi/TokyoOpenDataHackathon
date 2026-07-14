import type { Metadata } from 'next';
import { ALL_SLUGS, SLUG_TO_CODE } from '@/data/slugs';
import { WARDS as HERO_WARDS } from '@/hero/wards';
import { ResultPage } from '@/ui/pages/ResultPage';

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ward = HERO_WARDS.find((w) => w.id === SLUG_TO_CODE[slug])!;
  return {
    title: `${ward.name}ちゃんタイプ | うちの区ちゃん`,
    description: `診断結果: あなたは${ward.name}ちゃんタイプ。${ward.catch}`,
    // layoutのopenGraphは継承されず丸ごと置き換わるため、siteName等もここで指定する
    openGraph: {
      type: 'website',
      siteName: 'うちの区ちゃん',
      locale: 'ja_JP',
      title: `あなたは${ward.name}ちゃんタイプ！`,
      description: `${ward.catch} — 10問診断であなたに一番似ている区ちゃんが見つかる`,
      images: [{ url: `/og/${slug}.jpg`, width: 1200, height: 630, alt: `${ward.name}ちゃん` }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ResultPage slug={slug} />;
}
