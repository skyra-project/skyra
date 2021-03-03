export * from './B10';
export * from './HEX';
export * from './HSL';
export * from './RGB';

export interface ColorHandler {
	check(): void;
	toString(): string;
	readonly hex: import('./HEX').HEX;
	readonly rgb: import('./RGB').RGB;
	readonly hsl: import('./HSL').HSL;
	readonly b10: import('./B10').B10;
}
