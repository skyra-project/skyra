const { Event } = require('../index');

export default class extends Event {

	public run() {
		this.client.console.warn('Reconnecting...');
	}

}
