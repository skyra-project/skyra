/* eslint id-length: ["error", { "exceptions": ["h", "s", "l", "r", "g", "b", "d", "p", "q", "t"] }] */
module.exports = class HSL {

	/**
     * HSL Parser.
     * @param {number} h Hue. (0 - 360)
     * @param {number} s Saturation. (0 - 100)
     * @param {number} l Lightness. (0 - 100)
     */
	constructor(h, s, l) {
		this.h = parseInt(h);
		this.s = parseInt(s);
		this.l = parseInt(l);

		this.valid();
	}

	valid() {
		if (this.h < 0 || this.h > 360) throw `Invalid Hue range. Must be between 0 and 360, and it is ${this.h}`;
		if (this.s < 0 || this.s > 100) throw `Invalid Saturation range. Must be between 0 and 100, and it is ${this.s}`;
		if (this.l < 0 || this.l > 100) throw `Invalid Lightness range. Must be between 0 and 100, and it is ${this.l}`;
		return true;
	}

	get hex() {
		return this.rgb.hex;
	}

	get rgb() {
		const h = this.h / 360;
		const s = this.s / 100;
		const l = this.l / 100;
		/* Parse HSL to RGB */
		let r;
		let g;
		let b;

		if (s === 0) {
			/* Achromatic */
			r = l;
			g = l;
			b = l;
		} else {
			const q = l < 0.5 ? l * (1 + s) : (l + s) - (l * s);
			const p = (2 * l) - q;
			r = HSL.hue2rgb(p, q, h + (1 / 3));
			g = HSL.hue2rgb(p, q, h);
			b = HSL.hue2rgb(p, q, h - (1 / 3));
		}
		return new RGB(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
	}

	get hsl() {
		return this;
	}

	get b10() {
		return this.hex.b10;
	}

	toString() {
		return String(`hsl(${this.h}, ${this.s}, ${this.l})`);
	}

	static hue2rgb(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (((q - p) * 6) * t);
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (((q - p) * ((2 / 3) - t)) * 6);
		return p;
	}

};

const RGB = require('./RGB');
