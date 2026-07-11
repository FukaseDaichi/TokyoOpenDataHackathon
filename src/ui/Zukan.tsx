import { loadWards } from '../data/wards';
import type { Ward } from '../domain/axes';
import { ssrImage, wardTheme } from './wardTheme';

const WARDS = loadWards();

/** 図鑑No.（JIS区コード順 = 配列順） */
export function zukanNo(index: number): string {
  return `No.${String(index + 1).padStart(2, '0')}`;
}

export function Zukan({ onSelect }: { onSelect: (w: Ward) => void }) {
  return (
    <div className="zukan-grid">
      {WARDS.map((w, i) => {
        const theme = wardTheme(w.code);
        return (
          <button
            key={w.code}
            className="zukan-card"
            style={{ ['--ward-color' as string]: theme.color }}
            onClick={() => onSelect(w)}
            aria-label={`${w.name}の詳細を見る`}
          >
            <span className="zukan-card-no">{zukanNo(i)}</span>
            {theme.slug ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="zukan-card-img"
                src={ssrImage(theme.slug)}
                alt=""
                loading="lazy"
                width={512}
                height={768}
              />
            ) : (
              <span className="zukan-card-img zukan-card-placeholder" aria-hidden="true" />
            )}
            <span className="zukan-card-name">{w.name}</span>
            <span className="zukan-card-group">{w.group}</span>
          </button>
        );
      })}
    </div>
  );
}
