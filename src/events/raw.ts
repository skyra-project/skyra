const { Event } = require('../index');

export default class extends Event {

	public run(data) {
		const piece = this.client.rawEvents.get(data.t);
		if (piece && data.d) this._runPiece(piece, data.d);
	}

	public async _runPiece(piece, data) {
		try {
			const processed = await piece.process(data);
			if (processed) await piece.run(processed);
		} catch (error) {
			this.client.emit('wtf', `[RAWEVENT] ${piece.path}\n${error
				? error.stack ? error.stack : error : 'Unknown error'}`);
		}
	}

}
