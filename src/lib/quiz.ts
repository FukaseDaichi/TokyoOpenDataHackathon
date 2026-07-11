import { AXIS_KEYS, type AxisKey, type AxisVector, emptyVector } from '../domain/axes';

export interface QuizOption {
  label: string;
  deltas: Partial<AxisVector>;
}
export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export function scoreAnswers(questions: QuizQuestion[], answers: number[]): AxisVector {
  const sum = emptyVector();
  const count: Record<AxisKey, number> = { liveliness: 0, maturity: 0, greenery: 0, family: 0, luxury: 0 };
  questions.forEach((q, i) => {
    const opt = q.options[answers[i]];
    if (!opt) return;
    for (const key of AXIS_KEYS) {
      const d = opt.deltas[key];
      if (d !== undefined) {
        sum[key] += d;
        count[key] += 1;
      }
    }
  });
  const result = emptyVector();
  for (const key of AXIS_KEYS) result[key] = count[key] ? sum[key] / count[key] : 0;
  return result;
}

// 10問。各回答は対応軸に +1 / -1 を与える。UIコピーは日本語。
export const QUESTIONS: QuizQuestion[] = [
  { id: 'q1', text: '休日の理想の過ごし方は？', options: [
    { label: '賑やかな街を歩き回る', deltas: { liveliness: 1 } },
    { label: '静かに家や近所で過ごす', deltas: { liveliness: -1 } },
  ] },
  { id: 'q2', text: '住むならどっち？', options: [
    { label: '緑や公園が多い場所', deltas: { greenery: 1 } },
    { label: '駅前で何でも揃う都会', deltas: { greenery: -1 } },
  ] },
  { id: 'q3', text: '暮らしのスタイルは？', options: [
    { label: '家族・仲間とわいわい', deltas: { family: 1 } },
    { label: '一人の時間を大切に', deltas: { family: -1 } },
  ] },
  { id: 'q4', text: 'お金の使い方は？', options: [
    { label: '堅実にコツコツ', deltas: { luxury: -1 } },
    { label: '良いものに華やかに', deltas: { luxury: 1 } },
  ] },
  { id: 'q5', text: '好きな街の雰囲気は？', options: [
    { label: '新しく若々しい', deltas: { maturity: -1 } },
    { label: '落ち着いて成熟した', deltas: { maturity: 1 } },
  ] },
  { id: 'q6', text: '夜の過ごし方は？', options: [
    { label: '外食や繁華街へ', deltas: { liveliness: 1 } },
    { label: '家でゆっくり', deltas: { liveliness: -1 } },
  ] },
  { id: 'q7', text: '週末の買い物は？', options: [
    { label: '大型商業施設やブランド', deltas: { luxury: 1 } },
    { label: '地元の商店街やスーパー', deltas: { luxury: -1 } },
  ] },
  { id: 'q8', text: '子育て環境の優先度は？', options: [
    { label: '高い（家族向け重視）', deltas: { family: 1 } },
    { label: '低い（身軽さ重視）', deltas: { family: -1 } },
  ] },
  { id: 'q9', text: '通勤・通学するなら？', options: [
    { label: '職住近接でアクティブに', deltas: { liveliness: 1, greenery: -1 } },
    { label: '郊外からのんびり', deltas: { liveliness: -1, greenery: 1 } },
  ] },
  { id: 'q10', text: '街に求めるのは？', options: [
    { label: '刺激と最先端', deltas: { maturity: -1, luxury: 1 } },
    { label: '安定と暮らしやすさ', deltas: { maturity: 1, luxury: -1 } },
  ] },
];
