const Logger = require('./helpers/Logger');
let W2PRightBar = require('./components/RightBar/RightBar');
let W2PLoading = require('./components/Loading/Loading');
let W2PLeftBar = require('./components/LeftBar/LeftBar');
let W2PMainWindow = require('./components/MainWindow/MainWindow');
const LeftBar = require('./components/LeftBar/LeftBar');
const MainWindow = require('./components/MainWindow/MainWindow');

/**
 * -------------------------------------------------------------------
 * Main logic
 * -------------------------------------------------------------------
 */
class W2P {
    /**
     * @param {string|null} appId The ID for the app DivElement.
     * @type {HTMLElement}
     * @static
     */
    static APP_WRAP = null;

    /**
     * @param {object|null} templateLiteral The template literal for the app.
     * @type {object}
     * @static
     */
    static TEMPLATE_LITERAL = null;

    /**
     * @param {string} appId The app element id.
     * @returns {W2P} Instance of.
     */
    constructor(appId) {
        W2P.APP_WRAP = document.getElementById(appId);

        if (!W2P.APP_WRAP) {
            Logger.log('W2P: targetElement must be an HTMLElement', 'error');
            return;
        }

        this._initComponents();
    }

    render(template) {
        if (!this._validateTemplate(template)) {
            Logger.log('W2P: template must be an object literal', 'error');
            return;
        }

        W2P.TEMPLATE_LITERAL = template;
        W2PMainWindow.render(template)
            .then(() => {
                W2PLoading.hide();
            });
    }

    /**
     * Initialize app components.
     *
     * @returns {void}
     */
    _initComponents() {
        // initialize components.
        W2PLoading = new W2PLoading(W2P.APP_WRAP, 'Initializing...');
        W2PRightBar = new W2PRightBar('#w2p-rightbar');
        W2PLeftBar = new W2PLeftBar('#w2p-leftbar');
        W2PMainWindow = new W2PMainWindow('#w2p-main');

        // listen for events.
        // :: left bar properties.
        W2P.APP_WRAP.addEventListener(LeftBar.W2P_LEFTBAR_PROPS_EVENT, (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            if (e.detail.open) {
                W2PRightBar.show();
                return;
            }

            W2PRightBar.hide();
        });

        //:: selected text event.
        W2P.APP_WRAP.addEventListener(MainWindow.W2P_SELECTED_ELEMENT_EVENT, (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            const element = e.detail.element ?? null;
            const targetpage = e.detail.page ?? null;

            if (!element || !targetpage) {
                Logger.log('W2P: selected element event provided no detail context.', 'error');
                return;
            }

            // @todo: selected text must be wrapped by resize/rotate handles.

            console.log('--------- selected element event ---------');
            console.log(element);
            console.log(targetpage);
        });

        //:: scale event.
        W2P.APP_WRAP.addEventListener(MainWindow.W2P_SCALE_EVENT, (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            const scale = e.detail.scale ?? null;

            if (!scale) {
                Logger.log('W2P: scale event provided no detail context.', 'error');
                return;
            }


        });
    }

    /**
     * Validate if the given template is valid.
     *
     * @param {Object} template - The template to validate.
     * @returns {boolean} true if the template is valid, false otherwise.
     *
     * A valid template must be an object literal and contain the following properties:
     * - props: an object containing application props.
     * - measure: an object containing the measure of the application.
     * - sides: an object containing the sides of the application.
     */
    _validateTemplate(template) {
        if (!template || typeof template !== 'object') {
            return false;
        }

        if (!template.hasOwnProperty('props') || typeof template.props !== 'object') {
            return false;
        }

        if (!template.hasOwnProperty('measure') || typeof template.measure !== 'object') {
            return false;
        }

        if (!template.hasOwnProperty('sides') || typeof template.sides !== 'object') {
            return false;
        }

        return true;
    }
}

/**
 * -------------------------------------------------------------------
 * DOMContentLoaded
 * -------------------------------------------------------------------
 */
document.addEventListener('DOMContentLoaded', () => {
    window.w2p = new W2P('w2p');
});