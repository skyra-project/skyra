import { DbSet } from '@lib/structures/DbSet';
import { Events } from '@lib/types/Enums';
import { User } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';

export default class extends Extendable {

	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public async fetchRank(this: User) {
		const list = await this.client.leaderboard.fetch();

		const rank = list.get(this.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = this.username;
		return rank.position;
	}

	public async increaseBalance(this: User, amount: number) {
		const { users } = await DbSet.connect();

		let current = 0;
		await users.lock([this.id], async id => {
			const user = await users.ensure(id);

			current = user.money;
			user.money -= amount;
			await user.save();

			return user.points;
		});

		this.client.emit(Events.MoneyTransaction, this, amount, current);
	}

	public async decreaseBalance(this: User, amount: number) {
		const { users } = await DbSet.connect();

		let current = 0;
		await users.lock([this.id], async id => {
			const user = await users.ensure(id);

			current = user.money;
			user.money -= amount;
			await user.save();

			return user.points;
		});

		this.client.emit(Events.MoneyTransaction, this, amount, current);
	}

}
