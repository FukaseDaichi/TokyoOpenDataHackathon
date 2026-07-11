'use client';

import dynamic from 'next/dynamic';
import { Component, type ReactNode, useEffect, useState } from 'react';
import { detectQuality, type QualityTier } from '../hero/quality';
import { WardMap2D } from './WardMap2D';

const WardMap3D = dynamic(() => import('./WardMap3D'), { ssr: false });

class MapErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
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

/** 「東京のどこにいる？」地図。品質判定でR3F/2D SVGを出し分ける */
export function WardMapSection({ code }: { code: string }) {
  const [tier, setTier] = useState<QualityTier | null>(null);
  const [glFailed, setGlFailed] = useState(false);

  useEffect(() => {
    setTier(detectQuality());
  }, []);

  const use3d = tier === 'high' || tier === 'low';
  return (
    <div className="ward-map-frame">
      {use3d && !glFailed ? (
        <MapErrorBoundary onError={() => setGlFailed(true)}>
          <WardMap3D code={code} tier={tier as 'high' | 'low'} />
        </MapErrorBoundary>
      ) : (
        <WardMap2D code={code} />
      )}
    </div>
  );
}
