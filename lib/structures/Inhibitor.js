const Piece = require('./interfaces/Piece');

class Inhibitor {

	/**
     * @typedef {Object} InhibitorOptions
     * @memberof Inhibitor
     * @property {string} [name = theFileName] The name of the inhibitor
     * @property {boolean} [enabled=true] Whether the inhibitor is enabled
     * @property {boolean} [spamProtection=false] If this inhibitor is meant for spamProtection (disables the inhibitor while generating help)
     */

	/**
     * @param {Client} client The Discord client
     * @param {string} dir The path to the core or user inhibitor pieces folder
     * @param {string} file The path from the pieces folder to the inhibitor file
     * @param {InhibitorOptions} [options = {}] Optional Inhibitor settings
     */
	constructor(client, dir, file, options = {}) {
		this.client = client;
		this.dir = dir;
		this.file = file;
		this.name = options.name || file.slice(0, -3);
		this.enabled = 'enabled' in options ? options.enabled : true;
		this.spamProtection = options.spamProtection || false;

		this.type = 'inhibitor';
	}

	/**
     * The run method to be overwritten in actual inhibitors
     * @param {external:Message} msg The message that triggered this inhibitor
     * @param {Command} cmd The command to run
     * @abstract
     * @returns {Promise<void|string>}
     */
	run() {
		// Defined in extension Classes
	}

	/**
     * The init method to be optionaly overwritten in actual inhibitors
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

Piece.applyToClass(Inhibitor);

module.exports = Inhibitor;
