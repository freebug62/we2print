const Logger = require('../../helpers/Logger');
const Measure = require('../../helpers/Measure');

class MainWindow {
    /**
     * @param {HTMLElement|null} WRAP The main window wrapper element.
     * @static
     * @type {HTMLElement|null}
     */
    static WRAP = null;

    /**
     * @param {object|null} TEMPLATE The template to render.
     * @static
     * @type {object|null}
     */
    static TEMPLATE = null;

    /**
     * @param {array|null} PAGES Tracks the document pages.
     * @static
     * @type {array|null}
     */
    static PAGES = [];

    /**
     * @param {number} PAGE_ACTIVE The index of the active page on MainWindow.PAGES array.
     * @static
     * @type {number}
     */
    static PAGE_ACTIVE = 0;

    /**
     * @param {number} PAGE_SCALE The scale of the page.
     * @static
     * @type {number}
     */
    static PAGE_SCALE = 1;

    /**
     * @param {string} W2P_SELECTED_ELEMENT_EVENT The event name for selected element.
     * @static
     * @type {string}
     */
    static W2P_SELECTED_ELEMENT_EVENT = 'w2p:selected-element';

    /**
     * @param {string} W2P_SCALE_EVENT The event name for scale event.
     * @static
     * @type {string}
     */
    static W2P_SCALE_EVENT = 'w2p:scale';

    /**
     * @param {HTMLElement|null} SELECTED_ELEMENT The selected HTMLElement object.
     * @static
     * @type {HTMLElement|null}
     */
    static SELECTED_ELEMENT = null;

    /**
     * @param {string} elId The ID for the main window wrapper element.
     * @returns {MainWindow} Instance of.
     */
    constructor(elId) {
        MainWindow.WRAP = document.querySelector(elId);

        if (!MainWindow.WRAP) {
            Logger.log('MainWindow: targetElement must be an HTMLElement', 'error');
            return;
        }
    }

    /**
     * Renders the given template and returns a promise.
     * The promise is resolved after all pages are rendered and the pages scale is updated.
     * The promise is rejected if the given template is invalid.
     *
     * @param {object} template - The template to render.
     * @returns {Promise<void>} A promise that is resolved after all pages are rendered and the pages scale is updated.
     */
    render(template) {
        return new Promise((resolve, reject) => {
            this._resolveMeasure(template);

            let i;

            for (i = 0; i < template.sides.length; i++) {
                this._renderPages(template.sides[i], template.measure);
            }

            // display first page.
            MainWindow.PAGES[MainWindow.PAGE_ACTIVE].page.classList.add('active');

            // add page elements.
            for (i = 0; i < MainWindow.PAGES.length; i++) {
                this._addPageElements(MainWindow.PAGES[i]);
            }

            // update pages scale.
            this._updatePagesScale();

            // set the dynamic document mask to the width and height of the main window wrapper element.
            MainWindow.WRAP.style.setProperty('--w2p-dynamic-document-mask-width', `${Math.round(MainWindow.TEMPLATE.measure.pxWidth)}px`);
            MainWindow.WRAP.style.setProperty('--w2p-dynamic-document-mask-height', `${Math.round(MainWindow.TEMPLATE.measure.pxHeight)}px`);
            MainWindow.WRAP.style.setProperty('--w2p-dynamic-document-scale', `${(MainWindow.PAGE_SCALE).toFixed(4)}`);

            // update UI page count.
            document.querySelector('#w2p-main-doc-page').textContent = `Displaying page ${(MainWindow.PAGE_ACTIVE + 1)} of ${MainWindow.PAGES.length} pages.`;

            // initialize document pagination.
            this._initPagination();

            // wait for frame refresh (min. 1ms)
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }

    /**
     * Creates a new text element and appends it to the given page.
     *
     * @param {HTMLDivElement} page The target page in which text should be add.
     * @param {object} textObj The text object.
     * @property {number} textObj.x The x position of the text.
     * @property {number} textObj.y The y position of the text.
     * @property {string} textObj.text The text content.
     * @property {number} textObj.size The text size.
     * @property {string} textObj.color The text color.
     * @property {string} textObj.align The text alignment.
     * @property {number} textObj.rotate The text rotation.
     * @property {string} textObj.font The text font.
     * @property {boolean} textObj.bold The text bold status.
     * @property {boolean} textObj.italic The text italic status.
     * @property {boolean} textObj.underline The text underline status.
     * @property {boolean} textObj.locked The text locked status.
     * @returns {void}
     */
    newText(page, textObj) {
        const text = document.createElement('div');
        const measure = MainWindow.PAGES[MainWindow.PAGE_ACTIVE].measure;

        text.classList.add('w2p-text');

        if (measure.type === 'mm') {
            text.style.left = `${Measure.convertMMToPixels(textObj.x, measure.dpi)}px`;
            text.style.top = `${Measure.convertMMToPixels(textObj.y, measure.dpi)}px`;
        } else {
            text.style.left = `${Measure.convertINToPixels(textObj.x, measure.dpi)}px`;
            text.style.top = `${Measure.convertINToPixels(textObj.y, measure.dpi)}px`;
        }

        text.style.fontSize = `${Measure.ptToPx(textObj.size)}px`;
        text.style.color = `${textObj.color}`;
        text.style.textAlign = `${textObj.align}`;
        text.style.transform = `rotate(${textObj.rotate}deg)`;
        text.style.fontFamily = `${textObj.font}`;
        text.style.fontWeight = `${textObj.bold ? 'bold' : 'normal'}`;
        text.style.fontStyle = `${textObj.italic ? 'italic' : 'normal'}`;
        text.style.textDecoration = `${textObj.underline ? 'underline' : 'none'}`;
        text.innerText = textObj.text;
        page.appendChild(text);

        if (textObj.locked) {
            MainWindow.SELECTED_ELEMENT = event.currentTarget;
            return text;
        }

        text.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (MainWindow.SELECTED_ELEMENT === event.currentTarget) {
                return;
            }

            this._moveWrapper(event.currentTarget);

            const customEvent = new CustomEvent(MainWindow.W2P_SELECTED_ELEMENT_EVENT, {
                bubbles: true,
                detail: {
                    element: event.currentTarget,
                    page: page
                }
            });

            MainWindow.SELECTED_ELEMENT = event.currentTarget;
            event.currentTarget.dispatchEvent(customEvent);
        });

        return text;
    }

    /**
     * Creates a new image element and appends it to the given page.
     * Supports PNG and JPEG image formats.
     *
     * @param {HTMLElement} page - The page element to append the image element to.
     * @param {Object} imageObj - The image object containing the image properties.
     * @property {string} imageObj.src - The source URL of the image.
     * @property {number} imageObj.x - The x position of the image element in the page coordinate system.
     * @property {number} imageObj.y - The y position of the image element in the page coordinate system.
     * @property {number} imageObj.width - The width of the image element in the page coordinate system.
     * @property {number} imageObj.height - The height of the image element in the page coordinate system.
     * @property {number} imageObj.rotate - The rotation of the image element in degrees.
     * @property {boolean} imageObj.locked - Whether the image element is locked or not.
     * @returns {void}
     */
    newImage(page, imageObj) {
        const image = document.createElement('img');
        const measure = MainWindow.PAGES[MainWindow.PAGE_ACTIVE].measure;

        image.classList.add('w2p-image');

        if (measure.type === 'mm') {
            image.style.left = `${Measure.convertMMToPixels(imageObj.x, measure.dpi)}px`;
            image.style.top = `${Measure.convertMMToPixels(imageObj.y, measure.dpi)}px`;
            image.style.width = `${Measure.convertMMToPixels(imageObj.width, measure.dpi)}px`;
            image.style.height = `${Measure.convertMMToPixels(imageObj.height, measure.dpi)}px`;
        } else {
            image.style.left = `${Measure.convertINToPixels(imageObj.x, measure.dpi)}px`;
            image.style.top = `${Measure.convertINToPixels(imageObj.y, measure.dpi)}px`;
            image.style.width = `${Measure.convertINToPixels(imageObj.width, measure.dpi)}px`;
            image.style.height = `${Measure.convertINToPixels(imageObj.height, measure.dpi)}px`;
        }

        image.src = imageObj.src;
        image.style.transform = `rotate(${imageObj.rotate}deg)`;
        image.draggable = false;
        page.appendChild(image);

        if (imageObj.locked) {
            MainWindow.SELECTED_ELEMENT = event.currentTarget;
            return image;
        }

        image.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (MainWindow.SELECTED_ELEMENT === event.currentTarget) {
                return;
            }

            this._moveWrapper(event.currentTarget);

            const customEvent = new CustomEvent(MainWindow.W2P_SELECTED_ELEMENT_EVENT, {
                bubbles: true,
                detail: {
                    element: event.currentTarget,
                    page: page
                }
            });

            MainWindow.SELECTED_ELEMENT = event.currentTarget;
            event.currentTarget.dispatchEvent(customEvent);
        });

        return image;
    }

    /**
     * Creates a new shape element and appends it to the given page.
     * Supports SVG only.
     *
     * @param {HTMLElement} page - The page element to append the shape element to.
     * @param {Object} shapeObj - The shape object containing the shape properties.
     * @property {string} shapeObj.src - The source URL of the shape SVG.
     * @property {number} shapeObj.x - The x position of the shape element in the page coordinate system.
     * @property {number} shapeObj.y - The y position of the shape element in the page coordinate system.
     * @property {number} shapeObj.width - The width of the shape element in the page coordinate system.
     * @property {number} shapeObj.height - The height of the shape element in the page coordinate system.
     * @property {string} shapeObj.color - The fill color of the shape element.
     * @property {number} shapeObj.rotate - The rotation of the shape element in degrees.
     * @property {boolean} shapeObj.locked - Whether the shape element is locked or not.
     * @returns {void}
     */
    newShape(page, shapeObj) {
        const measure = MainWindow.PAGES[MainWindow.PAGE_ACTIVE].measure;

        fetch(shapeObj.src)
            .then(response => response.text())
            .then(svg => {
                svg = svg.replaceAll(
                    /fill\s*=\s*(['"])(#[0-9a-f]{3,6}|rgb\([^)]*\)|rgba\([^)]*\)|[a-zA-Z]+)\1/gi,
                    `fill="${shapeObj.color}"`
                );

                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
                const svgEl = svgDoc.documentElement;

                svgEl.classList.add('w2p-shape');

                if (measure.type === 'mm') {
                    svgEl.setAttribute('width', Measure.convertMMToPixels(shapeObj.width, measure.dpi));
                    svgEl.setAttribute('height', Measure.convertMMToPixels(shapeObj.height, measure.dpi));
                    svgEl.style.left = Measure.convertMMToPixels(Measure.convertMMToPixels(shapeObj.x, measure.dpi));
                    svgEl.style.top = Measure.convertMMToPixels(Measure.convertMMToPixels(shapeObj.y, measure.dpi));
                } else {
                    svgEl.setAttribute('width', Measure.convertINToPixels(shapeObj.width, measure.dpi));
                    svgEl.setAttribute('height', Measure.convertINToPixels(shapeObj.height, measure.dpi));
                    svgEl.style.left = Measure.convertINToPixels(Measure.convertINToPixels(shapeObj.x, measure.dpi));
                    svgEl.style.top = Measure.convertINToPixels(Measure.convertINToPixels(shapeObj.y, measure.dpi));
                }

                svgEl.style.transform = `rotate(${shapeObj.rotate}deg)`;
                page.appendChild(svgEl);

                if (shapeObj.locked) {
                    MainWindow.SELECTED_ELEMENT = svgEl;
                    return svgEl;
                }

                svgEl.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    if (MainWindow.SELECTED_ELEMENT === event.currentTarget) {
                        return;
                    }

                    this._moveWrapper(event.currentTarget);

                    const customEvent = new CustomEvent(MainWindow.W2P_SELECTED_ELEMENT_EVENT, {
                        bubbles: true,
                        detail: {
                            element: event.currentTarget,
                            page: page
                        }
                    });

                    MainWindow.SELECTED_ELEMENT = event.currentTarget;
                    event.currentTarget.dispatchEvent(customEvent);
                });

                return svgEl;
            })
            .catch(error => {
                Logger.log('MainWindow: unable to load shape source. Error: ' + error, 'error');
            });
    }

    /**
     * Updates the main window scale UI with the given scale.
     * The scale is displayed as a percentage value.
     *
     * @param {number} scale - The scale value to update the element with.
     * @returns {void}
     */
    _scaleUi(scale) {
        document.getElementById('w2p-main-scale').innerText = `Zoom: ${(scale * 100).toFixed(0)}%`;
    }

    /**
     * Adds page elements like bleed lines, cut lines, text, images and shapes.
     *
     * @param {object} page - Page object.
     * @returns {void}
     */
    _addPageElements(page) {
        // add bleed lines.
        const bleed = document.createElement('div');

        bleed.classList.add('w2p-bleed');
        bleed.style.width = `calc(100% - ${(page.measure.pxBleed * 2)}px)`;
        bleed.style.height = `calc(100% - ${(page.measure.pxBleed * 2)}px)`;
        bleed.style.top = `${page.measure.pxBleed}px`;
        bleed.style.left = `${page.measure.pxBleed}px`;
        page.page.appendChild(bleed);
        page.ui = {
            bleed: bleed
        };

        // add cutlines.
        const cutlines = document.createElement('div');

        cutlines.classList.add('w2p-cutlines');
        cutlines.style.width = `calc(100% - ${(page.measure.pxCut * 2)}px)`;
        cutlines.style.height = `calc(100% - ${(page.measure.pxCut * 2)}px)`;
        cutlines.style.top = `${page.measure.pxCut}px`;
        cutlines.style.left = `${page.measure.pxCut}px`;
        page.page.appendChild(cutlines);
        page.ui.cutlines = cutlines;

        // add text.
        let i;

        page.ui.text = [];
        page.ui.image = [];
        page.ui.shape = [];

        for (i = 0; i < page.elements.text.length; i++) {
            page.ui.text.push(this.newText(page.page, page.elements.text[i]));
        }

        // add images.
        for (i = 0; i < page.elements.images.length; i++) {
            page.ui.image.push(this.newImage(page.page, page.elements.images[i]));
        }

        // add shapes.
        for (i = 0; i < page.elements.shapes.length; i++) {
            page.ui.shape.push(this.newShape(page.page, page.elements.shapes[i]));
        }
    }

    /**
     * Renders a single page based on the given side and measure.
     * Creates a page wrapper element with the given width and height, and appends it to the main window wrapper element.
     * Creates the background image layer element and appends it to the page.
     * If the side has a background image, it creates an img element and appends it to the image layer element.
     * Adds an event listener to the window resize event to update the page scale.
     *
     * @private
     * @param {Object} side The side object containing background color and image.
     * @param {Object} measure The measure object containing width and height in pixels.
     * @returns {void}
     */
    _renderPages(side, measure) {
        const width = Math.round(measure.pxWidth);
        const height = Math.round(measure.pxHeight);
        const wrapper = document.createElement('div');
        const imageLayer = document.createElement('div');

        wrapper.classList.add('w2p-main-page');
        wrapper.style.width = `${width}px`;
        wrapper.style.height = `${height}px`;
        wrapper.style.backgroundColor = side.background.color;

        imageLayer.classList.add('w2p-main-page-bglayer');
        imageLayer.style.width = `100%`;
        imageLayer.style.height = `100%`;
        imageLayer.style.overflow = 'hidden';
        wrapper.appendChild(imageLayer);

        if (side.background.image) {
            const image = document.createElement('img');

            image.draggable = false;
            image.src = side.background.image;
            image.style.width = '100%';
            image.style.height = '100%';
            imageLayer.appendChild(image);
        }

        side.background.wrap = imageLayer;

        MainWindow.WRAP.appendChild(wrapper);
        MainWindow.PAGES.push({
            elements: side,
            measure: measure,
            page: wrapper
        });

        wrapper.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('w2p-main-page')) {
                return;
            }

            this._deselectAllElements(e.currentTarget);
        });

        // update page size on window resize.
        window.addEventListener('resize', () => {
            this._updatePagesScale();
        });
    }

    _deselectAllElements(page) {
        page.querySelectorAll('.w2p-element-wrap').forEach((element) => {
            // get child element.
            const el = element.children[0];

            // update child element with wrapper matrix and style.
            el.style.transform = element.style.transform;
            el.style.top = (element.style.top.replace('px', '') + 2) + 'px';
            el.style.left = element.style.left;
            el.style.width = element.style.width;
            el.style.height = element.style.height;

            console.log(el.tagName)

            // remove from move wrapper and re-insert on same position.
            page.insertBefore(el, element);
            element.remove();
        });
    }

    /**
     * Updates the scale of all pages in MainWindow.PAGES array.
     * The scale of each page is calculated based on the width and height of the page and the width and height of the main window wrapper element.
     * The scale is then applied to the page wrapper element using CSS transform property.
     *
     * @private
     * @returns {void}
     */
    _updatePagesScale() {

        for (let i = 0; i < MainWindow.PAGES.length; i++) {
            const wrapper = MainWindow.PAGES[i].page;
            const measure = MainWindow.PAGES[i].measure;
            const scale = Measure.calculateScale(measure.pxWidth, measure.pxHeight, MainWindow.WRAP.offsetWidth, MainWindow.WRAP.offsetHeight);

            wrapper.style.top = '50%';
            wrapper.style.left = '50%';
            wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;

            MainWindow.PAGE_SCALE = scale;
        }


        MainWindow.WRAP.style.setProperty('--w2p-dynamic-document-mask-width', `${Math.round(MainWindow.TEMPLATE.measure.pxWidth)}px`);
        MainWindow.WRAP.style.setProperty('--w2p-dynamic-document-mask-height', `${Math.round(MainWindow.TEMPLATE.measure.pxHeight)}px`);
        MainWindow.WRAP.style.setProperty('--w2p-dynamic-document-scale', `${(MainWindow.PAGE_SCALE).toFixed(4)}`);

        // send scale change event.
        const customEvent = new CustomEvent(MainWindow.W2P_SCALE_EVENT, {
            bubbles: true,
            detail: {
                scale: MainWindow.PAGE_SCALE
            }
        });

        MainWindow.WRAP.dispatchEvent(customEvent);
        this._scaleUi(MainWindow.PAGE_SCALE);
    }

    /**
     * Resolves the measure of the given template by converting the width, height, bleed and cut from mm or in to pixels.
     * The dpi of the measure is used to perform the conversion.
     * The resolved measure is stored in MainWindow.TEMPLATE.
     *
     * @param {object} template - The template to resolve the measure of.
     * @private
     * @returns {void}
     */
    _resolveMeasure(template) {
        if (template.measure.type === 'mm') {
            template.measure.pxWidth = Measure.convertMMToPixels(template.measure.width, template.measure.dpi);
            template.measure.pxHeight = Measure.convertMMToPixels(template.measure.height, template.measure.dpi);
            template.measure.pxBleed = Measure.convertMMToPixels(template.measure.bleed, template.measure.dpi);
            template.measure.pxCut = Measure.convertMMToPixels(template.measure.cut, template.measure.dpi);
        } else {
            template.measure.pxWidth = Measure.convertINToPixels(template.measure.width, template.measure.dpi);
            template.measure.pxHeight = Measure.convertINToPixels(template.measure.height, template.measure.dpi);
            template.measure.pxBleed = Measure.convertINToPixels(template.measure.bleed, template.measure.dpi);
            template.measure.pxCut = Measure.convertINToPixels(template.measure.cut, template.measure.dpi);
        }

        MainWindow.TEMPLATE = template;
    }

    /**
     * Initializes the pagination of the main window document pages.
     *
     * @private
     * @returns {void}
     */
    _initPagination() {
        const prevbtn = document.getElementById('w2p-main-doc-prev-btn');
        const nextbtn = document.getElementById('w2p-main-doc-next-btn');
        const label = document.getElementById('w2p-main-doc-page');
        const paginateTo = index => {
            let i;

            for (i = 0; i < MainWindow.PAGES.length; i++) {
                if (i === index) {
                    MainWindow.PAGES[i].page.classList.add('active');
                    label.textContent = `Displaying page ${(index + 1)} of ${MainWindow.PAGES.length} pages.`;
                } else {
                    MainWindow.PAGES[i].page.classList.remove('active');
                }
            }
        };

        if (MainWindow.PAGES.length < 2) {
            prevbtn.classList.add('disabled');
            prevbtn.style.display = 'none';
            nextbtn.classList.add('disabled');
            nextbtn.style.display = 'none';

            return;
        }

        let currentPageIndex = MainWindow.PAGE_ACTIVE;

        prevbtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopImmediatePropagation();

            currentPageIndex--;

            if (currentPageIndex < 0) {
                currentPageIndex = 0;
            }

            if (currentPageIndex === MainWindow.PAGE_ACTIVE) {
                return;
            }

            if (currentPageIndex === 0) {
                prevbtn.classList.add('disabled');
            }

            nextbtn.classList.remove('disabled');
            MainWindow.PAGE_ACTIVE = currentPageIndex;
            paginateTo(currentPageIndex);
        });

        nextbtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopImmediatePropagation();

            currentPageIndex++;

            if (currentPageIndex > MainWindow.PAGES.length - 1) {
                currentPageIndex = MainWindow.PAGES.length - 1;
            }

            if (currentPageIndex === MainWindow.PAGE_ACTIVE) {
                return;
            }

            if ((currentPageIndex + 1) >= MainWindow.PAGES.length) {
                nextbtn.classList.add('disabled');
            }

            prevbtn.classList.remove('disabled');
            MainWindow.PAGE_ACTIVE = currentPageIndex;
            paginateTo(currentPageIndex);
        });
    }

    _moveWrapper(element) {
        const wrap = document.createElement('div');
        const page = element.parentElement;
        const padding = 2;

        wrap.classList.add('w2p-element-wrap');

        if (element.tagName === 'svg') {
            wrap.style.top = `${parseFloat(getComputedStyle(element).top) - padding}px`;
            wrap.style.left = `${parseFloat(getComputedStyle(element).left) - padding}px`;
            wrap.style.width = `${element.width.baseVal.value}px`;
            wrap.style.height = `${element.height.baseVal.value}px`;
        } else {
            wrap.style.top = `${element.offsetTop - padding}px`;
            wrap.style.left = `${element.offsetLeft - padding}px`;
            wrap.style.width = `${element.offsetWidth}px`;
            wrap.style.height = `${element.offsetHeight}px`;
        }

        wrap.style.position = 'absolute';
        wrap.style.transform = element.style.transform;
        wrap.style.cursor = 'grab';

        page.insertBefore(wrap, element);
        wrap.appendChild(element);

        const scale = MainWindow.PAGE_SCALE || 1;
        let startLocalX = 0, startLocalY = 0;
        let origLeft = 0, origTop = 0;
        let isDown = false;
        let invMatrix = null;
        let rect = null;

        function getInverseMatrix(el) {
            const t = getComputedStyle(el).transform;
            if (!t || t === 'none') return new DOMMatrix();
            return new DOMMatrix(t).inverse();
        }

        function clientToLocal(clientX, clientY) {
            const px = clientX - rect.left;
            const py = clientY - rect.top;
            const local = invMatrix.transformPoint(new DOMPoint(px, py));
            return { x: local.x, y: local.y };
        }

        wrap.addEventListener('mousedown', e => {
            isDown = true;
            wrap.style.cursor = 'grabbing';

            // Lock matrix + rect at drag start
            rect = wrap.getBoundingClientRect();
            invMatrix = getInverseMatrix(wrap);

            const local = clientToLocal(e.clientX, e.clientY);
            startLocalX = local.x;
            startLocalY = local.y;

            origLeft = parseFloat(wrap.style.left || 0);
            origTop = parseFloat(wrap.style.top || 0);

            e.preventDefault();
        });

        document.addEventListener('mouseup', () => {
            if (!isDown) return;
            isDown = false;
            wrap.style.cursor = 'grab';

            // --- Snap to nearest corner if completely off the page ---
            const pageW = page.clientWidth;
            const pageH = page.clientHeight;
            const w = wrap.offsetWidth;
            const h = wrap.offsetHeight;
            const left = parseFloat(wrap.style.left);
            const top = parseFloat(wrap.style.top);

            const completelyOffRight = left > pageW;
            const completelyOffLeft = left + w < 0;
            const completelyOffBottom = top > pageH;
            const completelyOffTop = top + h < 0;

            const fullyOut =
                (completelyOffRight || completelyOffLeft || completelyOffBottom || completelyOffTop);

            if (fullyOut) {
                // compute distances to each corner
                const corners = [
                    { name: 'tl', x: 0, y: 0 },
                    { name: 'tr', x: pageW - w, y: 0 },
                    { name: 'bl', x: 0, y: pageH - h },
                    { name: 'br', x: pageW - w, y: pageH - h },
                ];

                const centerX = left + w / 2;
                const centerY = top + h / 2;

                let nearest = corners[0];
                let minDist = Infinity;
                for (const c of corners) {
                    const dx = centerX - (c.x + w / 2);
                    const dy = centerY - (c.y + h / 2);
                    const d = dx * dx + dy * dy;
                    if (d < minDist) {
                        minDist = d;
                        nearest = c;
                    }
                }

                // Smooth snap animation
                wrap.style.transition = 'left 0.2s ease-out, top 0.2s ease-out';
                wrap.style.left = `${nearest.x}px`;
                wrap.style.top = `${nearest.y}px`;

                // Remove transition after animation
                setTimeout(() => {
                    wrap.style.transition = '';
                }, 250);
            }
        });

        document.addEventListener('mousemove', e => {
            if (!isDown) return;

            const local = clientToLocal(e.clientX, e.clientY);
            const dx = (local.x - startLocalX) / scale;
            const dy = (local.y - startLocalY) / scale;

            wrap.style.left = `${origLeft + dx}px`;
            wrap.style.top = `${origTop + dy}px`;
        });
    }
}

module.exports = MainWindow;