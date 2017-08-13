const util = require('../util/util');
const Piece = require('./interfaces/Piece');
const ParsedUsage = require('../usage/ParsedUsage');
const SkyraError = require('../../functions/SkyraError');

class Command {

    /**
	 * @typedef {Object} CommandOptions
	 * @memberof Command
	 * @property {string} [name = theFileName] The name of the command
	 * @property {boolean} [enabled=true] Whether the command is enabled or not
	 * @property {boolean} [guildOnly=false] If the command should run only in guilds
	 * @property {number} [cooldown=0] The amount of time before the user can run the command again in seconds
	 * @property {Array<string>} [aliases=[]] Any comand aliases
	 * @property {number} [permLevel=0] The required permission level to use the command
	 * @property {Array<string>} [botPerms=[]] The required Discord permissions for the bot to use this command
	 * @property {string} [description=''] The help description for the command
	 * @property {string} [usage=''] The usage string for the command
	 * @property {?string} [usageDelim=undefined] The string to deliminate the command input for usage
	 * @property {string} [extendedHelp='No extended help available.'] Extended help strings
	 */

    /**
	 * @param {Client} client The Discord Client
	 * @param {string} dir The path to the core or user command pieces folder
	 * @param {Array} file The path from the pieces folder to the command file
	 * @param {CommandOptions} [options = {}] Optional Command settings
	 */
    constructor(client, dir, file, options = {}) {
        this.client = client;
        this.enabled = 'enabled' in options ? options.enabled : true;

        this.guildOnly = 'guildOnly' in options ? options.guildOnly : false;
        this.cooldown = options.cooldown || 0;
        this.aliases = options.aliases || [];
        this.permLevel = options.permLevel || 0;
        this.botPerms = options.botPerms || [];

        this.name = options.name || file[file.length - 1].slice(0, -3);
        this.description = options.description || '';
        this.extendedHelp = options.extendedHelp || 'No extended help available.';
        this.usageString = options.usage || '';
        this.usageDelim = options.usageDelim || undefined;

        this.fullCategory = file.slice(0, -1);
        this.category = this.fullCategory[0] || 'General';
        this.subCategory = this.fullCategory[1] || 'General';

        this.usage = new ParsedUsage(client, this);
        this.cooldowns = new Map();
        this.file = file;
        this.dir = dir;

        this.type = 'command';
    }

    /**
	 * The run method to be overwritten in actual commands
	 * @param {CommandMessage} msg The command message mapped on top of the message used to trigger this command
	 * @param {Array<any>} params The fully resolved parameters based on your usage / usageDelim
	 * @abstract
	 * @returns {Promise<external:Message>} You should return the response message whenever possible
	 */
    async run() {
        // Defined in extension Classes
    }

    /**
	 * The init method to be optionaly overwritten in actual commands
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

    static sendDM(msg, content, options) {
        return msg.author.send(content, options)
            .then(() => msg.guild ? msg.send(`Dear ${msg.author}, I have send you the message in DMs.`).catch(Command.handleError) : true)
            .catch(() => msg.send('I am sorry, I could not send the message in DMs.').catch(Command.handleError));
    }

    /**
     * Throw errors!
     * @static
     * @param {Error} err An error to throw.
     * @memberof Command
     */
    static handleError(err) {
        throw new SkyraError(err);
    }

    /**
     * Resolve an string
     * @static
     * @param {string} string The string to resolve.
     * @returns {string}
     */
    static strip([string]) {
        string = string.replace(/^\n/, '');
        const length = /^[ ]*/.exec(string)[0].length;
        return length > 0 ? string.split('\n').map(line => line.slice(length)).join('\n') : string;
    }

    static joinLines(string) {
        string = string.replace(/^\n/, '');
        return string.split('\n').map(line => line.length > 0 ? line.trim() : '\n\n').join(' ');
    }

    static shiny(msg) {
        return util.hasPermission(msg, 'USE_EXTERNAL_EMOJIS') ? '<:ShinyYellow:324157128270938113>' : 'S';
    }

}

Piece.applyToClass(Command);

module.exports = Command;
