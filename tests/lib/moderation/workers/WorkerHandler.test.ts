/* eslint-disable @typescript-eslint/dot-notation */
import {
	IncomingType,
	OutgoingType,
	TimeoutError,
	WorkerHandler,
	type IncomingRunRegExpPayload,
	type NoId,
	type OutgoingPayload
} from '#lib/moderation/workers';

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
		expect(handler['threadId']).toBe(-1);
		expect(handler['online']).toBe(false);
		expect(handler['worker'].listenerCount('message')).toBe(1);
		expect(handler['worker'].listenerCount('online')).toBe(1);
		expect(handler['worker'].listenerCount('exit')).toBe(1);
		expect(handler['response']['id']).toBe(-1);
		expect(handler['response']['timer']).toBeNull();
		expect(handler['response']['handler']).toBeNull();

		const handleOnline = vi.spyOn(handler, 'handleOnline' as any);
		const handleExit = vi.spyOn(handler, 'handleExit' as any);
		const terminate = vi.spyOn(handler['worker'], 'terminate');

		await expect(handler.start()).resolves.toBeUndefined();

		expect(handleOnline).toHaveBeenCalledTimes(1);
		expect(handleExit).not.toHaveBeenCalled();
		expect(terminate).not.toHaveBeenCalled();

		expect(handler['threadId']).not.toBe(-1);
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

	test('GIVEN matching RunRegExp payload THEN resolves with a RegExpMatch payload', async () => {
		await handler.start();

		const handleMessage = vi.spyOn(handler, 'handleMessage' as any);

		const regExp = /hello/g;
		const given: NoId<IncomingRunRegExpPayload> = { type: IncomingType.RunRegExp, regExp, content: 'hello world!' };
		const expected: OutgoingPayload = {
			id: 0,
			type: OutgoingType.RegExpMatch,
			filtered: '***** world!',
			highlighted: '__hello__ world!'
		};

		await expect(handler.send(given)).resolves.toEqual(expected);
		expect(handleMessage).toHaveBeenCalledTimes(2);
	});

	test('GIVEN non-matching RunRegExp payload THEN resolves with a RegExpMatch payload', async () => {
		await handler.start();

		const handleMessage = vi.spyOn(handler, 'handleMessage' as any);

		const regExp = /hello/g;
		const given: NoId<IncomingRunRegExpPayload> = { type: IncomingType.RunRegExp, regExp, content: 'nope' };
		const expected: OutgoingPayload = {
			id: 0,
			type: OutgoingType.NoContent
		};

		await expect(handler.send(given)).resolves.toEqual(expected);
		expect(handleMessage).toHaveBeenCalledTimes(2);
	});

	test('GIVEN ReDoS payload THEN rejects with a TimeoutError', async () => {
		await handler.start();

		const handleMessage = vi.spyOn(handler, 'handleMessage' as any);
		const restart = vi.spyOn(handler, 'restart');
		const destroy = vi.spyOn(handler, 'destroy');
		const terminate = vi.spyOn(handler['worker'], 'terminate');
		const spawn = vi.spyOn(handler, 'spawn');
		const start = vi.spyOn(handler, 'start');

		const regExp = /([a-z]+)+$/;
		const given: NoId<IncomingRunRegExpPayload> = { type: IncomingType.RunRegExp, regExp, content: `${'a'.repeat(100)}!` };

		await expect(handler.send(given, 5)).rejects.toBeInstanceOf(TimeoutError);
		expect(handleMessage).not.toHaveBeenCalled();
		expect(restart).toHaveBeenCalledTimes(1);
		expect(destroy).toHaveBeenCalledTimes(1);
		expect(terminate).toHaveBeenCalledTimes(1);
		expect(spawn).toHaveBeenCalledTimes(1);
		expect(start).toHaveBeenCalledTimes(1);
	});
});
