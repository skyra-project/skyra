const util = require('../util/util');
/**
 * The internal class that turns command arguments into command parameters
 */
class CommandMessage {

    /**
     * @param {external:Message} msg The message this command message is for
     * @param {Command} cmd The command being run
     * @param {string} prefix The prefix the user used to run the command
     * @param {number} prefixLength The length of the prefix the user used to run the command
     */
    constructor(msg, cmd, prefix, prefixLength) {
        /**
         * The client this CommandMessage was created with.
         * @name CommandMessage#client
         * @type {Client}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: msg.client });

        /**
         * The message this command message is for
         * @type {external:Message}
         */
        this.msg = msg;

        /**
         * The command being run
         * @type {Command}
         */
        this.cmd = cmd;

        /**
         * The prefix used
         * @type {string}
         */
        this.prefix = prefix;

        /**
         * The length of the prefix used
         * @type {number}
         */
        this.prefixLength = prefixLength;

        /**
         * The string arguments derived from the usageDelim of the command
         * @type {string[]}
         */
        this.args = this.cmd.quotedStringSupport ? this.constructor.getQuotedStringArgs(this) : this.constructor.getArgs(this);

        /**
         * The parameters resolved by this class
         * @type {any[]}
         */
        this.params = [];

        /**
         * If the command reprompted for missing args
         * @type {boolean}
         */
        this.reprompted = false;

        /**
         * A cache of the current usage while validating
         * @private
         * @type {Object}
         */
        this._currentUsage = {};

        /**
         * Whether the current usage is a repeating arg
         * @private
         * @type {boolean}
         */
        this._repeat = false;
    }

    /**
     * Validates and resolves args into parameters
     * @private
     * @returns {any[]} The resolved parameters
     */
    async validateArgs() {
        if (this.params.length >= this.cmd.usage.parsedUsage.length && this.params.length >= this.args.length) {
            return this.params;
        } else if (this.cmd.usage.parsedUsage[this.params.length]) {
            if (this.cmd.usage.parsedUsage[this.params.length].type !== 'repeat') {
                this._currentUsage = this.cmd.usage.parsedUsage[this.params.length];
            } else if (this.cmd.usage.parsedUsage[this.params.length].type === 'repeat') {
                this._currentUsage.type = 'optional';
                this._repeat = true;
            }
        } else if (!this._repeat) {
            return this.params;
        }
        if (this._currentUsage.type === 'optional' && (this.args[this.params.length] === undefined || this.args[this.params.length] === '')) {
            if (this.cmd.usage.parsedUsage.slice(this.params.length).some(usage => usage.type === 'required')) {
                this.args.splice(this.params.length, 0, undefined);
                this.args.splice(this.params.length, 1, null);
                throw util.newError(this.msg.language.get('COMMANDMESSAGE_MISSING'), 1);
            } else {
                return this.params;
            }
        } else if (this._currentUsage.type === 'required' && this.args[this.params.length] === undefined) {
            this.args.splice(this.params.length, 1, null);
            throw util.newError(this._currentUsage.possibles.length === 1
                ? this.msg.language.get('COMMANDMESSAGE_MISSING_REQUIRED', this._currentUsage.possibles[0].name)
                : this.msg.language.get('COMMANDMESSAGE_MISSING_OPTIONALS', this._currentUsage.possibles.map(poss => poss.name).join(', ')), 1);
        } else if (this._currentUsage.possibles.length === 1) {
            if (this.client.argResolver[this._currentUsage.possibles[0].type]) {
                return this.client.argResolver[this._currentUsage.possibles[0].type](this.args[this.params.length], this._currentUsage, 0, this._repeat, this.msg)
                    .catch((err) => {
                        this.args.splice(this.params.length, 1, null);
                        throw util.newError(err, 1);
                    })
                    .then((res) => {
                        if (res !== null) {
                            this.params.push(res);
                            return this.validateArgs();
                        }
                        this.args.splice(this.params.length, 0, undefined);
                        this.params.push(undefined);
                        return this.validateArgs();
                    });
            }
            this.client.emit('log', 'Unknown Argument Type encountered', 'warn');
            return this.validateArgs();
        } else {
            return this.multiPossibles(0, false);
        }
    }

    /**
     * Validates and resolves args into parameters, when multiple types of usage is defined
     * @param {number} possible The id of the possible usage currently being checked
     * @param {boolean} validated Escapes the recursive function if the previous iteration validated the arg into a parameter
     * @private
     * @returns {any[]} The resolved parameters
     */
    async multiPossibles(possible, validated) {
        if (validated) {
            return this.validateArgs();
        } else if (possible >= this._currentUsage.possibles.length) {
            if (this._currentUsage.type === 'optional' && !this._repeat) {
                this.args.splice(this.params.length, 0, undefined);
                this.params.push(undefined);
                return this.validateArgs();
            }
            this.args.splice(this.params.length, 1, null);
            throw util.newError(this.msg.language.get('COMMANDMESSAGE_NOMATCH', this._currentUsage.possibles.map(poss => poss.name).join(', ')), 1);
        } else if (this.client.argResolver[this._currentUsage.possibles[possible].type]) {
            return this.client.argResolver[this._currentUsage.possibles[possible].type](this.args[this.params.length], this._currentUsage, possible, this._repeat, this.msg)
                .then((res) => {
                    if (res !== null) {
                        this.params.push(res);
                        return this.multiPossibles(++possible, true);
                    }
                    return this.multiPossibles(++possible, validated);
                })
                .catch(() => this.multiPossibles(++possible, validated));
        } else {
            this.client.emit('log', 'Unknown Argument Type encountered', 'warn');
            return this.multiPossibles(++possible, validated);
        }
    }

    /**
     * Parses a message into string args
     * @param {CommandMessage} cmdMsg this command message
     * @private
     * @returns {string[]}
     */
    static getArgs(cmdMsg) {
        const args = cmdMsg.msg.content
            .slice(cmdMsg.prefixLength)
            .trim()
            .split(' ')
            .slice(1)
            .join(' ')
            .trim()
            .split(cmdMsg.cmd.usageDelim !== '' ? cmdMsg.cmd.usageDelim : undefined);

        return args.length === 1 && args[0] === '' ? [] : args;
    }

    /**
     * Parses a message into string args taking into account quoted strings
     * @param {CommandMessage} cmdMsg this command message
     * @private
     * @returns {string[]}
     */
    static getQuotedStringArgs(cmdMsg) {
        const content = cmdMsg.msg.content.slice(cmdMsg.prefixLength).trim().split(' ').slice(1).join(' ').trim();

        if (!cmdMsg.cmd.usageDelim || cmdMsg.cmd.usageDelim === '') return [content];

        const args = [];
        let current = '';
        let openQuote = false;

        for (let i = 0; i < content.length; i++) {
            if (!openQuote && content.slice(i, i + cmdMsg.cmd.usageDelim.length) === cmdMsg.cmd.usageDelim) {
                if (current !== '') args.push(current);
                current = '';
                continue;
            }
            if (content[i] === '"' && content[i - 1] !== '\\') {
                openQuote = !openQuote;
                if (current !== '') args.push(current);
                current = '';
                continue;
            }
            current += content[i];
        }
        if (current !== '') args.push(current);

        return args.length === 1 && args[0] === '' ? [] : args;
    }

}

module.exports = CommandMessage;
