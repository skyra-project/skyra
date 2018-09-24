const ConnectFour = require('./ConnectFour');

module.exports = class ConnectFourManager {

	constructor(client) {
		/**
		 * The KlasaClient instance that manages this manager
		 * @since 3.0.0
		 * @type {KlasaClient}
		 */
		this.client = client;

		/**
		 * The matches
		 * @since 3.0.0
		 * @type {Map<string, ConnectFour>}
		 */
		this.matches = new Map();
	}

	/**
	 * Check if a channel has a running match
	 * @since 3.0.0
	 * @param {string} channel The channel to check for
	 * @returns {boolean}
	 */
	has(channel) {
		return this.matches.has(channel);
	}

	/**
	 * Delete a match
	 * @since 3.0.0
	 * @param {string} channel The channel to delete
	 * @returns {boolean}
	 */
	delete(channel) {
		const match = this.matches.get(channel);
		if (match) {
			this.matches.delete(channel);
			match.dispose();
			return true;
		}
		return false;
	}

	/**
	 * Allocate a match for a channel
	 * @since 3.0.0
	 * @param {string} channel The channel to allocate the channel for
	 * @param {KlasaUser} challenger The challenger KlasaUser instance
	 * @param {KlasaUser} challengee The challengee KlasaUser instance
	 * @returns {Function}
	 */
	alloc(channel, challenger, challengee) {
		if (this.matches.has(channel)) return null;
		this.matches.set(channel, null);
		return this._alloc.bind(this, channel, challenger, challengee);
	}

	/**
	 * Create a new match for a channel
	 * @since 3.0.0
	 * @param {string} channel The channel to set the match to
	 * @param {KlasaUser} challenger The challenger KlasaUser instance
	 * @param {KlasaUser} challengee The challengee KlasaUser instance
	 * @returns {ConnectFour}
	 */
	create(channel, challenger, challengee) {
		if (this.matches.has(channel)) return null;
		const match = new ConnectFour(challenger, challengee);
		this.matches.set(channel, match);
		return match;
	}

	/**
	 * If true is passed to accept, this will create a new match.
	 * @since 3.0.0
	 * @param {string} channel The channel to allocate the channel for
	 * @param {KlasaUser} challenger The challenger KlasaUser instance
	 * @param {KlasaUser} challengee The challengee KlasaUser instance
	 * @param {boolean} accept Whether the allocation is accepted
	 * @returns {?ConnectFour}
	 * @private
	 */
	_alloc(channel, challenger, challengee, accept) {
		this.matches.delete(channel);
		if (accept) return this.create(channel, challenger, challengee);
		return null;
	}

};
