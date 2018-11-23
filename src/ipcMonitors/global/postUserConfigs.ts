import { IPCMonitor } from '../../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public async run({ userID, type, action, amount }: any): Promise<number> {
		const user = await this.client.users.fetch(userID).catch(() => null);
		if (!user) return null;
		await user.settings.sync();
		const oldAmount = user.settings[type];
		const newAmount = this.getNewAmount(action, oldAmount, amount);

		await user.settings.update(type, newAmount);
		return newAmount;
	}

	public getNewAmount(action: 'set' | 'add' | 'remove', oldAmount: number, amount: number): number {
		switch (action) {
			case 'set': return amount;
			case 'add': return oldAmount + amount;
			case 'remove': {
				if (amount > oldAmount) throw 'Failed to remove points from user. \'value\' is greater than \'current\'';
				return oldAmount - amount;
			}
			default: throw null;
		}
	}

}
