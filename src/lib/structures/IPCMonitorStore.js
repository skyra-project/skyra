const { Store } = require('klasa');
const IPCMonitor = require('./IPCMonitor');

class IPCMonitorStore extends Store {

	constructor(client) {
		super(client, 'ipcMonitors', IPCMonitor);
	}

	async run(message) {
		if (!Array.isArray(message.data) || message.data.length === 0 || message.data.length > 2) {
			this.client.emit('error', message.data);
			message.reply([0, 'INVALID_PAYLOAD']);
			return;
		}

		const [route, payload = null] = message.data;
		const monitor = this.get(route);
		if (!monitor) {
			message.reply([0, 'UNKNOWN_ROUTE']);
			return;
		}

		try {
			const result = await monitor.run(payload);
			message.reply([1, result]);
		} catch (error) {
			message.reply([0, error]);
		}
	}

}

module.exports = IPCMonitorStore;
