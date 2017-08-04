const ParsedUsage = require('./parsedUsage');
const SkyraError = require('../functions/SkyraError');

/**
 * @typedef  {Object}        CommandOptions
 * @property {Array<string>} [aliases=[]] Any comand aliases.
 * @property {boolean}       [guildOnly=false] What channel types the command should run in.
 * @property {number}        [permLevel=0] The required permission level to use the command.
 * @property {Array<string>} [botPerms=[]] The required Discord permissions for the bot to use this command.
 * @property {number}        [mode=0] The mode the command should run in.
 * @property {boolean}       [spam=false] Whether the command should be considered or not.
 * @property {number}        [cooldown=0] The amount of time before the user can run the command again in seconds.
 * @property {string}        [description=''] The help description for the command.
 * @property {string}        [usage=''] The usage string for the command.
 * @property {?string}       [usageDelim=undefined] The string to deliminate the command input for usage.
 * @property {string}        [extendedHelp='No extended help available.'] Extended help strings.
 * @memberof Command
 */

/* eslint-disable class-methods-use-this */
class Command {

    /**
     * @param {Client} client The Client
     * @param {Array} file The path from the pieces folder to the command file
     * @param {CommandOptions} [options = {}] Optional Command settings
     */

    constructor(client, file, name, {
        aliases = [],
        guildOnly = false,
        permLevel = 0,
        botPerms = [],
        mode = 0,
        spam = false,
        cooldown = 0,

        guilds = null,

        usage = '',
        usageDelim = undefined,
        description,
        extendedHelp = null
    } = {}) {
        this.client = client;
        this.conf = {
            aliases,
            guildOnly,
            permLevel,
            botPerms,
            mode,
            spam,
            cooldown,
            guilds
        };
        this.help = {
            name,
            description,
            usage,
            usageDelim,
            extendedHelp,
            fullCategory: file,
            category: file[0] || 'General',
            subCategory: file[1] || 'General'
        };
        this.cooldown = new Map();
        this.usage = new ParsedUsage(client, this);
    }

    /**
     * The run method to be overwritten in actual commands
     * @param {CommandMessage} msg The command message mapped on top of the message used to trigger this command
     * @param {Array<any>} params The fully resolved parameters based on your usage / usageDelim
     * @abstract
     * @returns {Promise<Message>} You should return the response message whenever possible
     */
    run() {
        // Defined in extension Classes
    }

    /**
     * The init method to be optionaly overwritten in actual commands
     * @abstract
     * @returns {Promise<Void>}
     */
    init() {
        // Optionally defined in extension Classes
    }

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

    static hasPermission(msg, permission) {
        return msg.channel.permissionsFor(msg.guild.me).has(permission);
    }

    static codeBlock(lang, expression) {
        return `${'```'}${lang}\n${expression.replace(/```/g, '`\u200b``')}${'```'}`;
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
        return Command.hasPermission(msg, 'USE_EXTERNAL_EMOJIS') ? '<:ShinyYellow:324157128270938113>' : 'S';
    }

}

module.exports = Command;
