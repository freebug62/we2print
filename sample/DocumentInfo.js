const W2pMeasureConverter = require('../bin/js/W2pMeasureConverter');

class DocumentInfo {
    /**
     * @type {Object} Holds UI elements.
     */
    ELEMENTS = {};

    /**
     * @type {W2p} Instance of W2p.
     */
    W2p = null;

    /**
     * @type {HTMLElement} Window content div element.
     */
    TARGET = null;

    /**
     * @type {DragWindow} Instance of DragWindow.
     */
    DRAG_WINDOW = null;

    /**
     * @type {Object} Contains document size in different units.
     */
    SIZES = {};

    /**
     * Initializes a new instance of the DrawElement class.
     *
     * @param {HTMLElement} target - The target element to append the draw element window UI to.
     * @param {Object} payload - Contains the W2p instance and the drag window instance.
     */
    constructor(target, payload) {
        this.W2p = payload.w2p;
        this.TARGET = target;
        this.DRAG_WINDOW = payload.window;

        this._getDocumentSize();
        this._initUi();
    }

    /**
     * Destroys the draw element window UI.
     *
     * @returns {void}
     */
    destroy() {
        this.ELEMENTS = null;
    }

    /**
     * Initializes the UI elements.
     * Creates the container, title and input elements and appends them to the target element.
     *
     * @private
     * @returns {void}
     */
    _initUi() {
        this.ELEMENTS.wrap = document.createElement('div');
        this.ELEMENTS.wrap.classList.add('ui-comp-section');
        this.TARGET.appendChild(this.ELEMENTS.wrap);

        let h3, div, p, w;

        // title.
        h3 = document.createElement('h3');
        h3.innerHTML = 'Title';
        this.ELEMENTS.wrap.appendChild(h3);

        div = document.createElement('div');
        div.classList.add('document-info');
        this.ELEMENTS.wrap.appendChild(div);

        p = document.createElement('p');
        p.innerHTML = this.W2p._TEMPLATE.title;
        this.ELEMENTS.wrap.appendChild(p);

        // measure.
        w = document.createElement('div');
        w.classList.add('ui-comp-section');
        this.TARGET.appendChild(w);

        h3 = document.createElement('h3');
        h3.innerHTML = 'Size';
        w.appendChild(h3);

        div = document.createElement('div');
        div.classList.add('document-info');
        w.appendChild(div);

        p = document.createElement('p');
        p.innerHTML = `<strong>Millimeters:</strong> ${this.SIZES.mm.width.toFixed(2)}x${this.SIZES.mm.height.toFixed(2)}`;
        div.appendChild(p);

        p = document.createElement('p');
        p.innerHTML = `<strong>Inches:</strong> ${this.SIZES.in.width.toFixed(2)}x${this.SIZES.in.height.toFixed(2)}`;
        div.appendChild(p);

        p = document.createElement('p');
        p.innerHTML = `<strong>DPI:</strong> ${this.W2p._TEMPLATE.size.dpi}`;
        div.appendChild(p);

        // sides.
        w = document.createElement('div');
        w.classList.add('ui-comp-section');
        this.TARGET.appendChild(w);

        h3 = document.createElement('h3');
        h3.innerHTML = 'Sides';
        w.appendChild(h3);

        div = document.createElement('div');
        w.appendChild(div);

        p = document.createElement('p');
        p.innerHTML = this.W2p._TEMPLATE.pages.length + ' page(s)';
        div.appendChild(p);
    }

    /**
     * Retrieves the document size in different units of measurement (millimeters and inches)
     * and stores it in the SIZES object.
     *
     * @private
     * @returns {void}
     */
    _getDocumentSize() {
        this.SIZES = {
            mm: {
                width: 0,
                height: 0
            },
            in: {
                width: 0,
                height: 0
            }
        };

        if (this.W2p._TEMPLATE.size.measure === 'mm') {
            this.SIZES.mm.width = this.W2p._TEMPLATE.size.width;
            this.SIZES.mm.height = this.W2p._TEMPLATE.size.height;
            this.SIZES.in.width = W2pMeasureConverter.convertMMToIN(this.W2p._TEMPLATE.size.width, this.W2p._TEMPLATE.size.dpi);
            this.SIZES.in.height = W2pMeasureConverter.convertMMToIN(this.W2p._TEMPLATE.size.height, this.W2p._TEMPLATE.size.dpi);
        } else {
            this.SIZES.in.width = this.W2p._TEMPLATE.size.width;
            this.SIZES.in.height = this.W2p._TEMPLATE.size.height;
            this.SIZES.mm.width = W2pMeasureConverter.convertINToMM(this.W2p._TEMPLATE.size.width, this.W2p._TEMPLATE.size.dpi);
            this.SIZES.mm.height = W2pMeasureConverter.convertINToMM(this.W2p._TEMPLATE.size.height, this.W2p._TEMPLATE.size.dpi);
        }
    }
}

module.exports = DocumentInfo;