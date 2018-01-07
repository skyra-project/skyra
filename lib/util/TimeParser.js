/**
 * The TimeParser class in charge to convert human duration into milliseconds
 * @since 3.0.0
 * @version 2.0.0
 */
class TimeParser {

	/**
	 * Parse human times into an actual machine's timestamp
	 * @since 3.0.0
	 * @param {string} pattern The pattern to parse
	 */
	constructor(pattern) {
		/**
		 * The pattern given
		 * @since 3.0.0
		 * @type {number}
		 */
		this.pattern = pattern.trim();

		/**
		 * The target date
		 * @since 3.0.0
		 * @type {Date}
		 */
		this.date = new Date();

		/**
		 * The target timestamp
		 * @since 3.0.0
		 * @type {number}
		 */
		this.timestamp = this.date.getTime();

		/**
		 * NOTE: This exists instead of doing Date.now() because of unaccuracy
		 * @since 3.0.0
		 * @type {number}
		 * @private
		 */
		this._start = this.timestamp;

		this._parse();
	}

	/**
	 * Get the duration between the final/parsed time and the current date
	 * @since 3.0.0
	 * @returns {number}
	 * @readonly
	 */
	get duration() {
		return this.timestamp - this._start;
	}

	/**
	 * Parse the pattern
	 * @since 3.0.0
	 * @private
	 */
	_parse() {
		const words = TimeParser.getTokens(this.pattern);
		let num = null;
		for (const word of words) {
			if (typeof word === 'number')
				num = word;
			else if (num)
				this._addTime(num, TimeParser.getType(word));
		}
	}

	/**
	 * Add an amount of time for a certain type
	 * @since 3.0.0
	 * @param {number} amount The number of the type to add
	 * @param {*} type The constant type value to add
	 * @private
	 */
	_addTime(amount, type) {
		switch (type) {
			case TimeParser.TIME_TYPES.MONTH: {
				this.timestamp = this.date.setUTCMonth(this.date.getUTCMonth() + amount);
				break;
			}
			case TimeParser.TIME_TYPES.YEAR: {
				this.timestamp = this.date.setUTCFullYear(this.date.getUTCFullYear() + amount);
				break;
			}
			default: {
				const unit = TimeParser.TIME_TOKENS[type];
				if (unit) {
					this.timestamp += amount * unit;
					this.date.setTime(this.timestamp);
				}
			}
		}
	}

	/**
	 * Get the token type from natural language to objective constant
	 * @since 3.0.0
	 * @param {string} type The type to find
	 * @returns {string}
	 */
	static getType(type) {
		switch (type) {
			case 'ms':
			case 'millisecond':
			case 'milliseconds':
				return TimeParser.TIME_TYPES.MILLISECOND;
			case 's':
			case 'sec':
			case 'secs':
			case 'second':
			case 'seconds':
				return TimeParser.TIME_TYPES.SECOND;
			case 'm':
			case 'min':
			case 'mins':
			case 'minute':
			case 'minutes':
				return TimeParser.TIME_TYPES.MINUTE;
			case 'h':
			case 'hs':
			case 'hour':
			case 'hours':
				return TimeParser.TIME_TYPES.HOUR;
			case 'd':
			case 'ds':
			case 'day':
			case 'days':
				return TimeParser.TIME_TYPES.DAY;
			case 'w':
			case 'ws':
			case 'week':
			case 'weeks':
				return TimeParser.TIME_TYPES.WEEK;
			case 'month':
			case 'months':
				return TimeParser.TIME_TYPES.MONTH;
			case 'y':
			case 'ys':
			case 'year':
			case 'years':
				return TimeParser.TIME_TYPES.YEAR;
			default:
				return null;
		}
	}

	/**
	 * Separate the text from the numbers
	 * Credits to: https://stackoverflow.com/questions/3370263/separate-integers-and-text-in-a-string
	 * @since 3.0.0
	 * @param {string} pattern The pattern to parse
	 * @returns {Array<string|number>}
	 */
	static getTokens(pattern) {
		pattern = pattern.replace(TimeParser.TOKEN_REPLACER, '');
		const tokens = [];
		let str = pattern;
		while (str) {
			const match = str.match(TimeParser.TOKEN_PARSER);
			if (!match) break;
			if (match[1]) tokens.push(match[1]);
			if (match[2]) tokens.push(Number(match[2]));

			str = match[3];
		}
		return tokens;
	}

	/**
	 * Check if a year is leap
	 * @since 3.0.0
	 * @param {(Date|number)} year The year to check
	 * @returns {boolean}
	 */
	static isLeapYear(year) {
		if (year instanceof Date) year = year.getUTCFullYear();
		return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
	}

}

/**
 * @typedef  {Object} TimeParserTimeTypes
 * @property {string} MILLISECOND
 * @property {string} SECOND
 * @property {string} MINUTE
 * @property {string} HOUR
 * @property {string} DAY
 * @property {string} WEEK
 * @property {string} MONTH
 * @property {string} YEAR
 * @memberof TimeParser
 */

/**
 * @typedef  {Object} TimeParserTimeTokens
 * @property {number} MILLISECOND
 * @property {number} SECOND
 * @property {number} MINUTE
 * @property {number} HOUR
 * @property {number} DAY
 * @property {number} WEEK
 * @property {number} MONTH
 * @property {number} YEAR
 * @memberof TimeParser
 */

/**
 * The natural language string token remover
 * @since 3.0.0
 * @type {RegExp}
 * @static
 */
TimeParser.TOKEN_REPLACER = /(,|\.| |\b(st|nd|rd|th)\b)+/g;

/**
 * The natural language string parser detection
 * @since 3.0.0
 * @type {Readonly<RegExp>}
 * @static
 */
TimeParser.TOKEN_PARSER = Object.freeze(/^(\D+)?(\d+)?(.*)$/);

/**
 * The supported time types
 * @since 3.0.0
 * @type {Readonly<TimeParserTimeTypes>}
 * @static
 */
TimeParser.TIME_TYPES = Object.freeze({
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
 * @static
 */
TimeParser.TIME_TOKENS = Object.freeze({
	[TimeParser.TIME_TYPES.MILLISECOND]: 1,
	[TimeParser.TIME_TYPES.SECOND]: 1000,
	[TimeParser.TIME_TYPES.MINUTE]: 1000 * 60,
	[TimeParser.TIME_TYPES.HOUR]: 1000 * 60 * 60,
	[TimeParser.TIME_TYPES.DAY]: 1000 * 60 * 60 * 24,
	[TimeParser.TIME_TYPES.WEEK]: 1000 * 60 * 60 * 24 * 7,
	// 29.53059 days is the official duration of a month: https://en.wikipedia.org/wiki/Month
	[TimeParser.TIME_TYPES.MONTH]: 2628000000,
	[TimeParser.TIME_TYPES.YEAR]: 31536000000
});

module.exports = TimeParser;
