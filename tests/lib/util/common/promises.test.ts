import { safeWrapPromise } from '#utils/common';
import { err, ok } from '@sapphire/framework';

describe('util common iterators', () => {
	describe('safeWrapPromise', () => {
		test('GIVEN passing promise THEN resolves with result', async () => {
			const value = 'Hello there';
			const result = safeWrapPromise(Promise.resolve(value));

			await expect(result).resolves.toStrictEqual(ok(value));
		});

		test('GIVEN failing promise THEN resolves with result', async () => {
			const error = new Error('Hello there');
			const result = safeWrapPromise(Promise.reject(error));

			await expect(result).resolves.toStrictEqual(err(error));
		});
	});
});
