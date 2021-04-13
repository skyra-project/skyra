import { ResponseError, Status } from '#lib/grpc';
import { Store } from '@sapphire/pieces';

const { grpc } = Store.injectedContext;

describe('Grpc', () => {
	beforeAll(async () => {
		await grpc.start();
	});

	afterAll(() => {
		grpc.destroy();
	});

	describe('Members', () => {
		const entry = { guildId: '1', userId: '1' };

		beforeEach(() => grpc.members.resetPoints(entry));

		describe('Add Points', () => {
			test('GIVEN 50 experience points on non-existing entry THEN returns 50', async () => {
				const result = await grpc.members.addPoints({ ...entry, amount: 50 });
				expect(result.status).toBe(Status.SUCCESS);
				expect(result.experience).toBe(50);
			});

			test('GIVEN 50 experience points on existing entry THEN returns 50 plus the existing amount', async () => {
				await grpc.members.addPoints({ ...entry, amount: 50 });
				const result = await grpc.members.addPoints({ ...entry, amount: 200 });
				expect(result.status).toBe(Status.SUCCESS);
				expect(result.experience).toBe(250);
			});
		});

		describe('Get Points', () => {
			test('GIVEN a non-existing entry THEN returns 0', async () => {
				const result = await grpc.members.getPoints(entry);
				expect(result.status).toBe(Status.SUCCESS);
				expect(result.experience).toBe(0);
			});

			test('GIVEN an existing entry THEN returns the existing amount', async () => {
				await grpc.members.addPoints({ ...entry, amount: 100 });
				const result = await grpc.members.getPoints(entry);
				expect(result.status).toBe(Status.SUCCESS);
				expect(result.experience).toBe(100);
			});
		});

		describe('Reset Points', () => {
			test('GIVEN a non-existing entry THEN returns 0', async () => {
				const resetResult = await grpc.members.resetPoints(entry);
				expect(resetResult.status).toBe(Status.SUCCESS);

				const getResult = await grpc.members.getPoints(entry);
				expect(getResult.status).toBe(Status.SUCCESS);
				expect(getResult.experience).toBe(0);
			});

			test('GIVEN an existing entry THEN returns the existing amount', async () => {
				await grpc.members.addPoints({ ...entry, amount: 100 });

				const resetResult = await grpc.members.resetPoints(entry);
				expect(resetResult.status).toBe(Status.SUCCESS);

				const getResult = await grpc.members.getPoints(entry);
				expect(getResult.status).toBe(Status.SUCCESS);
				expect(getResult.experience).toBe(0);
			});
		});

		describe('Set Points', () => {
			test('GIVEN a non-existing entry THEN creates entry with the correct experience points', async () => {
				const resetResult = await grpc.members.setPoints({ ...entry, amount: 300 });
				expect(resetResult.status).toBe(Status.SUCCESS);

				const getResult = await grpc.members.getPoints(entry);
				expect(getResult.status).toBe(Status.SUCCESS);
				expect(getResult.experience).toBe(300);
			});

			test('GIVEN a existing entry THEN creates entry with the correct experience points', async () => {
				await grpc.members.addPoints({ ...entry, amount: 100 });

				const resetResult = await grpc.members.setPoints({ ...entry, amount: 350 });
				expect(resetResult.status).toBe(Status.SUCCESS);

				const getResult = await grpc.members.getPoints(entry);
				expect(getResult.status).toBe(Status.SUCCESS);
				expect(getResult.experience).toBe(350);
			});
		});

		describe('Exceptions', () => {
			test('GIVEN an identifier that is too long THEN generates Status.Failed', async () => {
				const id = '1'.repeat(20);
				const promise = grpc.members.setPoints({ guildId: id, userId: id, amount: 100 });
				await expect(promise).rejects.toThrowError("Received non-OK response: '1'");
				await expect(promise).rejects.toBeInstanceOf(ResponseError);
			});
		});
	});

	describe('Users', () => {
		const authorId = '1';
		const targetId = '2';
		const authorQuery = { id: authorId };
		const targetQuery = { id: targetId };
		// const authorTargetQuery = { authorId, targetId };

		beforeEach(async () => {
			await grpc.users.resetPoints(authorQuery);
			await grpc.users.resetPoints(targetQuery);
		});

		describe('Add Points', () => {
			test('GIVEN 50 experience points on non-existing entry THEN returns 50', async () => {
				const result = await grpc.users.addPoints({ ...authorQuery, amount: 50 });
				expect(result.status).toBe(Status.SUCCESS);
				expect(result.amount).toBe(50);
			});

			test('GIVEN 50 experience points on existing entry THEN returns 50 plus the existing amount', async () => {
				await grpc.users.addPoints({ ...authorQuery, amount: 50 });
				const result = await grpc.users.addPoints({ ...authorQuery, amount: 200 });
				expect(result.status).toBe(Status.SUCCESS);
				expect(result.amount).toBe(250);
			});
		});

		describe('Get Points', () => {
			test('GIVEN a non-existing entry THEN returns 0', async () => {
				const result = await grpc.users.getPoints(authorQuery);
				expect(result.status).toBe(Status.SUCCESS);
				expect(result.amount).toBe(0);
			});

			test('GIVEN an existing entry THEN returns the existing amount', async () => {
				await grpc.users.addPoints({ ...authorQuery, amount: 100 });
				const result = await grpc.users.getPoints(authorQuery);
				expect(result.status).toBe(Status.SUCCESS);
				expect(result.amount).toBe(100);
			});
		});

		describe('Reset Points', () => {
			test('GIVEN a non-existing entry THEN returns 0', async () => {
				const resetResult = await grpc.users.resetPoints(authorQuery);
				expect(resetResult.status).toBe(Status.SUCCESS);

				const getResult = await grpc.users.getPoints(authorQuery);
				expect(getResult.status).toBe(Status.SUCCESS);
				expect(getResult.amount).toBe(0);
			});

			test('GIVEN an existing entry THEN returns the existing amount', async () => {
				await grpc.users.addPoints({ ...authorQuery, amount: 100 });

				const resetResult = await grpc.users.resetPoints(authorQuery);
				expect(resetResult.status).toBe(Status.SUCCESS);

				const getResult = await grpc.users.getPoints(authorQuery);
				expect(getResult.status).toBe(Status.SUCCESS);
				expect(getResult.amount).toBe(0);
			});
		});

		describe('Exceptions', () => {
			test('GIVEN an identifier that is too long THEN generates Status.Failed', async () => {
				const id = '1'.repeat(20);
				const promise = grpc.users.addPoints({ id, amount: 100 });
				await expect(promise).rejects.toThrowError("Received non-OK response: '1'");
				await expect(promise).rejects.toBeInstanceOf(ResponseError);
			});
		});
	});
});
