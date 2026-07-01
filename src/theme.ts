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

import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {
  calculateDvales,
  calculateFont,
  calculateHeight,
  calculateWidth,
} from './responsive';

const isTablet = DeviceInfo.isTablet();

// `Platform.isPad` is iOS-only; guard the access so it type-checks on Android too.
const isPad = Platform.OS === 'ios' && (Platform as { isPad?: boolean }).isPad === true;

/**
 * Pick the raw scale fraction for the active device class. `pad` defaults to
 * `tablet` since the two share a value for the vast majority of tokens.
 */
const forDevice = (phone: number, tablet: number, pad: number = tablet): number =>
  isPad ? pad : isTablet ? tablet : phone;

const font = (phone: number, tablet: number, pad?: number): number =>
  calculateFont(forDevice(phone, tablet, pad));

const width = (phone: number, tablet: number, pad?: number): number =>
  calculateWidth(forDevice(phone, tablet, pad));

const height = (phone: number, tablet: number, pad?: number): number =>
  calculateHeight(forDevice(phone, tablet, pad));

export const COLORS = {
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
} as const;

export const FONTFAMILY = {
  Archivo_black: 'Archivo-Black',
  Archivo_bold: 'Archivo-Bold',
  Archivo_extrabold: 'Archivo-ExtraBold',
  Archivo_extralight: 'Archivo-ExtraLight',
  Archivo_light: 'Archivo-Light',
  Archivo_medium: 'Archivo-Medium',
  Archivo_regular: 'Archivo-Regular',
  Archivo_semibold: 'Archivo-SemiBold',
  Archivo_thin: 'Archivo-Thin',
} as const;


type FontSizeMap = { [key: `size_${number}`]: number };
export const FONTSIZE = {} as FontSizeMap;
for (let i = 1; i <= 100; i++) {
  FONTSIZE[`size_${i}` as keyof FontSizeMap] = font(i / 440, i / 500);
}

type HScaleMap = { [key: `Width_${number}`]: number };
export const HScale = {} as HScaleMap;
for (let i = 1; i <= 400; i++) {
  const val = i / 450;
  HScale[`Width_${i}` as keyof HScaleMap] = width(val, val);
}

type VScaleMap = { [key: `Height_${number}`]: number };
export const VScale = {} as VScaleMap;
for (let i = 1; i <= 800; i++) {
  const val = i / 1000;
  VScale[`Height_${i}` as keyof VScaleMap] = height(val, val);
}

type BorderRadiusMap = { [key: `radius_${number}`]: number };
export const BORDER_RADIUS = {} as BorderRadiusMap;
for (let i = 1; i <= 200; i++) {
  const val = i / 1000;
  BORDER_RADIUS[`radius_${i}` as keyof BorderRadiusMap] = height(val, val);
}

type IconSizeMap = { [key: `iconSize_${number}`]: number };
export const IconSize = {} as IconSizeMap;
for (let i = 1; i <= 200; i++) {
  IconSize[`iconSize_${i}` as keyof IconSizeMap] = font(i / 440, i / 500);
}

type DvaluesMap = { [key: `Dvalues_${number}`]: ReturnType<typeof calculateDvales> };
export const Dvalues = {} as DvaluesMap;
for (let i = 1; i <= 400; i++) {
  Dvalues[`Dvalues_${i}` as keyof DvaluesMap] = calculateDvales(i / 450);
}
