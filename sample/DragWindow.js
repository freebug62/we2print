/**
 * Adds a draggable window to the target element.
 * @module DragWindow
 */
class DragWindow {
    /**
     * Holds the UI elements.
     * @type {Object}
     */
    ELEMENTS = {};

    /**
     * The element in which the drag window is to be created.
     * @type {HTMLElement}
     */
    TARGET = null;

    /**
     * The type of the drag window.
     * @type {string|null} e.g. `bgimage`, `bgcolor`, `text`, `image`, `shape`, `draw`, `info`
     */
    TYPE = null;

    /**
     * The class to be initialized using the `content` wrapper as the target.
     * @type {class|null}
     */
    MODULE = null;

    /**
     * The payload to be passed to the module constructor.
     * @type {Object|null}
     */
    MODULE_PAYLOAD = null;

    /**
     * The event to be fired when the drag window is closed.
     * @type {string}
     */
    static WINDOW_CLOSE_EVENT = 'drag-window-close-event';

    /**
     * @param {HTMLElement} target The element in which the drag window is to be created.
     * @param {class|null} module The class to be initialized using the `content` wrapper as the target.
     * @param {Object|null} payload The payload to be passed to the module constructor.
     * @returns {DragWindow} Instance of.
     */
    constructor(target, module, payload) {
        this.TARGET = target;
        this.MODULE = module;
        this.MODULE_PAYLOAD = payload;
        this.MODULE_PAYLOAD.window = this;

        this._initElements();
        this._initModule();
        this._initAutoClose();
    }

    /**
     * Sets the title of the drag window.
     *
     * @public
     * @param {string} title - The title of the drag window.
     * @returns {void}
     */
    setTitle(title) {
        this.ELEMENTS.handle.textContent = title;
    }

    /**
     * Sets the type of the drag window.
     *
     * @public
     * @param {string|null} type - The type of the drag window. e.g. `bgimage`, `bgcolor`, `text`, `image`, `shape`, `draw`, `info`
     * @returns {void}
     */
    setType(type) {
        this.TYPE = type;
    }

    /**
     * Retrieves the type of the drag window.
     *
     * @public
     * @readonly
     * @returns {string|null} The type of the drag window. e.g. `bgimage`, `bgcolor`, `text`, `image`, `shape`, `draw`, `info`
     */
    getType() {
        return this.TYPE;
    }

    /**
     * Destroys the drag window.
     *
     * @public
     * @returns {void}
     */
    destroy() {
        if (!this.TARGET) return;

        this.TARGET.removeChild(this.ELEMENTS.wrap);
        this.TYPE = null;
        this.MODULE = null;
        this.TARGET = null;
        this.ELEMENTS.wrap = null;
        this.ELEMENTS.handle = null;
        this.ELEMENTS.content = null;

        const closeEvent = new CustomEvent(DragWindow.WINDOW_CLOSE_EVENT, { bubbles: true, cancelable: true, detail: this.TYPE });
        document.dispatchEvent(closeEvent);
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
        const closeHandler = e => {
            if (this.ELEMENTS.wrap && !this.ELEMENTS.wrap.contains(e.target)) {
                this.destroy();
                document.removeEventListener('click', closeHandler);
            }
        };

        document.addEventListener('click', closeHandler, true);
    }

    /**
     * Initializes the UI elements.
     * Creates the container, handle and content elements and appends them to the target element.
     *
     * @private
     */
    _initElements() {
        this.ELEMENTS.wrap = document.createElement('div');
        this.ELEMENTS.wrap.classList.add('drag-window');
        this.TARGET.appendChild(this.ELEMENTS.wrap);

        this.ELEMENTS.handle = document.createElement('h3');
        this.ELEMENTS.handle.classList.add('drag-window-handle');
        this.ELEMENTS.wrap.appendChild(this.ELEMENTS.handle);

        this.ELEMENTS.content = document.createElement('div');
        this.ELEMENTS.content.classList.add('drag-window-content');
        this.ELEMENTS.wrap.appendChild(this.ELEMENTS.content);

        this._windowDragWindow();
    }

    /**
     * Allow the window to be dragged by the title bar handle.
     *
     * @private
     */
    _windowDragWindow() {
        const moveHandler = (e) => {
            const handle = e.target.closest('.drag-window-handle');
            if (!handle) return;

            const window = handle.closest('.drag-window');
            if (!window) return;

            const rect = window.getBoundingClientRect();
            const offsetX = e.clientX - rect.left + 7;
            const offsetY = e.clientY - rect.top + 7;

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
     * Initializes the module using the content wrapper as the target.
     * If no module is specified, this function does nothing.
     *
     * @private
     * @returns {void}
     */
    _initModule() {
        if (!this.MODULE) return;

        new this.MODULE(this.ELEMENTS.content, this.MODULE_PAYLOAD);
    }
}

module.exports = DragWindow;