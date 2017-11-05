/* eslint-disable id-length */

class Colors {

	/**
	 * @typedef  {object} ColorsFormatOptions
	 * @property {(string | string[])} style
	 * @property {(number | string | number[] | string[])} background
	 * @property {(number | string | number[] | string[])} text
	 * @memberof Colors
	 */

	constructor() {
		this.CLOSE = {
			normal: 0,
			bold: 22,
			dim: 22,
			italic: 23,
			underline: 24,
			inverse: 27,
			hidden: 28,
			strikethrough: 29,
			text: 39,
			background: 49
		};

		this.STYLES = {
			normal: 0,
			bold: 1,
			dim: 2,
			italic: 3,
			underline: 4,
			inverse: 7,
			hidden: 8,
			strikethrough: 9
		};

		this.TEXTS = {
			black: 30,
			red: 31,
			green: 32,
			yellow: 33,
			blue: 34,
			magenta: 35,
			cyan: 36,
			lightgray: 37,
			lightgrey: 37,
			gray: 90,
			grey: 90,
			lightred: 91,
			lightgreen: 92,
			lightyellow: 93,
			lightblue: 94,
			lightmagenta: 95,
			lightcyan: 96,
			white: 97
		};

		this.BACKGROUNDS = {
			black: 40,
			red: 41,
			green: 42,
			yellow: 43,
			blue: 44,
			magenta: 45,
			cyan: 46,
			gray: 47,
			grey: 47,
			lightgray: 100,
			lightgrey: 100,
			lightred: 101,
			lightgreen: 102,
			lightyellow: 103,
			lightblue: 104,
			lightmagenta: 105,
			lightcyan: 106,
			white: 107
		};
	}

	/**
	 * Convert hex to RGB
	 * @param {string} hex The hexadecimal value to parse.
	 * @returns {number[]}
	 */
	static hexToRGB(hex) {
		if (hex.length === 3) hex = hex.split('').map(char => char + char).join('');
		const integer = parseInt(hex, 16);
		// eslint-disable-next-line no-bitwise
		return [(integer >> 16) & 0xFF, (integer >> 8) & 0xFF, integer & 0xFF];
	}

	/**
	 * Convert hue to RGB
	 * @param {number} p Value number one.
	 * @param {number} q Value number two.
	 * @param {number} t Value number three.
	 * @returns {number}
	 */
	static hueToRGB(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + ((q - p) * 6 * t);
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + ((q - p) * ((2 / 3) - t) * 6);
		return p;
	}

	/**
	 * Format HSL to RGB
	 * @param {(number[]|string[])} formatArray The array to format.
	 * @returns {number[]}
	 */
	static hslToRGB([h, s, l]) {
		if (s === '0%' && typeof l === 'number') return [l, l, l];
		if (typeof h !== 'number' || typeof s !== 'number' || typeof l !== 'number') {
			throw new TypeError(`The input for Colors.hslToRGB must be number[], received: [${typeof h}, ${typeof s}, ${typeof l}]`);
		}

		const q = l < 0.5 ? l * (1 + s) : (l + s) - (l * s);
		const p = (2 * l) - q;
		return [Colors.hueToRGB(p, q, h + (1 / 3)), Colors.hueToRGB(p, q, h), Colors.hueToRGB(p, q, h - (1 / 3))];
	}

	/**
	 * Format an array into a string
	 * @param {(number[]|string[])} formatArray The array to format.
	 * @returns {string}
	 */
	static formatArray([pos1, pos2, pos3]) {
		if (typeof pos1 === 'string' && typeof pos2 === 'string' && pos3 === 'string') {
			const exec1 = /(\d{1,3})%?/.exec(pos1);
			if (exec1 === null) throw new TypeError('Invalid argument parsed at first position. Expected a parsable numeric value.');
			const exec2 = /(\d{1,3})%?/.exec(pos2);
			if (exec2 === null) throw new TypeError('Invalid argument parsed at second position. Expected a parsable numeric value.');
			const exec3 = /(\d{1,3})%?/.exec(pos3);
			if (exec3 === null) throw new TypeError('Invalid argument parsed at third position. Expected a parsable numeric value.');

			return `38;2;${Colors.hslToRGB([parseInt(exec1[1]), parseInt(exec2[1]), parseInt(exec3[1])]).join(';')}`;
		}
		return `38;2;${pos1};${pos2};${pos3}`;
	}


	/**
	 * Format a string
	 * @param {string} string The string to format.
	 * @param {ColorsFormatOptions} formatOptions The format options.
	 * @returns {string}
	 */
	format(string, { style, background, text } = {}) {
		const opening = [];
		const closing = [];
		if (style) {
			if (Array.isArray(style)) {
				for (let i = 0; i < style.length; i++) {
					opening.push(`${this.STYLES[style[i].toLowerCase()]}`);
					closing.push(`${this.CLOSE[style[i].toLowerCase()]}`);
				}
			} else if (typeof style === 'string' && style.toLowerCase() in this.STYLES) {
				opening.push(`${this.STYLES[style.toLowerCase()]}`);
				closing.push(`${this.CLOSE[style.toLowerCase()]}`);
			}
		}
		if (background) {
			if (typeof background === 'number') {
				if (Number.isInteger(background) === false) background = Math.round(background);

				const number = (background >= 0x100 && background <= 0xFFF) || (background >= 0x100000 && background <= 0xFFFFFF)
					? background.toString(16)
					: null;

				if (number !== null) {
					opening.push(`48;5;${background}`);
					closing.push(`${this.CLOSE.background}`);
				}
			} else if (Array.isArray(background)) {
				opening.push(Colors.formatArray([background[0], background[1], background[2]]));
				closing.push(`\u001B[${this.CLOSE.background}`);
			} else if (typeof background === 'string' && background.toLowerCase() in this.BACKGROUNDS) {
				opening.push(`${this.BACKGROUNDS[background.toLowerCase()]}`);
				closing.push(`${this.CLOSE.background}`);
			}
		}
		if (text) {
			if (typeof text === 'number') {
				if (Number.isInteger(text) === false) text = Math.round(text);
				opening.push(`38;5;${text}`);
				closing.push(`${this.CLOSE.text}`);
			} else if (Array.isArray(text)) {
				opening.push(Colors.formatArray([text[0], text[1], text[2]]));
				closing.push(`${this.CLOSE.text}`);
			} else if (typeof text === 'string' && text.toLowerCase() in this.TEXTS) {
				opening.push(`${this.TEXTS[text.toLowerCase()]}`);
				closing.push(`${this.CLOSE.text}`);
			}
		}
		return `\u001B[${opening.join(';')}m${string}\u001B[${closing.join(';')}m`;
	}

}

/* eslint-enable id-length */

module.exports = new Colors();
