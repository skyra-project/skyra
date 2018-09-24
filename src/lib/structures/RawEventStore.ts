const { Store } = require('klasa');
const RawEvent = require('./RawEvent');

class RawEventStore extends Store {

	/**
	 * Constructs our APIStore for use in Klasa
	 * @since 3.0.0
	 * @param {KlasaClient} client The Klasa Client
	 */
	public constructor(client) {
		super(client, 'rawEvents', RawEvent);
	}

}

module.exports = RawEventStore;
