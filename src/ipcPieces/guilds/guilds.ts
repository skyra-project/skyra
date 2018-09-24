const { API, ToJSON } = require('../../index');

module.exports = class extends API {

	public run() {
		return this.client.guilds.map(ToJSON.guild);
	}

};
