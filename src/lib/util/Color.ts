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

export function parse(input: string): HEX | B10 | RGB | HSL {
	if (REGEXP.RANDOM.test(input)) return _generateRandom();
	const output = _HEX(input)
		|| _B10(input)
		|| _RGB(input)
		|| _HSL(input);

	if (output !== null) return output;
	throw `${input} is not a supported type.`;
}

export function generateHexadecimal() {
	return [
		generateBetween(255, 200).toString(16),
		generateBetween(255, 200).toString(16),
		generateBetween(255, 200).toString(16)
	].join('');
}

function generateBetween(max: number, min: number): number {
	return Math.floor(Math.random() * (max - min)) + 1 + min;
}

export function luminance(r: number, g: number, b: number): number {
	return (0.299 * (r ** 2)) + (0.587 * (g ** 2)) + (0.114 * (b ** 2));
}

export function hexConcat(r: number, g: number, b: number) {
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function _generateRandom(): HEX {
	return new Resolver.HEX(
		generateBetween(255, 200).toString(16),
		generateBetween(255, 200).toString(16),
		generateBetween(255, 200).toString(16)
	);
}

function _HEX(input: string): HEX {
	if (!REGEXP.HEX.test(input)) return null;
	let raw = REGEXP.HEX_EXEC.exec(input)[1];
	if (raw.length === 3) raw = raw.split('').map(char => char + char).join('');
	return new Resolver.HEX(raw.substring(0, 2), raw.substring(2, 4), raw.substring(4, 6));
}

function _RGB(input: string): RGB {
	if (!REGEXP.RGB.test(input)) return null;
	const raw = REGEXP.RGB_EXEC.exec(input);
	return new Resolver.RGB(parseInt(raw[1], 10), parseInt(raw[2], 10), parseInt(raw[3], 10));
}

function _HSL(input: string): HSL {
	if (!REGEXP.HSL.test(input)) return null;
	const raw = REGEXP.HSL_EXEC.exec(input);
	return new Resolver.HSL(parseInt(raw[1], 10), parseInt(raw[2], 10), parseInt(raw[3], 10));
}

function _B10(input: string): B10 {
	if (!REGEXP.B10.test(input)) return null;
	return new Resolver.B10(input);
}
