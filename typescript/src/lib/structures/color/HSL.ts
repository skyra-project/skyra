import { LanguageKeys } from '#lib/i18n/languageKeys';
import { UserError } from '@sapphire/framework';
import type { ColorHandler } from './index';

export class HSL implements ColorHandler {
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

		this.check();
	}

	public check() {
		if (this.h < 0 || this.h > 360) {
			throw new UserError({ identifier: LanguageKeys.Colors.InvalidHslHue, context: { value: this.h } });
		}
		if (this.s < 0 || this.s > 100) {
			throw new UserError({ identifier: LanguageKeys.Colors.InvalidHslSaturation, context: { value: this.s } });
		}
		if (this.l < 0 || this.l > 100) {
			throw new UserError({ identifier: LanguageKeys.Colors.InvalidHslLightness, context: { value: this.l } });
		}
	}

	public get hex() {
		return this.rgb.hex;
	}

	public get rgb() {
		const h = this.h / 360;
		const s = this.s / 100;
		const l = this.l / 100;
		/* Parse HSL to RGB */
		let r: number;
		let g: number;
		let b: number;

		if (s === 0) {
			/* Achromatic */
			r = l;
			g = l;
			b = l;
		} else {
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = HSL.hue2rgb(p, q, h + 1 / 3);
			g = HSL.hue2rgb(p, q, h);
			b = HSL.hue2rgb(p, q, h - 1 / 3);
		}
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		return new RGB(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
	}

	public get hsl() {
		return this;
	}

	public get b10() {
		return this.hex.b10;
	}

	public toString() {
		return String(`hsl(${this.h}, ${this.s}, ${this.l})`);
	}

	public static hue2rgb(p: number, q: number, t: number) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	}
}

import { RGB } from './RGB';
