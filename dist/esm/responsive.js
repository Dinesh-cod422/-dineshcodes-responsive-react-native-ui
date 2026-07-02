/**
 * Responsive scaling helpers — derive sizes from the *current* screen
 * dimensions so layouts adapt across device sizes and react to runtime changes
 * (rotation, split-screen, foldables, resizable windows).
 *
 * Every helper reads the live window size on each call rather than a value
 * snapshotted at import time. Pair with the `useResponsive` hook (see
 * `./theme`) to have components re-render when the dimensions change.
 */
import { Dimensions, PixelRatio } from 'react-native';
/**
 * Fallback window size (iPhone X class) used only if the platform cannot report
 * real dimensions (e.g. very early startup, tests, or a non-RN environment).
 * Guarantees every helper returns a finite, sane number instead of throwing.
 */
export const FALLBACK_WIDTH = 375;
export const FALLBACK_HEIGHT = 812;
/** A positive, finite number, or the fallback if the input is neither. */
const safeSize = (value, fallback) => typeof value === 'number' && isFinite(value) && value > 0 ? value : fallback;
/**
 * Monotonic counter bumped whenever a configuration setter changes global scale
 * behaviour. Token maps mix it into their cache keys so cached values are
 * invalidated when the guideline, reference caps, or font-scale flag change.
 */
let CONFIG_VERSION = 0;
export const getConfigVersion = () => CONFIG_VERSION;
const bumpConfig = () => {
    CONFIG_VERSION++;
};
/**
 * Guideline base dimensions used as the reference for `horizontalScale` /
 * `verticalScale`. Based on a standard mid-size handset (iPhone X class).
 * Override globally via {@link setGuidelineBaseDimensions}.
 */
export let GUIDELINE_BASE_WIDTH = FALLBACK_WIDTH;
export let GUIDELINE_BASE_HEIGHT = FALLBACK_HEIGHT;
/**
 * Change the reference device used by the linear scale helpers. Non-positive or
 * non-finite values are ignored so the scale math can never divide by zero.
 */
export const setGuidelineBaseDimensions = (width, height) => {
    GUIDELINE_BASE_WIDTH = safeSize(width, GUIDELINE_BASE_WIDTH);
    GUIDELINE_BASE_HEIGHT = safeSize(height, GUIDELINE_BASE_HEIGHT);
    bumpConfig();
};
/**
 * Upper bounds applied to the reference dimension used by the fraction-based
 * tokens, so values stop growing on very large surfaces (desktop RN, TV,
 * unfolded foldables). `Infinity` (the default) disables clamping and preserves
 * pure fraction-of-screen behaviour. Configure via {@link setMaxReference}.
 */
export let MAX_REFERENCE_SHORT = Infinity;
export let MAX_REFERENCE_LONG = Infinity;
/**
 * Cap the reference short/long side used by the fraction tokens. Pass a
 * non-positive/omitted value to leave that bound unchanged. Use e.g.
 * `setMaxReference(1024, 1366)` (iPad Pro class) to tame oversized surfaces.
 */
export const setMaxReference = (short, long) => {
    if (typeof short === 'number' && short > 0)
        MAX_REFERENCE_SHORT = short;
    if (typeof long === 'number' && long > 0)
        MAX_REFERENCE_LONG = long;
    bumpConfig();
};
/**
 * When enabled, font tokens are multiplied by the OS text-size setting
 * (`PixelRatio.getFontScale()`) so the app honours the user's accessibility
 * preference. Off by default to preserve existing output; toggle with
 * {@link setRespectFontScale}.
 */
export let RESPECT_FONT_SCALE = false;
export const setRespectFontScale = (value) => {
    RESPECT_FONT_SCALE = !!value;
    bumpConfig();
};
/** The OS font-scale multiplier, or 1 if unavailable. */
export const getFontScale = () => {
    try {
        const f = PixelRatio.getFontScale();
        return typeof f === 'number' && isFinite(f) && f > 0 ? f : 1;
    }
    catch (_a) {
        return 1;
    }
};
/**
 * Snap a value to the nearest physical pixel so layout/text edges stay crisp
 * instead of landing on a sub-pixel boundary. Falls back to `Math.round` when
 * `PixelRatio` is unavailable.
 */
export const roundToPixel = (value) => {
    try {
        return PixelRatio.roundToNearestPixel(value);
    }
    catch (_a) {
        return Math.round(value);
    }
};
/** Constrain `value` to the `[min, max]` range. */
export const clamp = (value, min = -Infinity, max = Infinity) => Math.min(Math.max(value, min), max);
/**
 * Read the live window dimensions. Never throws: falls back to sane defaults if
 * `Dimensions` is unavailable or reports invalid values.
 */
export const getScreenDimensions = () => {
    try {
        const win = Dimensions.get('window');
        return {
            width: safeSize(win && win.width, FALLBACK_WIDTH),
            height: safeSize(win && win.height, FALLBACK_HEIGHT),
        };
    }
    catch (_a) {
        return { width: FALLBACK_WIDTH, height: FALLBACK_HEIGHT };
    }
};
/** Live window width. */
export const getScreenWidth = () => getScreenDimensions().width;
/** Live window height. */
export const getScreenHeight = () => getScreenDimensions().height;
/** Live shortest window side (orientation-independent). */
export const getShortSide = () => {
    const d = getScreenDimensions();
    return Math.min(d.width, d.height);
};
/** Live longest window side (orientation-independent). */
export const getLongSide = () => {
    const d = getScreenDimensions();
    return Math.max(d.width, d.height);
};
/**
 * Reference short side used by fraction tokens: the window's short side,
 * clamped to {@link MAX_REFERENCE_SHORT}. Orientation-independent, so tokens
 * stay stable across rotation.
 */
export const getReferenceShort = (dims = getScreenDimensions()) => Math.min(Math.min(dims.width, dims.height), MAX_REFERENCE_SHORT);
/**
 * Reference long side used by fraction tokens: the window's long side, clamped
 * to {@link MAX_REFERENCE_LONG}. Orientation-independent.
 */
export const getReferenceLong = (dims = getScreenDimensions()) => Math.min(Math.max(dims.width, dims.height), MAX_REFERENCE_LONG);
/**
 * Snapshot of the window size at import time.
 *
 * @deprecated These constants do not update when the device rotates or the
 * window resizes. Prefer {@link getScreenWidth} / {@link getScreenHeight}, or
 * the `useResponsive` hook, for values that stay correct at runtime.
 */
export const SCREEN_WIDTH = getScreenDimensions().width;
/** @deprecated See {@link SCREEN_WIDTH}. */
export const SCREEN_HEIGHT = getScreenDimensions().height;
/**
 * Subscribe to window dimension changes. Returns an unsubscribe function.
 * Never throws: if the platform does not support the listener, the returned
 * unsubscribe is a safe no-op.
 */
export const onDimensionsChange = (listener) => {
    try {
        const sub = Dimensions.addEventListener('change', ({ window }) => {
            listener({ width: window.width, height: window.height });
        });
        return () => {
            try {
                sub.remove();
            }
            catch (_a) {
                /* ignore */
            }
        };
    }
    catch (_a) {
        return () => {
            /* no-op */
        };
    }
};
/** True when the given window is wider than it is tall. */
export const isLandscape = (width = getScreenWidth(), height = getScreenHeight()) => width > height;
/**
 * Guideline base dimensions matched to the *current orientation*.
 *
 * The guideline is stored portrait-first, but a device can be in either
 * orientation. Comparing the live long/short side against the guideline's
 * long/short side keeps the scale factor sane both ways: rotating to landscape
 * no longer divides the (now long) width by the portrait base width, which
 * would otherwise inflate every `horizontalScale` result.
 */
const orientedBase = (width, height) => {
    const gShort = Math.min(GUIDELINE_BASE_WIDTH, GUIDELINE_BASE_HEIGHT);
    const gLong = Math.max(GUIDELINE_BASE_WIDTH, GUIDELINE_BASE_HEIGHT);
    return isLandscape(width, height)
        ? { baseWidth: gLong, baseHeight: gShort }
        : { baseWidth: gShort, baseHeight: gLong };
};
/**
 * Linear scale relative to the guideline width, orientation-aware so it stays
 * correct in both portrait and landscape. Result is snapped to the nearest
 * physical pixel.
 */
export const horizontalScale = (size, width = getScreenWidth(), height = getScreenHeight()) => roundToPixel((width / orientedBase(width, height).baseWidth) * size);
/**
 * Linear scale relative to the guideline height, orientation-aware so it stays
 * correct in both portrait and landscape. Result is snapped to the nearest
 * physical pixel.
 */
export const verticalScale = (size, height = getScreenHeight(), width = getScreenWidth()) => roundToPixel((height / orientedBase(width, height).baseHeight) * size);
/**
 * Scale that only partially applies the linear factor — useful for font sizes
 * and paddings that should grow, but not as aggressively as the raw scale.
 * Orientation-aware and pixel-snapped.
 */
export const moderateScale = (size, factor = 0.5, width = getScreenWidth(), height = getScreenHeight()) => {
    // Compute against the raw (unsnapped) linear scale so the factor blend is
    // exact, then snap once at the end.
    const linear = (width / orientedBase(width, height).baseWidth) * size;
    return roundToPixel(size + (linear - size) * factor);
};
/** Font size as a fraction of the given reference dimension. */
export const calculateFont = (value, width = getScreenWidth()) => width * value;
/** Width as a fraction of the given reference dimension. */
export const calculateWidth = (value, width = getScreenWidth()) => width * value;
/** Height as a fraction of the given reference dimension. */
export const calculateHeight = (value, height = getScreenHeight()) => height * value;
/** A circle sized as a fraction of the given reference dimension. */
export const calculateDvales = (value, width = getScreenWidth()) => {
    const CdWidth = width * value;
    const CdHeight = CdWidth;
    const CdBorderRadius = CdWidth / 2;
    return { CdWidth, CdHeight, CdBorderRadius };
};
