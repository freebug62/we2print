const Logger = require('../../helpers/Logger');

class RightBar {
    /**
     * @param {HTMLDivElement|null} WRAP The DivElement for the right bar.
     * @static
     * @type {HTMLElement}
     */
    static WRAP = null;

    /**
     * @param {string} barId The ID for the right bar DivElement.
     * @returns {RightBar} Instance of.
     */
    constructor(barId) {
        RightBar.WRAP = document.querySelector(barId);

        if (!RightBar.WRAP) {
            Logger.log('RightBar: targetElement must be an HTMLElement', 'error');
            return;
        }

    }

    /**
     * Shows the right bar.
     *
     * @returns {void}
     */
    show() {
        RightBar.WRAP.classList.remove('w2p-rightbar-hide');
        RightBar.WRAP.classList.add('w2p-rightbar-show');
    }

    /**
     * Hides the right bar.
     *
     * @returns {void}
     */
    hide() {
        RightBar.WRAP.classList.remove('w2p-rightbar-show');
        RightBar.WRAP.classList.add('w2p-rightbar-hide');
    }
}

module.exports = RightBar;