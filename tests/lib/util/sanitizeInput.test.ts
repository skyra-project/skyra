import { sanitizeInput } from '#utils/util';

describe('util sanitizeInput', () => {
	test('GIVEN invalid characters THEN removes', () => {
		const input = 'h⣫╶ell ཻུ۪⸙͎o';
		const expected = 'hello';

		const sanitized = sanitizeInput(input);

		expect(sanitized).toBe(expected);
	});
});
