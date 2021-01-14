import { sleep } from '#utils/Promisified/sleep';

test('sleep(cozy)', async () => {
	const pending = sleep(1);

	const result = await pending;
	expect(result).toBe(undefined);
});
