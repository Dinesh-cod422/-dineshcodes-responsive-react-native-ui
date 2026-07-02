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
import { Dimensionsable, calculateDvales } from './responsive';
/** Smallest side (in dp) at or above which a device is treated as a tablet. */
export declare const TABLET_BREAKPOINT = 600;
/** Pure-JS tablet check for a given window size (orientation-independent). */
export declare const isTabletDimensions: (dims: Dimensionsable) => boolean;
/**
 * Whether the current device is a tablet, evaluated against the *live* window
 * size on each call. Stays correct across runtime changes that cross the tablet
 * breakpoint — split-screen, foldables, resizable windows — not just rotation.
 * Prefer this (or the `isTablet` field from {@link useResponsive}) over the
 * {@link isTablet} snapshot.
 */
export declare const getIsTablet: () => boolean;
/**
 * Whether the device was a tablet **at import time**. Uses the smallest window
 * side, so it is stable across rotation but will not reflect later split-screen
 * / foldable / resize changes.
 *
 * @deprecated Snapshot value. Use {@link getIsTablet} for a live check, or the
 * `isTablet` field returned by {@link useResponsive} inside components.
 */
export declare const isTablet: boolean;
export declare const isPad: boolean;
/**
 * Pick the raw scale fraction for the active device class. `pad` defaults to
 * `tablet` since the two share a value for the vast majority of tokens.
 *
 * Reads the *live* window size on each call (via `pick`) so the choice stays
 * correct across runtime changes — split-screen, foldables, resizable windows —
 * rather than being frozen to the device class at import time.
 */
export declare const forDevice: (phone: number, tablet: number, pad?: number) => number;
/** Ordered layout breakpoints (min current-width, in dp). */
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';
/** Mutable min-width thresholds for each breakpoint. Override via {@link setBreakpoints}. */
export declare const BREAKPOINTS: Record<Breakpoint, number>;
/** Override one or more breakpoint thresholds (dp). */
export declare const setBreakpoints: (overrides: Partial<Record<Breakpoint, number>>) => void;
/**
 * Active breakpoint for a window, based on its *current width* (so landscape
 * reports a wider breakpoint than portrait, as expected for layout decisions).
 */
export declare const getBreakpoint: (dims?: Dimensionsable) => Breakpoint;
/**
 * Pick the value for the active breakpoint, falling back to the nearest smaller
 * breakpoint that is defined (mobile-first cascade). Returns `undefined` if no
 * matching or smaller value exists.
 */
export declare const selectByBreakpoint: <T>(values: Partial<Record<Breakpoint, T>>, dims?: Dimensionsable) => T | undefined;
type FontSizeMap = {
    [key: `size_${number}`]: number;
};
type HScaleMap = {
    [key: `Width_${number}`]: number;
};
type VScaleMap = {
    [key: `Height_${number}`]: number;
};
type BorderRadiusMap = {
    [key: `radius_${number}`]: number;
};
type IconSizeMap = {
    [key: `iconSize_${number}`]: number;
};
type DvaluesMap = {
    [key: `Dvalues_${number}`]: ReturnType<typeof calculateDvales>;
};
/** The complete responsive token surface bound to a dimensions source. */
export interface ResponsiveTokens {
    width: number;
    height: number;
    isTablet: boolean;
    isPad: boolean;
    isLandscape: boolean;
    breakpoint: Breakpoint;
    FONTSIZE: FontSizeMap;
    HScale: HScaleMap;
    VScale: VScaleMap;
    BORDER_RADIUS: BorderRadiusMap;
    IconSize: IconSizeMap;
    Dvalues: DvaluesMap;
}
/** Build a token surface bound to a fixed set of dimensions. */
export declare const createResponsive: (dimensions: Dimensionsable) => ResponsiveTokens;
export declare const FONTSIZE: FontSizeMap;
export declare const HScale: HScaleMap;
export declare const VScale: VScaleMap;
export declare const BORDER_RADIUS: BorderRadiusMap;
export declare const IconSize: IconSizeMap;
export declare const Dvalues: DvaluesMap;
/**
 * React hook returning the full token surface bound to the current window
 * dimensions. Components using it re-render on rotation / resize so tokens
 * used inside `StyleSheet.create` or inline styles stay correct.
 */
export declare const useResponsive: () => ResponsiveTokens;
/**
 * React hook returning the active {@link Breakpoint}, recomputed when the window
 * width crosses a threshold on rotation / resize.
 */
export declare const useBreakpoint: () => Breakpoint;
export {};
