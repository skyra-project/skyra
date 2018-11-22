export class B10 {

	private value: number;

	/**
	 * B10 Parser.
	 * @param value Base10 (0 - 0xFFFFFF)
	 */
	public constructor(value: string | number) {
		this.value = Number(value);
		this.valid();
	}

	public valid(): boolean {
		if (this.value < 0 || this.value > 0xFFFFFF) throw 'Color must be within the range 0 - 16777215 (0xFFFFFF).';
		return true;
	}

	public get hex(): HEX {
		const hex = this.value.toString(16).padStart(6, '0');
		return new HEX(hex.substring(0, 2), hex.substring(2, 4), hex.substring(4, 6));
	}

	public get rgb(): RGB {
		return this.hex.rgb;
	}

	public get hsl(): HSL {
		return this.hex.hsl;
	}

	public get b10(): B10 {
		return this;
	}

	public toString(): string {
		return String(this.value);
	}

}

import { HEX } from './HEX';
import { HSL } from './HSL';
import { RGB } from './RGB';
