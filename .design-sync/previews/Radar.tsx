import { Radar, loadWards, wardTheme } from 'kuchan-shindan-zukan';

const wards = loadWards();
const shibuya = wards.find((w) => w.name === '渋谷区')!;
const setagaya = wards.find((w) => w.name === '世田谷区')!;
const nerima = wards.find((w) => w.name === '練馬区')!;

export const Default = () => <Radar vector={shibuya.axes} />;

export const WardColor = () => <Radar vector={setagaya.axes} color={wardTheme(setagaya.code).color} />;

export const WithOverlay = () => (
  <Radar vector={nerima.axes} color={wardTheme(nerima.code).color} overlay={{ liveliness: 0.2, maturity: -0.4, greenery: 0.6, family: 0.5, luxury: -0.3 }} />
);

export const Small = () => <Radar vector={shibuya.axes} size={140} />;
