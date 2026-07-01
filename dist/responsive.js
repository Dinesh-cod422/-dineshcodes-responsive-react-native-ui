"use strict";
/**
 * Responsive scaling helpers — derive sizes from the current screen
 * dimensions so layouts adapt across device sizes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDvales = exports.calculateHeight = exports.calculateWidth = exports.calculateFont = exports.moderateScale = exports.verticalScale = exports.horizontalScale = exports.SCREEN_HEIGHT = exports.SCREEN_WIDTH = void 0;
const react_native_1 = require("react-native");
const { width, height } = react_native_1.Dimensions.get('window');
exports.SCREEN_WIDTH = width;
exports.SCREEN_HEIGHT = height;
const horizontalScale = (size) => size;
exports.horizontalScale = horizontalScale;
const verticalScale = (size) => size;
exports.verticalScale = verticalScale;
const moderateScale = (size, factor = 0.5) => size + ((0, exports.horizontalScale)(size) - size) * factor;
exports.moderateScale = moderateScale;
/** Font size as a fraction of screen width. */
const calculateFont = (value) => width * value;
exports.calculateFont = calculateFont;
/** Width as a fraction of screen width. */
const calculateWidth = (value) => width * value;
exports.calculateWidth = calculateWidth;
/** Height as a fraction of screen height. */
const calculateHeight = (value) => height * value;
exports.calculateHeight = calculateHeight;
/** A circle sized as a fraction of screen width. */
const calculateDvales = (value) => {
    const CdWidth = width * value;
    const CdHeight = CdWidth;
    const CdBorderRadius = CdWidth / 2;
    return { CdWidth, CdHeight, CdBorderRadius };
};
exports.calculateDvales = calculateDvales;
