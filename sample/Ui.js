'use strict';

const BgImage = require("./BgImage");
const DrawElement = require("./DrawElement");
const ElementImage = require("./ElementImage");
const ShapeImage = require("./ShapeImage");
const ElementText = require("./ElementText");
const DragWindow = require("./DragWindow");
const DocumentInfo = require("./DocumentInfo");

class Ui {
    /**
     * @type {W2p} Instance of W2p.
     */
    W2p = null;

    /**
     * @type {Object} Config object.
     */
    CONFIG = null;

    /**
     * Tracks which window is currently open.
     * @type {DragWindow|null}
     */
    CURRENT_WINDOW = null;

    /**
     * @type {Array} List of background images.
     */
    BACKGROUND_IMAGE_LIST = [];

    /**
     * @type {Array} List of image elements.
     */
    IMAGE_LIST = [];

    /**
     * @type {Array} List of shape elements.
     */
    SHAPE_LIST = [];

    /**
     * @type {Array} List of fonts.
     */
    FONT_LIST = [];

    /**
     * @type {HTMLElement} Target element.
     * @param {W2p} w2p Instance of.
     * @param {Object} config Config object.
     * @param {Array} bgImageList List of background images.
     */
    constructor(target, w2p, config, libLists) {
        this.W2p = w2p;
        this.CONFIG = config;
        this.BACKGROUND_IMAGE_LIST = libLists.background;
        this.IMAGE_LIST = libLists.image;
        this.SHAPE_LIST = libLists.shape;
        this.FONT_LIST = libLists.font;
        this.TARGET = target;

        if (this.FONT_LIST.length > 0) {
            this._embedFontsFromJSON(this.FONT_LIST);
        }

        this._initBackgroundImage();
        this._initAddElementImage();
        this._initAddShapeElement();
        this._initAddElementText();
        this._initDrawElement();
        this._initDocumentInfo();

        // listen to edit element event.
        document.addEventListener(this.W2p.W2P_EDIT_EVENT, this._handleTransformEditEvent.bind(this));
    }

    /**
     * Handles the 'edit element' event triggered by the transform handles.
     *
     * @private
     * @param {Event} e - The 'edit element' event.
     * @returns {void}
     */
    _handleTransformEditEvent(e) {
        this.W2p._log('Edit element event fired. See payload below.', 'info');
        console.log(e.detail);

        alert('Edit element event fired!\nSee the selected element information in the console.\n\nIt\'s up to you to implement this feature on your own UI. The element information and document page instance is provided in the payload.');
    }

    /**
     * Initializes the document information window UI.
     *
     * @private
     * @returns {void}
     */
    _initDocumentInfo() {
        const btn = document.getElementById('info-btn');


        if (!btn) return;

        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            btn.setAttribute('disabled', true);

            if (this.CURRENT_WINDOW !== null) {
                if (this.CURRENT_WINDOW.getType() === 'info') {
                    return;
                };

                this.CURRENT_WINDOW.destroy();
                this.CURRENT_WINDOW = null;
            }

            const payload = {
                w2p: this.W2p,
                lib: this.FONT_LIST
            };

            this.CURRENT_WINDOW = new DragWindow(this.TARGET, DocumentInfo, payload);
            this.CURRENT_WINDOW.setType('info');
            this.CURRENT_WINDOW.setTitle('Document information');

            const closedEvent = () => {
                this.CURRENT_WINDOW.destroy();
                this.CURRENT_WINDOW = null;
                btn.removeAttribute('disabled');

                document.removeEventListener(DragWindow.WINDOW_CLOSE_EVENT, closedEvent);
            };

            document.addEventListener(DragWindow.WINDOW_CLOSE_EVENT, closedEvent);
        });
    }

    /**
     * Initializes the 'Draw on document' button event listener.
     * @private
     * @returns {void}
     */
    _initDrawElement() {
        const btn = document.getElementById('draw-btn');

        if (!btn) return;

        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            btn.setAttribute('disabled', true);

            if (this.CURRENT_WINDOW !== null) {
                if (this.CURRENT_WINDOW.getType() === 'vector') {
                    return;
                };

                this.CURRENT_WINDOW.destroy();
                this.CURRENT_WINDOW = null;
            }

            const payload = {
                w2p: this.W2p,
                lib: this.FONT_LIST
            };

            this.CURRENT_WINDOW = new DragWindow(this.TARGET, DrawElement, payload);
            this.CURRENT_WINDOW.setType('vector');
            this.CURRENT_WINDOW.setTitle('Draw on document');

            const closedEvent = () => {
                this.CURRENT_WINDOW.destroy();
                this.CURRENT_WINDOW = null;
                btn.removeAttribute('disabled');

                document.removeEventListener(DragWindow.WINDOW_CLOSE_EVENT, closedEvent);
            };

            document.addEventListener(DragWindow.WINDOW_CLOSE_EVENT, closedEvent);
        });
    }

    /**
     * Initializes the 'Add element text' button event listener.
     *
     * @private
     * @returns {void}
     */
    _initAddElementText() {
        const btn = document.getElementById('text-btn');

        if (!btn) return;

        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            btn.setAttribute('disabled', true);

            if (this.CURRENT_WINDOW !== null) {
                if (this.CURRENT_WINDOW.getType() === 'text') {
                    return;
                };

                this.CURRENT_WINDOW.destroy();
                this.CURRENT_WINDOW = null;
            }

            const payload = {
                w2p: this.W2p,
                lib: this.FONT_LIST
            };

            this.CURRENT_WINDOW = new DragWindow(this.TARGET, ElementText, payload);
            this.CURRENT_WINDOW.setType('text');
            this.CURRENT_WINDOW.setTitle('Text element');

            const closedEvent = () => {
                this.CURRENT_WINDOW.destroy();
                this.CURRENT_WINDOW = null;
                btn.removeAttribute('disabled');

                document.removeEventListener(DragWindow.WINDOW_CLOSE_EVENT, closedEvent);
            };

            document.addEventListener(DragWindow.WINDOW_CLOSE_EVENT, closedEvent);
        });
    }

    /**
     * Initializes the 'Add shape element' button event listener.
     *
     * @private
     * @returns {void}
     */
    _initAddShapeElement() {
        const btn = document.getElementById('shape-btn');

        if (!btn) return;

        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            btn.setAttribute('disabled', true);

            if (this.CURRENT_WINDOW !== null) {
                if (this.CURRENT_WINDOW.getType() === 'shape') {
                    return;
                };

                this.CURRENT_WINDOW.destroy();
                this.CURRENT_WINDOW = null;
            }

            const payload = {
                w2p: this.W2p,
                lib: this.SHAPE_LIST
            };

            this.CURRENT_WINDOW = new DragWindow(this.TARGET, ShapeImage, payload);
            this.CURRENT_WINDOW.setType('shape');
            this.CURRENT_WINDOW.setTitle('Shape element');

            const closedEvent = () => {
                this.CURRENT_WINDOW.destroy();
                this.CURRENT_WINDOW = null;
                btn.removeAttribute('disabled');

                document.removeEventListener(DragWindow.WINDOW_CLOSE_EVENT, closedEvent);
            };

            document.addEventListener(DragWindow.WINDOW_CLOSE_EVENT, closedEvent);
        });
    }

    /**
     * Initializes the add element image window UI.
     *
     * @private
     * @returns {void}
     */
    _initAddElementImage() {
        const btn = document.getElementById('image-btn');

        if (!btn) return;

        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            btn.setAttribute('disabled', true);

            if (this.CURRENT_WINDOW !== null) {
                if (this.CURRENT_WINDOW.getType() === 'image') {
                    return;
                };

                this.CURRENT_WINDOW.destroy();
                this.CURRENT_WINDOW = null;
            }

            const payload = {
                w2p: this.W2p,
                lib: this.IMAGE_LIST
            };

            this.CURRENT_WINDOW = new DragWindow(this.TARGET, ElementImage, payload);
            this.CURRENT_WINDOW.setType('image');
            this.CURRENT_WINDOW.setTitle('Image element');

            const closedEvent = () => {
                this.CURRENT_WINDOW.destroy();
                this.CURRENT_WINDOW = null;
                btn.removeAttribute('disabled');

                document.removeEventListener(DragWindow.WINDOW_CLOSE_EVENT, closedEvent);
            };

            document.addEventListener(DragWindow.WINDOW_CLOSE_EVENT, closedEvent);
        });
    }

    /**
     * Initializes the background image window UI.
     *
     * @private
     * @returns {void}
     */
    _initBackgroundImage() {
        const btn = document.getElementById('bg-image-btn');

        if (!btn) return;

        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            btn.setAttribute('disabled', true);

            if (this.CURRENT_WINDOW !== null) {
                if (this.CURRENT_WINDOW.getType() === 'bgimage') {
                    return;
                };

                this.CURRENT_WINDOW.destroy();
                this.CURRENT_WINDOW = null;
            }

            const payload = {
                w2p: this.W2p,
                lib: this.BACKGROUND_IMAGE_LIST
            };

            this.CURRENT_WINDOW = new DragWindow(this.TARGET, BgImage, payload);
            this.CURRENT_WINDOW.setType('bgimage');
            this.CURRENT_WINDOW.setTitle('Background image');

            const closedEvent = () => {
                this.CURRENT_WINDOW.destroy();
                this.CURRENT_WINDOW = null;
                btn.removeAttribute('disabled');

                document.removeEventListener(DragWindow.WINDOW_CLOSE_EVENT, closedEvent);
            };

            document.addEventListener(DragWindow.WINDOW_CLOSE_EVENT, closedEvent);
        });
    }

    /**
     * Embeds custom fonts into the page using the JSON data provided.
     * Removes any existing embedded custom fonts style tag.
     *
     * @param {object[]} fontsJSON - Array of custom font JSON objects.
     * @returns {Promise<HTMLStyleElement>} - Promise that resolves to the embedded custom fonts style tag if successful.
     */
    async _embedFontsFromJSON(fontsJSON) {
        const existing = document.getElementById('w2p-fonts');
        if (existing) existing.remove();

        const style = document.createElement('style');
        style.id = 'w2p-fonts';
        document.head.appendChild(style);

        const fontFaceRules = [];

        for (const font of fontsJSON) {
            const { family, src, italic = false, bold = false } = font;
            const weight = bold ? 'bold' : 'normal';
            const styleItalic = italic ? 'italic' : 'normal';

            const rule = `
@font-face {
  font-family: "${family}";
  src: url(${src});
  font-weight: ${weight};
  font-style: ${styleItalic};
  font-display: swap;
}`.trim();

            fontFaceRules.push(rule);
        }

        style.textContent = fontFaceRules.join('\n\n');
    }
}

module.exports = Ui;
