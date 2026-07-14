import { ShareCard, loadWards } from 'uchinokuchan';

const wards = loadWards();
const shibuya = wards.find((w) => w.name === '渋谷区')!;
const adachi = wards.find((w) => w.name === '足立区')!;

// 診断結果のSNSシェア用カード（区のテーマカラーが --ward-color で効く）
export const Shibuya = () => <ShareCard ward={shibuya} />;

export const Adachi = () => <ShareCard ward={adachi} />;
