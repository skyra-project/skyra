import { andMix, hasAtLeastOneKeyInMap, isNullishOrEmpty, isNullishOrZero } from '#utils/comparators';

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
			expect(hasAtLeastOneKeyInMap(new Map<string, string>([['foo', 'bar']]), [])).toEqual(false);
		});

		test('GIVEN empty map and filled array THEN does not pass test', () => {
			expect(hasAtLeastOneKeyInMap(new Map<string, string>([]), ['foo'])).toEqual(false);
		});

		test('GIVEN filled map and filled array with at least one common key THEN passes test', () => {
			expect(hasAtLeastOneKeyInMap(new Map<string, string>([['foo', 'bar']]), ['world', 'baz', 'foo'])).toEqual(true);
		});

		test('GIVEN filled map and filled array with no common keys THEN fails test', () => {
			expect(hasAtLeastOneKeyInMap(new Map<string, string>([['foo', 'bar']]), ['world', 'baz'])).toEqual(false);
		});
	});

	describe('andMix', () => {
		test('GIVEN two callbacks AND passing value THEN passes test', () => {
			const a = jest.fn((v: number) => v > 0);
			const b = jest.fn((v: number) => v < 1);

			const mix = andMix([a, b]);
			expect(a.mock.calls.length).toBe(0);
			expect(b.mock.calls.length).toBe(0);

			expect(mix(0.5)).toBe(true);
			expect(a.mock.calls.length).toBe(1);
			expect(a.mock.results[0].value).toBe(true);

			expect(b.mock.calls.length).toBe(1);
			expect(b.mock.results[0].value).toBe(true);
		});

		test('GIVEN two callbacks AND a value failing the second THEN fails test', () => {
			const a = jest.fn((v: number) => v > 0);
			const b = jest.fn((v: number) => v < 1);

			const mix = andMix([a, b]);
			expect(a.mock.calls.length).toBe(0);
			expect(b.mock.calls.length).toBe(0);

			expect(mix(1.5)).toBe(false);
			expect(a.mock.calls.length).toBe(1);
			expect(a.mock.results[0].value).toBe(true);

			expect(b.mock.calls.length).toBe(1);
			expect(b.mock.results[0].value).toBe(false);
		});

		test('GIVEN two callbacks AND a value failing the first THEN fails test and short-circuits the second', () => {
			const a = jest.fn((v: number) => v > 0);
			const b = jest.fn((v: number) => v < 1);

			const mix = andMix([a, b]);
			expect(a.mock.calls.length).toBe(0);
			expect(b.mock.calls.length).toBe(0);

			expect(mix(-1)).toBe(false);
			expect(a.mock.calls.length).toBe(1);
			expect(a.mock.results[0].value).toBe(false);

			expect(b.mock.calls.length).toBe(0);
		});
	});
});
