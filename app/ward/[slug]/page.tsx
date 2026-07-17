import type { Metadata } from 'next';
import { ALL_SLUGS, SLUG_TO_CODE } from '@/data/slugs';
import { WARDS as HERO_WARDS } from '@/hero/wards';
import { WardPage } from '@/ui/pages/WardPage';

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ward = HERO_WARDS.find((w) => w.id === SLUG_TO_CODE[slug])!;
  return {
    title: `${ward.name}ちゃん図鑑 | うちの区ちゃん`,
    description: `${ward.name}のオープンデータ深堀り: ${ward.catch}`,
    alternates: { canonical: `/ward/${slug}/` },
    // layoutのopenGraphは継承されず丸ごと置き換わるため、siteName等もここで指定する
    openGraph: {
      type: 'website',
      siteName: 'うちの区ちゃん',
      locale: 'ja_JP',
      title: `${ward.name}ちゃん図鑑`,
      description: `${ward.catch} — オープンデータで見る${ward.name}の性格`,
      images: [{ url: `/og/${slug}.jpg`, width: 1200, height: 630, alt: `${ward.name}ちゃん` }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <WardPage slug={slug} />;
}
