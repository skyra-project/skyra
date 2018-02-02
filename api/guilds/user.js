const { API, toJSON } = require('../../index');

module.exports = class extends API {

	run({ userID }) {
		return this.client.users.fetch(userID)
			.then(toJSON.user)
			.catch(() => null);
	}

};
