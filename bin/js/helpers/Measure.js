/**
 * Used to convert between different units of measure.
 *
 * @class Measure
 * @static
 */
class Measure {
    /**
     * Converts a given number of millimeters to pixels.
     * The conversion is done using the given dpi.
     * @param {number} mm - The number of millimeters to convert.
     * @param {number} dpi - The dpi to use for the conversion.
     * @returns {number} The number of pixels equivalent to the given number of millimeters.
     */
    static convertMMToPixels(mm, dpi) {
        if (!Measure.isValidMeasure(mm)) return mm;
        if (!Measure.isValidMeasure(dpi)) return mm;

        return (mm * dpi) / 25.4;
    }

    /**
     * Converts a given number of inches to pixels.
     * The conversion is done using the given dpi.
     * @param {number} inches - The number of inches to convert.
     * @param {number} dpi - The dpi of the screen.
     * @return {number} The number of pixels converted from inches.
     */
    static convertINToPixels(inches, dpi) {
        if (!Measure.isValidMeasure(inches)) return inches;
        if (!Measure.isValidMeasure(dpi)) return inches;

        return inches * dpi;
    }

    /**
     * Converts a given number of pixels to millimeters.
     * The conversion is done using the given dpi.
     * @param {number} pixels - The number of pixels to convert.
     * @param {number} dpi - The dpi to use for the conversion.
     * @returns {number} The number of millimeters equivalent to the given number of pixels.
     */
    static convertPixelToMM(pixels, dpi) {
        if (!Measure.isValidMeasure(pixels)) return pixels;
        if (!Measure.isValidMeasure(dpi)) return pixels;

        return (pixels * 25.4) / dpi;
    }

    /**
     * Converts a given number of pixels to inches.
     * The conversion is done using the given dpi.
     *
     * @param {number} pixels - The number of pixels to convert.
     * @param {number} dpi - The dpi of the screen.
     * @return {number} The number of inches converted from pixels.
     */
    static convertPixelToIN(pixels, dpi) {
        if (!Measure.isValidMeasure(pixels)) return pixels;
        if (!Measure.isValidMeasure(dpi)) return pixels;

        return pixels / dpi;
    }

    /**
     * Check if a given number is a valid measure.
     * A measure is valid if it is a positive number.
     *
     * @param {number} number - The number to check.
     * @return {boolean} True if the number is a valid measure, false otherwise.
     */
    static isValidMeasure(number) {
        if (typeof number !== 'number') return false;
        if (number < 0.01) return false;

        return true;
    }

    /**
     * Calculate the scale of an image based on its size and the window size.
     * The scale is calculated so that the image will fit in the window with a padding of 100px.
     *
     * @param {number} srcWidth - The width of the image.
     * @param {number} srcHeight - The height of the image.
     * @param {number} windowWidth - The width of the window.
     * @param {number} windowHeight - The height of the window.
     * @return {number} The scale of the image.
     */
    static calculateScale(srcWidth, srcHeight, windowWidth, windowHeight) {
        let scale = 1;
        const padding = 100;

        if (srcWidth > windowWidth - padding) scale = (windowWidth - padding) / srcWidth;
        if (srcHeight > windowHeight - padding) scale = Math.min(scale, (windowHeight - padding) / srcHeight);

        return scale;
    }

    /**
     * Converts a given number of points to pixels.
     * The conversion is done using the ratio 96px / 72pt.
     *
     * @param {number} pt - The number of points to convert.
     * @return {number} The number of pixels equivalent to the given number of points.
     */
    static ptToPx(pt) {
        return (pt * 96) / 72;
    }

    /**
     * Converts a given number of pixels to points.
     * The conversion is done using the ratio 72pt / 96px.
     *
     * @param {number} px - The number of pixels to convert.
     * @return {number} The number of points equivalent to the given number of pixels.
     */
    static pxToPt(px) {
        return (px * 72) / 96;
    }
}

module.exports = Measure;