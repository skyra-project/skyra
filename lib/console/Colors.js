/* eslint-disable no-bitwise */
/* eslint id-length: ["error", { "exceptions": ["p", "q", "t"] }] */

class Colors {

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

	static hexToRGB(hex) {
		let string = hex[0];
		if (string.length === 3) string = string.split('').map(char => char + char).join('');
		const integer = parseInt(string, 16);
		return [(integer >> 16) & 0xFF, (integer >> 8) & 0xFF, integer & 0xFF];
	}

	static hslToRGB([h, s, l]) {
		if (s === '0%') return [l, l, l];
		const q = l < 0.5 ? l * (1 + s) : (l + s) - (l * s);
		const p = (2 * l) - q;
		return [Colors.hueToRGB(p, q, h + (1 / 3)), Colors.hueToRGB(p, q, h), Colors.hueToRGB(p, q, h - (1 / 3))];
	}

	static hueToRGB(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (((q - p) * 6) * t);
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (((q - p) * ((2 / 3) - t)) * 6);
		return p;
	}

	static formatArray(array) {
		if (array[2].endsWith('%') && array[3].endsWith('%')) {
			return Colors.hslToRGB(array);
		}
		return `38;2;${array[0]};${array[1]};${array[2]}`;
	}


	format(string, { style, background, text } = {}) {
		const opening = [];
		const closing = [];
		const backgroundMatch = background ? background.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i) : null;
		const textMatch = text ? text.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i) : null;
		if (backgroundMatch) background = Colors.hexToRGB(backgroundMatch);
		if (textMatch) text = Colors.hexToRGB(textMatch);
		if (style) {
			if (Array.isArray(style)) style.forEach(sty => sty in this.STYLES ? opening.push(`${this.STYLES[sty.toLowerCase()]}`) && closing.push(`${this.CLOSE[sty.toLowerCase()]}`) : null);
			else if (style in this.STYLES) {
				opening.push(`${this.STYLES[style.toLowerCase()]}`);
				closing.push(`${this.CLOSE[style.toLowerCase()]}`);
			}
		}
		if (background) {
			if (Number.isInteger(background)) {
				opening.push(`48;5;${background}`);
				closing.push(`${this.CLOSE.background}`);
			}
			if (Array.isArray(background)) {
				opening.push(Colors.formatArray(background));
				closing.push(`\u001B[${this.CLOSE.background}`);
			} else if (background.toString().toLowerCase() in this.BACKGROUNDS) {
				opening.push(`${this.BACKGROUNDS[background.toLowerCase()]}`);
				closing.push(`${this.CLOSE.background}`);
			}
		}
		if (text) {
			if (Number.isInteger(text)) {
				opening.push(`38;5;${text}`);
				closing.push(`${this.CLOSE.text}`);
			}
			if (Array.isArray(text)) {
				opening.push(Colors.formatArray(text));
				closing.push(`${this.CLOSE.text}`);
			} else if (text.toString().toLowerCase() in this.TEXTS) {
				opening.push(`${this.TEXTS[text.toLowerCase()]}`);
				closing.push(`${this.CLOSE.text}`);
			}
		}
		return `\u001B[${opening.join(';')}m${string}\u001B[${closing.join(';')}m`;
	}

}

module.exports = new Colors();
