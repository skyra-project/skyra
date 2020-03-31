import { parseRange } from '@utils/util';

describe('Utils', () => {
	describe('parseRange', () => {
		test('GIVEN 1..5 THEN returns [1, 2, 3, 4, 5]', () => {
			expect(parseRange('1..5')).toStrictEqual([1, 2, 3, 4, 5]);
		});

		test('GIVEN 1..5,10 THEN returns [1, 2, 3, 4, 5, 10]', () => {
			expect(parseRange('1..5,10')).toStrictEqual([1, 2, 3, 4, 5, 10]);
		});

		test('GIVEN 1..5,10..12 THEN returns [1, 2, 3, 4, 5, 10, 11, 12]', () => {
			expect(parseRange('1..5,10..12')).toStrictEqual([1, 2, 3, 4, 5, 10, 11, 12]);
		});

		test('GIVEN 20..22,10..12,10..15,60..57 THEN [20, 21, 22, 10, 11, 12, 13, 14, 15, 57, 58, 59, 60]', () => {
			expect(parseRange('20..22,10..12,10..15,60..57')).toStrictEqual([20, 21, 22, 10, 11, 12, 13, 14, 15, 57, 58, 59, 60]);
		});

		test('GIVEN 1,2,2,2,1..2,2,2..1 THEN returns [1, 2]', () => {
			expect(parseRange('1,2,2,2,1..2,2,2..1')).toStrictEqual([1, 2]);
		});

		test('GIVEN 1..3,2,6,0,9 THEN returns [1, 2, 3, 6, 9]', () => {
			expect(parseRange('1..3,2,6,0,9')).toStrictEqual([1, 2, 3, 6, 9]);
		});

		test('GIVEN 1,2,3,6,10,12 THEN returns [1, 2, 3, 6, 10, 12]', () => {
			expect(parseRange('1,2,3,6,10,12')).toStrictEqual([1, 2, 3, 6, 10, 12]);
		});

		test('GIVEN 1,   2, 3,   6, THEN returns [1, 2, 3, 6]', () => {
			expect(parseRange('1,   2, 3,   6,')).toStrictEqual([1, 2, 3, 6]);
		});

		test('GIVEN 1,..,,   2, 3,   6, THEN returns [1, 2, 3, 6]', () => {
			expect(parseRange('1,..,,   2, 3,   6,')).toStrictEqual([1, 2, 3, 6]);
		});

		test('GIVEN 1,..,,   2, 3, ..  6, THEN returns [1, 2, 3]', () => {
			expect(parseRange('1,..,,   2, 3, ..  6,')).toStrictEqual([1, 2, 3]);
		});

		test('GIVEN 1,..,,   2, 3,4 ..  6, THEN returns [1, 2, 3, 4, 5, 6]', () => {
			expect(parseRange('1,..,,   2, 3,4 ..  6,')).toStrictEqual([1, 2, 3, 4, 5, 6]);
		});
	});
});
