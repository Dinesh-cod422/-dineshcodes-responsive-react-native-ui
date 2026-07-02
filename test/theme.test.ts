import { __reset, __setWindow } from './stubs/react-native';
import { setRespectFontScale } from '../src/responsive';
import {
  BORDER_RADIUS,
  Dvalues,
  FONTSIZE,
  forDevice,
  getBreakpoint,
  getIsTablet,
  HScale,
  selectByBreakpoint,
  useBreakpoint,
  useResponsive,
  VScale,
} from '../src/theme';

beforeEach(() => {
  __reset();
  setRespectFontScale(false);
});

describe('tokens are orientation-stable', () => {
  test('FONTSIZE does not change when a phone rotates', () => {
    __setWindow(375, 812);
    const portrait = FONTSIZE.size_16;
    __setWindow(812, 375);
    expect(FONTSIZE.size_16).toBe(portrait);
  });

  test('HScale / VScale / BORDER_RADIUS are stable across rotation', () => {
    __setWindow(375, 812);
    const snap = [HScale.Width_100, VScale.Height_100, BORDER_RADIUS.radius_16];
    __setWindow(812, 375);
    expect([HScale.Width_100, VScale.Height_100, BORDER_RADIUS.radius_16]).toEqual(snap);
  });

  test('tablet fonts are larger than phone fonts', () => {
    __setWindow(375, 812);
    const phone = FONTSIZE.size_16;
    __setWindow(768, 1024);
    expect(FONTSIZE.size_16).toBeGreaterThan(phone);
  });

  test('out-of-range / malformed token keys are undefined', () => {
    expect((FONTSIZE as Record<string, number>).size_9999).toBeUndefined();
    expect((FONTSIZE as Record<string, number>).nope).toBeUndefined();
  });
});

describe('device + breakpoint selectors read live dimensions', () => {
  test('getIsTablet flips with the window size', () => {
    __setWindow(375, 812);
    expect(getIsTablet()).toBe(false);
    __setWindow(800, 1200);
    expect(getIsTablet()).toBe(true);
  });

  test('forDevice picks by live device class', () => {
    __setWindow(375, 812);
    expect(forDevice(1, 2)).toBe(1);
    __setWindow(800, 1200);
    expect(forDevice(1, 2)).toBe(2);
  });

  test('getBreakpoint maps current width to a breakpoint', () => {
    __setWindow(375, 812);
    expect(getBreakpoint()).toBe('sm');
    __setWindow(700, 500);
    expect(getBreakpoint()).toBe('md');
    __setWindow(1000, 700);
    expect(getBreakpoint()).toBe('lg');
    __setWindow(1300, 900);
    expect(getBreakpoint()).toBe('xl');
  });

  test('selectByBreakpoint cascades down to the nearest defined value', () => {
    __setWindow(1000, 700); // lg
    expect(selectByBreakpoint({ sm: 1, md: 2 })).toBe(2); // no lg -> falls to md
    expect(selectByBreakpoint({ sm: 1, lg: 3 })).toBe(3);
    expect(selectByBreakpoint({ xl: 9 })).toBeUndefined(); // nothing at or below lg
  });
});

describe('accessibility + caching', () => {
  test('respecting OS font scale enlarges fonts', () => {
    __setWindow(375, 812, { fontScale: 1 });
    const base = FONTSIZE.size_16;
    setRespectFontScale(true);
    __setWindow(375, 812, { fontScale: 2 });
    expect(FONTSIZE.size_16).toBeGreaterThan(base);
  });

  test('lazy map memoises object tokens per dimension', () => {
    __setWindow(375, 812);
    expect(Dvalues.Dvalues_1).toBe(Dvalues.Dvalues_1); // same cached reference
  });
});

describe('hooks (run with stubbed react/useWindowDimensions)', () => {
  test('useResponsive exposes live-bound token surface', () => {
    __setWindow(812, 375);
    const t = useResponsive();
    expect(t.width).toBe(812);
    expect(t.isLandscape).toBe(true);
    expect(t.breakpoint).toBe('md');
    expect(typeof t.FONTSIZE.size_16).toBe('number');
  });

  test('useBreakpoint returns the active breakpoint', () => {
    __setWindow(1300, 900);
    expect(useBreakpoint()).toBe('xl');
  });
});
