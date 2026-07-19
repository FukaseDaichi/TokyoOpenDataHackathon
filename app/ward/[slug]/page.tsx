import type { Metadata } from 'next';
import { ALL_SLUGS, SLUG_TO_CODE } from '@/data/slugs';
import { WARDS as HERO_WARDS } from '@/hero/wards';
import { buildBreadcrumbJsonLd, resolveSiteOrigin, serializeJsonLd } from '@/lib/seo';
import { WardPage } from '@/ui/pages/WardPage';

const SITE_ORIGIN = resolveSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ward = HERO_WARDS.find((w) => w.id === SLUG_TO_CODE[slug])!;
  return {
    title: `${ward.name}ちゃん図鑑 | うちの区ちゃん`,
    description: `${ward.name}の特徴をオープンデータで解説。人口・地価・公園面積など主要指標の23区内順位と、擬人化キャラ「${ward.name}ちゃん」の性格を紹介。${ward.catch}`,
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
  const ward = HERO_WARDS.find((w) => w.id === SLUG_TO_CODE[slug])!;
  const breadcrumb = buildBreadcrumbJsonLd(SITE_ORIGIN, [
    { name: 'うちの区ちゃん', path: '/' },
    { name: `${ward.name}ちゃん図鑑`, path: `/ward/${slug}/` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumb) }} />
      <WardPage slug={slug} />
    </>
  );
}
