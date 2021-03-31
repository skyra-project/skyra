export * from './B10.js';
export * from './HEX.js';
export * from './HSL.js';
export * from './RGB.js';

export interface ColorHandler {
	check(): void;
	toString(): string;
	readonly hex: import('./HEX').HEX;
	readonly rgb: import('./RGB').RGB;
	readonly hsl: import('./HSL').HSL;
	readonly b10: import('./B10').B10;
}
