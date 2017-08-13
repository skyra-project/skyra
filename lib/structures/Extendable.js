const Piece = require('./interfaces/Piece');
const Discord = require('discord.js');

class Extendable {

    /**
	 * @typedef {object} ExtendableOptions
	 * @memberof Extendable
	 * @property {string} [name = theFileName] The name of the extendable
	 * @property {boolean} [enabled = true] If the extendable is enabled or not
	 */

    /**
	 * @param {Client} client The Discord client
	 * @param {string} dir The path to the core or user extendable pieces folder
	 * @param {string} file The path from the pieces folder to the extendable file
	 * @param {string[]} appliesTo The discord classes this extendable applies to
	 * @param {ExtendableOptions} options The options for this extendable
	 */
    constructor(client, dir, file, appliesTo = [], options = {}) {
        /**
		 * @type {Client}
		 */
        this.client = client;

        /**
		 * The directory to where this extendable piece is stored
		 * @type {string}
		 */
        this.dir = dir;

        /**
		 * The file location where this extendable is stored
		 * @type {string}
		 */
        this.file = file;

        /**
		 * The name of the extendable
		 * @type {string}
		 */
        this.name = options.name || file.slice(0, -3);

        /**
		 * The type of piece this is
		 * @type {string}
		 */
        this.type = 'extendable';

        /**
		 * The discord classes this extendable applies to
		 * @type{string[]}
		 */
        this.appliesTo = appliesTo;

        /**
		 * If the language is enabled or not
		 * @type {boolean}
		 */
        this.enabled = 'enabled' in options ? options.enabled : true;
    }

    /**
	 * The extend method to be overwritten in actual extend pieces
	 * @param {any} params Any parameters you want
	 * @abstract
	 * @returns {any}
	 */
    extend() {
        // Defined in extension Classes
    }

    /**
	 * The init method to apply the extend method to the Discord.js Class
	 * @private
	 */
    async init() {
        if (this.enabled) this.enable();
    }

    /**
	 * Disables this piece
	 * @returns {Piece} This piece
	 */
    disable() {
        this.enabled = false;
        for (const structure of this.appliesTo) delete Discord[structure].prototype[this.name];
        return this;
    }

    /**
	 * Enables this piece
	 * @returns {Piece} This piece
	 */
    enable() {
        this.enabled = true;
        for (const structure of this.appliesTo) Object.defineProperty(Discord[structure].prototype, this.name, Object.getOwnPropertyDescriptor(this.constructor.prototype, 'extend'));
        return this;
    }

    // left for documentation
    /* eslint-disable no-empty-function */
    async reload() {}
    unload() {}
    /* eslint-enable no-empty-function */

}

Piece.applyToClass(Extendable, ['disable', 'enable']);

module.exports = Extendable;
