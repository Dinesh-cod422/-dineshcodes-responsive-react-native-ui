/**
 * Responsive design tokens
 *
 * Scale-aware constants (colors, fonts, sizes, radii) derived from the current
 * screen dimensions via the helpers in `../utils/responsive`. Sizes adapt across
 * phones and tablets.
 *
 * Each numeric token resolves to one of three raw fractions — phone, tablet, or
 * iPad — through the `forDevice` selector below. Because iPad and Android tablet
 * usually share a value, the `pad` argument defaults to `tablet`; only pass it
 * when the iPad value genuinely differs.
 *
 * Tablet detection uses `react-native-device-info` (`DeviceInfo.isTablet()`).
 */
import { calculateDvales } from './responsive';
export declare const COLORS: {
    readonly mainWhite: "#FFF";
    readonly mainBlue: "#3B78FF";
    readonly mainBlueV1: "#0D3283";
    readonly mainBlack: "#000";
    readonly primaryRedHex: "#DC3535";
    readonly primaryOrangeHex: "#D17842";
    readonly primaryBlackHex: "#0C0F14";
    readonly primaryDarkGreyHex: "#141921";
    readonly secondaryDarkGreyHex: "#21262E";
    readonly primaryGreyHex: "#252A32";
    readonly secondaryGreyHex: "#252A32";
    readonly primaryLightGreyHex: "#52555A";
    readonly secondaryLightGreyHex: "#AEAEAE";
    readonly primaryBlackRGBA: "rgba(12,15,20,0.5)";
    readonly secondaryBlackRGBA: "rgba(0,0,0,0.7)";
    readonly touchColor: "#f2f2f2";
    readonly touchColor1: "#dbdbdb";
    readonly blackDarkColor1: "#000";
    readonly blackDarkColor2: "#404040";
};
export declare const FONTFAMILY: {
    readonly Archivo_black: "Archivo-Black";
    readonly Archivo_bold: "Archivo-Bold";
    readonly Archivo_extrabold: "Archivo-ExtraBold";
    readonly Archivo_extralight: "Archivo-ExtraLight";
    readonly Archivo_light: "Archivo-Light";
    readonly Archivo_medium: "Archivo-Medium";
    readonly Archivo_regular: "Archivo-Regular";
    readonly Archivo_semibold: "Archivo-SemiBold";
    readonly Archivo_thin: "Archivo-Thin";
};
type FontSizeMap = {
    [key: `size_${number}`]: number;
};
export declare const FONTSIZE: FontSizeMap;
type HScaleMap = {
    [key: `Width_${number}`]: number;
};
export declare const HScale: HScaleMap;
type VScaleMap = {
    [key: `Height_${number}`]: number;
};
export declare const VScale: VScaleMap;
type BorderRadiusMap = {
    [key: `radius_${number}`]: number;
};
export declare const BORDER_RADIUS: BorderRadiusMap;
type IconSizeMap = {
    [key: `iconSize_${number}`]: number;
};
export declare const IconSize: IconSizeMap;
type DvaluesMap = {
    [key: `Dvalues_${number}`]: ReturnType<typeof calculateDvales>;
};
export declare const Dvalues: DvaluesMap;
export {};
