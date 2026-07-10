'use client';

// 3Dヒーローの統合コンポーネント。
// - ページ全体を450vhにし、Canvasは100vhでsticky固定（ネイティブスクロールを奪わない）
// - 品質ティア: high / low はWebGL、fallback（reduced-motion・WebGL不可・初期化失敗）は2D絵本
// - Canvasは next/dynamic + ssr:false でクライアント側のみ読み込む
import dynamic from 'next/dynamic';
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createHudState } from './hud';
import { detectQuality, type QualityTier } from './quality';
import { useScrollProgress } from './useScrollProgress';
import HeroOverlay from './HeroOverlay';
import Hero2DFallback from './Hero2DFallback';

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false });

class CanvasErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export interface HeroProps {
  onSelectWard: (id: string) => void;
  onCtaClick: () => void;
}

export default function Hero({ onSelectWard, onCtaClick }: HeroProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useScrollProgress(wrapperRef);
  const hud = useMemo(createHudState, []);
  const [tier, setTier] = useState<QualityTier | null>(null);
  const [glFailed, setGlFailed] = useState(false);

  useEffect(() => {
    setTier(detectQuality());
  }, []);

  const effective: QualityTier | null = glFailed ? 'fallback' : tier;

  if (effective === 'fallback') {
    return <Hero2DFallback onSelectWard={onSelectWard} onCtaClick={onCtaClick} />;
  }

  return (
    <div ref={wrapperRef} style={{ height: '450vh', position: 'relative' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: '#1d140c',
        }}
      >
        {effective !== null && (
          <CanvasErrorBoundary onError={() => setGlFailed(true)}>
            <HeroCanvas progressRef={progressRef} hud={hud} tier={effective} onSelectWard={onSelectWard} />
          </CanvasErrorBoundary>
        )}
        <HeroOverlay hud={hud} onCtaClick={onCtaClick} />
      </div>
    </div>
  );
}
