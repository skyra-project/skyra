import { andMix, orMix } from '#utils/common';

describe('util common comparators', () => {
	describe('andMix', () => {
		test('GIVEN two callbacks AND passing value THEN passes test', () => {
			const a = vi.fn((v: number) => v > 0);
			const b = vi.fn((v: number) => v < 1);

			const mix = andMix(a, b);
			expect(a.mock.calls.length).toBe(0);
			expect(b.mock.calls.length).toBe(0);

			expect(mix(0.5)).toBe(true);
			expect(a.mock.calls.length).toBe(1);
			expect(a.mock.results[0].value).toBe(true);

			expect(b.mock.calls.length).toBe(1);
			expect(b.mock.results[0].value).toBe(true);
		});

		test('GIVEN two callbacks AND a value failing the second THEN fails test', () => {
			const a = vi.fn((v: number) => v > 0);
			const b = vi.fn((v: number) => v < 1);

			const mix = andMix(a, b);
			expect(a.mock.calls.length).toBe(0);
			expect(b.mock.calls.length).toBe(0);

			expect(mix(1.5)).toBe(false);
			expect(a.mock.calls.length).toBe(1);
			expect(a.mock.results[0].value).toBe(true);

			expect(b.mock.calls.length).toBe(1);
			expect(b.mock.results[0].value).toBe(false);
		});

		test('GIVEN two callbacks AND a value failing the first THEN fails test and short-circuits the second', () => {
			const a = vi.fn((v: number) => v > 0);
			const b = vi.fn((v: number) => v < 1);

			const mix = andMix(a, b);
			expect(a.mock.calls.length).toBe(0);
			expect(b.mock.calls.length).toBe(0);

			expect(mix(-1)).toBe(false);
			expect(a.mock.calls.length).toBe(1);
			expect(a.mock.results[0].value).toBe(false);

			expect(b.mock.calls.length).toBe(0);
		});
	});

	describe('orMix', () => {
		test('GIVEN two callbacks AND passing value THEN passes test', () => {
			const a = vi.fn((v: number) => v > 0);
			const b = vi.fn((v: number) => v < 1);

			const mix = orMix(a, b);
			expect(a.mock.calls.length).toBe(0);
			expect(b.mock.calls.length).toBe(0);

			expect(mix(0.5)).toBe(true);
			expect(a.mock.calls.length).toBe(1);
			expect(a.mock.results[0].value).toBe(true);

			expect(b.mock.calls.length).toBe(0);
		});

		test('GIVEN two callbacks AND a value passing the first THEN passes test and short-circuits the second', () => {
			const a = vi.fn((v: number) => v > 0);
			const b = vi.fn((v: number) => v < 1);

			const mix = orMix(a, b);
			expect(a.mock.calls.length).toBe(0);
			expect(b.mock.calls.length).toBe(0);

			expect(mix(1.5)).toBe(true);
			expect(a.mock.calls.length).toBe(1);
			expect(a.mock.results[0].value).toBe(true);

			expect(b.mock.calls.length).toBe(0);
		});

		test('GIVEN two callbacks AND a value passing the second THEN passes test', () => {
			const a = vi.fn((v: number) => v > 0);
			const b = vi.fn((v: number) => v < 1);

			const mix = orMix(a, b);
			expect(a.mock.calls.length).toBe(0);
			expect(b.mock.calls.length).toBe(0);

			expect(mix(-1)).toBe(true);
			expect(a.mock.calls.length).toBe(1);
			expect(a.mock.results[0].value).toBe(false);

			expect(b.mock.calls.length).toBe(1);
			expect(b.mock.results[0].value).toBe(true);
		});

		test('GIVEN two callbacks AND a value failing both THEN fails test and short-circuits the second', () => {
			const a = vi.fn((v: number) => v < 0);
			const b = vi.fn((v: number) => v > 1);

			const mix = orMix(a, b);
			expect(a.mock.calls.length).toBe(0);
			expect(b.mock.calls.length).toBe(0);

			expect(mix(0.5)).toBe(false);
			expect(a.mock.calls.length).toBe(1);
			expect(a.mock.results[0].value).toBe(false);

			expect(b.mock.calls.length).toBe(1);
			expect(b.mock.results[0].value).toBe(false);
		});
	});
});
