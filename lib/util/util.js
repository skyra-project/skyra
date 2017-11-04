const { Message, Channel, Permissions: { FLAGS } } = require('discord.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const zws = String.fromCharCode(8203);
let sensitivePattern;

/**
 * Contains static methods to be used throughout the framework
 */
class Util {

	/**
     * This class may not be initiated with new
     */
	constructor() {
		throw new Error('This class may not be initiated with new');
	}

	/**
     * Makes a codeblock markup string
     * @param {string} lang The codeblock language
     * @param {string} expression The expression to be wrapped in the codeblock
     * @returns {string}
     */
	static codeBlock(lang, expression = '\u200B') {
		return `${'```'}${lang}\n${String(expression).replace(/```/g, '`\u200b``')}${'```'}`;
	}

	/**
     * Cleans sensitive info from strings
     * @param {string} text The text to clean
     * @returns {string}
     */
	static clean(text) {
		if (typeof text === 'string') return text.replace(sensitivePattern, '「ｒｅｄａｃｔｅｄ」').replace(/`/g, `\`${zws}`).replace(/@/g, `@${zws}`);
		return text;
	}

	/**
     * Check if the bot has a permission in a channel.
     * @param {Message|Channel} channel The channel.
     * @param {FLAGS} permission The permission.
     * @returns {boolean}
     */
	static hasPermission(channel, permission) {
		if (channel instanceof Message) channel = channel.channel;
		else if (channel instanceof Channel === false) throw `Invalid input, 'channel' must be either a Channel or a Message instance.`;
		if (channel.type !== 'text' || channel.type !== 'voice') return true;
		if (permission in FLAGS === false) throw `Invalid permission: ${permission}`;
		return channel.permissionsFor(channel.guild.me).has(permission);
	}

	/**
     * Initializes the sensitive patterns for clean()
     * @private
     * @param {Client} client The Discord Client
     * @static
     */
	static initClean(client) {
		const patterns = [];
		if (client.token) patterns.push(client.token);
		if (client.user.email) patterns.push(client.user.email);
		if (client.password) patterns.push(client.password);
		sensitivePattern = new RegExp(patterns.join('|'), 'gi');
	}

	/**
     * Converts a string to Title Case
     * @param {string} str The string to titlecaseify
     * @returns {string}
     * @static
     */
	static toTitleCase(str) {
		return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
	}

	/**
     * Generates an error object used for argument reprompting
     * @param {Error} error An error object
     * @param {number} code The status code to assign to the error
     * @returns {Error}
     * @static
     */
	static newError(error, code) {
		if (error.status) {
			this.statusCode = error.response.res.statusCode;
			this.statusMessage = error.response.res.statusMessage;
			this.code = error.response.body.code;
			this.message = error.response.body.message;
			return this;
		}
		this.code = code || null;
		this.message = error;
		this.stack = error.stack || null;
		return this;
	}

	/**
     * Cleans a string from regex injection
     * @param {string} str The string to clean
     * @returns {string}
     * @static
     */
	static regExpEsc(str) {
		return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
	}

	/**
     * Split a string by its latest space character in a range from the character 0 to the selected one.
     * @param {string} str    The text to split.
     * @param {number} length The length of the desired string.
     * @returns {string}
     * @static
     */
	static splitText(str, length) {
		const x = str.substring(0, length).lastIndexOf(' ');
		const pos = x === -1 ? length : x;
		return str.substring(0, pos);
	}

	/**
     * Applies an interface to a class
     * @param {Object} base The interface to apply to a structure
     * @param {Object} structure The structure to apply the interface to
     * @param {string[]} [skips=[]] The methods to skip when applying this interface
     * @static
     */
	static applyToClass(base, structure, skips = []) {
		for (const method of Object.getOwnPropertyNames(base.prototype)) {
			if (!skips.includes(method)) Object.defineProperty(structure.prototype, method, Object.getOwnPropertyDescriptor(base.prototype, method));
		}
	}

}

/**
 * @typedef {Object} execOptions
 * @memberof {Util}
 * @property {string} [cwd=process.cwd()] Current working directory of the child process
 * @property {Object} [env={}] Environment key-value pairs
 * @property {string} [encoding='utf8'] encoding to use
 * @property {string} [shell=os === unix ? '/bin/sh' : process.env.ComSpec] Shell to execute the command with
 * @property {number} [timeout=0]
 * @property {number} [maxBuffer=200*1024] Largest amount of data in bytes allowed on stdout or stderr. If exceeded, the child process is terminated.
 * @property {string|number} [killSignal='SIGTERM'] <string> | <integer> (Default: 'SIGTERM')
 * @property {number} [uid] Sets the user identity of the process.
 * @property {number} [gid] Sets the group identity of the process.
 */

/**
 * Promisified version of child_process.exec for use with await
 * @param {string} command The command to run
 * @param {execOptions} options The options to pass to exec
 * @returns {string}
 */
Util.exec = promisify(exec);

/**
 * Promisified version of setTimeout for use with await
 * @param {number} delay The amount of time in ms to delay
 * @param {any} args Any args to pass to the .then (mostly pointless in this form)
 * @returns {Promise<any>} The args value passed in
 */
Util.sleep = promisify(setTimeout);

module.exports = Util;
