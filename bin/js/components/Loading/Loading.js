const Logger = require('../../helpers/Logger');

class W2PLoading {
    /**
     * Defines the animated SVG used by W2PLoading UI.
     * @param {String} ANIMATED_SVG
     * @static
     * @readonly
     * @type {String}
     */
    static ANIMATED_SVG = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="40" stroke="#1e88e5" stroke-width="8" fill="none" stroke-linecap="round">
                                <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from="0 50 50"
                                to="360 50 50"
                                dur="1s"
                                repeatCount="indefinite"/>
                                <animate
                                attributeName="stroke-dasharray"
                                values="1,251;120,251;1,251"
                                dur="1.5s"
                                repeatCount="indefinite"/>
                            </circle>
                            </svg>
                            `;

    /**
     * @param {HTMLElement} targetElement The element in which W2PLoading will be attached to.
     * @param {String} message Message to be displayed.
     * @returns {W2PLoading} Instance of.
     */
    constructor(targetElement, message) {
        if (!targetElement instanceof HTMLElement) {
            Logger.log('W2PLoading: targetElement must be an HTMLElement', 'error');
            return;
        }

        const text = document.createElement('div');
        const wrap = document.createElement('div');

        wrap.id = 'w2p-loading';
        text.classList.add('w2p-loading-text');

        wrap.innerHTML = W2PLoading.ANIMATED_SVG;
        wrap.appendChild(text);

        if (message) {
            text.innerHTML = message;
        }

        this.textWrap = text;
        this.wrap = wrap;
        this.targetElement = targetElement;
        this.targetElement.appendChild(this.wrap);
    }

    /**
     * Destroys the W2PLoading instance by removing the loading animation from the target element
     * and setting all internal references to null (GC).
     *
     * @returns {void}
     */
    destroy() {
        this.targetElement.removeChild(this.wrap);
        this.wrap = null;
        this.textWrap = null;
        this.targetElement = null;
    }

    /**
     * Hides the loading animation on the target element.
     * The animation will not be removed from the DOM.
     *
     * @returns {void}
     */
    hide() {
        if (!this.wrap) {
            return;
        }

        this.wrap.classList.add('w2p-loading-hidden');
    }

    /**
     * Shows the loading animation on the target element.
     *
     * @returns {void}
     */
    show() {
        if (!this.wrap) {
            return;
        }

        this.wrap.removeAttribute('style');
        this.wrap.classList.remove('w2p-loading-hidden');
    }

    /**
     * Updates the loading animation message on the target element.
     *
     * @param {string} message Message to be displayed on the loading animation.
     * @returns {void}
     */
    message(message) {
        if (!this.textWrap) {
            return;
        }

        this.textWrap.innerHTML = message;
    }
}

module.exports = W2PLoading;