const { Event } = require('klasa');
const EVENTS = new Set(['GUILD_MEMBER_REMOVE', 'MESSAGE_REACTION_ADD']);

module.exports = class extends Event {

	async run(data) {
		if (!EVENTS.has(data.t)) return;
		const piece = this.client.rawEvents.get(data.t);
		if (piece) {
			const processed = await piece.process(data.d);
			if (processed) piece.run().catch(error => this.client.emit('error', error));
		} else {
			this.client.emit('error', `The raw event ${data.t} does not exist.`);
		}
	}

};
