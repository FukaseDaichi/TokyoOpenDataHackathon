// GA4計測の薄いラッパー。gtagは app/layout.tsx の <GoogleAnalytics> が定義する。
// gtag不在（NEXT_PUBLIC_GA_ID未設定・SSR・広告ブロック）や送信時例外は無音のno-opとし、
// 計測が診断フローを止めることは絶対にない。

type GtagFn = (command: 'event', eventName: string, params: Record<string, string | number>) => void;

function gaEvent(name: string, params: Record<string, string | number>): void {
  if (typeof window === 'undefined') return;
  try {
    const gtag = (window as Window & { gtag?: GtagFn }).gtag;
    if (typeof gtag !== 'function') return;
    gtag('event', name, params);
  } catch {
    // 計測失敗はUIへ影響させない
  }
}

/** 診断で1問回答が確定するたびに送る。choiceIndexは0始まりの選択肢番号。 */
export function trackDiagnosisAnswer(questionId: string, choiceIndex: number): void {
  gaEvent('diagnosis_answer', { question_id: questionId, choice_index: choiceIndex });
}

/** 診断結果（マッチした区）が確定したときに送る。 */
export function trackDiagnosisResult(wardSlug: string): void {
  gaEvent('diagnosis_result', { ward_slug: wardSlug });
}
