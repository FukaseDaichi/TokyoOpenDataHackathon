import { describe, it, expect } from 'vitest';
import { emptyVector, type AxisVector } from '../domain/axes';
import { personaType, selectMatchedAxes, matchedAxisTags } from './personaType';

function vec(partial: Partial<AxisVector>): AxisVector {
  return { ...emptyVector(), ...partial };
}

describe('personaType', () => {
  it('names from the top-2 axes by absolute value', () => {
    const t = personaType(vec({ liveliness: 1, family: -0.5 }));
    expect(t.name).toBe('都会派×ソロ充タイプ');
    expect(t.description).toBeTruthy();
  });

  it('uses the pole label matching the sign of each axis', () => {
    const t = personaType(vec({ greenery: 0.8, luxury: -0.6 }));
    expect(t.name).toBe('みどり派×堅実派タイプ');
  });

  it('orders pole labels by absolute value (stronger axis first)', () => {
    const t = personaType(vec({ maturity: -0.5, liveliness: 1 }));
    expect(t.name).toBe('都会派×フレッシュ志向タイプ');
  });

  it('falls back to a single-axis type when only one axis clears the 0.3 threshold', () => {
    const t = personaType(vec({ liveliness: -1, greenery: 0.2 }));
    expect(t.name).toBe('のんびり派タイプ');
  });

  it('falls back to balance type when no axis clears the threshold', () => {
    const t = personaType(emptyVector());
    expect(t.name).toBe('バランスタイプ');
    expect(t.description).toBeTruthy();
  });

  it('treats exactly 0.3 as clearing the threshold', () => {
    const t = personaType(vec({ luxury: 0.3 }));
    expect(t.name).toBe('華やか志向タイプ');
  });

  it('breaks ties by AXIS_KEYS order', () => {
    const t = personaType(vec({ maturity: 1, greenery: -1 }));
    // maturity が AXIS_KEYS で先 → 先頭
    expect(t.name).toBe('おとな志向×シティ派タイプ');
  });
});

describe('selectMatchedAxes', () => {
  it('returns the 2 axes with smallest user-ward distance among axes where |user| >= 0.3', () => {
    const user = vec({ liveliness: 1, family: -1, greenery: 0.5 });
    const ward = vec({ liveliness: 0.9, family: -0.8, greenery: -0.5 });
    expect(selectMatchedAxes(user, ward)).toEqual(['liveliness', 'family']);
  });

  it('ignores axes where the user has no signal, even if the distance is small', () => {
    // maturity は差0だがユーザー値0 → 対象外
    const user = vec({ liveliness: 1, luxury: 0.6, maturity: 0 });
    const ward = vec({ liveliness: 0.5, luxury: 0.5, maturity: 0 });
    expect(selectMatchedAxes(user, ward)).toEqual(['luxury', 'liveliness']);
  });

  it('always returns 2 axes, backfilling by distance when fewer than 2 qualify', () => {
    const user = vec({ liveliness: 1 });
    const ward = vec({ liveliness: 1, greenery: 0.1, maturity: 0.9, family: 0.5, luxury: -0.4 });
    const result = selectMatchedAxes(user, ward);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('liveliness');
    // 補充は残り軸のうち差が最小のもの（greenery: |0-0.1|=0.1）
    expect(result[1]).toBe('greenery');
  });

  it('backfills both axes for an all-zero user vector', () => {
    const user = emptyVector();
    const ward = vec({ liveliness: 0.9, maturity: 0.1, greenery: -0.2 });
    const result = selectMatchedAxes(user, ward);
    expect(result).toHaveLength(2);
    // 差最小は family=0 / luxury=0（同値はAXIS_KEYS順）
    expect(result).toEqual(['family', 'luxury']);
  });
});

describe('matchedAxisTags', () => {
  it('ユーザー側の極のラベルを一致軸の順に返す', () => {
    const user = { ...emptyVector(), luxury: 1, liveliness: -0.6 };
    expect(matchedAxisTags(user, ['luxury', 'liveliness'])).toEqual(['華やか志向', 'のんびり派']);
  });
  it('値0の軸は高い側のラベルになる', () => {
    expect(matchedAxisTags(emptyVector(), ['greenery'])).toEqual(['みどり派']);
  });
});
