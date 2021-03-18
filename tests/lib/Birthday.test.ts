import { yearIsLeap } from '#lib/birthday';

describe('Birthday', () => {
	describe('yearIsLeap', () => {
		test('GIVEN 2019 THEN returns false', () => {
			expect(yearIsLeap(2019)).toBe(false);
		});

		test('GIVEN 2020 THEN returns true', () => {
			expect(yearIsLeap(2020)).toBe(true);
		});

		test('GIVEN 1900 THEN returns false', () => {
			expect(yearIsLeap(1900)).toBe(false);
		});
	});
});
