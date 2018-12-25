/* eslint id-length: ["error", { "exceptions": ["h", "s", "l", "r", "g", "b", "d", "p", "q", "t"] }] */
export class HSL {

	public h: number;
	public s: number;
	public l: number;

	/**
	 * HSL Parser.
	 * @param h Hue. (0 - 360)
	 * @param s Saturation. (0 - 100)
	 * @param l Lightness. (0 - 100)
	 */
	public constructor(h: number | string, s: number | string, l: number | string) {
		this.h = Number(h);
		this.s = Number(s);
		this.l = Number(l);

		this.valid();
	}

	public valid(): boolean {
		if (this.h < 0 || this.h > 360) throw `Invalid Hue range. Must be between 0 and 360, and it is ${this.h}`;
		if (this.s < 0 || this.s > 100) throw `Invalid Saturation range. Must be between 0 and 100, and it is ${this.s}`;
		if (this.l < 0 || this.l > 100) throw `Invalid Lightness range. Must be between 0 and 100, and it is ${this.l}`;
		return true;
	}

	public get hex(): HEX {
		return this.rgb.hex;
	}

	public get rgb(): RGB {
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

	public get hsl(): HSL {
		return this;
	}

	public get b10(): B10 {
		return this.hex.b10;
	}

	public toString(): string {
		return String(`hsl(${this.h}, ${this.s}, ${this.l})`);
	}

	public static hue2rgb(p: number, q: number, t: number): number {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (((q - p) * 6) * t);
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (((q - p) * ((2 / 3) - t)) * 6);
		return p;
	}

}

import { B10 } from './B10';
import { HEX } from './HEX';
import { RGB } from './RGB';
