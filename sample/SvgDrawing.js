class SVGDrawing {
    constructor(svgElement, strokeColor = '#000000', strokeWidth = 3) {
        this.svg = svgElement;

        this._isDrawing = false;
        this._currentPath = null;
        this._points = [];

        this._strokeColor = strokeColor;
        this._strokeWidth = strokeWidth;

        // Bound event handlers (so we can remove them later)
        this._onMouseDown = this._handleMouseDown.bind(this);
        this._onMouseMove = this._handleMouseMove.bind(this);
        this._onMouseUp = this._handleMouseUp.bind(this);
        this._onMouseLeave = this._handleMouseLeave.bind(this);

        this._onTouchStart = this._handleTouchStart.bind(this);
        this._onTouchMove = this._handleTouchMove.bind(this);
        this._onTouchEnd = this._handleTouchEnd.bind(this);

        this._setupSVG();
        this._attachEvents();
    }

    /**
     * Sets the stroke width of the drawing tool.
     *
     * @public
     * @param {number} width - The new stroke width.
     */
    setStrokeWidth(width) {
        this._strokeWidth = width;
    }

    /**
     * Sets the stroke color of the drawing tool.
     *
     * @public
     * @param {string} color - The new stroke color.
     */
    setStrokeColor(color) {
        this._strokeColor = color;
    }

    /**
     * Sets the stroke color and width of the drawing tool.
     *
     * @public
     * @param {string} [color='#000000'] - The new stroke color.
     * @param {number} [width=3] - The new stroke width.
     */
    setStroke(color = '#000000', width = 3) {
        this._strokeColor = color;
        this._strokeWidth = width;
    }

    /**
     * Removes all paths from the SVG element.
     * This method is useful for clearing the canvas before drawing.
     *
     * @public
     */
    clear() {
        const paths = this.svg.querySelectorAll('path');
        paths.forEach(p => p.remove());
    }

    /**
     * Destroys the SVG drawing tool.
     *
     * @public
     * @param {Object} [options] - Options for destroying the drawing tool.
     * @param {boolean} [options.clearCanvas=true] - If true, clears the canvas before destroying the drawing tool.
     */
    destroy({ clearCanvas = true } = {}) {
        this._stopDrawing();
        this._detachEvents();

        if (clearCanvas) {
            this.clear();
        }

        // Clean up styles
        this.svg.style.touchAction = '';
        this.svg.style.cursor = '';
        this.svg.style.userSelect = '';
        this.svg.style.backgroundColor = '';

        // Null everything
        this.svg = null;
        this._currentPath = null;
        this._points = null;
    }


    /**
     * Sets up the SVG element for drawing.
     * This function sets the necessary CSS styles for the SVG element
     * to enable drawing.
     *
     * @private
     */
    _setupSVG() {
        this.svg.style.touchAction = 'none';
        this.svg.style.userSelect = 'none';
    }

    /**
     * Attaches event listeners to the SVG element to capture mouse and touch events.
     * The event listeners are bound to the following methods:
     * - _onMouseDown
     * - _onMouseMove
     * - _onMouseUp
     * - _onMouseLeave
     * - _onTouchStart
     * - _onTouchMove
     * - _onTouchEnd
     *
     * @private
     */
    _attachEvents() {
        this.svg.addEventListener('mousedown', this._onMouseDown);
        this.svg.addEventListener('mousemove', this._onMouseMove);
        this.svg.addEventListener('mouseup', this._onMouseUp);
        this.svg.addEventListener('mouseleave', this._onMouseLeave);

        this.svg.addEventListener('touchstart', this._onTouchStart, { passive: false });
        this.svg.addEventListener('touchmove', this._onTouchMove, { passive: false });
        this.svg.addEventListener('touchend', this._onTouchEnd, { passive: false });
    }

    /**
     * Removes the event listeners that were attached to the SVG element by _attachEvents.
     * This function is necessary to prevent memory leaks when the SVG element is removed from the DOM.
     *
     * @private
     */
    _detachEvents() {
        this.svg.removeEventListener('mousedown', this._onMouseDown);
        this.svg.removeEventListener('mousemove', this._onMouseMove);
        this.svg.removeEventListener('mouseup', this._onMouseUp);
        this.svg.removeEventListener('mouseleave', this._onMouseLeave);

        this.svg.removeEventListener('touchstart', this._onTouchStart);
        this.svg.removeEventListener('touchmove', this._onTouchMove);
        this.svg.removeEventListener('touchend', this._onTouchEnd);
    }

    /**
     * Returns the position of the pointer relative to the SVG element.
     * The position is returned as an object with 'x' and 'y' properties.
     * If the event is a touch event, the position is calculated from the first touch point.
     * If the event is a mouse event, the position is calculated from the mouse pointer position.
     *
     * @param {Event} e - The event that triggered this function.
     * @returns {Object} - The position of the pointer relative to the SVG element.
     * @private
     */
    _getPointerPos(e) {
        const rect = this.svg.getBoundingClientRect();
        const clientX = e.clientX ?? e.touches[0].clientX;
        const clientY = e.clientY ?? e.touches[0].clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    /**
     * Creates a new <path> element within the SVG element and returns it.
     * The <path> element is configured with the following attributes:
     * - fill: 'none'
     * - stroke: the value of _strokeColor
     * - stroke-width: the value of _strokeWidth
     * - stroke-linecap: 'round'
     * - stroke-linejoin: 'round'
     *
     * @returns {Element} - The newly created <path> element.
     * @private
     */
    _createPath() {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', this._strokeColor);
        path.setAttribute('stroke-width', this._strokeWidth);
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        this.svg.appendChild(path);
        return path;
    }

    /**
     * Updates the 'd' attribute of the current <path> element to reflect the current
     * points in the _points array. If the array contains less than one point, the function
     * does nothing.
     *
     * The path is constructed as follows:
     * - If the array contains only two points, a simple line is drawn between the two points.
     * - If the array contains three or more points, a smooth curve is drawn using quadratic Bézier
     *   curves.
     *
     * @private
     */
    _updatePath() {
        if (!this._currentPath || this._points.length < 1) return;

        let d = `M ${this._points[0].x} ${this._points[0].y}`;

        if (this._points.length < 3) {
            // First two points → simple line
            const p = this._points[this._points.length - 1];
            d += ` L ${p.x} ${p.y}`;
        } else {
            // Smooth curve using quadratic Béziers
            for (let i = 1; i < this._points.length - 2; i++) {
                const cpX = (this._points[i].x + this._points[i + 1].x) / 2;
                const cpY = (this._points[i].y + this._points[i + 1].y) / 2;
                d += ` Q ${this._points[i].x} ${this._points[i].y}, ${cpX} ${cpY}`;
            }
            // Final segment
            const last = this._points.length - 1;
            const cpX = (this._points[last - 1].x + this._points[last].x) / 2;
            const cpY = (this._points[last - 1].y + this._points[last].y) / 2;
            d += ` Q ${this._points[last - 1].x} ${this._points[last - 1].y}, ${this._points[last].x} ${this._points[last].y}`;
        }

        this._currentPath.setAttribute('d', d);
    }

    /**
     * Handles the mousedown event on the SVG element.
     * If the event is a left click, it sets the _isDrawing flag to true and
     * initializes the _points array and the _currentPath element.
     * It also adds the initial position of the pointer to the _points array.
     * If the event is not a left click, it does nothing.
     *
     * @param {MouseEvent} e - The event object.
     * @private
     */
    _handleMouseDown(e) {
        if (e.button !== 0) return; // left click only
        e.preventDefault();

        this._isDrawing = true;
        this._points = [];
        this._currentPath = this._createPath();

        const pos = this._getPointerPos(e);
        this._points.push(pos);
    }

    /**
     * Handles the mousemove event on the SVG element.
     * If the event is triggered during a drawing operation (i.e., the _isDrawing flag is true),
     * it adds the current position of the pointer to the _points array and updates the _currentPath element.
     * If the event is not triggered during a drawing operation, it does nothing.
     *
     * @param {MouseEvent} e - The event object.
     * @private
     */
    _handleMouseMove(e) {
        if (!this._isDrawing) return;
        e.preventDefault();

        const pos = this._getPointerPos(e);
        this._points.push(pos);
        this._updatePath();
    }

    /**
     * Handles the mouseup event on the SVG element.
     * If the event is triggered during a drawing operation (i.e., the _isDrawing flag is true),
     * it stops the drawing operation by calling the _stopDrawing method.
     * If the event is not triggered during a drawing operation, it does nothing.
     *
     * @param {MouseEvent} e - The event object.
     * @private
     */
    _handleMouseUp(e) {
        if (!this._isDrawing) return;
        this._stopDrawing();
    }

    /**
     * Handles the mouseleave event on the SVG element.
     * If the event is triggered during a drawing operation (i.e., the _isDrawing flag is true),
     * it stops the drawing operation by calling the _stopDrawing method.
     * If the event is not triggered during a drawing operation, it does nothing.
     *
     * @param {MouseEvent} e - The event object.
     * @private
     */
    _handleMouseLeave(e) {
        if (this._isDrawing) this._stopDrawing();
    }

    /**
     * Handles the touchstart event on the SVG element.
     * It prevents the default action, extracts the first touch point, and creates a simulated mouse down event.
     * The simulated event is then dispatched on the SVG element.
     * This allows the SVG element to handle touch events the same way as mouse events.
     *
     * @param {TouchEvent} e - The touch event object.
     * @private
     */
    _handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const simulated = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true,
            cancelable: true
        });
        this.svg.dispatchEvent(simulated);
    }

    /**
     * Handles the touchmove event on the SVG element.
     * It prevents the default action, extracts the first touch point, and creates a simulated mouse move event.
     * The simulated event is then dispatched on the SVG element.
     * This allows the SVG element to handle touch events the same way as mouse events.
     *
     * @param {TouchEvent} e - The touch event object.
     * @private
     */
    _handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const simulated = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true,
            cancelable: true
        });
        this.svg.dispatchEvent(simulated);
    }

    /**
     * Handles the touchend event on the SVG element.
     * It prevents the default action, and creates a simulated mouse up event.
     * The simulated event is then dispatched on the SVG element.
     * This allows the SVG element to handle touch events the same way as mouse events.
     *
     * @param {TouchEvent} e - The touch event object.
     * @private
     */
    _handleTouchEnd(e) {
        e.preventDefault();
        const simulated = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
        this.svg.dispatchEvent(simulated);
    }

    /**
     * Stops the drawing process.
     * It sets the internal drawing flag to false, resets the current path and points arrays.
     *
     * @private
     */
    _stopDrawing() {
        this._isDrawing = false;
        this._currentPath = null;
        this._points = [];
    }
}

module.exports = SVGDrawing;
