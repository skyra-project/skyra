const { API } = require('../index');

module.exports = class extends API {

	public run() {
		return this.client.invite;
	}

};
