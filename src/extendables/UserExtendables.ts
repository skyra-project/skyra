import { UserSettings } from '@lib/types/settings/UserSettings';
import { User } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';
import { EconomyTransactionReason, EconomyTransactionAction } from '@lib/types/influxSchema/Economy';
import { Events } from '@lib/types/Enums';

export default class extends Extendable {

	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public get profileLevel(this: User) {
		return Math.floor(0.2 * Math.sqrt(this.settings.get(UserSettings.Points)));
	}

	public async fetchRank(this: User) {
		const list = await this.client.leaderboard.fetch();

		const rank = list.get(this.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = this.username;
		return rank.position;
	}

	public async increaseBalance(this: User, amount: number, reason: EconomyTransactionReason = EconomyTransactionReason.NotDefined) {
		const current = this.settings.get(UserSettings.Money);
		await this.settings.update(UserSettings.Money, current + amount);
		this.client.emit(Events.MoneyTransaction, this, amount, current, EconomyTransactionAction.Add, reason);
	}

	public async decreaseBalance(this: User, amount: number, reason: EconomyTransactionReason = EconomyTransactionReason.NotDefined) {
		const current = this.settings.get(UserSettings.Money);
		await this.settings.update(UserSettings.Money, current - amount);
		this.client.emit(Events.MoneyTransaction, this, amount, current, EconomyTransactionAction.Remove, reason);
	}

}
