const { API, toJSON } = require('../../index');

module.exports = class extends API {

	async run({ userID }) {
		try {
			const user = await this.client.users.fetch(userID);
			return { response: toJSON.user(user) };
		} catch (error) {
			return null;
		}
	}

};
