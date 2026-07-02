/**
 * Responsive scaling helpers — derive sizes from the *current* screen
 * dimensions so layouts adapt across device sizes and react to runtime changes
 * (rotation, split-screen, foldables, resizable windows).
 *
 * Every helper reads the live window size on each call rather than a value
 * snapshotted at import time. Pair with the `useResponsive` hook (see
 * `./theme`) to have components re-render when the dimensions change.
 */
export interface Dimensionsable {
    width: number;
    height: number;
}
/**
 * Fallback window size (iPhone X class) used only if the platform cannot report
 * real dimensions (e.g. very early startup, tests, or a non-RN environment).
 * Guarantees every helper returns a finite, sane number instead of throwing.
 */
export declare const FALLBACK_WIDTH = 375;
export declare const FALLBACK_HEIGHT = 812;
export declare const getConfigVersion: () => number;
/**
 * Guideline base dimensions used as the reference for `horizontalScale` /
 * `verticalScale`. Based on a standard mid-size handset (iPhone X class).
 * Override globally via {@link setGuidelineBaseDimensions}.
 */
export declare let GUIDELINE_BASE_WIDTH: number;
export declare let GUIDELINE_BASE_HEIGHT: number;
/**
 * Change the reference device used by the linear scale helpers. Non-positive or
 * non-finite values are ignored so the scale math can never divide by zero.
 */
export declare const setGuidelineBaseDimensions: (width: number, height: number) => void;
/**
 * Upper bounds applied to the reference dimension used by the fraction-based
 * tokens, so values stop growing on very large surfaces (desktop RN, TV,
 * unfolded foldables). `Infinity` (the default) disables clamping and preserves
 * pure fraction-of-screen behaviour. Configure via {@link setMaxReference}.
 */
export declare let MAX_REFERENCE_SHORT: number;
export declare let MAX_REFERENCE_LONG: number;
/**
 * Cap the reference short/long side used by the fraction tokens. Pass a
 * non-positive/omitted value to leave that bound unchanged. Use e.g.
 * `setMaxReference(1024, 1366)` (iPad Pro class) to tame oversized surfaces.
 */
export declare const setMaxReference: (short?: number, long?: number) => void;
/**
 * When enabled, font tokens are multiplied by the OS text-size setting
 * (`PixelRatio.getFontScale()`) so the app honours the user's accessibility
 * preference. Off by default to preserve existing output; toggle with
 * {@link setRespectFontScale}.
 */
export declare let RESPECT_FONT_SCALE: boolean;
export declare const setRespectFontScale: (value: boolean) => void;
/** The OS font-scale multiplier, or 1 if unavailable. */
export declare const getFontScale: () => number;
/**
 * Snap a value to the nearest physical pixel so layout/text edges stay crisp
 * instead of landing on a sub-pixel boundary. Falls back to `Math.round` when
 * `PixelRatio` is unavailable.
 */
export declare const roundToPixel: (value: number) => number;
/** Constrain `value` to the `[min, max]` range. */
export declare const clamp: (value: number, min?: number, max?: number) => number;
/**
 * Read the live window dimensions. Never throws: falls back to sane defaults if
 * `Dimensions` is unavailable or reports invalid values.
 */
export declare const getScreenDimensions: () => Dimensionsable;
/** Live window width. */
export declare const getScreenWidth: () => number;
/** Live window height. */
export declare const getScreenHeight: () => number;
/** Live shortest window side (orientation-independent). */
export declare const getShortSide: () => number;
/** Live longest window side (orientation-independent). */
export declare const getLongSide: () => number;
/**
 * Reference short side used by fraction tokens: the window's short side,
 * clamped to {@link MAX_REFERENCE_SHORT}. Orientation-independent, so tokens
 * stay stable across rotation.
 */
export declare const getReferenceShort: (dims?: Dimensionsable) => number;
/**
 * Reference long side used by fraction tokens: the window's long side, clamped
 * to {@link MAX_REFERENCE_LONG}. Orientation-independent.
 */
export declare const getReferenceLong: (dims?: Dimensionsable) => number;
/**
 * Snapshot of the window size at import time.
 *
 * @deprecated These constants do not update when the device rotates or the
 * window resizes. Prefer {@link getScreenWidth} / {@link getScreenHeight}, or
 * the `useResponsive` hook, for values that stay correct at runtime.
 */
export declare const SCREEN_WIDTH: number;
/** @deprecated See {@link SCREEN_WIDTH}. */
export declare const SCREEN_HEIGHT: number;
/**
 * Subscribe to window dimension changes. Returns an unsubscribe function.
 * Never throws: if the platform does not support the listener, the returned
 * unsubscribe is a safe no-op.
 */
export declare const onDimensionsChange: (listener: (window: Dimensionsable) => void) => (() => void);
/** True when the given window is wider than it is tall. */
export declare const isLandscape: (width?: number, height?: number) => boolean;
/**
 * Linear scale relative to the guideline width, orientation-aware so it stays
 * correct in both portrait and landscape. Result is snapped to the nearest
 * physical pixel.
 */
export declare const horizontalScale: (size: number, width?: number, height?: number) => number;
/**
 * Linear scale relative to the guideline height, orientation-aware so it stays
 * correct in both portrait and landscape. Result is snapped to the nearest
 * physical pixel.
 */
export declare const verticalScale: (size: number, height?: number, width?: number) => number;
/**
 * Scale that only partially applies the linear factor — useful for font sizes
 * and paddings that should grow, but not as aggressively as the raw scale.
 * Orientation-aware and pixel-snapped.
 */
export declare const moderateScale: (size: number, factor?: number, width?: number, height?: number) => number;
/** Font size as a fraction of the given reference dimension. */
export declare const calculateFont: (value: number, width?: number) => number;
/** Width as a fraction of the given reference dimension. */
export declare const calculateWidth: (value: number, width?: number) => number;
/** Height as a fraction of the given reference dimension. */
export declare const calculateHeight: (value: number, height?: number) => number;
/** A circle sized as a fraction of the given reference dimension. */
export declare const calculateDvales: (value: number, width?: number) => {
    CdWidth: number;
    CdHeight: number;
    CdBorderRadius: number;
};
