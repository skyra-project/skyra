const { API } = require('../index');

module.exports = class extends API {

	run() {
		return this.client.invite;
	}

};
