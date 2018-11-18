const { IPCMonitor } = require('../../index');

module.exports = class extends IPCMonitor {

	async run({ userID }) {
		const user = await this.client.users.fetch(userID).catch(() => null);
		if (user) {
			await user.settings.sync();
			return user.settings.toJSON();
		}
		return null;
	}

};
