import type { Metadata } from 'next';
import { buildWebSiteJsonLd, resolveSiteOrigin, serializeJsonLd } from '@/lib/seo';
import App from '../src/App';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const SITE_ORIGIN = resolveSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildWebSiteJsonLd(SITE_ORIGIN)) }}
      />
      <App />
    </>
  );
}
