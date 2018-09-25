export default class HEX {

	public get hex(): HEX {
		return this;
	}

	public get rgb(): RGB {
		return new RGB(this.r, this.g, this.b);
	}

	public get hsl(): HSL {
		return this.rgb.hsl;
	}

	public get b10(): B10 {
		return new B10((this.r << 16) + (this.g << 8) + this.b);
	}

	/**
	 * HEX Parser.
	 * @param r Red value. ('00' - 'ff')
	 * @param g Green value. ('00' - 'ff')
	 * @param b Blue value. ('00' - 'ff')
	 */
	public constructor(r: string, g: string, b: string) {
		this.r = parseInt(r.padStart(2, '0'), 16);
		this.g = parseInt(g.padStart(2, '0'), 16);
		this.b = parseInt(b.padStart(2, '0'), 16);

		this.valid();
	}

	public r: number;
	public g: number;
	public b: number;

	public valid(): boolean {
		if (Number.isNaN(this.r)) throw `Invalid Red range. Must be between '00' and 'ff', and it is '${this.r}'`;
		if (Number.isNaN(this.g)) throw `Invalid Green range. Must be between '00' and 'ff', and it is '${this.g}'`;
		if (Number.isNaN(this.b)) throw `Invalid Blue range. Must be between '00' and 'ff', and it is '${this.b}'`;
		return true;
	}

	public toString(): string {
		return String(`#${((this.r << 16) + (this.g << 8) + this.b).toString(16).padStart(6, '0')}`);
	}

}

import B10 from './B10';
import HSL from './HSL';
import RGB from './RGB';
