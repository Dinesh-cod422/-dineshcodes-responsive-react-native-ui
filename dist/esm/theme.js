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
import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { calculateDvales, calculateFont, calculateWidth, getConfigVersion, getFontScale, getReferenceLong, getReferenceShort, getScreenDimensions, roundToPixel, RESPECT_FONT_SCALE, } from './responsive';
/** Smallest side (in dp) at or above which a device is treated as a tablet. */
export const TABLET_BREAKPOINT = 600;
/** Pure-JS tablet check for a given window size (orientation-independent). */
export const isTabletDimensions = (dims) => Math.min(dims.width, dims.height) >= TABLET_BREAKPOINT;
/**
 * Whether the current device is a tablet, evaluated against the *live* window
 * size on each call. Stays correct across runtime changes that cross the tablet
 * breakpoint — split-screen, foldables, resizable windows — not just rotation.
 * Prefer this (or the `isTablet` field from {@link useResponsive}) over the
 * {@link isTablet} snapshot.
 */
export const getIsTablet = () => isTabletDimensions(getScreenDimensions());
/**
 * Whether the device was a tablet **at import time**. Uses the smallest window
 * side, so it is stable across rotation but will not reflect later split-screen
 * / foldable / resize changes.
 *
 * @deprecated Snapshot value. Use {@link getIsTablet} for a live check, or the
 * `isTablet` field returned by {@link useResponsive} inside components.
 */
export const isTablet = getIsTablet();
// `Platform.isPad` is iOS-only; guard the access so it type-checks on Android too.
export const isPad = Platform.OS === 'ios' && Platform.isPad === true;
/** Resolve a per-device fraction for a specific window size. */
const pick = (dims, phone, tablet, pad = tablet) => isPad ? pad : isTabletDimensions(dims) ? tablet : phone;
/**
 * Pick the raw scale fraction for the active device class. `pad` defaults to
 * `tablet` since the two share a value for the vast majority of tokens.
 *
 * Reads the *live* window size on each call (via `pick`) so the choice stays
 * correct across runtime changes — split-screen, foldables, resizable windows —
 * rather than being frozen to the device class at import time.
 */
export const forDevice = (phone, tablet, pad = tablet) => pick(getScreenDimensions(), phone, tablet, pad);
/** Mutable min-width thresholds for each breakpoint. Override via {@link setBreakpoints}. */
export const BREAKPOINTS = { sm: 0, md: 600, lg: 900, xl: 1200 };
/** Override one or more breakpoint thresholds (dp). */
export const setBreakpoints = (overrides) => {
    for (const key of Object.keys(overrides)) {
        const v = overrides[key];
        if (typeof v === 'number' && isFinite(v) && v >= 0)
            BREAKPOINTS[key] = v;
    }
};
/**
 * Active breakpoint for a window, based on its *current width* (so landscape
 * reports a wider breakpoint than portrait, as expected for layout decisions).
 */
export const getBreakpoint = (dims = getScreenDimensions()) => {
    const w = dims.width;
    if (w >= BREAKPOINTS.xl)
        return 'xl';
    if (w >= BREAKPOINTS.lg)
        return 'lg';
    if (w >= BREAKPOINTS.md)
        return 'md';
    return 'sm';
};
const BP_ORDER = ['sm', 'md', 'lg', 'xl'];
/**
 * Pick the value for the active breakpoint, falling back to the nearest smaller
 * breakpoint that is defined (mobile-first cascade). Returns `undefined` if no
 * matching or smaller value exists.
 */
export const selectByBreakpoint = (values, dims = getScreenDimensions()) => {
    const active = getBreakpoint(dims);
    for (let i = BP_ORDER.indexOf(active); i >= 0; i--) {
        const v = values[BP_ORDER[i]];
        if (v !== undefined)
            return v;
    }
    return undefined;
};
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
            const key = `${d.width}x${d.height}:${getConfigVersion()}:${i}`;
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
const finalizeFont = (value) => roundToPixel(RESPECT_FONT_SCALE ? value * getFontScale() : value);
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
        return isTabletDimensions(getDims());
    },
    isPad,
    get isLandscape() {
        const d = getDims();
        return d.width > d.height;
    },
    get breakpoint() {
        return getBreakpoint(getDims());
    },
    FONTSIZE: numericMap('size', 100, (i, d) => finalizeFont(calculateFont(pick(d, i / 440, i / 500), getReferenceShort(d))), getDims),
    HScale: numericMap('Width', 400, (i, d) => roundToPixel(calculateWidth(i / 450, getReferenceShort(d))), getDims),
    VScale: numericMap('Height', 800, (i, d) => roundToPixel(calculateWidth(i / 1000, getReferenceLong(d))), getDims),
    BORDER_RADIUS: numericMap('radius', 200, (i, d) => roundToPixel(calculateWidth(i / 1000, getReferenceShort(d))), getDims),
    IconSize: numericMap('iconSize', 200, (i, d) => finalizeFont(calculateFont(pick(d, i / 440, i / 500), getReferenceShort(d))), getDims),
    Dvalues: numericMap('Dvalues', 400, (i, d) => {
        const dv = calculateDvales(i / 450, getReferenceShort(d));
        return {
            CdWidth: roundToPixel(dv.CdWidth),
            CdHeight: roundToPixel(dv.CdHeight),
            CdBorderRadius: roundToPixel(dv.CdBorderRadius),
        };
    }, getDims),
});
/** Build a token surface bound to a fixed set of dimensions. */
export const createResponsive = (dimensions) => buildTokens(() => dimensions);
// Live, module-level token surface. Every access reads the current window size.
const live = buildTokens(getScreenDimensions);
export const FONTSIZE = live.FONTSIZE;
export const HScale = live.HScale;
export const VScale = live.VScale;
export const BORDER_RADIUS = live.BORDER_RADIUS;
export const IconSize = live.IconSize;
export const Dvalues = live.Dvalues;
/**
 * React hook returning the full token surface bound to the current window
 * dimensions. Components using it re-render on rotation / resize so tokens
 * used inside `StyleSheet.create` or inline styles stay correct.
 */
export const useResponsive = () => {
    const win = useWindowDimensions();
    // Guard against a transient 0 / NaN from the platform on first render.
    const fallback = getScreenDimensions();
    const width = win.width > 0 ? win.width : fallback.width;
    const height = win.height > 0 ? win.height : fallback.height;
    return useMemo(() => createResponsive({ width, height }), [width, height]);
};
/**
 * React hook returning the active {@link Breakpoint}, recomputed when the window
 * width crosses a threshold on rotation / resize.
 */
export const useBreakpoint = () => {
    const win = useWindowDimensions();
    const fallback = getScreenDimensions();
    const width = win.width > 0 ? win.width : fallback.width;
    const height = win.height > 0 ? win.height : fallback.height;
    return useMemo(() => getBreakpoint({ width, height }), [width, height]);
};
