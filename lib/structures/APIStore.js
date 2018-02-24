const { Store } = require('klasa');
const API = require('./API');

class APIStore extends Store {

	/**
	 * Constructs our APIStore for use in Klasa
	 * @since 3.0.0
	 * @param {KlasaClient} client The Klasa Client
	 */
	constructor(client) {
		super(client, 'ipcPieces', API);
	}

	/**
	 * Run the router
	 * @since 3.0.0
	 * @param {*} data The data to process
	 * @returns {Promise<{ response: string, success: boolean }>}
	 */
	async run(data) {
		const _result = (router => router ? router.run(data) : null)(this.get(data.route));
		const result = _result && _result instanceof Promise ? await _result : _result;
		if (!result) return { response: 'NO MATCH', success: false };
		return { response: typeof result === 'string' ? result : JSON.stringify(result), success: true };
	}

}

module.exports = APIStore;
