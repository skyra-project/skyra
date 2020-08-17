/* eslint-disable @typescript-eslint/explicit-member-accessibility, @typescript-eslint/unified-signatures */
import { AsyncQueue } from '@klasa/async-queue';
import { Cache } from '@klasa/cache';
import { TimerManager } from '@klasa/timer-manager';
import { UserCooldownEntity } from '@orm/entities/UserCooldownEntity';
import { UserGameIntegrationsEntity } from '@orm/entities/UserGameIntegrationsEntity';
import { UserProfileEntity } from '@orm/entities/UserProfileEntity';
import { EntityRepository, FindOneOptions, Repository } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
	public async ensure(id: string, options?: FindOneOptions<UserEntity>) {
		const previous = await this.findOne(id, options);
		if (previous) return previous;

		const data = new UserEntity();
		data.id = id;
		return data;
	}

	public async ensureProfile(id: string, options: FindOneOptions<UserEntity> = {}) {
		const user = await this.ensure(id, { ...options, relations: ['profile'] });
		if (!user.profile) {
			user.profile = new UserProfileEntity();
			user.profile.user = user;
		}

		return user as UserEntity & { profile: NonNullable<UserEntity['profile']> };
	}

	public async ensureGI(id: string, options: FindOneOptions<UserEntity> = {}) {
		const user = await this.ensure(id, { ...options, relations: ['gi'] });
		if (!user.gi) {
			user.gi = new UserGameIntegrationsEntity();
			user.gi.user = user;
		}

		return user as UserEntity & { gi: NonNullable<UserEntity['gi']> };
	}

	public async ensureCooldowns(id: string, options: FindOneOptions<UserEntity> = {}) {
		const user = await this.ensure(id, { ...options, relations: ['cooldowns'] });
		if (!user.cooldowns) {
			user.cooldowns = new UserCooldownEntity();
			user.cooldowns.user = user;
		}

		return user as UserEntity & { cooldowns: NonNullable<UserEntity['cooldowns']> };
	}

	public async ensureProfileAndCooldowns(id: string, options: FindOneOptions<UserEntity> = {}) {
		const user = await this.ensure(id, { ...options, relations: ['profile', 'cooldowns'] });
		if (!user.profile) {
			user.profile = new UserProfileEntity();
			user.profile.user = user;
		}

		if (!user.cooldowns) {
			user.cooldowns = new UserCooldownEntity();
			user.cooldowns.user = user;
		}

		return user as UserEntity & { profile: NonNullable<UserEntity['profile']>; cooldowns: NonNullable<UserEntity['cooldowns']> };
	}

	public async fetchSpouse(a: string, b: string): Promise<RawSpouseEntry | null> {
		const entries = await this.query(
			/* sql */ `SELECT * FROM user_spouses_user WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1);`,
			[a, b]
		);
		return entries.length ? entries[0] : null;
	}

	public async fetchSpouses(id: string) {
		const entries = (await this.query(/* sql */ `SELECT * FROM user_spouses_user WHERE user_id_1 = $1 OR user_id_2 = $1`, [
			id
		])) as RawSpouseEntry[];
		return entries.map((entry) => (entry.user_id_1 === id ? entry.user_id_2 : entry.user_id_1));
	}

	public async deleteSpouse(entry: RawSpouseEntry) {
		await this.query(/* sql */ `DELETE FROM user_spouses_user WHERE user_id_1 = $1 AND user_id_2 = $2`, [entry.user_id_1, entry.user_id_2]);
	}

	public async lock<T>(targets: readonly string[], cb: (...targets: readonly string[]) => Promise<T>): Promise<T> {
		if (targets.length !== new Set(targets).size) {
			throw new Error(`Duplicated targets detected: '${targets.join("', '")}'`);
		}

		const queues = targets.map((target) => {
			const existing = UserRepository.queues.get(target);
			if (existing) return existing;

			const created = new AsyncQueue();
			UserRepository.queues.set(target, created);
			return created;
		});

		await Promise.all(queues.map((queue) => queue.wait()));

		try {
			return await cb(...targets);
		} finally {
			for (const queue of queues) queue.shift();
		}
	}

	private static queues = new Cache<string, AsyncQueue>();
}

TimerManager.setInterval(() => {
	UserRepository['queues'].sweep((value) => value.remaining === 0);
}, 60000);

interface RawSpouseEntry {
	user_id_1: string;
	user_id_2: string;
}
