import { ColorHandler } from './index';

export class RGB implements ColorHandler {
	public r: number;
	public g: number;
	public b: number;

	/**
	 * RGB Parser.
	 * @param r Red value. (0 - 255)
	 * @param g Green value. (0 - 255)
	 * @param b Blue value. (0 - 255)
	 */
	public constructor(r: number | string, g: number | string, b: number | string) {
		this.r = Number(r);
		this.g = Number(g);
		this.b = Number(b);

		this.check();
	}

	public check() {
		if (this.r < 0 || this.r > 255) throw `Invalid Red range. Must be between 0 and 255, and it is ${this.r}`;
		if (this.g < 0 || this.g > 255) throw `Invalid Green range. Must be between 0 and 255, and it is ${this.g}`;
		if (this.b < 0 || this.b > 255) throw `Invalid Blue range. Must be between 0 and 255, and it is ${this.b}`;
	}

	public get hex() {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		return new HEX(this.r.toString(16), this.g.toString(16), this.b.toString(16));
	}

	public get rgb() {
		return this;
	}

	public get hsl() {
		const r = this.r / 255;
		const g = this.g / 255;
		const b = this.b / 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h: number | undefined = undefined;
		let s: number | undefined = undefined;
		const l = (max + min) / 2;

		if (max === min) {
			/* Achromatic */
			h = 0;
			s = 0;
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
				// no default
			}
			// TODO(kyranet): This feel more wrong than eating cactus.
			h! /= 6;
		}
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		return new HSL(Math.round(h! * 360), Math.round(s * 100), Math.round(l * 100));
	}

	public get b10() {
		return this.hex.b10;
	}

	public toString() {
		return String(`rgb(${this.r}, ${this.g}, ${this.b})`);
	}
}

import { HEX } from './HEX';
import { HSL } from './HSL';
