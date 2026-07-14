// 初回ロード演出の純ロジック。
// - 初回判定はsessionStorage（不可環境では常に初回扱い＝表示して閉じるだけ）
// - プリロードは「全完了 or タイムアウト」の早い方で必ず解決し、失敗しても待たせない
export const VISITED_KEY = 'uk-visited';

/** ヒーロー序盤でクローズアップされる区（manifest.tsのCLOSEUPSと対応） */
const CLOSEUP_SLUGS = ['chiyoda', 'shinjuku', 'koto'] as const;

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

/** 初回に先読みする画像URL。合計1MB前後に収める */
export function firstLoadPreloadUrls(textureWidth: 512 | 896): string[] {
  return [
    '/title-w720.webp',
    ...CLOSEUP_SLUGS.map((slug) => `/characters/ssr/${slug}-w${textureWidth}.webp`),
  ];
}

export function hasVisited(storage: StorageLike | null): boolean {
  try {
    return storage?.getItem(VISITED_KEY) !== null && storage !== null;
  } catch {
    return false;
  }
}

export function markVisited(storage: StorageLike | null): void {
  try {
    storage?.setItem(VISITED_KEY, '1');
  } catch {
    // プライベートモード等で保存できなくても演出は成立する
  }
}

/** 全URLのロード完了かtimeoutMsの早い方で解決する。rejectしない */
export function waitForPreload(
  urls: string[],
  timeoutMs: number,
  loadImage: (url: string) => Promise<void>,
): Promise<void> {
  const all = Promise.all(urls.map((url) => loadImage(url).catch(() => {})));
  const timeout = new Promise<void>((resolve) => {
    setTimeout(resolve, timeoutMs);
  });
  return Promise.race([all, timeout]).then(() => {});
}
