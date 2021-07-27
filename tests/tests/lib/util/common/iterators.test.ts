import { iteratorAt } from '#utils/common';

describe('util common iterators', () => {
	describe('iteratorAt', () => {
		function* generate() {
			for (let i = 0; i < 100; ++i) yield i;
		}

		test('GIVEN 0 THEN give first element', () => {
			expect(iteratorAt(generate(), 0)).toBe(0);
		});

		test('GIVEN 5 THEN give fifth element', () => {
			expect(iteratorAt(generate(), 5)).toBe(5);
		});

		test('GIVEN negative number THEN give first element', () => {
			expect(iteratorAt(generate(), -1)).toBe(null);
		});
	});
});
