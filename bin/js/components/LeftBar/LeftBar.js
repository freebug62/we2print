const Logger = require('../../helpers/Logger');

class LeftBar {
    /**
     * @param {string|null} WRAP The HTMLElement for the left bar DivElement.
     * @static
     */
    static WRAP = null;

    /**
     * @param {object|null} SELECTED_CONTROL Tracks the currently selected control and toolbar.
     * @static
     */
    static SELECTED_CONTROL = null;

    /**
     * @param {string} W2P_LEFTBAR_PROPS_EVENT The event name for the props click event.
     * @static
     */
    static W2P_LEFTBAR_PROPS_EVENT = 'w2p:propsClicked';

    /**
     * @param {boolean} PROPERTIES_TAB_OPEN The state of the properties tab.
     * @static
     */
    static PROPERTIES_TAB_OPEN = false;

    /**
     * @param {string} barId The ID for the left menu bar wrapper.
     * @returns {LeftBar} Instance of.
     */
    constructor(barId) {
        LeftBar.WRAP = document.querySelector(barId);

        if (!LeftBar.WRAP) {
            Logger.log('LeftBar: targetElement must be an HTMLElement', 'error');
            return;
        }

        this._initControls();
    }

    /**
     * Initialize left bar controls.
     *
     * @private
     * @returns {void}
     */
    _initControls() {
        // initialize left bar control buttons.
        document.querySelectorAll('.w2p-leftbar-btn').forEach((el) => {
            el.addEventListener('click', () => {
                document.querySelectorAll('.w2p-leftbar-btn').forEach((el) => {
                    el.classList.remove('active');
                });

                document.querySelectorAll('.w2p-leftbar-toolbar').forEach((el) => {
                    el.classList.remove('active');
                });

                const toolbarId = el.id;
                const toolbar = document.querySelector(`[data-ref="${toolbarId}"]`);

                toolbar.classList.add('active');
                el.classList.add('active');

                LeftBar.SELECTED_CONTROL = {
                    id: toolbarId,
                    toolbar: toolbar,
                    button: el
                };
            });
        });

        // initialize left bar properties button.
        document.querySelector('.w2p-leftbar-btn-props')
            .addEventListener('click', evt => {
                evt.preventDefault();
                evt.stopImmediatePropagation();

                if (LeftBar.PROPERTIES_TAB_OPEN) {
                    LeftBar.PROPERTIES_TAB_OPEN = false;
                    evt.currentTarget.classList.remove('active');
                } else {
                    LeftBar.PROPERTIES_TAB_OPEN = true;
                    evt.currentTarget.classList.add('active');
                }

                const customEvent = new CustomEvent(LeftBar.W2P_LEFTBAR_PROPS_EVENT, {
                    bubbles: true,
                    detail: { open: LeftBar.PROPERTIES_TAB_OPEN }
                });

                evt.currentTarget.dispatchEvent(customEvent);
            });
    }
}

module.exports = LeftBar;