/* eslint-disable @typescript-eslint/dot-notation */
import { WorkerHandler } from '#lib/moderation/workers';

describe('WorkerHandler', () => {
	let handler = new WorkerHandler();

	afterEach(async () => {
		await handler.destroy();
		handler = new WorkerHandler();
	});

	afterAll(async () => {
		await handler.destroy();
	});

	test('GIVEN new instance THEN has initial data', async () => {
		expect(handler.remaining).toBe(0);
		expect(handler.lastHeartBeat).toBe(0);
		expect(handler['id']).toBe(0);
		expect(handler['threadID']).toBe(-1);
		expect(handler['online']).toBe(false);
		expect(handler['worker'].listenerCount('message')).toBe(1);
		expect(handler['worker'].listenerCount('online')).toBe(1);
		expect(handler['worker'].listenerCount('exit')).toBe(1);
		expect(handler['response']['id']).toBe(-1);
		expect(handler['response']['timer']).toBeNull();
		expect(handler['response']['handler']).toBeNull();

		const handleOnline = jest.spyOn(handler, 'handleOnline' as any);
		const handleExit = jest.spyOn(handler, 'handleExit' as any);
		const terminate = jest.spyOn(handler['worker'], 'terminate');

		expect(handleOnline).not.toHaveBeenCalled();
		expect(handleExit).not.toHaveBeenCalled();
		expect(terminate).not.toHaveBeenCalled();

		await expect(handler.start()).resolves.toBeUndefined();

		expect(handleOnline).toHaveBeenCalledTimes(1);
		expect(handleExit).not.toHaveBeenCalled();
		expect(terminate).not.toHaveBeenCalled();

		expect(handler['threadID']).not.toBe(-1);
		expect(handler['online']).toBe(true);
		expect(handler['worker'].listenerCount('message')).toBe(1);
		expect(handler['worker'].listenerCount('online')).toBe(0);
		expect(handler['worker'].listenerCount('exit')).toBe(1);

		await expect(handler.destroy()).resolves.toBeUndefined();

		expect(handleOnline).toHaveBeenCalledTimes(1);
		expect(handleExit).toHaveBeenCalledTimes(1);
		expect(terminate).toHaveBeenCalledTimes(1);

		expect(handler['online']).toBe(false);
		expect(handler['worker'].listenerCount('message')).toBe(0);
		expect(handler['worker'].listenerCount('online')).toBe(0);
		expect(handler['worker'].listenerCount('exit')).toBe(0);
	});
});
