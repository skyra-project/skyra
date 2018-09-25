const { API, ToJSON } = require('../../index');

export default class extends API {

	public run() {
		return this.client.guilds.map(ToJSON.guild);
	}

}
