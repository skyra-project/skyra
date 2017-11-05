const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

class Duration {

	static parse(duration) {
		return [
			Math.floor(duration / DAY),
			Math.floor((duration / HOUR) % 24),
			Math.floor((duration / MINUTE) % 60),
			Math.floor((duration / SECOND) % 60)
		];
	}

	static duration(duration, assets, short = false) {
		const [td, th, tm, ts] = this.parse(duration);

		const method = short ? this._addShortUnit : this._addUnit;

		return (method(td, assets.DAY)
			+ method(th, assets.HOUR)
			+ method(tm, assets.MINUTE)
			+ method(ts, assets.SECOND)).trim();
	}

	static _addUnit(unit, time) {
		if (unit > 1) return `${unit} ${time.PLURAL} `;
		if (unit === 1) return `${unit} ${time.SING} `;
		return '';
	}

	static _addShortUnit(unit, time) {
		if (unit > 1) return `${unit}${time.SHORT_PLURAL} `;
		if (unit === 1) return `${unit}${time.SHORT_SING} `;
		return '';
	}

}

module.exports = Duration;
