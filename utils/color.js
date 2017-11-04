const randomcolor = require('randomcolor');
const Resolver = require('./color/index');

const REGEXP = {
	RANDOM: /^(-r|--random)$/,
	RGB: /^rgba?\(\d{1,3},\s?\d{1,3},\s?\d{1,3}(?:,.+)?\)$/,
	RGB_EXEC: /^rgba?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})(?:,.+)?\)$/,
	HEX: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
	HEX_EXEC: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
	HSL: /^hsl\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)$/,
	HSL_EXEC: /^hsl\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)$/,
	B10: /^\d{1,8}$/
};

/* eslint id-length: ["error", { "exceptions": ["h", "s", "l", "r", "g", "b", "d", "p", "q", "t"] }] */
class Color {

	static parse(input) {
		if (REGEXP.RANDOM.test(input)) return Color._generateRandom();
		const output = Color._HEX(input)
												|| Color._B10(input)
												|| Color._RGB(input)
												|| Color._HSL(input);

		if (output !== false) return output;
		throw 'Invalid input';
	}

	static _generateRandom() {
		const raw = randomcolor({ luminosity: 'bright' }).slice(1);
		const HEX = new Resolver.HEX(raw.substring(0, 2), raw.substring(2, 4), raw.substring(4, 6));
		return {
			hex: HEX,
			rgb: HEX.rgb,
			hsl: HEX.hsl,
			b10: HEX.b10
		};
	}

	static _RGB(input) {
		if (REGEXP.RGB.test(input) === false) return false;
		const raw = REGEXP.RGB_EXEC.exec(input);
		const RGB = new Resolver.RGB(parseInt(raw[1]), parseInt(raw[2]), parseInt(raw[3]));
		return {
			hex: RGB.hex,
			rgb: RGB,
			hsl: RGB.hsl,
			b10: RGB.b10
		};
	}

	static _HEX(input) {
		if (REGEXP.HEX.test(input) === false) return false;
		let raw = REGEXP.HEX_EXEC.exec(input)[1];
		if (raw.length === 3) raw = raw.split('').map(char => char + char).join('');
		const HEX = new Resolver.HEX(raw.substring(0, 2), raw.substring(2, 4), raw.substring(4, 6));
		return {
			hex: HEX,
			rgb: HEX.rgb,
			hsl: HEX.hsl,
			b10: HEX.b10
		};
	}

	static _HSL(input) {
		if (REGEXP.HSL.test(input) === false) return false;
		const raw = REGEXP.HSL_EXEC.exec(input);
		const HSL = new Resolver.HSL(parseInt(raw[1]), parseInt(raw[2]), parseInt(raw[3]));
		return {
			hex: HSL.hex,
			rgb: HSL.rgb,
			hsl: HSL,
			b10: HSL.b10
		};
	}

	static _B10(input) {
		if (REGEXP.B10.test(input) === false) return false;
		const B10 = new Resolver.B10(input);
		return {
			hex: B10.hex,
			rgb: B10.rgb,
			hsl: B10.hsl,
			b10: B10
		};
	}

	static luminance(r, g, b) {
		return (0.299 * (r ** 2)) + (0.587 * (g ** 2)) + (0.114 * (b ** 2));
	}

	static hexConcat(r, g, b) {
		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	}

	static fulFill(value, fill = 0, number = 2) {
		const length = value.toString().length;
		return `${fill.toString().repeat(number - length)}${value}`;
	}

}

Color.Resolver = Resolver;

module.exports = Color;
