import { ColorHandler } from './index';

export class HEX implements ColorHandler {
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

		this.check();
	}

	public check() {
		if (Number.isNaN(parseInt(this.r, 16))) throw `Invalid Red range. Must be between '00' and 'ff', and it is '${this.r}'`;
		if (Number.isNaN(parseInt(this.g, 16))) throw `Invalid Green range. Must be between '00' and 'ff', and it is '${this.g}'`;
		if (Number.isNaN(parseInt(this.b, 16))) throw `Invalid Blue range. Must be between '00' and 'ff', and it is '${this.b}'`;
	}

	public get hex() {
		return this;
	}

	public get rgb() {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		return new RGB(parseInt(this.r, 16), parseInt(this.g, 16), parseInt(this.b, 16));
	}

	public get hsl() {
		return this.rgb.hsl;
	}

	public get b10() {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		return new B10(parseInt(this.r + this.g + this.b, 16));
	}

	public toString() {
		return String(`#${this.r}${this.g}${this.b}`);
	}
}

import { B10 } from './B10';
import { RGB } from './RGB';
