// セクション見出し用の線画アイコン。絵本世界観に合わせ currentColor の
// ストロークのみで描く（塗りなし・外部アセット依存なし）。

export type SectionIconName =
  | 'quill'
  | 'compass'
  | 'scroll'
  | 'flame'
  | 'chart'
  | 'train'
  | 'friends'
  | 'book';

const PATHS: Record<SectionIconName, React.ReactNode> = {
  // 羽根ペン（キャラクター設定理由）
  quill: (
    <>
      <path d="M19 4c-6 0-11 4-13 10l-1.5 5L9 17.5C15 15.5 19 10 19 4Z" />
      <path d="M5.5 18.5C9 13 13 9 17 6.5" />
    </>
  ),
  // 方位磁針（地図）
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.2 5-4.8 2 2.2-5 4.8-2Z" />
    </>
  ),
  // 巻物（プロフィール）
  scroll: (
    <>
      <path d="M7 4h11a2 2 0 0 1 2 2v1H9" />
      <path d="M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1H9" />
      <path d="M9 10h7M9 13.5h7" />
    </>
  ),
  // 灯火（こころざし）
  flame: (
    <>
      <path d="M12 3c2.5 3 5 5.5 5 9a5 5 0 0 1-10 0c0-1.5.5-2.8 1.3-4.1.6 1 1.4 1.7 2.2 2.1C10 7.5 10.8 5 12 3Z" />
    </>
  ),
  // グラフ（ステータス）
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="M8 16v-5M12 16V8M16 16v-3" />
    </>
  ),
  // 電車（主要駅）
  train: (
    <>
      <rect x="6" y="4" width="12" height="13" rx="2.5" />
      <path d="M6 11h12M9.5 14.5h.01M14.5 14.5h.01M8.5 20l1.2-3M15.5 20l-1.2-3" />
    </>
  ),
  // なかま
  friends: (
    <>
      <circle cx="8.5" cy="9" r="3" />
      <circle cx="16" cy="10.5" r="2.4" />
      <path d="M3.5 19c.6-3 2.6-4.8 5-4.8s4.4 1.8 5 4.8" />
      <path d="M14.6 15.2c2.3-.8 4.8.5 5.6 3.3" />
    </>
  ),
  // 本（出典）
  book: (
    <>
      <path d="M12 6.5C10.5 5 8.5 4.5 5 4.5v13c3.5 0 5.5.5 7 2 1.5-1.5 3.5-2 7-2v-13c-3.5 0-5.5.5-7 2Z" />
      <path d="M12 6.5v13" />
    </>
  ),
};

export function SectionIcon({ name }: { name: SectionIconName }) {
  return (
    <svg
      className="ward-section-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
