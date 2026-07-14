import { WardDetail, loadWards } from 'uchinokuchan';

const wards = loadWards();
const suginami = wards.find((w) => w.name === '杉並区')!;
const chiyoda = wards.find((w) => w.name === '千代田区')!;

export const Default = () => <WardDetail ward={suginami} />;

// 診断結果画面と同じ「あなたの回答」オーバーレイ付き
export const WithUserOverlay = () => (
  <WardDetail
    ward={chiyoda}
    userOverlay={{ liveliness: 0.7, maturity: -0.2, greenery: -0.5, family: -0.4, luxury: 0.8 }}
  />
);
