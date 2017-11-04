const Piece = require('./interfaces/Piece');

class Event {

	/**
     * @typedef {Object} EventOptions
     * @memberof Event
     * @property {string} [name = theFileName] The name of the event
     * @property {boolean} [enabled=true] Whether the event is enabled or not
     */

	/**
     * @param {Client} client The Discord client
     * @param {string} dir The path to the core or user event pieces folder
     * @param {string} file The path from the pieces folder to the event file
     * @param {EventOptions} [options={}] The Event options
     */
	constructor(client, dir, file, options = {}) {
		/**
         * @type {Client}
         */
		this.client = client;

		/**
         * The directory to where this event piece is stored
         * @type {string}
         */
		this.dir = dir;

		/**
         * The file location where this event is stored
         * @type {string}
         */
		this.file = file;

		/**
         * The name of the event
         * @type {string}
         */
		this.name = options.name || file.slice(0, -3);

		/**
         * The type of piece this is
         * @type {string}
         */
		this.type = 'event';

		/**
         * If the event is enabled or not
         * @type {boolean}
         */
		this.enabled = 'enabled' in options ? options.enabled : true;
	}

	/**
     * A wrapper for the run method, to easily disable/enable events
     * @param {any} param The event parameters emited
     * @private
     * @returns {void}
     */
	_run(...args) {
		if (this.enabled) this.run(...args);
	}

	/**
     * The run method to be overwritten in actual event handlers
     * @param {any} param The event parameters emited
     * @abstract
     * @returns {void}
     */
	run() {
		// Defined in extension Classes
	}

	/**
     * The init method to be optionaly overwritten in actual events
     * @abstract
     * @returns {Promise<void>}
     */
	async init() {
		// Optionally defined in extension Classes
	}

	// left for documentation
	/* eslint-disable no-empty-function */
	async reload() {}
	unload() {}
	disable() {}
	enable() {}
	/* eslint-enable no-empty-function */

}

Piece.applyToClass(Event);

module.exports = Event;
