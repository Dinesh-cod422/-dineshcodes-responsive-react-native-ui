"use strict";
/**
 * Responsive design tokens
 *
 * Scale-aware constants (fonts, sizes, radii) derived from the *current* screen
 * dimensions via the helpers in `./responsive`. Sizes adapt across phones and
 * tablets and stay correct across runtime dimension changes.
 *
 * Numeric token maps (FONTSIZE, HScale, …) are **lazy**: each entry is computed
 * on access from the live window size rather than eagerly precomputed at import.
 * Results are memoised per (dimension, config) so repeated reads in a render are
 * cheap. This keeps import cost near-zero and means every read reflects the
 * current dimensions.
 *
 * For components that must re-render on rotation / resize, use {@link useResponsive},
 * which returns the same token surface bound to live dimensions.
 *
 * Orientation stability: font/width/radius tokens are derived from the window's
 * **short side** and height tokens from its **long side**, so their values do
 * not jump when the device rotates between portrait and landscape. The linear
 * `horizontalScale`/`verticalScale` helpers remain orientation-aware too.
 *
 * Tablet detection is pure JavaScript (no native modules): a device counts as a
 * tablet when its smallest side is at least 600dp — the same threshold Android
 * uses for `sw600dp` layouts, and true for every iPad.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBreakpoint = exports.useResponsive = exports.Dvalues = exports.IconSize = exports.BORDER_RADIUS = exports.VScale = exports.HScale = exports.FONTSIZE = exports.createResponsive = exports.selectByBreakpoint = exports.getBreakpoint = exports.setBreakpoints = exports.BREAKPOINTS = exports.forDevice = exports.isPad = exports.isTablet = exports.getIsTablet = exports.isTabletDimensions = exports.TABLET_BREAKPOINT = void 0;
const react_1 = require("react");
const react_native_1 = require("react-native");
const responsive_1 = require("./responsive");
/** Smallest side (in dp) at or above which a device is treated as a tablet. */
exports.TABLET_BREAKPOINT = 600;
/** Pure-JS tablet check for a given window size (orientation-independent). */
const isTabletDimensions = (dims) => Math.min(dims.width, dims.height) >= exports.TABLET_BREAKPOINT;
exports.isTabletDimensions = isTabletDimensions;
/**
 * Whether the current device is a tablet, evaluated against the *live* window
 * size on each call. Stays correct across runtime changes that cross the tablet
 * breakpoint — split-screen, foldables, resizable windows — not just rotation.
 * Prefer this (or the `isTablet` field from {@link useResponsive}) over the
 * {@link isTablet} snapshot.
 */
const getIsTablet = () => (0, exports.isTabletDimensions)((0, responsive_1.getScreenDimensions)());
exports.getIsTablet = getIsTablet;
/**
 * Whether the device was a tablet **at import time**. Uses the smallest window
 * side, so it is stable across rotation but will not reflect later split-screen
 * / foldable / resize changes.
 *
 * @deprecated Snapshot value. Use {@link getIsTablet} for a live check, or the
 * `isTablet` field returned by {@link useResponsive} inside components.
 */
exports.isTablet = (0, exports.getIsTablet)();
// `Platform.isPad` is iOS-only; guard the access so it type-checks on Android too.
exports.isPad = react_native_1.Platform.OS === 'ios' && react_native_1.Platform.isPad === true;
/** Resolve a per-device fraction for a specific window size. */
const pick = (dims, phone, tablet, pad = tablet) => exports.isPad ? pad : (0, exports.isTabletDimensions)(dims) ? tablet : phone;
/**
 * Pick the raw scale fraction for the active device class. `pad` defaults to
 * `tablet` since the two share a value for the vast majority of tokens.
 *
 * Reads the *live* window size on each call (via `pick`) so the choice stays
 * correct across runtime changes — split-screen, foldables, resizable windows —
 * rather than being frozen to the device class at import time.
 */
const forDevice = (phone, tablet, pad = tablet) => pick((0, responsive_1.getScreenDimensions)(), phone, tablet, pad);
exports.forDevice = forDevice;
/** Mutable min-width thresholds for each breakpoint. Override via {@link setBreakpoints}. */
exports.BREAKPOINTS = { sm: 0, md: 600, lg: 900, xl: 1200 };
/** Override one or more breakpoint thresholds (dp). */
const setBreakpoints = (overrides) => {
    for (const key of Object.keys(overrides)) {
        const v = overrides[key];
        if (typeof v === 'number' && isFinite(v) && v >= 0)
            exports.BREAKPOINTS[key] = v;
    }
};
exports.setBreakpoints = setBreakpoints;
/**
 * Active breakpoint for a window, based on its *current width* (so landscape
 * reports a wider breakpoint than portrait, as expected for layout decisions).
 */
const getBreakpoint = (dims = (0, responsive_1.getScreenDimensions)()) => {
    const w = dims.width;
    if (w >= exports.BREAKPOINTS.xl)
        return 'xl';
    if (w >= exports.BREAKPOINTS.lg)
        return 'lg';
    if (w >= exports.BREAKPOINTS.md)
        return 'md';
    return 'sm';
};
exports.getBreakpoint = getBreakpoint;
const BP_ORDER = ['sm', 'md', 'lg', 'xl'];
/**
 * Pick the value for the active breakpoint, falling back to the nearest smaller
 * breakpoint that is defined (mobile-first cascade). Returns `undefined` if no
 * matching or smaller value exists.
 */
const selectByBreakpoint = (values, dims = (0, responsive_1.getScreenDimensions)()) => {
    const active = (0, exports.getBreakpoint)(dims);
    for (let i = BP_ORDER.indexOf(active); i >= 0; i--) {
        const v = values[BP_ORDER[i]];
        if (v !== undefined)
            return v;
    }
    return undefined;
};
exports.selectByBreakpoint = selectByBreakpoint;
/** Cap on cached entries per map, so a device resized continuously never leaks. */
const CACHE_LIMIT = 4096;
/**
 * Build a lazy, dynamic token map. Entries `${prefix}_${i}` for `1 <= i <= max`
 * are computed on access from the dimensions returned by `getDims`, so values
 * always reflect the current (or bound) screen size and nothing is precomputed.
 * Results are memoised per (width, height, config version); the cache is cleared
 * wholesale if it grows past {@link CACHE_LIMIT}.
 */
const numericMap = (prefix, max, compute, getDims) => {
    const re = new RegExp(`^${prefix}_(\\d+)$`);
    const cache = new Map();
    const indexOf = (prop) => {
        if (typeof prop !== 'string')
            return null;
        const m = re.exec(prop);
        if (!m)
            return null;
        const i = Number(m[1]);
        return i >= 1 && i <= max ? i : null;
    };
    return new Proxy({}, {
        get(_target, prop) {
            const i = indexOf(prop);
            if (i === null)
                return undefined;
            const d = getDims();
            const key = `${d.width}x${d.height}:${(0, responsive_1.getConfigVersion)()}:${i}`;
            const hit = cache.get(key);
            if (hit !== undefined)
                return hit;
            const value = compute(i, d);
            if (cache.size >= CACHE_LIMIT)
                cache.clear();
            cache.set(key, value);
            return value;
        },
        has(_target, prop) {
            return indexOf(prop) !== null;
        },
        ownKeys() {
            const keys = [];
            for (let i = 1; i <= max; i++)
                keys.push(`${prefix}_${i}`);
            return keys;
        },
        getOwnPropertyDescriptor(_target, prop) {
            return indexOf(prop) === null ? undefined : { enumerable: true, configurable: true };
        },
    });
};
/** Apply optional OS font-scale, then snap to the nearest pixel. */
const finalizeFont = (value) => (0, responsive_1.roundToPixel)(responsive_1.RESPECT_FONT_SCALE ? value * (0, responsive_1.getFontScale)() : value);
/**
 * Build the full token surface bound to a `getDims` source. Used for both the
 * live module-level exports (source = live window) and {@link useResponsive}
 * (source = the hook's current dimensions).
 *
 * Font/width/radius tokens use the reference **short** side and height tokens
 * the reference **long** side, so values are orientation-stable and clamped on
 * oversized surfaces (see `setMaxReference`).
 */
const buildTokens = (getDims) => ({
    get width() {
        return getDims().width;
    },
    get height() {
        return getDims().height;
    },
    get isTablet() {
        return (0, exports.isTabletDimensions)(getDims());
    },
    isPad: exports.isPad,
    get isLandscape() {
        const d = getDims();
        return d.width > d.height;
    },
    get breakpoint() {
        return (0, exports.getBreakpoint)(getDims());
    },
    FONTSIZE: numericMap('size', 100, (i, d) => finalizeFont((0, responsive_1.calculateFont)(pick(d, i / 440, i / 500), (0, responsive_1.getReferenceShort)(d))), getDims),
    HScale: numericMap('Width', 400, (i, d) => (0, responsive_1.roundToPixel)((0, responsive_1.calculateWidth)(i / 450, (0, responsive_1.getReferenceShort)(d))), getDims),
    VScale: numericMap('Height', 800, (i, d) => (0, responsive_1.roundToPixel)((0, responsive_1.calculateWidth)(i / 1000, (0, responsive_1.getReferenceLong)(d))), getDims),
    BORDER_RADIUS: numericMap('radius', 200, (i, d) => (0, responsive_1.roundToPixel)((0, responsive_1.calculateWidth)(i / 1000, (0, responsive_1.getReferenceShort)(d))), getDims),
    IconSize: numericMap('iconSize', 200, (i, d) => finalizeFont((0, responsive_1.calculateFont)(pick(d, i / 440, i / 500), (0, responsive_1.getReferenceShort)(d))), getDims),
    Dvalues: numericMap('Dvalues', 400, (i, d) => {
        const dv = (0, responsive_1.calculateDvales)(i / 450, (0, responsive_1.getReferenceShort)(d));
        return {
            CdWidth: (0, responsive_1.roundToPixel)(dv.CdWidth),
            CdHeight: (0, responsive_1.roundToPixel)(dv.CdHeight),
            CdBorderRadius: (0, responsive_1.roundToPixel)(dv.CdBorderRadius),
        };
    }, getDims),
});
/** Build a token surface bound to a fixed set of dimensions. */
const createResponsive = (dimensions) => buildTokens(() => dimensions);
exports.createResponsive = createResponsive;
// Live, module-level token surface. Every access reads the current window size.
const live = buildTokens(responsive_1.getScreenDimensions);
exports.FONTSIZE = live.FONTSIZE;
exports.HScale = live.HScale;
exports.VScale = live.VScale;
exports.BORDER_RADIUS = live.BORDER_RADIUS;
exports.IconSize = live.IconSize;
exports.Dvalues = live.Dvalues;
/**
 * React hook returning the full token surface bound to the current window
 * dimensions. Components using it re-render on rotation / resize so tokens
 * used inside `StyleSheet.create` or inline styles stay correct.
 */
const useResponsive = () => {
    const win = (0, react_native_1.useWindowDimensions)();
    // Guard against a transient 0 / NaN from the platform on first render.
    const fallback = (0, responsive_1.getScreenDimensions)();
    const width = win.width > 0 ? win.width : fallback.width;
    const height = win.height > 0 ? win.height : fallback.height;
    return (0, react_1.useMemo)(() => (0, exports.createResponsive)({ width, height }), [width, height]);
};
exports.useResponsive = useResponsive;
/**
 * React hook returning the active {@link Breakpoint}, recomputed when the window
 * width crosses a threshold on rotation / resize.
 */
const useBreakpoint = () => {
    const win = (0, react_native_1.useWindowDimensions)();
    const fallback = (0, responsive_1.getScreenDimensions)();
    const width = win.width > 0 ? win.width : fallback.width;
    const height = win.height > 0 ? win.height : fallback.height;
    return (0, react_1.useMemo)(() => (0, exports.getBreakpoint)({ width, height }), [width, height]);
};
exports.useBreakpoint = useBreakpoint;
