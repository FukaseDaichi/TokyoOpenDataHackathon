import { Diagnosis } from 'kuchan-shindan-zukan';

// 10問診断フローの1問目（回答を進めた状態はインタラクションが必要なため静的表示は初期状態のみ）
export const FirstQuestion = () => (
  <div style={{ background: '#17110c', padding: '40px 20px', minHeight: 420 }}>
    <Diagnosis onComplete={() => {}} />
  </div>
);
