/* eslint-disable @typescript-eslint/dot-notation */
import {
	IncomingRunRegExpPayload,
	IncomingType,
	NoId,
	OutgoingNoContentPayload,
	OutgoingRegExpMatchPayload,
	OutgoingType,
	WorkerManager
} from '#lib/moderation/workers';

describe('WorkerManager', () => {
	let handler = new WorkerManager(2);
	const regExp = /hello/g;

	afterEach(async () => {
		await handler.destroy();
		handler = new WorkerManager(2);
	});

	afterAll(async () => {
		await handler.destroy();
	});

	test('GIVEN new instance THEN has initial data', async () => {
		expect(handler.workers.length).toBe(2);

		const start0 = jest.spyOn(handler.workers[0], 'start' as any);
		const start1 = jest.spyOn(handler.workers[1], 'start' as any);

		const destroy0 = jest.spyOn(handler.workers[0], 'destroy' as any);
		const destroy1 = jest.spyOn(handler.workers[1], 'destroy' as any);

		await expect(handler.start()).resolves.toBeUndefined();

		expect(start0).toHaveBeenCalledTimes(1);
		expect(start1).toHaveBeenCalledTimes(1);
		expect(destroy0).not.toHaveBeenCalled();
		expect(destroy1).not.toHaveBeenCalled();

		await expect(handler.destroy()).resolves.toBeUndefined();

		expect(start0).toHaveBeenCalledTimes(1);
		expect(start1).toHaveBeenCalledTimes(1);
		expect(destroy0).toHaveBeenCalledTimes(1);
		expect(destroy1).toHaveBeenCalledTimes(1);
	});

	test('GIVEN getIdealWorker WHEN workers are idle THEN returns the first worker', () => {
		expect(handler['getIdealWorker']()).toStrictEqual(handler.workers[0]);
	});

	test('GIVEN data to process WHEN both workers are idle THEN the command runs in the first worker', async () => {
		await handler.start();

		const getIdealWorker = jest.spyOn(handler, 'getIdealWorker' as any);

		const given: NoId<IncomingRunRegExpPayload> = { type: IncomingType.RunRegExp, regExp, content: 'hello world!' };
		const expected: OutgoingRegExpMatchPayload = {
			id: 0,
			type: OutgoingType.RegExpMatch,
			filtered: '***** world!',
			highlighted: '__hello__ world!'
		};

		await expect(handler.send(given)).resolves.toEqual(expected);
		expect(getIdealWorker).toHaveBeenCalledTimes(1);
		expect(getIdealWorker).toHaveLastReturnedWith(handler.workers[0]);
	});

	test('GIVEN data to process WHEN the first worker is busy THEN the command runs in the second worker', async () => {
		await handler.start();

		const getIdealWorker = jest.spyOn(handler, 'getIdealWorker' as any);

		const given0: NoId<IncomingRunRegExpPayload> = { type: IncomingType.RunRegExp, regExp, content: 'hello world!' };
		const expected0: OutgoingRegExpMatchPayload = {
			id: 0,
			type: OutgoingType.RegExpMatch,
			filtered: '***** world!',
			highlighted: '__hello__ world!'
		};

		const given1: NoId<IncomingRunRegExpPayload> = { type: IncomingType.RunRegExp, regExp, content: 'nope' };
		const expected1: OutgoingNoContentPayload = { id: 0, type: OutgoingType.NoContent };

		const promise0 = expect(handler.send(given0)).resolves.toEqual(expected0);
		expect(getIdealWorker).toHaveBeenCalledTimes(1);
		expect(getIdealWorker).toHaveLastReturnedWith(handler.workers[0]);

		const promise1 = expect(handler.send(given1)).resolves.toEqual(expected1);
		expect(getIdealWorker).toHaveBeenCalledTimes(2);
		expect(getIdealWorker).toHaveLastReturnedWith(handler.workers[1]);

		await promise0;
		await promise1;
	});

	test('GIVEN a lot data to process THEN both workers get to work', async () => {
		await handler.start();

		const getIdealWorker = jest.spyOn(handler, 'getIdealWorker' as any);
		const send0 = jest.spyOn(handler.workers[0], 'send');
		const send1 = jest.spyOn(handler.workers[1], 'send');

		const given0: NoId<IncomingRunRegExpPayload> = { type: IncomingType.RunRegExp, regExp, content: 'hello world!' };
		const expected0 = OutgoingType.RegExpMatch;
		const given1: NoId<IncomingRunRegExpPayload> = { type: IncomingType.RunRegExp, regExp, content: 'nope' };
		const expected1 = OutgoingType.NoContent;

		const tests: { given: NoId<IncomingRunRegExpPayload>; expected: OutgoingType }[] = [];
		for (let i = 0; i < 5; ++i) tests.push({ given: given0, expected: expected0 });
		for (let i = 0; i < 20; ++i) tests.push({ given: given1, expected: expected1 });
		for (let i = 0; i < 25; ++i) tests.push({ given: given0, expected: expected0 });
		for (let i = 0; i < 10; ++i) tests.push({ given: given1, expected: expected1 });
		for (let i = 0; i < 25; ++i) tests.push({ given: given0, expected: expected0 });
		for (let i = 0; i < 15; ++i) tests.push({ given: given1, expected: expected1 });

		await Promise.all(tests.map((t) => expect(handler.send(t.given)).resolves.toHaveProperty('type', t.expected)));

		expect(getIdealWorker).toHaveBeenCalledTimes(100);
		expect(send0).toHaveBeenCalledTimes(50);
		expect(send1).toHaveBeenCalledTimes(50);
	});
});
