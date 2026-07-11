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
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    title: `${ward.name}ちゃん図鑑 | うちの区ちゃん診断図鑑`,
    description: `${ward.name}のオープンデータ深堀り: ${ward.catch}`,
    ...(site && { metadataBase: new URL(site) }),
    openGraph: { images: [`/og/${slug}.png`], title: `${ward.name}ちゃん図鑑`, description: ward.catch },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <WardPage slug={slug} />;
}
