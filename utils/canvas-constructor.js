const Canvas = require('canvas');

/* eslint-disable id-length */
class CanvasConstructor {

    constructor(width, height) {
        this.canvas = new Canvas(width, height);
        this.context = this.canvas.getContext('2d');

        this.width = width;
        this.height = height;

        this.font = {
            style: '',
            size: 21.33,
            font: ''
        };
    }

    /**
     * Change the current canvas' size.
     * @param {number} width  The new width for the canvas.
     * @param {number} height The new heigth for the canvas.
     * @returns {CanvasConstructor}
     * @chainable
     */
    changeCanvasSize(width, height) {
        if (width && isNaN(width) === false) {
            this.canvas.width = width;
            this.width = width;
        }

        if (height && isNaN(height) === false) {
            this.canvas.height = height;
            this.height = height;
        }

        return this;
    }

    /**
     * Change the current canvas' width.
     * @param {number} width The new width for the canvas.
     * @returns {CanvasConstructor}
     * @chainable
     */
    changeCanvasWidth(width) {
        return this.changeCanvasSize(width, undefined);
    }

    /**
     * Change the current canvas' height.
     * @param {number} height The new height for the canvas.
     * @returns {CanvasConstructor}
     * @chainable
     */
    changeCanvasHeigth(height) {
        return this.changeCanvasSize(undefined, height);
    }

    /**
     * Save the entire state of the canvas by pushing the current state onto a stack.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/save
     */
    save() {
        this.context.save();
        return this;
    }

    /**
     * Restores the most recently saved canvas by popping the top entry in the drawing state stack. If there is no saved state, this method does nothing.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/restore
     */
    restore() {
        this.context.restore();
        return this;
    }

    /**
     * Adds a rotation to the transformation matrix. The angle argument represents a clockwise rotation angle and is expressed in radians.
     * @param {number} angle The angle to rotate clockwise in radians.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate
     */
    rotate(angle) {
        this.context.rotate(angle);
        return this;
    }

    /**
     * Adds a scaling transformation to the canvas units by x horizontally and by y vertically.
     * @param {number} x Scaling factor in the horizontal direction.
     * @param {number} y Scaling factor in the vertical direction.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/scale
     */
    scale(x, y) {
        this.context.scale(x, y);
        return this;
    }

    /**
     * Adds a translation transformation by moving the canvas and its origin x horizontally and y vertically on the grid.
     * @param {number} x Distance to move in the horizontal direction.
     * @param {number} y Distance to move in the vertical direction.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/translate
     */
    traslate(x, y) {
        this.context.traslate(x, y);
        return this;
    }

    /**
     * Resets (overrides) the current transformation to the identity matrix and then invokes a transformation described
     * by the arguments of this method.
     * @param {number} a Horizontal scaling.
     * @param {number} b Horizontal skewing.
     * @param {number} c Vertical skewing.
     * @param {number} d Vertical scaling.
     * @param {number} e Horizontal moving.
     * @param {number} f Vertical moving.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
     */
    setTransform(a, b, c, d, e, f) {
        this.context.setTransform(a, b, c, d, e, f);
        return this;
    }

    /**
     * Reset the transformation.
     * @returns {CanvasConstructor}
     * @chainable
     */
    resetTransformation() {
        return this.setTransform(1, 0, 0, 1, 0, 0);
    }

    /**
     * Fills the current or given path with the current fill style using the non-zero or even-odd winding rule.
     * @param {any} path A Path2D path to fill.
     * @param {('nonzero'|'evenodd')} fillRule The algorithm by which to determine if a point is inside a path or
     * outside a path.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fill
     */
    fill(path, fillRule) {
        this.context.fill(path, fillRule);
        return this;
    }

    /**
     * Add a rectangle.
     * @param {number} x      The position x to start drawing the element.
     * @param {number} y      The position y to start drawing the element.
     * @param {number} width  The width of the element.
     * @param {number} height The heigth of the element.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillRect
     */
    addRect(x, y, width, height) {
        this.context.fillRect(x, y, width, height);
        return this;
    }

    /**
     * Add a text.
     * @param {string} text The text to write.
     * @param {number} x    The position x to start drawing the element.
     * @param {number} y    The position y to start drawing the element.
     * @param {number} maxWidth The maximum width to draw. If specified, and the string is computed to be wider than
     * this width, the font is adjusted to use a more horizontally condensed font.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText
     */
    addText(text, x, y, maxWidth) {
        this.context.fillText(text, x, y, maxWidth);
        return this;
    }

    /**
     * Add responsive text
     * @param {string} text     The text to write.
     * @param {number} x        The position x to start drawing the element.
     * @param {number} y        The position y to start drawing the element.
     * @param {number} maxWidth The max length in pixels for the text.
     * @returns {CanvasConstructor}
     * @chainable
     * @example
     * new Canvas(400, 300)
     *     .setTextFont('40px Tahoma')
     *     .addResponsiveText('Hello World', 30, 30, 50)
     *     .toBuffer();
     */
    addResponsiveText(text, x, y, maxWidth) {
        const { style = '', size, font } = this.font;
        if (isNaN(size)) throw new TypeError('The parameter size must be a valid number.');
        const { width } = this.measureText(text);
        const newLength = maxWidth > width ? maxWidth : (maxWidth / width) * size;
        return this
            .setTextFont(`${style}${newLength}px ${font}`)
            .addText(text, x, y);
    }

    /**
     * Strokes the current or given path with the current stroke style using the non-zero winding rule.
     * @param {any} path A Path2D path to stroke.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke
     */
    stroke(path) {
        this.context.stroke(path);
        return this;
    }

    /**
     * Paints a rectangle which has a starting point at (x, y) and has a w width and an h height onto the canvas, using
     * the current stroke style.
     * @param {number} x      The x axis of the coordinate for the rectangle starting point.
     * @param {number} y      The y axis of the coordinate for the rectangle starting point.
     * @param {number} width  The rectangle's width.
     * @param {number} height The rectangle's height.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeRect
     */
    addStrokeRect(x, y, width, height) {
        this.context.strokeRect(x, y, width, height);
        return this;
    }

    /**
     * Add stroked text.
     * @param {string} text The text to write.
     * @param {number} x    The position x to start drawing the element.
     * @param {number} y    The position y to start drawing the element.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeText
     */
    addStrokeText(text, x, y) {
        this.context.strokeText(text, x, y);
        return this;
    }

    /**
     * Measure a text's width given a string.
     * If a callback is not passed, this method will not be chainable, and it will return an integer instead.
     * @param {string}   text     The text to measure.
     * @param {Function} callback The callback, if not specified, this method won't be chainable as it will return a
     * number. If you use an arrow function, you might want to use the second argument which is the instance of the
     * class. Otherwise, the keyword this is binded to the class instance itself, so you can use it safely.
     * @returns {(CanvasConstructor|number)}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/measureText
     * @example
     * new Canvas(500, 400)
     *     .setTextFont('40px Tahoma')
     *     .measureText('Hello World!', function(size) {
     *         const newSize = size.width < 500 ? 40 : (500 / size.width) * 40;
     *         this.setTextFont(`${newSize}px Tahoma`);
     *     })
     *     .addText('Hello World!', 30, 50)
     *     .toBuffer(); // Returns a Buffer
     * @example
     * new Canvas(500, 400)
     *     .setTextFont('40px Tahoma')
     *     .measureText('Hello World!', (size, inst) => {
     *         const newSize = size.width < 500 ? 40 : (500 / size.width) * 40;
     *         inst.setTextFont(`${newSize}px`);
     *     })
     *     .addText('Hello World!', 30, 50)
     *     .toBuffer(); // Returns a Buffer
     * @example
     * const size = new Canvas(500, 400)
     *     .setTextFont('40px Tahoma')
     *     .measureText('Hello World!'); // Returns a number
     *
     * const newSize = size.width < 500 ? 40 : (500 / size.width) * 40;
     *
     * new Canvas(500, 400)
     *     .setTextFont(`${newSize}px Tahoma`)
     *     .addText('Hello World!', 30, 50)
     *     .toBuffer(); // Returns a Buffer
     */
    measureText(text, callback) {
        if (callback) {
            if (typeof callback !== 'function') throw new TypeError('Callback must be a function.');
            callback.bind(this)(this.context.measureText(text), this);
            return this;
        }
        return this.context.measureText(text);
    }

    /**
     * Specifies the color or style to use for the lines around shapes. The default is #000000 (black).
     * @param {string} [color='#000000'] A canvas' color resolvable.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle
     */
    setStroke(color = '#000000') {
        this.context.strokeStyle = color;
        return this;
    }

    /**
     * Sets the thickness of lines in space units.
     * @param {number} [width=1] A number specifying the line width in space units.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineWidth
     */
    setStrokeWidth(width = 1) {
        this.context.lineWidth = width;
        return this;
    }

    /**
     * Add an image.
     * @param {Buffer} buffer  The image's buffer.
     * @param {number} x       The position x to start drawing the element.
     * @param {number} y       The position y to start drawing the element.
     * @param {number} width   The width of the element.
     * @param {number} height  The heigth of the element.
     * @param {Object} options Options.
     * @param {number} options.radius The radius for the new image.
     * @param {'round'|'bevel'} options.type   The type for the new image.
     * @returns {CanvasConstructor}
     * @chainable
     */
    addImage(buffer, x, y, width, height, options = {}) {
        if (options.type) {
            if (isNaN(options.radius)) options.radius = 10;
            if (options.type === 'round') this.createRoundClip(x + options.radius, y + options.radius, options.radius);
            if (options.type === 'bevel') this.createBeveledClip(x, y, width, height, options.radius);
        }
        const image = new Canvas.Image();
        image.onload = () => this.context.drawImage(image, x, y, width, height);
        image.src = buffer;
        return this;
    }

    /**
     * Add a round image.
     * @param {Buffer} buffer The image's buffer.
     * @param {number} x      The position x to start drawing the element.
     * @param {number} y      The position y to start drawing the element.
     * @param {number} width  The width of the element.
     * @param {number} height The heigth of the element.
     * @param {number} radius The radius for the new image.
     * @returns {CanvasConstructor}
     * @chainable
     */
    addRoundImage(buffer, x, y, width, height, radius = 10) {
        return this.addImage(buffer, x, y, width, height, { type: 'round', radius });
    }

    /**
     * Add a beveled image.
     * @param {Buffer} buffer The image's buffer.
     * @param {number} x      The position x to start drawing the element.
     * @param {number} y      The position y to start drawing the element.
     * @param {number} width  The width of the element.
     * @param {number} height The heigth of the element.
     * @param {number} radius The radius for the new image.
     * @returns {CanvasConstructor}
     * @chainable
     */
    addBevelImage(buffer, x, y, width, height, radius = 10) {
        return this.addImage(buffer, x, y, width, height, { type: 'bevel', radius });
    }

    /**
     * Create a round clip.
     * @param {number} x                   The position x in the center of the clip's circle.
     * @param {number} y                   The position y in the center of the clip's circle.
     * @param {number} radius              The radius for the clip.
     * @param {number} [start=0]           The degree in radians to start drawing the circle.
     * @param {number} [angle=Math.PI * 2] The degree in radians to finish drawing the circle, defaults to a full circle.
     * @returns {CanvasConstructor}
     * @chainable
     */
    createRoundClip(x, y, radius, start = 0, angle = Math.PI * 2) {
        this.context.save();
        this.context.beginPath();
        this.context.arc(x, y, radius, start, angle, false);
        this.context.clip();
        return this;
    }

    /**
     * Create a round clip.
     * @param {number} x      The position x to start drawing clip.
     * @param {number} y      The position y to start drawing clip.
     * @param {number} width  The width of clip.
     * @param {number} height The heigth of clip.
     * @param {number} radius The radius for clip's rounded borders.
     * @returns {CanvasConstructor}
     * @chainable
     */
    createBeveledClip(x, y, width, height, radius) {
        if (width > 0 && height > 0) {
            radius = Math.min(radius, width / 2, height / 2);
            this.context.beginPath();
            this.context.moveTo(x + radius, y);
            this.context.lineTo(x + width - radius, y);
            this.context.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.context.lineTo(x + width, y + height - radius);
            this.context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            this.context.lineTo(x + radius, y + height);
            this.context.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.context.lineTo(x, y + radius);
            this.context.quadraticCurveTo(x, y, x + radius, y);
            this.context.closePath();
            this.context.clip();
        }
        return this;
    }

    /**
     * Set a color for the canvas' context.
     * @param {string} color A canvas' color resolvable.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle
     */
    setColor(color) {
        this.context.fillStyle = color;
        return this;
    }

    /**
     * Change the font.
     * @param {string} font The font's name to set.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
     */
    setTextFont(font) {
        this._parseFontString(font);
        this.context.font = font;
        return this;
    }

    /**
     * Change the font alignment.
     * @param {('left'|'center'|'right'|'start'|'end')} align The font's alignment to set.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign
     */
    setTextAlign(align) {
        this.context.textAlign = align;
        return this;
    }

    /**
     * Change the font's baseline.
     * @param {('top'|'hanging'|'middle'|'alphabetic'|'ideographic'|'bottom')} baseline The font's baseline to set.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline
     */
    setTextBaseline(baseline) {
        this.context.textBaseline = baseline;
        return this;
    }

    /**
     * Starts a new path by emptying the list of sub-paths.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/beginPath
     */
    beginPath() {
        this.context.beginPath();
        return this;
    }

    /**
     * Causes the point of the pen to move back to the start of the current sub-path.
     * If the shape has already been closed or has only one point, this function does nothing.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/closePath
     */
    closePath() {
        this.context.closePath();
        return this;
    }

    /**
     * Creates a gradient along the line given by the coordinates represented by the parameters.
     * The coordinates are global, the second point does not rely on the position of the first and vice versa.
     * @param {number} x0 The x axis of the coordinate of the start point.
     * @param {number} y0 The y axis of the coordinate of the start point.
     * @param {number} x1 The x axis of the coordinate of the end point.
     * @param {number} y1 The y axis of the coordinate of the end point.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
     */
    createLinearGradient(x0, y0, x1, y1) {
        this.context.createLinearGradient(x0, y0, x1, y1);
        return this;
    }

    /**
     * Creates a radial gradient given by the coordinates of the two circles represented by the parameters.
     * @param {number} x0 The x axis of the coordinate of the start circle.
     * @param {number} y0 The y axis of the coordinate of the start circle.
     * @param {number} r0 The radius of the start circle.
     * @param {number} x1 The x axis of the coordinate of the end circle.
     * @param {number} y1 The y axis of the coordinate of the end circle.
     * @param {number} r1 The radius of the end circle.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
     */
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
        this.context.createRadialGradient(x0, y0, r0, x1, y1, r1);
        return this;
    }

    /**
     * adds an arc to the path which is centered at (x, y) position with radius r starting at startAngle and ending at
     * endAngle going in the given direction by anticlockwise (defaulting to clockwise).
     * @param {number} x          The x coordinate of the arc's center.
     * @param {number} y          The y coordinate of the arc's center.
     * @param {number} radius     The arc's radius.
     * @param {number} startAngle The angle at which the arc starts, measured clockwise from the positive x axis and
     * expressed in radians.
     * @param {number} endAngle   The angle at which the arc ends, measured clockwise from the positive x axis and
     * expressed in radians.
     * @param {boolean} [anticlockwise=false] An optional Boolean which, if true, causes the arc to be drawn
     * counter-clockwise between the two angles. By default it is drawn clockwise.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
     */
    arc(x, y, radius, startAngle, endAngle, anticlockwise = false) {
        this.context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        return this;
    }

    /**
     * Adds an arc to the path with the given control points and radius, connected to the previous point by a straight line.
     * @param {number} x1     The x axis of the coordinate for the first control point.
     * @param {number} y1     The y axis of the coordinate for the first control point.
     * @param {number} x2     The x axis of the coordinate for the second control point.
     * @param {number} y2     The y axis of the coordinate for the second control point.
     * @param {number} radius The arc's radius.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arcTo
     */
    arcTo(x1, y1, x2, y2, radius) {
        this.context.arcTo(x1, y1, x2, y2, radius);
        return this;
    }

    /**
     * Adds a quadratic Bézier curve to the path. It requires two points. The first point is a control point and the
     * second one is the end point. The starting point is the last point in the current path, which can be changed using
     * moveTo() before creating the quadratic Bézier curve.
     * @param {number} cpx The x axis of the coordinate for the control point.
     * @param {number} cpy The y axis of the coordinate for the control point.
     * @param {number} x   The x axis of the coordinate for the end point.
     * @param {number} y   The y axis of the coordinate for the end point.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/quadraticCurveTo
     */
    quadraticCurveTo(cpx, cpy, x, y) {
        this.context.quadraticCurveTo(cpx, cpy, x, y);
        return this;
    }

    /**
     * Adds a cubic Bézier curve to the path. It requires three points. The first two points are control points and the
     * third one is the end point. The starting point is the last point in the current path, which can be changed using
     * moveTo() before creating the Bézier curve.
     * @param {number} cp1x The x axis of the coordinate for the first control point.
     * @param {number} cp1y The y axis of the coordinate for first control point.
     * @param {number} cp2x The x axis of the coordinate for the second control point.
     * @param {number} cp2y The y axis of the coordinate for the second control point.
     * @param {number} x    The x axis of the coordinate for the end point.
     * @param {number} y    The y axis of the coordinate for the end point.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo
     */
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
        this.context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        return this;
    }

    /**
     * Connects the last point in the sub-path to the x, y coordinates with a straight line
     * @param {number} x The x axis of the coordinate for the end of the line.
     * @param {number} y The y axis of the coordinate for the end of the line.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo
     */
    lineTo(x, y) {
        this.context.lineTo(x, y);
        return this;
    }

    /**
     * Moves the starting point of a new sub-path to the (x, y) coordinates.
     * @param {number} x The x axis of the point.
     * @param {number} y The y axis of the point.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/moveTo
     */
    moveTo(x, y) {
        this.context.moveTo(x, y);
        return this;
    }

    /**
     * Set the shadow's blur.
     * @param {number} radius The shadow's blur radius to set.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur
     */
    setShadowBlur(radius) {
        this.context.shadowBlur = radius;
        return this;
    }

    /**
     * Set the shadow's color.
     * @param {string} color A canvas' color resolvable to set as shadow's color.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowColor
     */
    setShadowColor(color) {
        this.context.shadowColor = color;
        return this;
    }

    /**
     * Set the property that specifies the distance that the shadow will be offset in horizontal distance.
     * @param {number} value The value in pixels for the distance.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX
     */
    setShadowOffsetX(value) {
        this.context.shadowOffsetX = value;
        return this;
    }

    /**
     * Set the property that specifies the distance that the shadow will be offset in vertical distance.
     * @param {number} value The value in pixels for the distance.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetY
     */
    setShadowOffsetY(value) {
        this.context.shadowOffsetY = value;
        return this;
    }

    /**
     * Modify the alpha value that is applied to shapes and images before they are drawn into the canvas.
     * @param {number} value The alpha value, from 0.0 (fully transparent) to 1.0 (fully opaque)
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalAlpha
     */
    setGlobalAlpha(value) {
        this.context.globalAlpha = value;
        return this;
    }

    /**
     * Reset the canvas' shadows.
     * @returns {CanvasConstructor}
     * @chainable
     */
    resetShadows() {
        return this
            .setShadowBlur(0)
            .setShadowColor('#000000');
    }

    /**
     * Clear a circle.
     * @param {number} x                   The position x in the center of the clip's circle.
     * @param {number} y                   The position y in the center of the clip's circle.
     * @param {number} radius              The radius for the clip.
     * @param {number} [start=0]           The degree in radians to start drawing the circle.
     * @param {number} [angle=Math.PI * 2] The degree in radians to finish drawing the circle, defaults to a full circle.
     * @returns {CanvasConstructor}
     * @chainable
     */
    clearCircle(x, y, radius, start = 0, angle = Math.PI * 2) {
        return this
            .createRoundClip(x, y, radius, start, angle)
            .clearPixels(x - radius, y - radius, radius * 2, radius * 2);
    }

    /**
     * Clear an area.
     * @param {number} [x=0]                The position x to start drawing the element.
     * @param {number} [y=0]                The position y to start drawing the element.
     * @param {number} [width=this.width]   The width of the element.
     * @param {number} [height=this.heigth] The heigth of the element.
     * @returns {CanvasConstructor}
     * @chainable
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clearRect
     */
    clearPixels(x = 0, y = 0, width = this.width, height = this.height) {
        this.context.clearRect(x, y, width, height);
        return this;
    }

    /**
     * Render the canvas into a buffer.
     * @param {Object} options The render's options.
     * @returns {Buffer}
     */
    toBuffer(options) {
        return this.canvas.toBuffer(options);
    }

    /**
     * Render the canvas into a buffer using a Promise.
     * @returns {Promise<Buffer>}
     */
    toBufferAsync() {
        return new Promise((resolve, reject) => this.canvas.toBuffer((err, res) => {
            if (err) reject(err);
            else resolve(res);
        }));
    }

    static getCanvas() {
        return Canvas;
    }

    /**
     * Register a new font.
     * @param {string} path   The path for the font.
     * @param {string} family The font's family name.
     * @returns {CanvasConstructor}
     */
    static registerFont(path, family) {
        Canvas.registerFont(path, { family });
        return this;
    }

    /**
     * Parses the font.
     * @param {string} string A string.
     * @returns {void}
     * @private
     */
    _parseFontString(string) {
        const data = /([^\d]+)?([\d\w]+) (.+)?/.exec(string);
        if (data === null) return;
        this.font.style = data[1] || '';
        this.font.size = this._parseFontSize(data[2]);
        this.font.font = data[3] || '';
    }

    /**
     * Parses the font's size
     * @param {string} string The string with a number and a unit.
     * @returns {number}
     * @private
     */
    _parseFontSize(string) {
        const data = /(\d+)(\w+)/.exec(string);
        if (data === null) return 21.33;
        let size = parseFloat(data[1]);
        const unit = data[2];
        switch (unit) {
            case 'pt': size /= 0.75; break;
            case 'pc': size *= 16; break;
            case 'in': size *= 96; break;
            case 'cm': size *= 96.0 / 2.54; break;
            case 'mm': size *= 96.0 / 25.4; break;
            case 'em': size /= 0.75; break;
            case 'rem': size *= 21.33 / 0.75; break;
            case 'q': size *= 96 / 25.4 / 4; break;
        }

        return size;
    }

}

module.exports = CanvasConstructor;
