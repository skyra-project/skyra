const { Event } = require('../index');

module.exports = class extends Event {

	async run(message) {
		message.reply(await this.client.ipcPieces.run(message));
	}

};
