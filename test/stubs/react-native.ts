/**
 * Minimal `react-native` stub for unit tests. Lets tests drive the reported
 * window size, pixel density and font scale without a native runtime.
 */
export interface ScaledSize {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
}

let win: ScaledSize = { width: 375, height: 812, scale: 2, fontScale: 1 };
let listeners: Array<(e: { window: ScaledSize }) => void> = [];

/** Test helper: set the reported window and notify listeners. */
export const __setWindow = (
  width: number,
  height: number,
  opts: { scale?: number; fontScale?: number } = {},
): void => {
  win = { width, height, scale: opts.scale ?? win.scale, fontScale: opts.fontScale ?? win.fontScale };
  for (const l of listeners) l({ window: win });
};

/** Test helper: reset to the default portrait iPhone-X window. */
export const __reset = (): void => {
  win = { width: 375, height: 812, scale: 2, fontScale: 1 };
  listeners = [];
};

export const Dimensions = {
  get: (_kind: 'window' | 'screen'): ScaledSize => win,
  addEventListener: (_type: 'change', cb: (e: { window: ScaledSize }) => void) => {
    listeners.push(cb);
    return {
      remove: () => {
        listeners = listeners.filter((l) => l !== cb);
      },
    };
  },
};

export const PixelRatio = {
  get: (): number => win.scale,
  getFontScale: (): number => win.fontScale,
  roundToNearestPixel: (value: number): number => Math.round(value * win.scale) / win.scale,
};

export const Platform = { OS: 'ios' as 'ios' | 'android', isPad: false };

export const useWindowDimensions = (): ScaledSize => win;
