import type { Ward } from '../domain/axes';
import { Radar } from './Radar';
import { ssrImage, wardTheme } from './wardTheme';

/** シェア用の1枚カード（区名・系統・レーダー）。PNG書き出しは別プラン、まずはDOM表示。 */
export function ShareCard({ ward }: { ward: Ward }) {
  const theme = wardTheme(ward.code);
  return (
    <div className="share-card" data-testid="share-card" style={{ ['--ward-color' as string]: theme.color }}>
      <p className="share-card-eyebrow">うちの区ちゃん</p>
      <div className="share-card-main">
        {theme.slug && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ssrImage(theme.slug)} alt="" width={512} height={768} />
        )}
        <div>
          <h4 className="share-card-name">{ward.name}ちゃん</h4>
          <p className="share-card-group">{ward.group}</p>
          <Radar vector={ward.axes} color={theme.color} size={190} />
        </div>
      </div>
      <p className="share-card-tag">#うちの区ちゃん</p>
    </div>
  );
}

/** X（Twitter）シェアリンク。ユーザー自身のクリックで投稿画面を開くだけ。 */
export function xShareUrl(ward: Ward, appUrl: string): string {
  const text = `わたしに一番似ているのは「${ward.name}ちゃん」でした！ #うちの区ちゃん`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}`;
}
