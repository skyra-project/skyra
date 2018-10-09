/// <reference path="../../index.d.ts" />
const { Store } = require('klasa');
// @ts-ignore
const { Constants: { Events } } = require('discord.js');
const RawEvent = require('./RawEvent');

class RawEventStore extends Store {

	constructor(client) {
		super(client, 'rawEvents', RawEvent);
	}

	run(data) {
		const piece = data.d && super.get(Events[data.t]);
		if (piece) this._run(piece, data.d);
	}

	/**
	 * Run a RawEvent
	 * @since 4.0.0
	 * @param {RawEvent} piece The piece to run
	 * @param {Object} data The data payload
	 */
	async _run(piece, data) {
		try {
			// @ts-ignore
			await piece.run(data);
		} catch (error) {
			this.client.emit('wtf', `[RAWEVENT] ${piece.path}\n${error
				? error.stack ? error.stack : error : 'Unknown error'}`);
		}
	}

}

module.exports = RawEventStore;
