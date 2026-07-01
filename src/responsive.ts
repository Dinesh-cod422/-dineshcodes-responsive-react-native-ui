/**
 * Responsive scaling helpers — derive sizes from the current screen
 * dimensions so layouts adapt across device sizes.
 */

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const horizontalScale = (size: number): number => size;

export const verticalScale = (size: number): number => size;

export const moderateScale = (size: number, factor = 0.5): number =>
  size + (horizontalScale(size) - size) * factor;

/** Font size as a fraction of screen width. */
export const calculateFont = (value: number): number => width * value;

/** Width as a fraction of screen width. */
export const calculateWidth = (value: number): number => width * value;

/** Height as a fraction of screen height. */
export const calculateHeight = (value: number): number => height * value;

/** A circle sized as a fraction of screen width. */
export const calculateDvales = (
  value: number,
): { CdWidth: number; CdHeight: number; CdBorderRadius: number } => {
  const CdWidth = width * value;
  const CdHeight = CdWidth;
  const CdBorderRadius = CdWidth / 2;
  return { CdWidth, CdHeight, CdBorderRadius };
};
