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
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    title: `${ward.name}ちゃんタイプ | うちの区ちゃん`,
    description: `診断結果: あなたは${ward.name}ちゃんタイプ。${ward.catch}`,
    ...(site && { metadataBase: new URL(site) }),
    openGraph: { images: [`/og/${slug}.png`], title: `${ward.name}ちゃんタイプ`, description: ward.catch },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ResultPage slug={slug} />;
}
