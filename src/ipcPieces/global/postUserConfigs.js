const { API } = require('../../index');

module.exports = class extends API {

	async run({ userID, type, action, amount }) {
		const user = await this.client.users.fetch(userID).catch(() => null);
		if (!user) return null;
		await user.settings.sync();
		const oldAmount = user.settings[type];
		const newAmount = this.getNewAmount(action, oldAmount, amount);

		await user.settings.update(type, newAmount);
		return { response: newAmount };
	}

	getNewAmount(action, oldAmount, amount) {
		switch (action) {
			case 'set': return amount;
			case 'add': return oldAmount + amount;
			case 'remove': {
				if (amount > oldAmount) {
					throw {
						message: 'Failed to remove points from user. \'value\' is greater than \'current\'',
						data: {
							current: oldAmount,
							tried: amount,
							action: action
						},
						code: 403,
						type: 'PROFILE_REMOVE_VALUE'
					};
				}
				return oldAmount - amount;
			}
			default: throw null;
		}
	}

};
