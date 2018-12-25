export class HEX {

	public r: string;
	public g: string;
	public b: string;

	/**
	 * HEX Parser.
	 * @param r Red value. ('00' - 'ff')
	 * @param g Green value. ('00' - 'ff')
	 * @param b Blue value. ('00' - 'ff')
	 */
	public constructor(r: string, g: string, b: string) {
		this.r = r.padStart(2, '0');
		this.g = g.padStart(2, '0');
		this.b = b.padStart(2, '0');

		this.valid();
	}

	public valid(): boolean {
		if (Number.isNaN(parseInt(this.r, 16))) throw `Invalid Red range. Must be between '00' and 'ff', and it is '${this.r}'`;
		if (Number.isNaN(parseInt(this.g, 16))) throw `Invalid Green range. Must be between '00' and 'ff', and it is '${this.g}'`;
		if (Number.isNaN(parseInt(this.b, 16))) throw `Invalid Blue range. Must be between '00' and 'ff', and it is '${this.b}'`;
		return true;
	}

	public get hex(): HEX {
		return this;
	}

	public get rgb(): RGB {
		return new RGB(parseInt(this.r, 16), parseInt(this.g, 16), parseInt(this.b, 16));
	}

	public get hsl(): HSL {
		return this.rgb.hsl;
	}

	public get b10(): B10 {
		return new B10(parseInt(this.r + this.g + this.b, 16));
	}

	public toString(): string {
		return String(`#${this.r}${this.g}${this.b}`);
	}

}

import { B10 } from './B10';
import { HSL } from './HSL';
import { RGB } from './RGB';
