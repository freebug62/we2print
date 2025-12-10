/**
 * Implementation of document background color picker UI.
 */
class BgColor {
    /**
     * The current running instance of W2p.
     * @type {W2p|null}
     */
    W2p = null;

    /**
     * The wrapper for the background color picker UI window.
     * @type {HTMLDivElement|null}
     */
    WINDOW_WRAP = null;

    PAGE_COLOR = '#999999';

    PALETTE_IMG = null;

    /**
     * @param {W2p} w2p The current running instance of W2p.
     * @param {string} paletteImg The palette image for the color picker.
     * @returns {BgColor}
     */
    constructor(w2p, paletteImg) {
        this.W2p = w2p;
        this.PALETTE_IMG = paletteImg;
        this.WINDOW_WRAP = document.getElementById('bg-colorpicker');

        this._initColorPicker();
        this._initUiTrigger();
        this._initAutoClose();
        this._initHexUi();
        this._initCmykUi();
        this._initDraggableWindow();
    }

    /**
     * Close the background color picker window.
     *
     * @public
     * @returns {void}
     */
    close() {
        this.WINDOW_WRAP.style.display = 'none';
    }

    /**
     * Initializes the draggable window by listening to mousedown events on the window's drag handle.
     * When the handle is dragged, the window's position is updated accordingly.
     *
     * @private
     * @returns {void}
     */
    _initDraggableWindow() {
        const moveHandler = (e) => {
            const handle = e.target.closest('.window-drag-handle');
            if (!handle) return;

            const window = handle.closest('.toolwindow');
            if (!window) return;

            const rect = window.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            function onMouseMove(e) {
                window.style.left = (e.clientX - offsetX) + 'px';
                window.style.top = (e.clientY - offsetY) + 'px';
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousedown', moveHandler);
    }

    /**
     * Initializes the CMYK color picker input UI.
     * This function listens for input events on the CMYK color picker input fields and updates
     * the color picker UI and the W2p page accordingly.
     *
     * @private
     * @returns {void}
     */
    _initCmykUi() {
        const c = document.getElementById('bg-color-picker-input_cmyk-c');
        const m = document.getElementById('bg-color-picker-input_cmyk-m');
        const y = document.getElementById('bg-color-picker-input_cmyk-y');
        const k = document.getElementById('bg-color-picker-input_cmyk-k');
        const hex = document.getElementById('bg-color-picker-input_hex');
        const pointer = document.getElementById('bg-color-picker_palette-pointer');
        const preview = document.getElementById('bg-color-picker_preview-hover');
        const selected = document.getElementById('bg-color-picker_preview-selected');

        const cmykEvent = (e, input) => {
            const value = parseInt(input.value);
            const cmyk = {
                c: parseInt(c.value),
                m: parseInt(m.value),
                y: parseInt(y.value),
                k: parseInt(k.value)
            };

            if (isNaN(value)) {
                return;
            }

            if (input === c) {
                cmyk.c = parseInt(input.value);

                if (cmyk.c > 100) {
                    cmyk.c = 100;
                    c.value = cmyk.c;
                }

                if (cmyk.c < 0) {
                    cmyk.c = 0;
                    c.value = cmyk.c;
                }
            }

            if (input === m) {
                cmyk.m = parseInt(input.value);

                if (cmyk.m > 100) {
                    cmyk.m = 100;
                    m.value = cmyk.m;
                }

                if (cmyk.m < 0) {
                    cmyk.m = 0;
                    m.value = cmyk.m;
                }
            }

            if (input === y) {
                cmyk.y = parseInt(input.value);

                if (cmyk.y > 100) {
                    cmyk.y = 100;
                    y.value = cmyk.y;
                }

                if (cmyk.y < 0) {
                    cmyk.y = 0;
                    y.value = cmyk.y;
                }
            }

            if (input === k) {
                cmyk.k = parseInt(input.value);

                if (cmyk.k > 100) {
                    cmyk.k = 100;
                    k.value = cmyk.k;
                }

                if (cmyk.k < 0) {
                    cmyk.k = 0;
                    k.value = cmyk.k;
                }
            }

            const hexColor = this._cmykToHex(cmyk.c, cmyk.m, cmyk.y, cmyk.k);

            if (!this._isHex(hexColor)) {
                return;
            }

            this.PAGE_COLOR = hexColor;

            // hide pointer.
            pointer.style.display = 'none';

            // update preview.
            preview.style.backgroundColor = hexColor;
            selected.style.backgroundColor = hexColor;

            // update hex input field.
            hex.value = hexColor;

            // update W2p page color.
            this.W2p.setBackgroundColor(hexColor);
        }

        c.addEventListener('input', e => cmykEvent(e, c));
        m.addEventListener('input', e => cmykEvent(e, m));
        y.addEventListener('input', e => cmykEvent(e, y));
        k.addEventListener('input', e => cmykEvent(e, k));
    }

    /**
     * Initializes the hex color picker input UI.
     *
     * This function listens for input events on the hex color picker input field and updates
     * the color picker UI and the W2p page accordingly.
     *
     * @private
     * @returns {void}
     */
    _initHexUi() {
        const input = document.getElementById('bg-color-picker-input_hex');

        input.oninput = () => {
            const hex = input.value.trim();

            if (!this._isHex(hex)) {
                return;
            }

            this.PAGE_COLOR = input.value;

            // hide pointer.
            const pointer = document.getElementById('bg-color-picker_palette-pointer');
            pointer.style.display = 'none';

            // update preview.
            const preview = document.getElementById('bg-color-picker_preview-hover');
            const selected = document.getElementById('bg-color-picker_preview-selected');

            preview.style.backgroundColor = input.value;
            selected.style.backgroundColor = input.value;

            // update cmyk inputs.
            const cmyk = this._rgbToCmyk(this._hexToRgb(input.value));
            const c = document.getElementById('bg-color-picker-input_cmyk-c');
            const m = document.getElementById('bg-color-picker-input_cmyk-m');
            const y = document.getElementById('bg-color-picker-input_cmyk-y');
            const k = document.getElementById('bg-color-picker-input_cmyk-k');

            c.value = cmyk.c;
            m.value = cmyk.m;
            y.value = cmyk.y;
            k.value = cmyk.k;

            // apply to page.
            this.W2p.setBackgroundColor(this.PAGE_COLOR);
        };
    }

    /**
     * Initializes the auto-close feature for the background color picker window.
     * This feature listens for a click event outside of the window and closes the window
     * when such an event is detected.
     *
     * @private
     * @returns {void}
     */
    _initAutoClose() {
        this._outsideClickHandler = (e) => {
            if (this.WINDOW_WRAP && !this.WINDOW_WRAP.contains(e.target)) {
                this.close();
            }
        };

        document.addEventListener('click', this._outsideClickHandler, true);
    }

    /**
     * Initializes the UI trigger to open the background color picker.
     * The trigger is the button with the id "bg-color-btn" on HTML.
     *
     * @private
     * @returns {void}
     */
    _initUiTrigger() {
        const btn = document.getElementById('bg-color-btn');
        const pointer = document.getElementById('bg-color-picker_palette-pointer');
        const hexInput = document.getElementById('bg-color-picker-input_hex');
        const c = document.getElementById('bg-color-picker-input_cmyk-c');
        const m = document.getElementById('bg-color-picker-input_cmyk-m');
        const y = document.getElementById('bg-color-picker-input_cmyk-y');
        const k = document.getElementById('bg-color-picker-input_cmyk-k');
        const preview = document.getElementById('bg-color-picker_preview-hover');
        const selected = document.getElementById('bg-color-picker_preview-selected');

        btn.onclick = e => {
            e.preventDefault();
            e.stopImmediatePropagation();

            this.PAGE_COLOR = this._getCurrentPageBgColor();
            this.WINDOW_WRAP.style.display = 'block';

            // preset document color.
            hexInput.value = this.PAGE_COLOR;

            const rgb = this._hexToRgb(this.PAGE_COLOR);
            const cmyk = this._rgbToCmyk(rgb);

            c.value = cmyk.c;
            m.value = cmyk.m;
            y.value = cmyk.y;
            k.value = cmyk.k;

            preview.style.backgroundColor = '#fff';
            selected.style.backgroundColor = this.PAGE_COLOR;

            // hide pointer.
            pointer.style.display = 'none';
        };
    }

    /**
     * Initializes the background color picker UI.
     *
     * @private
     * @returns {void}
     */
    _initColorPicker() {
        //  get current page color (hex).
        this.PAGE_COLOR = this._getCurrentPageBgColor();

        // load palette into canvas.
        const palette = document.getElementById('bg-color-picker_palette-picker');
        const img = new Image();

        img.onload = () => {
            palette.getContext('2d').drawImage(img, 0, 0, 160, 90);
        };

        img.src = this.PALETTE_IMG;

        // update color picker input UI.
        const hexInput = document.getElementById('bg-color-picker-input_hex');
        const c = document.getElementById('bg-color-picker-input_cmyk-c');
        const m = document.getElementById('bg-color-picker-input_cmyk-m');
        const y = document.getElementById('bg-color-picker-input_cmyk-y');
        const k = document.getElementById('bg-color-picker-input_cmyk-k');

        hexInput.value = this.PAGE_COLOR;

        const rgb = this._hexToRgb(this.PAGE_COLOR);
        const cmyk = this._rgbToCmyk(rgb);

        c.value = cmyk.c;
        m.value = cmyk.m;
        y.value = cmyk.y;
        k.value = cmyk.k;

        // get color picker color under pointer.
        const ctx = palette.getContext('2d', { willReadFrequently: true });
        const preview = document.getElementById('bg-color-picker_preview-hover');
        const selected = document.getElementById('bg-color-picker_preview-selected');
        const pointer = document.getElementById('bg-color-picker_palette-pointer');

        let isMouseOver = false,
            curColor = this._hexToRgb(this.PAGE_COLOR),
            pointerPos = { x: 0, y: 0 };

        palette.addEventListener('mousemove', e => {
            pickColor(e);
        });

        palette.addEventListener('mouseenter', () => {
            isMouseOver = true;
        });

        palette.addEventListener('mouseleave', () => {
            isMouseOver = false;
            preview.style.backgroundColor = this.PAGE_COLOR;
        });

        palette.addEventListener('click', e => {
            e.preventDefault();
            e.stopImmediatePropagation();

            // set selected color box.
            selected.style.backgroundColor = curColor;

            // set pointer position.
            pointer.style.left = `${pointerPos.x}px`;
            pointer.style.top = `${pointerPos.y}px`;
            pointer.style.display = 'block';

            // update ui input fields.
            hexInput.value = this._rgbToHex(curColor);
            const cmyk = this._rgbToCmyk(curColor);

            c.value = cmyk.c;
            m.value = cmyk.m;
            y.value = cmyk.y;
            k.value = cmyk.k;

            // set document color.
            this.PAGE_COLOR = this._rgbToHex(curColor);
            this.W2p.setBackgroundColor(this.PAGE_COLOR);

            // close picker.
            this.close();
        });

        const pickColor = e => {
            if (!isMouseOver) return;

            const rect = palette.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

            pointerPos = {
                x: x,
                y: y
            };

            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const [r, g, b] = pixel;

            curColor = `rgb(${r}, ${g}, ${b})`;
            preview.style.backgroundColor = curColor;
        };
    }

    /**
     * Gets the background color of the current page in hex format.
     *
     * @private
     * @returns {string} The current background color of the page in hex format.
     * @example
     * const color = _getCurrentPageBgColor();
     * console.log(color); // Output: #ffffff
     */
    _getCurrentPageBgColor() {
        const color = this.W2p.getBackgroundColor();

        if (this._isHex(color)) {
            return color;
        }

        return this._rgbToHex(color);
    }

    /**
     * Checks if the given string is a valid hex color code.
     *
     * @private
     * @param {string} hex - The string to check.
     * @returns {boolean} True if the string is a valid hex color code, false otherwise.
     * @example
     * const hex = '#ff0000';
     * const isValidHex = _isHex(hex);
     * console.log(isValidHex); // Output: true
     */
    _isHex(hex) {
        return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/i.test(hex.trim());
    }

    /**
     * Converts a hex color code to an RGB color array.
     *
     * @private
     * @param {string} hex - The hex color code to convert. Accepts #f00 or #ff0000.
     * @returns {array<number>} - The RGB color array if the conversion was successful, null otherwise.
     * @example
     * const hex = '#fff000';
     * const rgb = _hexToRgb(hex);
     * console.log(rgb); // Output: [255, 0, 0]
     * @private
     */
    _hexToRgb(hex) {
        let hexClean = hex.replace(/^#/, '').trim();

        // Handle 3-digit shorthand: #fff → #ffffff
        if (hexClean.length === 3) {
            hexClean = hexClean.split('').map(char => char + char).join('');
        }

        // Optional: Handle 4-digit with alpha shorthand: #ffff → #ffffffff
        if (hexClean.length === 4) {
            hexClean = hexClean.split('').map(char => char + char).join('');
        }

        // Now we expect 6 or 8 characters
        if (hexClean.length !== 6 && hexClean.length !== 8) {
            return 'rgb(0, 0, 0)'; // fallback
        }

        // Validate hex chars
        if (!/^[0-9A-Fa-f]+$/.test(hexClean)) {
            return 'rgb(0, 0, 0)';
        }

        const r = parseInt(hexClean.substring(0, 2), 16);
        const g = parseInt(hexClean.substring(2, 4), 16);
        const b = parseInt(hexClean.substring(4, 6), 16);

        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Converts RGB color to Hex color.
     *
     * If the input is a string, it will be treated as an RGB color string.
     * If the input is not a string, it will be treated as individual RGB color values.
     *
     * @private
     * @param {string|number} rgb The RGB color string or individual RGB color values.
     * @returns {string} The Hex color string.
     */
    _rgbToHex(rgb) {
        let r, g, b;

        if (typeof rgb === 'string') {
            const match = rgb.match(/(\d+),?\s*(\d+),?\s*(\d+)/);
            [, r, g, b] = match || [];
        } else {
            [r, g, b] = arguments;
        }

        return "#" + [r, g, b]
            .map(x => parseInt(x).toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();
    }

    /**
     * Converts RGB color to CMYK color.
     *
     * @private
     * @param {string} rgb The RGB color string.
     * @returns {Object} The CMYK color object.
     * @property {number} c Cyan value (0-100).
     * @property {number} m Magenta value (0-100).
     * @property {number} y Yellow value (0-100).
     * @property {number} k Black value (0-100).
     */
    _rgbToCmyk(rgb) {
        rgb = rgb.match(/\d+/g).map(Number);

        const r = rgb[0];
        const g = rgb[1];
        const b = rgb[2];

        let c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255;
        let k = Math.min(c, m, y);
        if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
        return {
            c: Math.round((c - k) / (1 - k) * 100),
            m: Math.round((m - k) / (1 - k) * 100),
            y: Math.round((y - k) / (1 - k) * 100),
            k: Math.round(k * 100)
        };
    }

    /**
     * Converts CMYK to HEX color
     *
     * @param {number} c - Cyan (0–100 or 0–1)
     * @param {number} m - Magenta (0–100 or 0–1)
     * @param {number} y - Yellow (0–100 or 0–1)
     * @param {number} k - Key/Black (0–100 or 0–1)
     * @returns {string} HEX color like "#ff00cc"
     */
    _cmykToHex(c, m, y, k) {
        // Normalize values to 0–1 range if they're in 0–100
        if (c > 1 || m > 1 || y > 1 || k > 1) {
            c /= 100;
            m /= 100;
            y /= 100;
            k /= 100;
        }

        // Clamp values
        c = Math.max(0, Math.min(1, c));
        m = Math.max(0, Math.min(1, m));
        y = Math.max(0, Math.min(1, y));
        k = Math.max(0, Math.min(1, k));

        // CMYK to RGB formula
        const r = 255 * (1 - c) * (1 - k);
        const g = 255 * (1 - m) * (1 - k);
        const b = 255 * (1 - y) * (1 - k);

        // Convert to hex
        const toHex = (n) => Math.round(n).toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }
}

module.exports = BgColor;
