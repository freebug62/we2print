const W2p = require('../bin/js/W2p');
const BgColor = require('./BgColor');
const LibraryLoader = require('./LibraryLoader');
const Ui = require('./Ui');


document.addEventListener('DOMContentLoaded', async () => {
    // this is just a sample template which should be passed down
    // to the W2p constructor as an object.
    const template = require('../sample/template');

    // set configuration.
    const config = {
        logo: 'dist/asset/ui/sample-logo.png',
        locale: {
            PAGINATION: {
                PREVIOUS: 'Previous page.',
                NEXT: 'Next page.',
                OF: 'of'
            },
            FIT_TO_SCREEN: 'Fit to screen.',
            CUT_SAFE_SWITCH: 'Switch to cut-safe mode.',
            TRANSFORM: {
                LAYER_UP: 'One layer up.',
                LAYER_DOWN: 'One layer down.',
                EDIT: 'Edit element.',
                DELETE: 'Delete element.',
                ROTATE: 'Rotate element.',
                RESIZE: 'Resize element.'
            }
        },
        ui: {
            pagination: {
                prev: 'dist/asset/ui/angle-left.svg',
                next: 'dist/asset/ui/angle-right.svg'
            },
            colorpicker: {
                palette: 'dist/asset/ui/palette.jpg'
            }
        }
    };

    // @todo: build loading screen.

    // load libraries.
    const backgroundLib = await LibraryLoader.load(`dist/asset/template/background/${template.size.measure}/${template.size.width}x${template.size.height}/list.json`);
    const imageLib = await LibraryLoader.load(`dist/asset/template/image/list.json`);
    const shapeLib = await LibraryLoader.load(`dist/asset/template/shape/list.json`);
    const fontLib = await LibraryLoader.load(`dist/asset/fonts/list.json`);

    // initialize W2p.
    const divWrap = document.getElementById('w2p');
    const w2p = new W2p(template, divWrap, config);

    // initialize Ui interaction with W2p.
    new Ui(document.getElementById('capp'), w2p, config, {
        background: backgroundLib,
        image: imageLib,
        shape: shapeLib,
        font: fontLib
    });

    // @todo: refactor BgColor into Ui.
    new BgColor(w2p, config.ui.colorpicker.palette);

    // show disclaimer.
    new SampleDisclaimer();
});

/**
 * Renders R&D Disclaimer along with usage policy.
 */
class SampleDisclaimer {
    /**
     * Holds the disclaimer elements.
     * @type {{wrap: HTMLElement, box: HTMLElement, title: HTMLElement, close: HTMLElement, text: HTMLElement}}
     */
    ELEMENTS = {};

    /**
     * @returns {SampleDisclaimer} Instance of.
     */
    constructor() {
        const agreed = window.localStorage.getItem('disclaimer');

        if (agreed) {
            return;
        }

        this.ELEMENTS = {
            wrap: document.createElement('div'),
            box: document.createElement('div'),
            title: document.createElement('h1'),
            close: document.createElement('button'),
            text: document.createElement('div')
        };

        this.ELEMENTS.wrap.appendChild(this.ELEMENTS.box);
        this.ELEMENTS.box.appendChild(this.ELEMENTS.title);
        this.ELEMENTS.box.appendChild(this.ELEMENTS.text);
        this.ELEMENTS.box.appendChild(this.ELEMENTS.close);

        this.ELEMENTS.wrap.classList.add('disclaimer');
        this.ELEMENTS.title.textContent = 'R&D Disclaimer';
        this.ELEMENTS.close.textContent = 'Agree and close';
        this.ELEMENTS.close.type = 'button';
        this.ELEMENTS.text.innerHTML =
            `
        <i>[Disclaimer]</i><br>
        - This project is a prototype used for research on SVG embed application.<br>
        - This project is not for public use. It still on development stage and may or may not be fully implemented.<br>
        - This project is not for commercial use.<br>
        - The source code for this project may NOT be used to train AI in any way, shape or form.<br><br>
        Contact me on <a href="https://taniguchi-blog.com" target="_blank">https://taniguchi-blog.com</a> if you have any questions.
        `;

        document.body.appendChild(this.ELEMENTS.wrap);

        const closeHandler = e => {
            e.preventDefault();
            e.stopImmediatePropagation();

            window.localStorage.setItem('disclaimer', '1');

            this.ELEMENTS.close.removeEventListener('click', closeHandler);
            this.ELEMENTS.wrap.remove();
            this.ELEMENTS = null;
        };

        this.ELEMENTS.close.addEventListener('click', closeHandler);
    }
}