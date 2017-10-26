const Piece = require('./interfaces/Piece');

class Finalizer {

    /**
     * @typedef {Object} FinalizerOptions
     * @memberof Finalizer
     * @property {string} [name = theFileName] The name of the finalizer
     * @property {boolean} [enabled=true] Whether the finalizer is enabled or not
     */

    /**
     * @param {Client} client The Discord Client
     * @param {string} dir The path to the core or user finalizer pieces folder
     * @param {Array} file The path from the pieces folder to the finalizer file
     * @param {FinalizerOptions} [options = {}] Optional Finalizer settings
     */
    constructor(client, dir, file, options = {}) {
        this.client = client;
        this.dir = dir;
        this.file = file;
        this.name = options.name || file.slice(0, -3);
        this.enabled = 'enabled' in options ? options.enabled : true;

        this.type = 'finalizer';
    }

    /**
     * The run method to be overwritten in actual finalizers
     * @param {CommandMessage} msg The command message mapped on top of the message used to trigger this finalizer
     * @param {external:Message} mes The bot's response message, if one is returned
     * @abstract
     * @returns {void}
     */
    run() {
        // Defined in extension Classes
    }

    /**
     * The init method to be optionaly overwritten in actual finalizers
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

Piece.applyToClass(Finalizer);

module.exports = Finalizer;
