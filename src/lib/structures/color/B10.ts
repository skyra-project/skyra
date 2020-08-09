import { ColorHandler } from './index';

export class B10 implements ColorHandler {
	public value: number;

	/**
	 * B10 Parser.
	 * @param value Base10 (0 - 0xFFFFFF)
	 */
	public constructor(value: string | number) {
		this.value = Number(value);
		this.check();
	}

	public check() {
		if (this.value < 0 || this.value > 0xffffff) throw 'Color must be within the range 0 - 16777215 (0xFFFFFF).';
	}

	public get hex() {
		const hex = this.value.toString(16).padStart(6, '0');
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		return new HEX(hex.substring(0, 2), hex.substring(2, 4), hex.substring(4, 6));
	}

	public get rgb() {
		return this.hex.rgb;
	}

	public get hsl() {
		return this.hex.hsl;
	}

	public get b10() {
		return this;
	}

	public toString() {
		return String(this.value);
	}
}

import { HEX } from './HEX';
