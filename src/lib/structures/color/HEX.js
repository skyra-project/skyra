/* eslint id-length: ["error", { "exceptions": ["h", "s", "l", "r", "g", "b", "d", "p", "q", "t"] }] */
export default class HEX {

	/**
     * HEX Parser.
     * @param {string} r Red value. ('00' - 'ff')
     * @param {string} g Green value. ('00' - 'ff')
     * @param {string} b Blue value. ('00' - 'ff')
     */
	constructor(r, g, b) {
		this.r = r.padStart(2, 0);
		this.g = g.padStart(2, 0);
		this.b = b.padStart(2, 0);

		this.valid();
	}

	valid() {
		if (isNaN(parseInt(this.r, 16))) throw `Invalid Red range. Must be between '00' and 'ff', and it is '${this.r}'`;
		if (isNaN(parseInt(this.g, 16))) throw `Invalid Green range. Must be between '00' and 'ff', and it is '${this.g}'`;
		if (isNaN(parseInt(this.b, 16))) throw `Invalid Blue range. Must be between '00' and 'ff', and it is '${this.b}'`;
		return true;
	}

	get hex() {
		return this;
	}

	get rgb() {
		return new RGB(parseInt(this.r, 16), parseInt(this.g, 16), parseInt(this.b, 16));
	}

	get hsl() {
		return this.rgb.hsl;
	}

	get b10() {
		return new B10(parseInt(this.r + this.g + this.b, 16));
	}

	toString() {
		return String(`#${this.r}${this.g}${this.b}`);
	}

};

const RGB = require('./RGB');
const B10 = require('./B10');
