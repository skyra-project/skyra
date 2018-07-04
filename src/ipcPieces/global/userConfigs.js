const { API } = require('../../index');

module.exports = class extends API {

	async run({ userID }) {
		const user = await this.client.users.fetch(userID).catch(() => null);
		if (user) {
			await user.configs.waitSync();
			return { response: user.configs.toJSON() };
		}
		return null;
	}

};
