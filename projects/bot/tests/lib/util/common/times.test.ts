import { seconds, minutes, hours, days, months, years } from '#utils/common';

describe('Time functions', () => {
	describe('seconds', () => {
		test('GIVEN 1 second THEN returns 1000 milliseconds', () => {
			expect(seconds(1)).toEqual(1_000);
		});
	});

	describe('seconds.fromMilliseconds', () => {
		test('GIVEN 1000 milliseconds THEN returns 1 second', () => {
			expect(seconds.fromMilliseconds(1_000)).toEqual(1);
		});

		test('GIVEN 12440 milliseconds THEN returns 12 seconds', () => {
			expect(seconds.fromMilliseconds(12_440)).toEqual(12);
		});

		test('GIVEN 12450 milliseconds THEN returns 12 seconds', () => {
			expect(seconds.fromMilliseconds(12_450)).toEqual(12);
		});

		test('GIVEN 12460 milliseconds THEN returns 12 seconds', () => {
			expect(seconds.fromMilliseconds(12_460)).toEqual(12);
		});

		test('GIVEN 12540 milliseconds THEN returns 13 seconds', () => {
			expect(seconds.fromMilliseconds(12_540)).toEqual(13);
		});

		test('GIVEN 12550 milliseconds THEN returns 13 seconds', () => {
			expect(seconds.fromMilliseconds(12_550)).toEqual(13);
		});

		test('GIVEN 12560 milliseconds THEN returns 13 seconds', () => {
			expect(seconds.fromMilliseconds(12_560)).toEqual(13);
		});
	});

	describe('minutes', () => {
		test('GIVEN 1 minute THEN returns 60000 milliseconds', () => {
			expect(minutes(1)).toEqual(60_000);
		});
	});

	describe('minutes.toSeconds', () => {
		test('GIVEN 1 minute THEN returns 60 seconds', () => {
			expect(minutes.toSeconds(1)).toEqual(60);
		});
	});

	describe('hours', () => {
		test('GIVEN 1 hour THEN returns 60000 milliseconds', () => {
			expect(hours(1)).toEqual(3_600_000);
		});
	});

	describe('days', () => {
		test('GIVEN 1 day THEN returns 60000 milliseconds', () => {
			expect(days(1)).toEqual(86_400_000);
		});
	});

	describe('months', () => {
		test('GIVEN 1 month THEN returns 60000 milliseconds', () => {
			expect(months(1)).toEqual(2_628_000_000);
		});
	});

	describe('years', () => {
		test('GIVEN 1 year THEN returns 60000 milliseconds', () => {
			expect(years(1)).toEqual(31_536_000_000);
		});
	});
});
