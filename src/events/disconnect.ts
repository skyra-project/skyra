const { Event } = require('../index');

export default class extends Event {

	public run(err) {
		this.client.console.error(`Disconnected | ${err.code}: ${err.reason}`);
	}

}
