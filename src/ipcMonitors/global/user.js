const { IPCMonitor, ToJSON } = require('../../index');

module.exports = class extends IPCMonitor {

	async run({ userID }) {
		try {
			const user = await this.client.users.fetch(userID);
			return ToJSON.user(user);
		} catch (error) {
			return null;
		}
	}

};
