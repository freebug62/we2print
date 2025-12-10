const W2pMeasureConverter = require('../bin/js/W2pMeasureConverter');

class ShapeImage {
    /**
     * @type {W2p} W2p Instance of.
     */
    W2p = null;

    /**
     * @type {Array} List of image elements.
     */
    IMAGE_LIST = [];

    /**
     * @type {HTMLElement} Target element to append the UI elements to.
     */
    TARGET = null;

    /**
     * @type {Object} UI elements.
     */
    ELEMENTS = {};

    /**
     * @type {DragWindow} Drag window instance.
     */
    DRAG_WINDOW = null;

    /**
     *
     * @param {HTMLDivElement} target Target where elements will be append to.
     * @param {Object} payload Contains the w2p instance, image list and, drag window instance.
     * @returns {ElementImage} Instance of.
     */
    constructor(target, payload) {
        this.W2p = payload.w2p;
        this.IMAGE_LIST = payload.lib ?? [];
        this.TARGET = target;
        this.DRAG_WINDOW = payload.window;

        this._initSearchUi();
        this._initLibraryUi();
    }

    /**
     * Destroys the element image window UI.
     *
     * @returns {void}
     */
    destroy() {
        this.ELEMENTS.input.removeEventListener('input', this._searchEventHandler);
        this.ELEMENTS.clear.removeEventListener('click', this._clearSearchEventHandler);
        this.ELEMENTS = null;
    }

    /**
     * Initializes the library UI elements.
     *
     * @private
     * @returns {void}
     */
    _initLibraryUi() {
        this.ELEMENTS.listwrap = document.createElement('section');
        this.ELEMENTS.listwrap.classList.add('ui-comp-section');
        this.ELEMENTS.listwrap.classList.add('element-shape-list');
        this.TARGET.appendChild(this.ELEMENTS.listwrap);

        let i, d, img;

        for (i = 0; i < this.IMAGE_LIST.length; i++) {
            d = document.createElement('div');
            d.classList.add('element-shape-list-item');
            d.dataset.width = this.IMAGE_LIST[i].width;
            d.dataset.height = this.IMAGE_LIST[i].height;
            d.dataset.src = this.IMAGE_LIST[i].src;
            d.title = this.IMAGE_LIST[i].description;
            this.ELEMENTS.listwrap.appendChild(d);

            img = document.createElement('img');
            img.src = this.IMAGE_LIST[i].src;
            img.setAttribute('draggable', 'false');
            img.alt = this.IMAGE_LIST[i].description;
            d.appendChild(img);

            d.addEventListener('click', this._selectedElementEventHandler.bind(this));
        }
    }

    /**
     * Handles the event when a user selects an element from the library.
     *
     * @param {MouseEvent} e Event object.
     * @private
     * @returns {void}
     */
    _selectedElementEventHandler(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        let w = parseInt(e.currentTarget.dataset.width),
            h = parseInt(e.currentTarget.dataset.height),
            tw = W2pMeasureConverter.convertMMToPixels(this.W2p._TEMPLATE.size.width, this.W2p._TEMPLATE.size.dpi),
            th = W2pMeasureConverter.convertMMToPixels(this.W2p._TEMPLATE.size.height, this.W2p._TEMPLATE.size.dpi);

        if (this.W2p._TEMPLATE.size.measure === 'in') {
            tw = W2pMeasureConverter.convertINToPixels(this.W2p._TEMPLATE.size.width, this.W2p._TEMPLATE.size.dpi);
            th = W2pMeasureConverter.convertINToPixels(this.W2p._TEMPLATE.size.height, this.W2p._TEMPLATE.size.dpi);
        }

        let pos = {
            x: 0,
            y: 0
        };

        // check if image is greater than document.
        // if so, resize it to 1/4 of the document size.
        if (w > tw || h > th) {
            const scale = Math.min(tw / w, th / h);

            w *= scale;
            h *= scale;
        }

        // calculate position for image to the center of the document.
        pos.x = (tw - w) / 2;
        pos.y = (th - h) / 2;

        // convert to mm or in.
        if (this.W2p._TEMPLATE.size.measure === 'mm') {
            pos.x = W2pMeasureConverter.convertPixelToMM(pos.x, this.W2p._TEMPLATE.size.dpi);
            pos.y = W2pMeasureConverter.convertPixelToMM(pos.y, this.W2p._TEMPLATE.size.dpi);
            w = W2pMeasureConverter.convertPixelToMM(w, this.W2p._TEMPLATE.size.dpi);
            h = W2pMeasureConverter.convertPixelToMM(h, this.W2p._TEMPLATE.size.dpi);
        } else {
            pos.x = W2pMeasureConverter.convertPixelToIN(pos.x, this.W2p._TEMPLATE.size.dpi);
            pos.y = W2pMeasureConverter.convertPixelToIN(pos.y, this.W2p._TEMPLATE.size.dpi);
            w = W2pMeasureConverter.convertPixelToIN(w, this.W2p._TEMPLATE.size.dpi);
            h = W2pMeasureConverter.convertPixelToIN(h, this.W2p._TEMPLATE.size.dpi);
        }

        // add element.
        const elem = {
            type: 'vector',
            x: pos.x,
            y: pos.y,
            width: w,
            height: h,
            vector: e.currentTarget.dataset.src,
            color: '#444444',
            locked: false
        };

        const page = this.W2p._PAGES[this.W2p._CURRENT_PAGE_INDEX];

        this.W2p.addElement(elem, page)
            .catch(e => {
                console.log(`%c[ERROR] _selectedElementEventHandler: ${e}`, 'background:tomato;color:white;padding:3px;');
            });

        this.DRAG_WINDOW.destroy();
    }

    /**
     * Initializes the search UI elements.
     *
     * @private
     * @returns {void}
     */
    _initSearchUi() {
        if (this.IMAGE_LIST.length === 0) return;

        this.ELEMENTS.searchwrap = document.createElement('section');
        this.ELEMENTS.searchwrap.classList.add('ui-comp-section');
        this.ELEMENTS.searchwrap.classList.add('element-shape-search');
        this.TARGET.appendChild(this.ELEMENTS.searchwrap);

        const title = document.createElement('h3');
        title.textContent = 'Search for shapes';
        this.ELEMENTS.searchwrap.appendChild(title);

        this.ELEMENTS.input = document.createElement('input');
        this.ELEMENTS.input.id = 'element-shape-search-input';
        this.ELEMENTS.input.type = 'text';
        this.ELEMENTS.input.placeholder = 'Search keyword';
        this.ELEMENTS.input.classList.add('ui-text-input');
        this.ELEMENTS.searchwrap.appendChild(this.ELEMENTS.input);

        this.ELEMENTS.clear = document.createElement('button');
        this.ELEMENTS.clear.type = 'button';
        this.ELEMENTS.clear.innerHTML = `&times;`;
        this.ELEMENTS.clear.title = 'Clear search';
        this.ELEMENTS.clear.classList.add('ui-button');
        this.ELEMENTS.clear.classList.add('element-clear-btn');
        this.ELEMENTS.searchwrap.appendChild(this.ELEMENTS.clear);

        this.ELEMENTS.input.addEventListener('input', this._searchEventHandler.bind(this));
        this.ELEMENTS.clear.addEventListener('click', this._clearSearchEventHandler.bind(this));
    }

    /**
     * Handles the event when the user clicks the clear search button.
     * Clears the search input field and hides the clear search button.
     *
     * @private
     * @param {Event} e - The event that triggered the function call.
     * @returns {void}
     */
    _clearSearchEventHandler(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        this.ELEMENTS.input.value = '';
        this.ELEMENTS.clear.style.display = 'none';

        const list = this.ELEMENTS.listwrap.querySelectorAll('.element-shape-list-item');

        for (let i = 0; i < list.length; i++) {
            list[i].removeAttribute('style');
        }
    }

    /**
     * Handles the event when the user types something in the search input field.
     *
     * @private
     * @param {Event} e - The event that triggered the function call.
     * @returns {void}
     */
    _searchEventHandler(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        const keyword = e.target.value.toLowerCase().trim();

        if (keyword === '') {
            this.ELEMENTS.clear.style.display = 'none';
        } else {
            this.ELEMENTS.clear.style.display = 'flex';
        }

        const list = this.ELEMENTS.listwrap.querySelectorAll('.element-shape-list-item');

        for (let i = 0; i < list.length; i++) {
            const hasKeyword = list[i].title.toLowerCase().includes(keyword);

            list[i].style.display = (hasKeyword ? 'block' : 'none');
        }
    }
}

module.exports = ShapeImage;
