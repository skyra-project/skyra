/**
 * The supported time types
 */
enum TimeTypes {
	Millisecond = 'MILLISECOND',
	Second = 'SECOND',
	Minute = 'MINUTE',
	Hour = 'HOUR',
	Day = 'DAY',
	Week = 'WEEK',
	Month = 'MONTH',
	Year = 'YEAR'
}

/**
 * The duration of each time type in milliseconds
 */
const TIME_TOKENS = new Map<TimeTypes, number>([
	[TimeTypes.Millisecond, 1],
	[TimeTypes.Second, 1000],
	[TimeTypes.Minute, 1000 * 60],
	[TimeTypes.Hour, 1000 * 60 * 60],
	[TimeTypes.Day, 1000 * 60 * 60 * 24],
	[TimeTypes.Week, 1000 * 60 * 60 * 24 * 7],
	// 29.53059 days is the official duration of a month: https://en.wikipedia.org/wiki/Month
	[TimeTypes.Month, 2628000000],
	[TimeTypes.Year, 31536000000]
]);

const UNIT_DISTANCES = new Map<TimeTypes, number>([
	[TimeTypes.Day, TIME_TOKENS.get(TimeTypes.Week)! / TIME_TOKENS.get(TimeTypes.Day)!],
	[TimeTypes.Hour, TIME_TOKENS.get(TimeTypes.Day)! / TIME_TOKENS.get(TimeTypes.Hour)!],
	[TimeTypes.Minute, TIME_TOKENS.get(TimeTypes.Hour)! / TIME_TOKENS.get(TimeTypes.Minute)!],
	[TimeTypes.Month, TIME_TOKENS.get(TimeTypes.Year)! / TIME_TOKENS.get(TimeTypes.Month)!],
	[TimeTypes.Second, TIME_TOKENS.get(TimeTypes.Minute)! / TIME_TOKENS.get(TimeTypes.Second)!],
	[TimeTypes.Week, TIME_TOKENS.get(TimeTypes.Month)! / TIME_TOKENS.get(TimeTypes.Week)!],
	[TimeTypes.Year, Infinity]
]);

/**
 * The unit types supported for parsing
 */
const UNIT_TYPES = Object.freeze([
	TimeTypes.Week,
	TimeTypes.Day,
	TimeTypes.Hour,
	TimeTypes.Minute,
	TimeTypes.Second
]);

/**
 * Display the duration
 * @param duration The duration in milliseconds to parse and display
 * @param assets The language assets
 */
export default function(duration: number, assets: DurationFormatAssetsTime) {
	const result = _parse(duration);
	const output: string[] = [];

	for (const [timeType, amount] of result) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		output.push(_addUnit(amount, assets[timeType]));
	}

	return output.join(' ') || _addUnit(0, assets.SECOND);
}

/**
 * Adds an unit, if non zero
 * @param time The duration of said unit
 * @param unit The unit language assets
 */
function _addUnit(time: number, unit: DurationFormatAssetsUnit) {
	if (time in unit) return `${time} ${unit[time]}`;
	return `${time} ${unit.DEFAULT}`;
}

/**
 * Parse the duration
 * @param duration The duration in milliseconds to parse
 */
function _parse(duration: number): [TimeTypes, number][] {
	const output: [TimeTypes, number][] = [];
	for (const unit of UNIT_TYPES) {
		const amount = _parseUnit(duration, unit);
		if (amount === 0) continue;
		output.push([unit, amount]);
		duration -= amount * TIME_TOKENS.get(unit)!;
	}
	return output;
}

/**
 * Parses the time duration by extracting the amount of units
 * given both the duration and the unit
 * @param time The time duration to parse
 * @param unit The unit
 */
function _parseUnit(time: number, unit: TimeTypes): number {
	// NOTE: The |0 converts any number into a 32-bit integer,
	// trimming the decimals at an incredibly speed as it does
	// data conversion and is significantly faster than Math.floor.
	// However, this also limits its range to 2^31: 2147483648,
	// which is, invalid (you cannot have a number to represent
	// 2147483648 weeks, that's an invalid date).
	return ((time / TIME_TOKENS.get(unit)!) % UNIT_DISTANCES.get(unit)!) | 0;
}

interface DurationFormatAssetsUnit extends Record<number, string> {
	DEFAULT: string;
}

interface DurationFormatAssetsTime {
	[TimeTypes.Second]: DurationFormatAssetsUnit;
	[TimeTypes.Minute]: DurationFormatAssetsUnit;
	[TimeTypes.Hour]: DurationFormatAssetsUnit;
	[TimeTypes.Day]: DurationFormatAssetsUnit;
	[TimeTypes.Week]: DurationFormatAssetsUnit;
}
