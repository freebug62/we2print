const SVGDrawing = require('./SvgDrawing');

class DrawElement {
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
     * @type {Array} List of stroke sizes.
     */
    STROKE_SIZES = [3, 5, 7, 9, 11, 13, 15];

    /**
     * @type {number} Selected stroke size.
     */
    SELECTED_STROKE_SIZE = 3;

    /**
     * @type {string} Selected color in HEX format.
     */
    SELECTED_COLOR = '#000000';

    /**
     * @type {SVGDrawing} Instance of SVGDrawing.
     */
    DRAWING = null;

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

        this._initUi();
    }

    /**
     * Destroys the draw element window UI.
     *
     * @returns {void}
     */
    destroy() {
        const elem = document.querySelectorAll('.draw-element-toolbar_a-size');

        elem.forEach((e) => e.removeEventListener('click', this._handleClickSize.bind(this)));

        this.ELEMENTS.toolbar.color.removeEventListener('input', this._handleChangeColor.bind(this));
        this.ELEMENTS.controls.apply.removeEventListener('click', this._handleApply.bind(this));
        this.ELEMENTS = null;

        if (this.DRAWING) {
            this.DRAWING.destroy();
            this.DRAWING = null;
        }
    }

    /**
     * Initializes the UI elements.
     *
     * @private
     * @returns {void}
     */
    _initUi() {
        this._initToolbar();
        this._initDrawBoard();
        this._initControls();
    }

    /**
     * Initializes the draw element controls.
     * This function creates a container div element and appends it to the target element.
     * It then creates a button element, adds it to the container and adds an event listener to it.
     * When the button is clicked, it calls the _handleApply function.
     *
     * @private
     * @returns {void}
     */
    _initControls() {
        const w = document.createElement('div');

        w.classList.add('draw-element-controls');
        this.TARGET.appendChild(w);

        this.ELEMENTS.controls = {
            apply: document.createElement('button'),
        };

        this.ELEMENTS.controls.apply.type = 'button';
        this.ELEMENTS.controls.apply.innerHTML = '+ Add drawing';
        this.ELEMENTS.controls.apply.classList.add('ui-button');
        this.ELEMENTS.controls.apply.classList.add('ui-button-primary');
        w.appendChild(this.ELEMENTS.controls.apply);

        this.ELEMENTS.controls.apply.addEventListener('click', this._handleApply.bind(this));
    }

    /**
     * Drawing apply button handler.
     *
     * @private
     */
    _handleApply(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        // calculate the center of the document.
        const doc = document.querySelector('.w2p-page');
        let pos = this.ELEMENTS.svg.getBoundingClientRect();

        pos = {
            dw: parseFloat(doc.getAttribute('width')),
            dh: parseFloat(doc.getAttribute('height')),
            w: pos.width,
            h: pos.height,
            x: pos.left,
            y: pos.top
        };

        pos.x += pos.dw / 2 - pos.w / 2;
        pos.y += pos.dh / 2 - pos.h / 2;

        const svg = this.ELEMENTS.svg.cloneNode(true);
        const data = {
            type: 'vector',
            x: pos.x,
            y: pos.y,
            width: pos.width,
            height: pos.height,
            vector: ``,
            color: '#4b4c48ff',
            locked: false
        };

        svg.removeAttribute('style');
        svg.removeAttribute('class');
        svg.classList.add('w2p-vector');
        svg.setAttribute('width', pos.w);
        svg.setAttribute('height', pos.h);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('x', pos.x);
        svg.setAttribute('y', pos.y);
        svg.setAttribute('viewBox', '0 0 ' + pos.w + ' ' + pos.h);

        const saveSVG = (svg, name = 'drawing.svg') => {
            const data = '<?xml version="1.0" encoding="UTF-8"?>\n' +
                new XMLSerializer().serializeToString(svg);
            const blob = new Blob([data], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = name; a.click();
            setTimeout(() => URL.revokeObjectURL(url), 100);
        };

        alert('[IMPORTANT]\n\rBecause this is a demo, the SVG code is not saved to the server. \n\rYou can download the SVG file directly from the browser and save it locally.\n\rAdding the drawing to the document is left for you to implement.');

        saveSVG(svg);
        this.DRAG_WINDOW.destroy();
    }

    /**
     * Initializes the draw element board.
     * Creates the container, SVG elements and appends them to the target element.
     *
     * @private
     * @returns {void}
     */
    _initDrawBoard() {
        const wrap = document.createElement('div');

        wrap.classList.add('ui-comp-section');
        wrap.classList.add('draw-element-board-wrap');

        this.TARGET.appendChild(wrap);
        this.ELEMENTS.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.ELEMENTS.svg.classList.add('draw-element-board');

        wrap.appendChild(this.ELEMENTS.svg);

        this.DRAWING = new SVGDrawing(this.ELEMENTS.svg, this.SELECTED_COLOR, this.SELECTED_STROKE_SIZE);
    }

    /**
     * Initializes the draw element toolbar.
     * This function creates the toolbar which contains UI elements for selecting stroke size and color.
     * The toolbar is a section element with two child div elements, one for stroke size and one for color picker.
     * The stroke size section contains a list of button elements each representing a stroke size.
     * The color picker section contains an input element of type color.
     * Listeners are added to the UI elements to handle user input events.
     *
     * @private
     */
    _initToolbar() {
        this.ELEMENTS.toolbar = {
            wrap: document.createElement('section'),
        };

        this.ELEMENTS.toolbar.wrap.classList.add('ui-comp-section');
        this.ELEMENTS.toolbar.wrap.classList.add('draw-element-toolbar');
        this.TARGET.appendChild(this.ELEMENTS.toolbar.wrap);

        // stroke size.
        const div = document.createElement('div');
        div.classList.add('ui-comp-section');
        div.classList.add('draw-element-toolbar_a');
        this.ELEMENTS.toolbar.wrap.appendChild(div);

        this.STROKE_SIZES.forEach((size) => {
            const s = document.createElement('button');
            s.type = 'button';
            s.title = `Size ${size}`;
            s.classList.add('draw-element-toolbar_a-size');
            s.dataset.size = size;
            s.innerHTML = `<span style="width: ${size}px; height: ${size}px;"></span>`;
            div.appendChild(s);

            if (size === this.SELECTED_STROKE_SIZE) {
                s.classList.add('active');
            }

            s.addEventListener('click', this._handleClickSize.bind(this));
        });

        // color picker.
        const d = document.createElement('div');
        d.classList.add('ui-comp-section');
        d.classList.add('draw-element-toolbar_b');
        this.ELEMENTS.toolbar.wrap.appendChild(d);

        this.ELEMENTS.toolbar.color = document.createElement('input');
        this.ELEMENTS.toolbar.color.type = 'color';
        this.ELEMENTS.toolbar.color.id = 'draw-element-toolbar_b-color';
        this.ELEMENTS.toolbar.color.value = this.SELECTED_COLOR;
        this.ELEMENTS.toolbar.color.title = `Current color: ${this.SELECTED_COLOR}`;
        d.appendChild(this.ELEMENTS.toolbar.color);

        this.ELEMENTS.toolbar.color.addEventListener('input', this._handleChangeColor.bind(this));
    }

    /**
     * Handles a click event on a stroke size button.
     * Prevents default event behavior and stops event propagation.
     * Updates the selected stroke size and logs it to the console.
     *
     * @private
     * @param {MouseEvent} e
     * @return {void}
     */
    _handleClickSize(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        this.SELECTED_STROKE_SIZE = e.currentTarget.dataset.size;

        document.querySelectorAll('.draw-element-toolbar_a-size').forEach((btn) => {
            btn.classList.remove('active');
        });

        e.currentTarget.classList.add('active');

        if (this.DRAWING) {
            this.DRAWING.setStrokeWidth(this.SELECTED_STROKE_SIZE);
        }
    }

    /**
     * Handles color picker input event.
     * Updates the title of the color picker input to reflect the new color.
     * Updates the background color of the stroke size buttons to reflect the new color.
     *
     * @private
     * @param {InputEvent} e
     * @return {void}
     */
    _handleChangeColor(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        this.SELECTED_COLOR = e.target.value;
        this.ELEMENTS.toolbar.color.title = `Current color: ${this.SELECTED_COLOR}`;

        let elem = document.querySelector('.draw-element-toolbar_a');

        if (!elem) {
            return;
        }

        elem = elem.querySelectorAll('button');

        if (!elem) {
            return;
        }

        elem.forEach(btn => {
            const span = btn.querySelector('span');

            if (!span) {
                return;
            }

            span.style.backgroundColor = this.SELECTED_COLOR;
        });

        if (this.DRAWING) {
            this.DRAWING.setStrokeColor(this.SELECTED_COLOR);
        }
    }
}

module.exports = DrawElement;