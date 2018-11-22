import * as Resolver from '../structures/color';
import { B10 } from '../structures/color/B10';
import { HEX } from '../structures/color/HEX';
import { HSL } from '../structures/color/HSL';
import { RGB } from '../structures/color/RGB';

const REGEXP = {
	B10: /^\d{1,8}$/,
	HEX: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/i,
	HEX_EXEC: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/i,
	HSL: /^hsl\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)$/i,
	HSL_EXEC: /^hsl\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)$/i,
	RANDOM: /^r|random$/i,
	RGB: /^rgba?\(\d{1,3},\s?\d{1,3},\s?\d{1,3}(?:,.+)?\)$/i,
	RGB_EXEC: /^rgba?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})(?:,.+)?\)$/i
};

export class Color {

	public static parse(input: string): HEX | B10 | RGB | HSL {
		if (REGEXP.RANDOM.test(input)) return Color._generateRandom();
		const output = Color._HEX(input)
			|| Color._B10(input)
			|| Color._RGB(input)
			|| Color._HSL(input);

		if (output !== null) return output;
		throw `${input} is not a supported type.`;
	}

	public static generateHexadecimal(): string {
		return [
			Color.generateBetween(255, 200).toString(16),
			Color.generateBetween(255, 200).toString(16),
			Color.generateBetween(255, 200).toString(16)
		].join('');
	}

	public static generateBetween(max: number, min: number): number {
		return Math.floor(Math.random() * (max - min)) + 1 + min;
	}

	public static luminance(r: number, g: number, b: number): number {
		return (0.299 * (r ** 2)) + (0.587 * (g ** 2)) + (0.114 * (b ** 2));
	}

	public static hexConcat(r: number, g: number, b: number): string {
		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	}

	public static _generateRandom(): HEX {
		const hex = new Resolver.HEX(
			Color.generateBetween(255, 200).toString(16),
			Color.generateBetween(255, 200).toString(16),
			Color.generateBetween(255, 200).toString(16)
		);

		return {
			get hex(): HEX { return hex; },
			get rgb(): RGB { return hex.rgb; },
			get hsl(): HSL { return hex.hsl; },
			get b10(): B10 { return hex.b10; }
		} as HEX;
	}

	public static _HEX(input: string): HEX {
		if (!REGEXP.HEX.test(input)) return null;
		let raw = REGEXP.HEX_EXEC.exec(input)[1];
		if (raw.length === 3) raw = raw.split('').map((char) => char + char).join('');
		const hex = new Resolver.HEX(raw.substring(0, 2), raw.substring(2, 4), raw.substring(4, 6));

		return {
			get hex(): HEX { return hex; },
			get rgb(): RGB { return hex.rgb; },
			get hsl(): HSL { return hex.hsl; },
			get b10(): B10 { return hex.b10; }
		} as HEX;
	}

	public static _RGB(input: string): RGB {
		if (!REGEXP.RGB.test(input)) return null;
		const raw = REGEXP.RGB_EXEC.exec(input);
		const rgb = new Resolver.RGB(parseInt(raw[1]), parseInt(raw[2]), parseInt(raw[3]));

		return {
			get hex(): HEX { return rgb.hex; },
			get rgb(): RGB { return rgb; },
			get hsl(): HSL { return rgb.hsl; },
			get b10(): B10 { return rgb.b10; }
		} as RGB;
	}

	public static _HSL(input: string): HSL {
		if (!REGEXP.HSL.test(input)) return null;
		const raw = REGEXP.HSL_EXEC.exec(input);
		const hsl = new Resolver.HSL(parseInt(raw[1]), parseInt(raw[2]), parseInt(raw[3]));

		return {
			get hex(): HEX { return hsl.hex; },
			get rgb(): RGB { return hsl.rgb; },
			get hsl(): HSL { return hsl; },
			get b10(): B10 { return hsl.b10; }
		} as HSL;
	}

	public static _B10(input: string): B10 {
		if (!REGEXP.B10.test(input)) return null;
		const b10 = new Resolver.B10(input);

		return {
			get hex(): HEX { return b10.hex; },
			get rgb(): RGB { return b10.rgb; },
			get hsl(): HSL { return b10.hsl; },
			get b10(): B10 { return b10; }
		} as B10;
	}

}
