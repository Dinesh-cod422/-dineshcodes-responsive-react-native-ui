"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dvalues = exports.IconSize = exports.BORDER_RADIUS = exports.VScale = exports.HScale = exports.FONTSIZE = exports.FONTFAMILY = exports.COLORS = void 0;
const react_native_1 = require("react-native");
const react_native_device_info_1 = __importDefault(require("react-native-device-info"));
const responsive_1 = require("./responsive");
const isTablet = react_native_device_info_1.default.isTablet();
// `Platform.isPad` is iOS-only; guard the access so it type-checks on Android too.
const isPad = react_native_1.Platform.OS === 'ios' && react_native_1.Platform.isPad === true;
/**
 * Pick the raw scale fraction for the active device class. `pad` defaults to
 * `tablet` since the two share a value for the vast majority of tokens.
 */
const forDevice = (phone, tablet, pad = tablet) => isPad ? pad : isTablet ? tablet : phone;
const font = (phone, tablet, pad) => (0, responsive_1.calculateFont)(forDevice(phone, tablet, pad));
const width = (phone, tablet, pad) => (0, responsive_1.calculateWidth)(forDevice(phone, tablet, pad));
const height = (phone, tablet, pad) => (0, responsive_1.calculateHeight)(forDevice(phone, tablet, pad));
exports.COLORS = {
    mainWhite: '#FFF',
    mainBlue: '#3B78FF',
    mainBlueV1: '#0D3283',
    mainBlack: '#000',
    primaryRedHex: '#DC3535',
    primaryOrangeHex: '#D17842',
    primaryBlackHex: '#0C0F14',
    primaryDarkGreyHex: '#141921',
    secondaryDarkGreyHex: '#21262E',
    primaryGreyHex: '#252A32',
    secondaryGreyHex: '#252A32',
    primaryLightGreyHex: '#52555A',
    secondaryLightGreyHex: '#AEAEAE',
    primaryBlackRGBA: 'rgba(12,15,20,0.5)',
    secondaryBlackRGBA: 'rgba(0,0,0,0.7)',
    touchColor: '#f2f2f2',
    touchColor1: '#dbdbdb',
    blackDarkColor1: '#000',
    blackDarkColor2: '#404040',
};
exports.FONTFAMILY = {
    Archivo_black: 'Archivo-Black',
    Archivo_bold: 'Archivo-Bold',
    Archivo_extrabold: 'Archivo-ExtraBold',
    Archivo_extralight: 'Archivo-ExtraLight',
    Archivo_light: 'Archivo-Light',
    Archivo_medium: 'Archivo-Medium',
    Archivo_regular: 'Archivo-Regular',
    Archivo_semibold: 'Archivo-SemiBold',
    Archivo_thin: 'Archivo-Thin',
};
exports.FONTSIZE = {};
for (let i = 1; i <= 100; i++) {
    exports.FONTSIZE[`size_${i}`] = font(i / 440, i / 500);
}
exports.HScale = {};
for (let i = 1; i <= 400; i++) {
    const val = i / 450;
    exports.HScale[`Width_${i}`] = width(val, val);
}
exports.VScale = {};
for (let i = 1; i <= 800; i++) {
    const val = i / 1000;
    exports.VScale[`Height_${i}`] = height(val, val);
}
exports.BORDER_RADIUS = {};
for (let i = 1; i <= 200; i++) {
    const val = i / 1000;
    exports.BORDER_RADIUS[`radius_${i}`] = height(val, val);
}
exports.IconSize = {};
for (let i = 1; i <= 200; i++) {
    exports.IconSize[`iconSize_${i}`] = font(i / 440, i / 500);
}
exports.Dvalues = {};
for (let i = 1; i <= 400; i++) {
    exports.Dvalues[`Dvalues_${i}`] = (0, responsive_1.calculateDvales)(i / 450);
}
