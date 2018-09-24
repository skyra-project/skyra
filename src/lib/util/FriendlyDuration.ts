/* eslint no-bitwise: "off" */

/**
 * The FriendlyDuration static class in charge of humanify the duration timestamps
 * @since 2.1.0
 * @version 2.0.0
 */
class FriendlyDuration {

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
	public static formatDate(date, language) {
		let dateFormat = FriendlyDuration._dateFormats.get(language);
		if (!dateFormat) {
			if (Intl.DateTimeFormat.supportedLocalesOf(language).length === 0) language = 'en-US';
			dateFormat = new Intl.DateTimeFormat(language, INTL_OPTIONS);
			FriendlyDuration._dateFormats.set(language, dateFormat);
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
	public static duration(duration, assets) {
		const result = FriendlyDuration._parse(duration);
		const output = [];

		for (const type of UNIT_TYPES)
			if (result[type]) output.push(FriendlyDuration._addUnit(result[type], assets[type]));

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
	public static _addUnit(time, unit) {
		if (time in unit) return `${time} ${unit[time]}`;
		return `${time} ${unit.DEFAULT}`;
	}

	/**
	 * Parse the duration
	 * @since 3.0.0
	 * @param {number} duration The duration in milliseconds to parse
	 * @returns {Object}
	 * @private
	 */
	public static _parse(duration) {
		const output = {};
		for (const unit of UNIT_TYPES) {
			const amount = FriendlyDuration._parseUnit(duration, unit);
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
	public static _parseUnit(time, unit) {
		// NOTE: The |0 converts any number into a 32-bit integer,
		// trimming the decimals at an incredibly speed as it does
		// data conversion and is significantly faster than Math.floor.
		// However, this also limits its range to 2^31: 2147483648,
		// which is, invalid (you cannot have a number to represent
		// 2147483648 weeks, that's an invalid date).
		return ((time / TIME_TOKENS[unit]) % UNIT_DISTANCES[unit]) | 0;
	}

}

/**
 * The supported time types
 * @since 3.0.0
 * @type {Readonly<TimeParserTimeTypes>}
 */
const TIME_TYPES = Object.freeze({
	MILLISECOND: 'MILLISECOND',
	SECOND: 'SECOND',
	MINUTE: 'MINUTE',
	HOUR: 'HOUR',
	DAY: 'DAY',
	WEEK: 'WEEK',
	MONTH: 'MONTH',
	YEAR: 'YEAR'
});

/**
 * The duration of each time type in milliseconds
 * @since 3.0.0
 * @type {Readonly<TimeParserTimeTokens>}
 */
const TIME_TOKENS = Object.freeze({
	[TIME_TYPES.MILLISECOND]: 1,
	[TIME_TYPES.SECOND]: 1000,
	[TIME_TYPES.MINUTE]: 1000 * 60,
	[TIME_TYPES.HOUR]: 1000 * 60 * 60,
	[TIME_TYPES.DAY]: 1000 * 60 * 60 * 24,
	[TIME_TYPES.WEEK]: 1000 * 60 * 60 * 24 * 7,
	// 29.53059 days is the official duration of a month: https://en.wikipedia.org/wiki/Month
	[TIME_TYPES.MONTH]: 2628000000,
	[TIME_TYPES.YEAR]: 31536000000
});

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
FriendlyDuration._dateFormats = new Map();

module.exports = FriendlyDuration;
