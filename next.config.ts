import type { NextConfig } from 'next';

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    '⚠ NEXT_PUBLIC_SITE_URL が未設定です。OGP画像のURLが localhost になります（Xカードが表示されません）'
  );
}

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
