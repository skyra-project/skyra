import { sanitizeInput } from '#utils/util';

describe('util sanitizeInput', () => {
	test('GIVEN invalid characters THEN removes', () => {
		const input = 'h⣫╶ellཻུ۪⸙͎o';
		const expected = 'hello';

		const sanitized = sanitizeInput(input);

		expect(sanitized).toBe(expected);
	});

	test('GIVEN spaces THEN does not remove', () => {
		const input = 'h⣫╶el lཻུ۪⸙͎o';
		const expected = 'hel lo';

		const sanitized = sanitizeInput(input);

		expect(sanitized).toBe(expected);
	});

	test('GIVEN emojis THEN does not remove', () => {
		const input = '😄h⣫╶el 😢 lཻུ۪⸙͎o 🤣';
		const expected = '😄hel 😢 lo 🤣';

		const sanitized = sanitizeInput(input);

		expect(sanitized).toBe(expected);
	});
});
