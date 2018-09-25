const { Event } = require('../index');

export default class extends Event {

	public async run(message) {
		const { response, success } = await this.client.ipcPieces.run(message);
		message.reply({ response, success });
	}

}
