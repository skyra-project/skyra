import { Time } from '@utils/constants';
import friendlyDuration, { DurationFormatAssetsTime, TimeTypes } from '@utils/FriendlyDuration';

const TIMES: DurationFormatAssetsTime = {
	[TimeTypes.Year]: {
		1: 'year',
		DEFAULT: 'years'
	},
	[TimeTypes.Month]: {
		1: 'month',
		DEFAULT: 'months'
	},
	[TimeTypes.Week]: {
		1: 'week',
		DEFAULT: 'weeks'
	},
	[TimeTypes.Day]: {
		1: 'day',
		DEFAULT: 'days'
	},
	[TimeTypes.Hour]: {
		1: 'hour',
		DEFAULT: 'hours'
	},
	[TimeTypes.Minute]: {
		1: 'minute',
		DEFAULT: 'minutes'
	},
	[TimeTypes.Second]: {
		1: 'second',
		DEFAULT: 'seconds'
	}
};

function durationImpl(time: number, precision?: number) {
	return friendlyDuration(time, TIMES, precision);
}

describe('FriendlyDuration', () => {
	test('GIVEN 1 millisecond w/o precision THEN shows 0 seconds', () => {
		expect(durationImpl(1)).toEqual('0 seconds');
	});

	test('GIVEN 1000 millisecond w/ precision THEN shows 1 second', () => {
		expect(durationImpl(1000, 5)).toEqual('1 second');
	});

	test('GIVEN 1 day, 3 hours and 2 minutes w/o precision THEN shows 1 day 3 hours and 2 minutes', () => {
		expect(durationImpl(Time.Day + Time.Hour * 3 + Time.Minute * 2)).toEqual('1 day 3 hours 2 minutes');
	});

	test('GIVEN 1 day, 3 hours and 2 minutes w/ precision of 2 THEN shows 1 day and 3 hours', () => {
		expect(durationImpl(Time.Day + Time.Hour * 3 + Time.Minute * 2, 2)).toEqual('1 day 3 hours');
	});

	test('GIVEN negative duration THEN prepends hyphen', () => {
		expect(durationImpl(Time.Day * -1)).toEqual('-1 day');
	});

	test('GIVEN durations higher than 1 THEN shows plurals', () => {
		expect(durationImpl(Time.Day * 2 + Time.Hour * 2)).toEqual('2 days 2 hours');
	});
});
