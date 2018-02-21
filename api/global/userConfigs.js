const { API } = require('../../index');

module.exports = class extends API {

	async run({ userID }) {
		const user = await this.client.users.fetch(userID).catch(() => null);
		if (user) {
			if (user.configs._syncStatus) await user.configs._syncStatus;
			return user.configs.toJSON();
		}
		return null;
	}

};
