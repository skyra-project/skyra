import Resolver, { B10, HEX, HSL, RGB } from '../structures/color';
import { ColorOutput } from '../types/skyra';

const REGEXP: Record<string, RegExp> = {
	B10: /^\d{1,8}$/,
	HEX: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
	HEX_EXEC: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
	HSL: /^hsl\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)$/,
	HSL_EXEC: /^hsl\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)$/,
	RANDOM: /^(-r|--random)$/,
	RGB: /^rgba?\(\d{1,3},\s?\d{1,3},\s?\d{1,3}(?:,.+)?\)$/,
	RGB_EXEC: /^rgba?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})(?:,.+)?\)$/
};

/* eslint id-length: ["error", { "exceptions": ["h", "s", "l", "r", "g", "b", "d", "p", "q", "t"] }] */
class Color {

	public static Resolver: { B10: typeof B10; HEX: typeof HEX; HSL: typeof HSL; RGB: typeof RGB } = Resolver;

	public static parse(input: string): ColorOutput {
		if (REGEXP.RANDOM.test(input)) return Color._generateRandom();
		const output: ColorOutput | false = Color._HEX(input)
			|| Color._B10(input)
			|| Color._RGB(input)
			|| Color._HSL(input);

		if (output !== false) return output;
		throw `${input} is not a supported type.`;
	}

	public static generateHexadecimal(): string {
		return ((Color.generateBetween(255, 200) << 16) + (Color.generateBetween(255, 200) << 8) + Color.generateBetween(255, 200)).toString(16);
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

	private static _generateRandom(): ColorOutput {
		const hex: HEX = new HEX(
			Color.generateBetween(255, 200).toString(16),
			Color.generateBetween(255, 200).toString(16),
			Color.generateBetween(255, 200).toString(16)
		);

		return {
			get hex(): HEX { return hex; },
			get rgb(): RGB { return hex.rgb; },
			get hsl(): HSL { return hex.hsl; },
			get b10(): B10 { return hex.b10; }
		};
	}

	private static _HEX(input: string): ColorOutput | false {
		if (!REGEXP.HEX.test(input)) return false;
		let raw: string = (<RegExpExecArray> REGEXP.HEX_EXEC.exec(input))[1];
		if (raw.length === 3) raw = raw.split('').map((char) => char + char).join('');
		const hex: HEX = new HEX(raw.substring(0, 2), raw.substring(2, 4), raw.substring(4, 6));

		return {
			get hex(): HEX { return hex; },
			get rgb(): RGB { return hex.rgb; },
			get hsl(): HSL { return hex.hsl; },
			get b10(): B10 { return hex.b10; }
		};
	}

	private static _RGB(input: string): ColorOutput | false {
		if (!REGEXP.RGB.test(input)) return false;
		const raw: RegExpExecArray = <RegExpExecArray> REGEXP.RGB_EXEC.exec(input);
		const rgb: RGB = new RGB(parseInt(raw[1]), parseInt(raw[2]), parseInt(raw[3]));

		return {
			get hex(): HEX { return rgb.hex; },
			get rgb(): RGB { return rgb; },
			get hsl(): HSL { return rgb.hsl; },
			get b10(): B10 { return rgb.b10; }
		};
	}

	private static _HSL(input: string): ColorOutput | false {
		if (!REGEXP.HSL.test(input)) return false;
		const raw: RegExpExecArray = <RegExpExecArray> REGEXP.HSL_EXEC.exec(input);
		const hsl: HSL = new HSL(parseInt(raw[1]), parseInt(raw[2]), parseInt(raw[3]));

		return {
			get hex(): HEX { return hsl.hex; },
			get rgb(): RGB { return hsl.rgb; },
			get hsl(): HSL { return hsl; },
			get b10(): B10 { return hsl.b10; }
		};
	}

	private static _B10(input: string): ColorOutput | false {
		if (!REGEXP.B10.test(input)) return false;
		const b10: B10 = new B10(Number(input));

		return {
			get hex(): HEX { return b10.hex; },
			get rgb(): RGB { return b10.rgb; },
			get hsl(): HSL { return b10.hsl; },
			get b10(): B10 { return b10; }
		};
	}

}

export default Color;
