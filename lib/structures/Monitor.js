class Monitor {

	/**
     * @typedef {Object} MonitorOptions
     * @memberof Monitor
     * @property {string} [name = theFileName] The name of the monitor
     * @property {boolean} [enabled=true] Whether the monitor is enabled
     * @property {boolean} [ignoreBots=true] Whether the monitor ignores bots or not
     * @property {boolean} [ignoreSelf=true] Whether the monitor ignores itself or not
     */

	/**
     * @param {Client} client The Discord client
     * @param {string} dir The path to the core or user monitor pieces folder
     * @param {string} file The path from the pieces folder to the monitor file
     * @param {MonitorOptions} [options = {}] Optional Monitor settings
     */
	constructor(client, dir, file, options = {}) {
		this.client = client;
		this.dir = dir;
		this.file = file;
		this.name = options.name || file.slice(0, -3);
		this.enabled = 'enabled' in options ? options.enabled : true;
		this.ignoreBots = 'ignoreBots' in options ? options.ignoreBots : true;
		this.ignoreSelf = 'ignoreSelf' in options ? options.ignoreSelf : true;
		this.guildOnly = 'guildOnly' in options ? options.guildOnly : false;

		this.type = 'monitor';
	}

	/**
     * The run method to be overwritten in actual monitor pieces
     * @param {external:Message} msg The discord message
     * @abstract
     * @returns {void}
     */
	run() {
		// Defined in extension Classes
	}

	/**
     * The init method to be optionaly overwritten in actual monitor pieces
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

require('./interfaces/Piece').applyToClass(Monitor);

module.exports = Monitor;
