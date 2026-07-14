import { Zukan } from 'uchinokuchan';

// 23区すべてのカードを図鑑グリッドで表示（クリックで onSelect(ward) が呼ばれる）
export const Grid = () => (
  <div style={{ background: '#17110c', padding: 24 }}>
    <Zukan onSelect={() => {}} />
  </div>
);
