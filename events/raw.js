const { Event } = require('klasa');
const { join } = require('path');
const EVENTS = new Set([
	'GUILD_MEMBER_ADD',
	'GUILD_MEMBER_REMOVE',
	'MESSAGE_REACTION_ADD',
	'MESSAGE_REACTION_REMOVE',
	'PRESENCE_UPDATE',
	'USER_UPDATE'
]);

module.exports = class extends Event {

	run(data) {
		if (!EVENTS.has(data.t)) return;
		const piece = this.client.rawEvents.get(data.t);
		if (piece && data.d) this._runPiece(piece, data.d);
	}

	async _runPiece(piece, data) {
		try {
			const processed = await piece.process(data);
			if (processed) await piece.run(processed);
		} catch (error) {
			this.client.emit('wtf', `[RAWEVENT] ${join(piece.dir, ...piece.file)}\n${error
				? error.stack ? error.stack : error : 'Unknown error'}`);
		}
	}

};
