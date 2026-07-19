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
  webpack: (config, { isServer }) => {
    // three.js は HeroCanvas（トップ）と WardMap3D（区詳細）の2つの動的チャンクへ
    // 各384KB複製されるため、共有vendorチャンクへ強制分離して1回のDL/キャッシュにする
    if (!isServer && config.optimization?.splitChunks) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        three: {
          test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
          name: 'three-vendor',
          chunks: 'async',
          priority: 40,
          reuseExistingChunk: true,
        },
      };
    }
    return config;
  },
};

export default nextConfig;
