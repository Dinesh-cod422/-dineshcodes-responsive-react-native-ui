"use strict";
/**
 * Responsive scaling helpers — derive sizes from the *current* screen
 * dimensions so layouts adapt across device sizes and react to runtime changes
 * (rotation, split-screen, foldables, resizable windows).
 *
 * Every helper reads the live window size on each call rather than a value
 * snapshotted at import time. Pair with the `useResponsive` hook (see
 * `./theme`) to have components re-render when the dimensions change.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDvales = exports.calculateHeight = exports.calculateWidth = exports.calculateFont = exports.moderateScale = exports.verticalScale = exports.horizontalScale = exports.isLandscape = exports.onDimensionsChange = exports.SCREEN_HEIGHT = exports.SCREEN_WIDTH = exports.getReferenceLong = exports.getReferenceShort = exports.getLongSide = exports.getShortSide = exports.getScreenHeight = exports.getScreenWidth = exports.getScreenDimensions = exports.clamp = exports.roundToPixel = exports.getFontScale = exports.setRespectFontScale = exports.RESPECT_FONT_SCALE = exports.setMaxReference = exports.MAX_REFERENCE_LONG = exports.MAX_REFERENCE_SHORT = exports.setGuidelineBaseDimensions = exports.GUIDELINE_BASE_HEIGHT = exports.GUIDELINE_BASE_WIDTH = exports.getConfigVersion = exports.FALLBACK_HEIGHT = exports.FALLBACK_WIDTH = void 0;
const react_native_1 = require("react-native");
/**
 * Fallback window size (iPhone X class) used only if the platform cannot report
 * real dimensions (e.g. very early startup, tests, or a non-RN environment).
 * Guarantees every helper returns a finite, sane number instead of throwing.
 */
exports.FALLBACK_WIDTH = 375;
exports.FALLBACK_HEIGHT = 812;
/** A positive, finite number, or the fallback if the input is neither. */
const safeSize = (value, fallback) => typeof value === 'number' && isFinite(value) && value > 0 ? value : fallback;
/**
 * Monotonic counter bumped whenever a configuration setter changes global scale
 * behaviour. Token maps mix it into their cache keys so cached values are
 * invalidated when the guideline, reference caps, or font-scale flag change.
 */
let CONFIG_VERSION = 0;
const getConfigVersion = () => CONFIG_VERSION;
exports.getConfigVersion = getConfigVersion;
const bumpConfig = () => {
    CONFIG_VERSION++;
};
/**
 * Guideline base dimensions used as the reference for `horizontalScale` /
 * `verticalScale`. Based on a standard mid-size handset (iPhone X class).
 * Override globally via {@link setGuidelineBaseDimensions}.
 */
exports.GUIDELINE_BASE_WIDTH = exports.FALLBACK_WIDTH;
exports.GUIDELINE_BASE_HEIGHT = exports.FALLBACK_HEIGHT;
/**
 * Change the reference device used by the linear scale helpers. Non-positive or
 * non-finite values are ignored so the scale math can never divide by zero.
 */
const setGuidelineBaseDimensions = (width, height) => {
    exports.GUIDELINE_BASE_WIDTH = safeSize(width, exports.GUIDELINE_BASE_WIDTH);
    exports.GUIDELINE_BASE_HEIGHT = safeSize(height, exports.GUIDELINE_BASE_HEIGHT);
    bumpConfig();
};
exports.setGuidelineBaseDimensions = setGuidelineBaseDimensions;
/**
 * Upper bounds applied to the reference dimension used by the fraction-based
 * tokens, so values stop growing on very large surfaces (desktop RN, TV,
 * unfolded foldables). `Infinity` (the default) disables clamping and preserves
 * pure fraction-of-screen behaviour. Configure via {@link setMaxReference}.
 */
exports.MAX_REFERENCE_SHORT = Infinity;
exports.MAX_REFERENCE_LONG = Infinity;
/**
 * Cap the reference short/long side used by the fraction tokens. Pass a
 * non-positive/omitted value to leave that bound unchanged. Use e.g.
 * `setMaxReference(1024, 1366)` (iPad Pro class) to tame oversized surfaces.
 */
const setMaxReference = (short, long) => {
    if (typeof short === 'number' && short > 0)
        exports.MAX_REFERENCE_SHORT = short;
    if (typeof long === 'number' && long > 0)
        exports.MAX_REFERENCE_LONG = long;
    bumpConfig();
};
exports.setMaxReference = setMaxReference;
/**
 * When enabled, font tokens are multiplied by the OS text-size setting
 * (`PixelRatio.getFontScale()`) so the app honours the user's accessibility
 * preference. Off by default to preserve existing output; toggle with
 * {@link setRespectFontScale}.
 */
exports.RESPECT_FONT_SCALE = false;
const setRespectFontScale = (value) => {
    exports.RESPECT_FONT_SCALE = !!value;
    bumpConfig();
};
exports.setRespectFontScale = setRespectFontScale;
/** The OS font-scale multiplier, or 1 if unavailable. */
const getFontScale = () => {
    try {
        const f = react_native_1.PixelRatio.getFontScale();
        return typeof f === 'number' && isFinite(f) && f > 0 ? f : 1;
    }
    catch (_a) {
        return 1;
    }
};
exports.getFontScale = getFontScale;
/**
 * Snap a value to the nearest physical pixel so layout/text edges stay crisp
 * instead of landing on a sub-pixel boundary. Falls back to `Math.round` when
 * `PixelRatio` is unavailable.
 */
const roundToPixel = (value) => {
    try {
        return react_native_1.PixelRatio.roundToNearestPixel(value);
    }
    catch (_a) {
        return Math.round(value);
    }
};
exports.roundToPixel = roundToPixel;
/** Constrain `value` to the `[min, max]` range. */
const clamp = (value, min = -Infinity, max = Infinity) => Math.min(Math.max(value, min), max);
exports.clamp = clamp;
/**
 * Read the live window dimensions. Never throws: falls back to sane defaults if
 * `Dimensions` is unavailable or reports invalid values.
 */
const getScreenDimensions = () => {
    try {
        const win = react_native_1.Dimensions.get('window');
        return {
            width: safeSize(win && win.width, exports.FALLBACK_WIDTH),
            height: safeSize(win && win.height, exports.FALLBACK_HEIGHT),
        };
    }
    catch (_a) {
        return { width: exports.FALLBACK_WIDTH, height: exports.FALLBACK_HEIGHT };
    }
};
exports.getScreenDimensions = getScreenDimensions;
/** Live window width. */
const getScreenWidth = () => (0, exports.getScreenDimensions)().width;
exports.getScreenWidth = getScreenWidth;
/** Live window height. */
const getScreenHeight = () => (0, exports.getScreenDimensions)().height;
exports.getScreenHeight = getScreenHeight;
/** Live shortest window side (orientation-independent). */
const getShortSide = () => {
    const d = (0, exports.getScreenDimensions)();
    return Math.min(d.width, d.height);
};
exports.getShortSide = getShortSide;
/** Live longest window side (orientation-independent). */
const getLongSide = () => {
    const d = (0, exports.getScreenDimensions)();
    return Math.max(d.width, d.height);
};
exports.getLongSide = getLongSide;
/**
 * Reference short side used by fraction tokens: the window's short side,
 * clamped to {@link MAX_REFERENCE_SHORT}. Orientation-independent, so tokens
 * stay stable across rotation.
 */
const getReferenceShort = (dims = (0, exports.getScreenDimensions)()) => Math.min(Math.min(dims.width, dims.height), exports.MAX_REFERENCE_SHORT);
exports.getReferenceShort = getReferenceShort;
/**
 * Reference long side used by fraction tokens: the window's long side, clamped
 * to {@link MAX_REFERENCE_LONG}. Orientation-independent.
 */
const getReferenceLong = (dims = (0, exports.getScreenDimensions)()) => Math.min(Math.max(dims.width, dims.height), exports.MAX_REFERENCE_LONG);
exports.getReferenceLong = getReferenceLong;
/**
 * Snapshot of the window size at import time.
 *
 * @deprecated These constants do not update when the device rotates or the
 * window resizes. Prefer {@link getScreenWidth} / {@link getScreenHeight}, or
 * the `useResponsive` hook, for values that stay correct at runtime.
 */
exports.SCREEN_WIDTH = (0, exports.getScreenDimensions)().width;
/** @deprecated See {@link SCREEN_WIDTH}. */
exports.SCREEN_HEIGHT = (0, exports.getScreenDimensions)().height;
/**
 * Subscribe to window dimension changes. Returns an unsubscribe function.
 * Never throws: if the platform does not support the listener, the returned
 * unsubscribe is a safe no-op.
 */
const onDimensionsChange = (listener) => {
    try {
        const sub = react_native_1.Dimensions.addEventListener('change', ({ window }) => {
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
exports.onDimensionsChange = onDimensionsChange;
/** True when the given window is wider than it is tall. */
const isLandscape = (width = (0, exports.getScreenWidth)(), height = (0, exports.getScreenHeight)()) => width > height;
exports.isLandscape = isLandscape;
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
    const gShort = Math.min(exports.GUIDELINE_BASE_WIDTH, exports.GUIDELINE_BASE_HEIGHT);
    const gLong = Math.max(exports.GUIDELINE_BASE_WIDTH, exports.GUIDELINE_BASE_HEIGHT);
    return (0, exports.isLandscape)(width, height)
        ? { baseWidth: gLong, baseHeight: gShort }
        : { baseWidth: gShort, baseHeight: gLong };
};
/**
 * Linear scale relative to the guideline width, orientation-aware so it stays
 * correct in both portrait and landscape. Result is snapped to the nearest
 * physical pixel.
 */
const horizontalScale = (size, width = (0, exports.getScreenWidth)(), height = (0, exports.getScreenHeight)()) => (0, exports.roundToPixel)((width / orientedBase(width, height).baseWidth) * size);
exports.horizontalScale = horizontalScale;
/**
 * Linear scale relative to the guideline height, orientation-aware so it stays
 * correct in both portrait and landscape. Result is snapped to the nearest
 * physical pixel.
 */
const verticalScale = (size, height = (0, exports.getScreenHeight)(), width = (0, exports.getScreenWidth)()) => (0, exports.roundToPixel)((height / orientedBase(width, height).baseHeight) * size);
exports.verticalScale = verticalScale;
/**
 * Scale that only partially applies the linear factor — useful for font sizes
 * and paddings that should grow, but not as aggressively as the raw scale.
 * Orientation-aware and pixel-snapped.
 */
const moderateScale = (size, factor = 0.5, width = (0, exports.getScreenWidth)(), height = (0, exports.getScreenHeight)()) => {
    // Compute against the raw (unsnapped) linear scale so the factor blend is
    // exact, then snap once at the end.
    const linear = (width / orientedBase(width, height).baseWidth) * size;
    return (0, exports.roundToPixel)(size + (linear - size) * factor);
};
exports.moderateScale = moderateScale;
/** Font size as a fraction of the given reference dimension. */
const calculateFont = (value, width = (0, exports.getScreenWidth)()) => width * value;
exports.calculateFont = calculateFont;
/** Width as a fraction of the given reference dimension. */
const calculateWidth = (value, width = (0, exports.getScreenWidth)()) => width * value;
exports.calculateWidth = calculateWidth;
/** Height as a fraction of the given reference dimension. */
const calculateHeight = (value, height = (0, exports.getScreenHeight)()) => height * value;
exports.calculateHeight = calculateHeight;
/** A circle sized as a fraction of the given reference dimension. */
const calculateDvales = (value, width = (0, exports.getScreenWidth)()) => {
    const CdWidth = width * value;
    const CdHeight = CdWidth;
    const CdBorderRadius = CdWidth / 2;
    return { CdWidth, CdHeight, CdBorderRadius };
};
exports.calculateDvales = calculateDvales;
