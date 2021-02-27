import { hasAtLeastOneKeyInMap, isNullishOrEmpty, isNullishOrZero } from '#utils/comparators';

describe('comparators', () => {
	describe('isNullishOrZero', () => {
		test('GIVEN undefined THEN passes test', () => {
			expect(isNullishOrZero(undefined)).toBe(true);
		});

		test('GIVEN null THEN passes test', () => {
			expect(isNullishOrZero(null)).toBe(true);
		});

		test('GIVEN 0 THEN passes test', () => {
			expect(isNullishOrZero(0)).toBe(true);
		});

		test('GIVEN "" THEN does not pass test', () => {
			expect(isNullishOrZero('')).toBe(false);
		});
	});

	describe('isNullishOrEmpty', () => {
		test('GIVEN undefined THEN passes test', () => {
			expect(isNullishOrEmpty(undefined)).toBe(true);
		});

		test('GIVEN null THEN passes test', () => {
			expect(isNullishOrEmpty(null)).toBe(true);
		});

		test('GIVEN 0 THEN does not pass test', () => {
			expect(isNullishOrEmpty(0)).toBe(false);
		});

		test('GIVEN "" THEN does passes test', () => {
			expect(isNullishOrEmpty('')).toBe(true);
		});
	});

	describe('hasAtLeastOneKeyInMap', () => {
		test('GIVEN empty map and empty array THEN does not pass test', () => {
			expect(hasAtLeastOneKeyInMap(new Map<string, string>([]), [])).toEqual(false);
		});

		test('GIVEN filled map and empty array THEN does not pass test', () => {
			expect(
				hasAtLeastOneKeyInMap(
					new Map<string, string>([['foo', 'bar']]),
					[]
				)
			).toEqual(false);
		});

		test('GIVEN empty map and filled array THEN does not pass test', () => {
			expect(hasAtLeastOneKeyInMap(new Map<string, string>([]), ['foo'])).toEqual(false);
		});

		test('GIVEN filled map and filled array with at least one common key THEN passes test', () => {
			expect(
				hasAtLeastOneKeyInMap(
					new Map<string, string>([['foo', 'bar']]),
					['world', 'baz', 'foo']
				)
			).toEqual(true);
		});

		test('GIVEN filled map and filled array with no common keys THEN fails test', () => {
			expect(
				hasAtLeastOneKeyInMap(
					new Map<string, string>([['foo', 'bar']]),
					['world', 'baz']
				)
			).toEqual(false);
		});
	});
});
