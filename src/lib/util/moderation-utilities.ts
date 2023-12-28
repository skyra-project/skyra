import type { SkyraArgs } from '#lib/structures';
import { seconds } from '#utils/common';

export const SecondsOptions = ['s', 'sec', 'secs', 'second', 'seconds'] as const;
export const MinutesOptions = ['m', 'min', 'mins', 'minute', 'minutes'] as const;
export const HoursOptions = ['h', 'hr', 'hrs', 'hour', 'hours'] as const;
export const DaysOptions = ['d', 'day', 'days'] as const;
export const TimeOptions = [...SecondsOptions, ...MinutesOptions, ...HoursOptions, ...DaysOptions] as const;

const maximum = seconds.fromDays(7);

export function getSeconds(args: SkyraArgs) {
	const result =
		getUnit(args, SecondsOptions) +
		getUnit(args, MinutesOptions, seconds.fromMinutes) +
		getUnit(args, HoursOptions, seconds.fromHours) +
		getUnit(args, DaysOptions, seconds.fromDays);
	return Math.min(result, maximum);
}

function getUnit(args: SkyraArgs, flags: readonly string[], cb?: (value: number) => number) {
	const value = args.getOption(...flags);
	if (value === null) return 0;

	const parsed = Number(value);
	return Number.isInteger(parsed) ? (cb ? cb(parsed) : parsed) : 0;
}
