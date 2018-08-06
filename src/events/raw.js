const { Event } = require('../index');
const EVENTS = new Set();

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
			this.client.emit('wtf', `[RAWEVENT] ${piece.path}\n${error
				? error.stack ? error.stack : error : 'Unknown error'}`);
		}
	}

	async init() {
		EVENTS.clear();
		for (const key of this.client.rawEvents.keys()) EVENTS.add(key);
	}

};
