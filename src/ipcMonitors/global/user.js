const { IPCMonitor, ToJSON } = require('../../index');

module.exports = class extends IPCMonitor {

	async run({ userID }) {
		try {
			const user = await this.client.users.fetch(userID);
			return { response: ToJSON.user(user) };
		} catch (error) {
			return null;
		}
	}

};
