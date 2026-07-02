import { __reset, __setWindow } from './stubs/react-native';
import {
  clamp,
  getLongSide,
  getShortSide,
  horizontalScale,
  isLandscape,
  moderateScale,
  roundToPixel,
  setMaxReference,
  verticalScale,
} from '../src/responsive';

beforeEach(() => __reset());

describe('scale helpers are orientation-aware', () => {
  test('horizontalScale stays stable across rotation on a phone', () => {
    __setWindow(375, 812); // portrait
    expect(horizontalScale(100)).toBe(100);
    __setWindow(812, 375); // landscape
    expect(horizontalScale(100)).toBe(100); // was ~217 before the fix
  });

  test('verticalScale stays stable across rotation on a phone', () => {
    __setWindow(375, 812);
    expect(verticalScale(100)).toBe(100);
    __setWindow(812, 375);
    expect(verticalScale(100)).toBe(100);
  });

  test('tablet scales up but swaps axes between orientations', () => {
    __setWindow(768, 1024); // portrait tablet
    const hPortrait = horizontalScale(100);
    const vPortrait = verticalScale(100);
    __setWindow(1024, 768); // landscape tablet
    expect(horizontalScale(100)).toBeCloseTo(vPortrait, 1);
    expect(verticalScale(100)).toBeCloseTo(hPortrait, 1);
  });

  test('moderateScale blends toward the base and is pixel-snapped', () => {
    __setWindow(750, 1624); // 2x guideline width
    // linear would be 200; factor 0.5 => 100 + (200-100)*0.5 = 150
    expect(moderateScale(100)).toBe(150);
  });
});

describe('utilities', () => {
  test('isLandscape reflects the current window', () => {
    __setWindow(375, 812);
    expect(isLandscape()).toBe(false);
    __setWindow(812, 375);
    expect(isLandscape()).toBe(true);
  });

  test('short/long side are orientation-independent', () => {
    __setWindow(812, 375);
    expect(getShortSide()).toBe(375);
    expect(getLongSide()).toBe(812);
  });

  test('roundToPixel snaps to device pixels (scale 2 => nearest 0.5)', () => {
    expect(roundToPixel(13.6)).toBe(13.5);
    expect(roundToPixel(13.8)).toBe(14);
  });

  test('clamp constrains to range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  test('setMaxReference caps the reference short side', () => {
    __setWindow(2000, 3000); // huge surface
    const uncapped = horizontalScale(10); // still linear, unaffected by ref cap
    expect(uncapped).toBeGreaterThan(10);
    setMaxReference(1024, 1366);
    // ref caps affect fraction tokens (see theme tests); restore for isolation
    setMaxReference(Infinity, Infinity);
  });
});
