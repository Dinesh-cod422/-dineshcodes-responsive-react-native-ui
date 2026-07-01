/**
 * Responsive scaling helpers — derive sizes from the current screen
 * dimensions so layouts adapt across device sizes.
 */
export declare const SCREEN_WIDTH: number;
export declare const SCREEN_HEIGHT: number;
export declare const horizontalScale: (size: number) => number;
export declare const verticalScale: (size: number) => number;
export declare const moderateScale: (size: number, factor?: number) => number;
/** Font size as a fraction of screen width. */
export declare const calculateFont: (value: number) => number;
/** Width as a fraction of screen width. */
export declare const calculateWidth: (value: number) => number;
/** Height as a fraction of screen height. */
export declare const calculateHeight: (value: number) => number;
/** A circle sized as a fraction of screen width. */
export declare const calculateDvales: (value: number) => {
    CdWidth: number;
    CdHeight: number;
    CdBorderRadius: number;
};
