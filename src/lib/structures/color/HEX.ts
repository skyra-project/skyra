export class HEX {

	/**
     * HEX Parser.
     * @param {string} r Red value. ('00' - 'ff')
     * @param {string} g Green value. ('00' - 'ff')
     * @param {string} b Blue value. ('00' - 'ff')
     */
	public constructor(r, g, b) {
		this.r = r.padStart(2, '0');
		this.g = g.padStart(2, '0');
		this.b = b.padStart(2, '0');

		this.valid();
	}

	public valid() {
		if (isNaN(parseInt(this.r, 16))) throw `Invalid Red range. Must be between '00' and 'ff', and it is '${this.r}'`;
		if (isNaN(parseInt(this.g, 16))) throw `Invalid Green range. Must be between '00' and 'ff', and it is '${this.g}'`;
		if (isNaN(parseInt(this.b, 16))) throw `Invalid Blue range. Must be between '00' and 'ff', and it is '${this.b}'`;
		return true;
	}

	public get hex() {
		return this;
	}

	public get rgb() {
		return new RGB(parseInt(this.r, 16), parseInt(this.g, 16), parseInt(this.b, 16));
	}

	public get hsl() {
		return this.rgb.hsl;
	}

	public get b10() {
		return new B10(parseInt(this.r + this.g + this.b, 16));
	}

	public toString() {
		return String(`#${this.r}${this.g}${this.b}`);
	}

}

import B10 from './B10';
import RGB from './RGB';
