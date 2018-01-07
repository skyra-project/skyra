const { TIME_TOKENS, TIME_TYPES } = require('./TimeParser');

/* eslint no-bitwise: "off" */

/**
 * The Duration static class in charge of humanify the duration timestamps
 * @since 2.1.0
 * @version 2.0.0
 */
class Duration {

	/**
	 * @typedef  {Object} DurationFormatAssetsTime
	 * @property {DurationFormatAssetsUnit} WEEK
	 * @property {DurationFormatAssetsUnit} DAY
	 * @property {DurationFormatAssetsUnit} HOUR
	 * @property {DurationFormatAssetsUnit} MINUTE
	 * @property {DurationFormatAssetsUnit} SECOND
	 */

	/**
	 * @typedef  {Object} DurationFormatAssetsUnit
	 * @property {string} [1]
	 * @property {string} [2]
	 * @property {string} [3]
	 * @property {string} [4]
	 * @property {string} [5]
	 * @property {string} [6]
	 * @property {string} DEFAULT
	 */

	/**
	 * Display an i18n-formatted date
	 * @since 3.0.0
	 * @param {(number|Date)} date The date to show
	 * @param {string} language The language to display
	 * @returns {string}
	 */
	static formatDate(date, language) {
		let dateFormat = Duration._dateFormats.get(language);
		if (!dateFormat) {
			if (Intl.DateTimeFormat.supportedLocalesOf(language).length === 0) language = 'en-US';
			dateFormat = new Intl.DateTimeFormat(language, INTL_OPTIONS);
			Duration._dateFormats.set(language, dateFormat);
		}
		return dateFormat.format(date);
	}

	/**
	 * Display the duration
	 * @since 2.1.0
	 * @param {number} duration The duration in milliseconds to parse and display
	 * @param {DurationFormatAssetsTime} assets The language assets
	 * @returns {string}
	 */
	static duration(duration, assets) {
		const result = Duration._parse(duration);
		const output = [];

		for (const type of UNIT_TYPES)
			if (result[type]) output.push(Duration._addUnit(result[type], assets[type]));

		return output.join(' ');
	}

	/**
	 * Adds an unit, if non zero
	 * @since 2.1.0
	 * @param {number} time The duration of said unit
	 * @param {DurationFormatAssetsUnit} unit The unit language assets
	 * @returns {string}
	 * @private
	 */
	static _addUnit(time, unit) {
		if (time in unit) return `${time} ${unit[time]}`;
		return `${time} ${unit.DEFAULT}`;
	}

	/**
	 * Parse the duration
	 * @since 3.0.0
	 * @param {number} duration The duration in milliseconds to parse
	 * @returns {number[]}
	 * @private
	 */
	static _parse(duration) {
		const output = {};
		for (const unit of UNIT_TYPES) {
			const amount = Duration._parseUnit(duration, unit);
			if (amount === 0) continue;
			output[unit] = amount;
			duration = Math.ceil(duration - (amount * TIME_TOKENS[unit]));
			// if (duration < TIME_TOKENS[unit]) break;
		}
		return output;
	}

	/**
	 * Parses the time duration by extracting the amount of units
	 * given both the duration and the unit
	 * @since 3.0.0
	 * @param {number} time The time duration to parse
	 * @param {string} unit The unit
	 * @returns {number}
	 * @private
	 */
	static _parseUnit(time, unit) {
		// NOTE: The |0 converts any number into a 32-bit integer,
		// trimming the decimals at an incredibly speed as it does
		// data conversion and is significantly faster than Math.floor.
		// However, this also limits its range to 2^31: 2147483648,
		// which is, invalid (you cannot have a number to represent
		// 2147483648 weeks, that's an invalid date).
		return ((time / TIME_TOKENS[unit]) % UNIT_DISTANCES[unit]) | 0;
	}

}

const UNIT_DISTANCES = Object.freeze({
	SECOND: TIME_TOKENS.MINUTE / TIME_TOKENS.SECOND,
	MINUTE: TIME_TOKENS.HOUR / TIME_TOKENS.MINUTE,
	HOUR: TIME_TOKENS.DAY / TIME_TOKENS.HOUR,
	DAY: TIME_TOKENS.WEEK / TIME_TOKENS.DAY,
	WEEK: TIME_TOKENS.MONTH / TIME_TOKENS.WEEK,
	MONTH: TIME_TOKENS.YEAR / TIME_TOKENS.MONTH,
	YEAR: Infinity
});

/**
 * The unit types supported for parsing
 * @since 3.0.0
 * @type {ReadonlyArray<string>}
 */
const UNIT_TYPES = Object.freeze([
	TIME_TYPES.YEAR,
	TIME_TYPES.MONTH,
	TIME_TYPES.WEEK,
	TIME_TYPES.DAY,
	TIME_TYPES.HOUR,
	TIME_TYPES.MINUTE,
	TIME_TYPES.SECOND
]);

/**
 * @typedef  {Object} DurationIntlOptions
 * @property {string} timeZoneName
 * @property {string} weekday
 * @property {string} year
 * @property {string} month
 * @property {string} day
 * @property {string} hour
 * @property {string} minute
 * @property {string} second
 */

/**
 * The Intl options
 * @since 3.0.0
 * @type {Readonly<DurationIntlOptions>}
 * @private
 */
const INTL_OPTIONS = Object.freeze({
	timeZoneName: 'short',
	weekday: 'long',
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	second: 'numeric'
});

/**
 * The cached DateFormats
 * @since 3.0.0
 * @type {Map<string, Intl.DateTimeFormat>}
 * @private
 */
Duration._dateFormats = new Map();

module.exports = Duration;
