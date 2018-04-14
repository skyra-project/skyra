const { Store, util: { isObject } } = require('klasa');
const API = require('./API');

const NOT_FOUND = { success: false, response: null, type: 'NO_MATCH', code: 404 };
const DEFAULTS_SUCCESS = [['success', true], ['response', null], ['type', 'SUCCESS'], ['code', 200]];
const DEFAULTS_FAILURE = [['success', false], ['response', null], ['type', 'UNKNOWN'], ['code', 403]];
const hasKey = Object.prototype.hasOwnProperty.call;

class APIStore extends Store {

	/**
	 * @typedef {Object} APIResponse
	 * @property {boolean} success
	 * @property {*} response
	 * @property {string} type
	 * @property {number} code
	 */

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
	 * @returns {Promise<APIResponse>}
	 */
	async run(data) {
		const piece = this.get(data.route);
		return piece ? this.runPiece(piece, data) : NOT_FOUND;
	}

	/**
	 * Run the piece
	 * @since 3.0.0
	 * @param {API} piece The Piece to run
	 * @param {*} data The data to process
	 * @returns {Promise<APIResponse>}
	 */
	async runPiece(piece, data) {
		try {
			const result = await piece.run(data);
			if (result === null) return NOT_FOUND;
			if (!isObject(result)) return { success: true, response: result, type: 'SUCCESS', code: 200 };

			for (const [key, value] of DEFAULTS_SUCCESS) if (!hasKey(result, key)) result[key] = value;
			return result;
		} catch (error) {
			if (error === null) return NOT_FOUND;
			if (!isObject(error)) return { success: false, response: error, type: 'UNKNOWN', code: 403 };

			for (const [key, value] of DEFAULTS_FAILURE) if (!hasKey(error, key)) error[key] = value;
			return error;
		}
	}

}

module.exports = APIStore;
