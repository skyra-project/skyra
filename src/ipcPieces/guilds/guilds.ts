const { API, ToJSON } = require('../../index');

module.exports = class extends API {

	run() {
		return this.client.guilds.map(ToJSON.guild);
	}

};
