const { API } = require('../index');

export default class extends API {

	public run() {
		return this.client.usageStatus;
	}

}
