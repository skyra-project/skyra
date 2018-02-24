const { API, toJSON } = require('../../index');

module.exports = class extends API {

	run() {
		return this.client.guilds.map(toJSON.guild);
	}

};
