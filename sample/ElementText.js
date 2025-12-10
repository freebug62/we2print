const W2pMeasureConverter = require('../bin/js/W2pMeasureConverter');

class ElementText {
    /**
     * @type {W2p} W2p Instance of.
     */
    W2p = null;

    /**
     * @type {Array} List of fonts.
     */
    FONT_LIST = [];

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
     * @type {string} Selected font.
     */
    SELECTED_FONT = 'Roboto';

    /**
     * @type {number} Default font size.
     */
    DEFAULT_FONT_SIZE = 16;

    /**
     * @type {string} Default font color.
     */
    DEFAULT_FONT_COLOR = '#444444';

    /**
     *
     * @param {HTMLDivElement} target Target where elements will be append to.
     * @param {Object} payload Contains the w2p instance, image list and, drag window instance.
     * @returns {ElementImage} Instance of.
     */
    constructor(target, payload) {
        this.W2p = payload.w2p;
        this.FONT_LIST = payload.lib ?? [];
        this.TARGET = target;
        this.DRAG_WINDOW = payload.window;

        this._initFontListUi();
        this._initFontPropsUi();
        this._initTextUi();
        this._initAddControlUi();
    }

    /**
     * Destroys the element text window UI.
     *
     * @returns {void}
     */
    destroy() {
        this.ELEMENTS.fontwrap.removeEventListener('change', this._fontChangeEventHandler);
        this.ELEMENTS.fontsize.removeEventListener('change', this._fontSizeChangeEventHandler);
        this.ELEMENTS.color.removeEventListener('change', this._fontColorChangeEventHandler);
        this.ELEMENTS.addbtn.removeEventListener('click', this._handleAddText);
        this.ELEMENTS = null;
    }

    /**
     * Initializes the add control button UI.
     * Adds a button to accept the text and close the window.
     *
     * @private
     * @returns {void}
     */
    _initAddControlUi() {
        // add button to accept text.
        this.ELEMENTS.addbtn = document.createElement('button');
        this.ELEMENTS.addbtn.type = 'button';
        this.ELEMENTS.addbtn.innerHTML = '+ Add Text';
        this.ELEMENTS.addbtn.title = 'Add text and close this window.';
        this.ELEMENTS.addbtn.classList.add('ui-button');
        this.ELEMENTS.addbtn.classList.add('ui-button-primary');
        this.TARGET.appendChild(this.ELEMENTS.addbtn);

        this.ELEMENTS.addbtn.addEventListener('click', this._handleAddText.bind(this));
    }

    /**
     * Handles the event when the 'Add text' button is clicked.
     * It will add the text to the current page and close the drag window.
     *
     * @private
     * @param {Event} e The click event.
     * @returns {void}
     */
    _handleAddText(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (this.ELEMENTS.textinput.value.trim().length < 1) return;

        const page = this.W2p._PAGES[this.W2p._CURRENT_PAGE_INDEX];

        // add text to current page.
        const elem = {
            type: 'text',
            x: this.W2p._TEMPLATE.size.safeline,
            y: this.W2p._TEMPLATE.size.safeline,
            text: this.ELEMENTS.textinput.value.trim(),
            color: this.DEFAULT_FONT_COLOR,
            family: this.SELECTED_FONT,
            size: this.DEFAULT_FONT_SIZE,
            weight: 'normal',
            style: 'normal',
            locked: false
        };

        this.W2p.addElement(elem, page)
            .catch(e => {
                console.log(`%c[ERROR] _selectedElementEventHandler: ${e}`, 'background:tomato;color:white;padding:3px;');
            });

        this.DRAG_WINDOW.destroy();
    }

    /**
     * Initializes the font size and color properties UI elements.
     *
     * @private
     * @returns {void}
     */
    _initFontPropsUi() {
        // section.
        this.ELEMENTS.props = document.createElement('section');
        this.ELEMENTS.props.classList.add('ui-comp-section');
        this.ELEMENTS.props.classList.add('element-text-props');
        this.TARGET.appendChild(this.ELEMENTS.props);

        // wrap flex.
        this.ELEMENTS.wrap = document.createElement('div');
        this.ELEMENTS.props.appendChild(this.ELEMENTS.wrap);

        // font size.
        this.ELEMENTS.fontsize = document.createElement('select');
        this.ELEMENTS.fontsize.classList.add('ui-text-input');
        this.ELEMENTS.fontsize.id = 'element-text-fontsize-input';

        let i,
            o,
            maxSize = 98,
            minSize = 8,
            step = 1;

        for (i = minSize; i <= maxSize; i += step) {
            o = document.createElement('option');
            o.value = i;
            o.textContent = W2pMeasureConverter.pxToPt(i) + 'pt';

            if (i === this.DEFAULT_FONT_SIZE) o.selected = true;

            this.ELEMENTS.fontsize.appendChild(o);
        }

        this.ELEMENTS.wrap.appendChild(this.ELEMENTS.fontsize);

        this.ELEMENTS.fontsize.classList.add('ui-text-input');
        this.ELEMENTS.wrap.appendChild(this.ELEMENTS.fontsize);
        this.ELEMENTS.fontsize.addEventListener('change', this._fontSizeChangeEventHandler.bind(this));

        // color picker.
        this.ELEMENTS.color = document.createElement('input');
        this.ELEMENTS.color.type = 'color';
        this.ELEMENTS.color.id = 'element-text-color-input';
        this.ELEMENTS.color.value = this.DEFAULT_FONT_COLOR;
        this.ELEMENTS.wrap.appendChild(this.ELEMENTS.color);

        this.ELEMENTS.color.addEventListener('change', this._fontColorChangeEventHandler.bind(this));
    }

    /**
     * Handles the 'change' event for the font color picker element.
     * Updates the `DEFAULT_FONT_COLOR` property with the selected font color.
     *
     * @private
     * @param {MouseEvent} e Event object.
     * @returns {void}
     */
    _fontColorChangeEventHandler(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        this.DEFAULT_FONT_COLOR = e.target.value;
        this.ELEMENTS.textinput.style.color = this.DEFAULT_FONT_COLOR;
    }

    /**
     * Handles the 'change' event for the font size select element.
     * Updates the `DEFAULT_FONT_SIZE` property with the selected font size.
     *
     * @private
     * @param {MouseEvent} e
     * @returns {void}
     */
    _fontSizeChangeEventHandler(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        this.DEFAULT_FONT_SIZE = e.target.value;
        this.ELEMENTS.textinput.style.fontSize = `${this.DEFAULT_FONT_SIZE}px`;
    }

    /**
     * Initializes the text UI elements.
     *
     * Creates the container, title and input elements and appends them to the target element.
     *
     * @private
     * @returns {void}
     */
    _initTextUi() {
        this.ELEMENTS.textwrap = document.createElement('section');
        this.ELEMENTS.textwrap.classList.add('ui-comp-section');
        this.ELEMENTS.textwrap.classList.add('element-text');
        this.TARGET.appendChild(this.ELEMENTS.textwrap);

        const title = document.createElement('h3');
        title.textContent = 'Enter your text';
        this.ELEMENTS.textwrap.appendChild(title);

        this.ELEMENTS.textinput = document.createElement('input');
        this.ELEMENTS.textinput.id = 'element-text-input';
        this.ELEMENTS.textinput.type = 'text';
        this.ELEMENTS.textinput.autocomplete = 'off';
        this.ELEMENTS.textinput.spellcheck = 'false';
        this.ELEMENTS.textinput.autocorrect = 'off';
        this.ELEMENTS.textinput.autocapitalize = 'off';
        this.ELEMENTS.textinput.maxlength = '100';
        this.ELEMENTS.textinput.placeholder = 'Enter your text here...';
        this.ELEMENTS.textinput.classList.add('ui-text-input');
        this.ELEMENTS.textinput.style.fontFamily = this.SELECTED_FONT;
        this.ELEMENTS.textwrap.appendChild(this.ELEMENTS.textinput);
    }

    /**
     * Initializes the font list UI elements.
     *
     * @private
     * @returns {void}
     */
    _initFontListUi() {
        this.ELEMENTS.fontwrap = document.createElement('section');
        this.ELEMENTS.fontwrap.classList.add('ui-comp-section');
        this.ELEMENTS.fontwrap.classList.add('element-text-font');
        this.TARGET.appendChild(this.ELEMENTS.fontwrap);

        const title = document.createElement('h3');
        title.textContent = 'Select Font';
        this.ELEMENTS.fontwrap.appendChild(title);

        this.ELEMENTS.fontinput = document.createElement('select');
        this.ELEMENTS.fontinput.id = 'element-text-font-input';
        this.ELEMENTS.fontinput.classList.add('ui-text-input');
        this.ELEMENTS.fontwrap.appendChild(this.ELEMENTS.fontinput);

        for (let i = 0; i < this.FONT_LIST.length; i++) {
            const option = document.createElement('option');
            option.value = this.FONT_LIST[i].family;
            option.textContent = this.FONT_LIST[i].family;
            option.dataset.bold = this.FONT_LIST[i].bold ? '1' : '0';
            option.dataset.italic = this.FONT_LIST[i].italic ? '1' : '0';
            option.style.fontFamily = this.FONT_LIST[i].family;

            if (this.FONT_LIST[i].family === this.SELECTED_FONT) option.selected = true;

            this.ELEMENTS.fontinput.appendChild(option);
        }

        this.ELEMENTS.fontinput.addEventListener('change', this._fontChangeEventHandler.bind(this));
    }

    /**
     * Handles the 'change' event for the font list select element.
     * Updates the `SELECTED_FONT` property with the selected font family.
     *
     * @private
     * @param {MouseEvent} e
     * @returns {void}
     */
    _fontChangeEventHandler(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        this.SELECTED_FONT = e.target.value;
        this.ELEMENTS.textinput.style.fontFamily = this.SELECTED_FONT;
    }
}


module.exports = ElementText;
