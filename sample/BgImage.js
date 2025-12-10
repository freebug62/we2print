const W2pMeasureConverter = require("../bin/js/W2pMeasureConverter");


class BgImage {
    /**
     * Holds the UI elements.
     * @type {Object}
     */
    ELEMENTS = {};

    /**
     * The target element to append the UI elements to.
     * @type {HTMLElement}
     */
    TARGET = null;

    /**
     * Holds the background image list.
     * @type {Array}
     */
    IMAGE_LIST = [];

    /**
     * The template for the UI elements.
     * @type {Object}
     */
    TEMPLATE = null;

    /**
     * The W2p instance.
     * @type {W2p}
     */
    W2p = null;

    /**
     * The drag window instance.
     * @type {DragWindow}
     */
    DRAG_WINDOW = null;

    /**
     * @param {HTMLElement} target The target element to append the UI elements to.
     * @returns {BgImage} Instance of.
     */
    constructor(target, payload) {
        this.TARGET = target;
        this.W2p = payload.w2p;
        this.IMAGE_LIST = payload.lib ?? [];
        this.TEMPLATE = this.W2p._TEMPLATE;
        this.DRAG_WINDOW = payload.window;

        this._initElements();
    }

    /**
     * Initializes the UI elements.
     *
     * @private
     * @returns {void}
     */
    _initElements() {
        let title, text;

        this.ELEMENTS.wrap = document.createElement('div');
        this.TARGET.appendChild(this.ELEMENTS.wrap);

        // remove bg image.
        const bg = this.W2p.getBackgroundImage();

        this.ELEMENTS.removeWrap = document.createElement('section');
        this.ELEMENTS.removeWrap.classList.add('bg-image-section');
        this.ELEMENTS.wrap.appendChild(this.ELEMENTS.removeWrap);
        this.ELEMENTS.removeWrap.addEventListener('click', this._removeBgEventHandler.bind(this));

        if (typeof bg !== 'string') {
            this.ELEMENTS.removeWrap.style.display = 'none';
        }

        this.ELEMENTS.removeButton = document.createElement('button');
        this.ELEMENTS.removeButton.type = 'button';
        this.ELEMENTS.removeButton.classList.add('ui-button');
        this.ELEMENTS.removeButton.classList.add('ui-button-danger');
        this.ELEMENTS.removeButton.innerHTML = '&times; Remove Background Image';
        this.ELEMENTS.removeWrap.appendChild(this.ELEMENTS.removeButton);

        // upload bg image.
        this.ELEMENTS.uploadWrap = document.createElement('section');
        this.ELEMENTS.uploadWrap.classList.add('bg-image-section');
        this.ELEMENTS.wrap.appendChild(this.ELEMENTS.uploadWrap);

        title = document.createElement('h3');
        title.textContent = 'Upload your image';
        this.ELEMENTS.uploadWrap.appendChild(title);

        let w, h;

        if (this.TEMPLATE.size.measure === 'mm') {
            w = W2pMeasureConverter.convertMMToPixels(this.TEMPLATE.size.width, this.TEMPLATE.size.dpi);
            h = W2pMeasureConverter.convertMMToPixels(this.TEMPLATE.size.height, this.TEMPLATE.size.dpi);
        } else {
            w = W2pMeasureConverter.convertINToPixels(this.TEMPLATE.size.width, this.TEMPLATE.size.dpi);
            h = W2pMeasureConverter.convertINToPixels(this.TEMPLATE.size.height, this.TEMPLATE.size.dpi);
        }

        text = document.createElement('p');
        text.textContent = `For best results, upload a high resolution image with the size of ${Math.ceil(w)}x${Math.ceil(h)} pixels.`;
        this.ELEMENTS.uploadWrap.appendChild(text);

        this.ELEMENTS.upload = document.createElement('input');
        this.ELEMENTS.upload.type = 'file';
        this.ELEMENTS.upload.accept = 'image/jpg, image/jpeg, image/png';
        this.ELEMENTS.uploadWrap.appendChild(this.ELEMENTS.upload);
        this.ELEMENTS.upload.addEventListener('change', this._handleBackgroundUpload.bind(this));

        // pick bg image from library.
        if (!this.IMAGE_LIST || typeof this.IMAGE_LIST !== 'object') {
            this.IMAGE_LIST = [];
        }

        if (this.IMAGE_LIST < 1) {
            return;
        }

        this.ELEMENTS.libraryWrap = document.createElement('section');
        this.ELEMENTS.libraryWrap.classList.add('bg-image-section');
        this.ELEMENTS.wrap.appendChild(this.ELEMENTS.libraryWrap);

        title = document.createElement('h3');
        title.textContent = 'Pick from library';
        this.ELEMENTS.libraryWrap.appendChild(title);

        this.ELEMENTS.lib = document.createElement('div');
        this.ELEMENTS.lib.classList.add('bg-image-library');
        this.ELEMENTS.libraryWrap.appendChild(this.ELEMENTS.lib);

        let i, d;

        for (i = 0; i < this.IMAGE_LIST.length; i++) {
            d = document.createElement('div');
            d.classList.add('bg-image-item');
            d.style.backgroundImage = 'url(' + this.IMAGE_LIST[i].path + ')';
            d.setAttribute('title', this.IMAGE_LIST[i].description ?? 'Image ' + (i + 1));
            d.dataset.path = this.IMAGE_LIST[i].path;
            d.style.aspectRatio = this._calculateAspectRatio(this.IMAGE_LIST[i].width, this.IMAGE_LIST[i].height).css;
            this.ELEMENTS.lib.appendChild(d);

            d.addEventListener('click', this._handleSelectedBackground.bind(this));
        }
    }

    /**
     * Handles the event when the background image is selected from the user's local computer.
     *
     * @private
     * @param {Event} e - The event that triggered the function call.
     * @returns {void}
     */
    _handleBackgroundUpload(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.currentTarget.removeEventListener('change', this._handleBackgroundUpload);

        if (!e.currentTarget.files || e.currentTarget.files.length !== 1) return;

        const file = e.target.files[0];

        // validate type.
        if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png' || file.size < 1) {
            alert('Invalid file type!');
            return;
        }

        const maxFileSize = 2 * 1024 * 1024; // 2MB

        if (file.size > maxFileSize) {
            alert('File size exceeds the maximum allowed size of 2MB.');
            return;
        }

        const closeAll = () => {
            this.DRAG_WINDOW.destroy();
        };

        this._fileToBase64Image(file)
            .then(img => {
                closeAll();
                this.W2p.setBackgroundImage(img);
            })
            .catch(err => {
                closeAll();
                console.error(err);
            });
    }

    /**
     * Converts a given file to a base64 encoded string representation of the image.
     *
     * @private
     * @param {File} file - The image file to convert.
     * @returns {Promise<string>} - A promise that resolves with the base64 encoded string representation of the image.
     * @throws {Error} - If the file is not an image or if an error occurs while reading the file.
     */
    _fileToBase64Image(file) {
        return new Promise((resolve, reject) => {
            // Optional: validate it's actually an image
            if (!file.type.startsWith('image/')) {
                reject(new Error('File is not an image'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const base64String = e.target.result; // e.g. "data:image/png;base64,iVBORw0KGgo..."
                resolve(base64String);
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.onabort = () => {
                reject(new Error('File reading was aborted'));
            };

            // Read the file as Data URL (which includes base64 encoding)
            reader.readAsDataURL(file);
        });
    }

    /**
     * Handles the event when a background image is selected from the library.
     *
     * @private
     * @param {MouseEvent} e
     * @returns {void}
     */
    _handleSelectedBackground(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        e.currentTarget.removeEventListener('click', this._handleSelectedBackground);

        this.W2p.setBackgroundImage(e.target.dataset.path);
        this.DRAG_WINDOW.destroy();
    }

    /**
     * Removes the background image and destroys the drag window.
     *
     * @private
     * @param {MouseEvent} e The click event.
     * @returns {void}
     */
    _removeBgEventHandler(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        this.ELEMENTS.removeWrap.removeEventListener('click', this._removeBgEventHandler);
        this.DRAG_WINDOW.destroy();
        this.W2p.removeBackgroundImage();
    }

    /**
     * Calculate the aspect ratio of an image.
     * Handles invalid inputs by returning null.
     * If both width and height are valid, returns an object with the following properties:
     * - width: The width of the image divided by the greatest common divisor of width and height.
     * - height: The height of the image divided by the greatest common divisor of width and height.
     * - ratio: A string representing the aspect ratio of the image.
     * - toString: A function that returns the string representation of the aspect ratio.
     * - decimal: A property representing the aspect ratio as a decimal.
     * - css: A property representing the aspect ratio as a CSS string.
     * @param {number} width The width of the image.
     * @param {number} height The height of the image.
     * @returns {Object} An object representing the aspect ratio of the image.
     */
    _calculateAspectRatio(width, height) {
        // Handle invalid inputs
        if (!width || !height || width <= 0 || height <= 0) {
            return null; // or throw an error
        }

        // Convert to integers to avoid floating-point issues
        width = Math.floor(width);
        height = Math.floor(height);

        // Euclidean algorithm to find Greatest Common Divisor (GCD)
        function gcd(a, b) {
            return b === 0 ? a : gcd(b, a % b);
        }

        const divisor = gcd(width, height);

        const ratioWidth = width / divisor;
        const ratioHeight = height / divisor;

        return {
            width: ratioWidth,
            height: ratioHeight,
            ratio: `${ratioWidth}:${ratioHeight}`,
            toString: () => `${ratioWidth}:${ratioHeight}`,
            decimal: ratioWidth / ratioHeight,
            css: `${ratioWidth}/${ratioHeight}`
        };
    }
}

module.exports = BgImage;
