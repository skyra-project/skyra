module.exports = class B10 {

	/**
     * B10 Parser.
     * @param {number} value Base10 (0 - 0xFFFFFF)
     */
	constructor(value) {
		this.value = Number(value);

		this.valid();
	}

	valid() {
		if (this.value < 0 || this.value > 0xFFFFFF) throw 'Color must be within the range 0 - 16777215 (0xFFFFFF).';
		return true;
	}

	get hex() {
		const hex = this.value.toString(16).padStart(6, '0');
		return new HEX(hex.substring(0, 2), hex.substring(2, 4), hex.substring(4, 6));
	}

	get rgb() {
		return this.hex.rgb;
	}

	get hsl() {
		return this.hex.hsl;
	}

	get b10() {
		return this;
	}

	toString() {
		return String(this.value);
	}

};

const HEX = require('./HEX');
