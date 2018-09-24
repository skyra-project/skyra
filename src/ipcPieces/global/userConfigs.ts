const { API } = require('../../index');

module.exports = class extends API {

	async run({ userID }) {
		const user = await this.client.users.fetch(userID).catch(() => null);
		if (user) {
			await user.settings.sync();
			return { response: user.settings.toJSON() };
		}
		return null;
	}

};
