const { Console } = require('console');
const Colors = require('./Colors');
const moment = require('moment');
const { inspect } = require('util');

/**
 * Skyra's console class, extends NodeJS Console class.
 */
class SkyraConsole extends Console {

	/**
	 * @memberof SkyraConsole
	 * @typedef {object} Colors - Time is for the timestamp of the log, message is for the actual output.
	 * @property {SkyraConsoleColorObjects} debug An object containing a message and time color object.
	 * @property {SkyraConsoleColorObjects} error An object containing a message and time color object.
	 * @property {SkyraConsoleColorObjects} log An object containing a message and time color object.
	 * @property {SkyraConsoleColorObjects} verbose An object containing a message and time color object.
	 * @property {SkyraConsoleColorObjects} warn An object containing a message and time color object.
	 * @property {SkyraConsoleColorObjects} wtf An object containing a message and time Color Object.
	 */

	/**
	 * @memberof SkyraConsole
	 * @typedef {object} SkyraConsoleColorObjects
	 * @property {string} [type='log'] The method from Console this color object should call.
	 * @property {SkyraConsoleMessageObject} message A message object containing colors and styles.
	 * @property {SkyraConsoleTimeObject} time A time object containing colors and styles.
	 */

	/**
	 * @memberof SkyraConsole
	 * @typedef {object} SkyraConsoleMessageObject
	 * @property {BackgroundColorTypes} background The background color. Can be a basic string like "red", a hex string, or a RGB array.
	 * @property {TextColorTypes} text The text color. Can be a basic string like "red", a hex string, or a RGB array.
	 * @property {StyleTypes} style A style string from StyleTypes.
	 */

	/**
	 * @memberof SkyraConsole
	 * @typedef {object} SkyraConsoleTimeObject
	 * @property {BackgroundColorTypes} background The background color. Can be a basic string like "red", a hex string, or a RGB array.
	 * @property {TextColorTypes} text The text color. Can be a basic string like "red", a hex string, a RGB array, or HSL array.
	 * @property {StyleTypes} style A style string from StyleTypes.
	 */

	/**
	 * @memberof SkyraConsole
	 * @typedef {*} TextColorTypes - All the valid color types.
	 * @property {string} black
	 * @property {string} red
	 * @property {string} green
	 * @property {string} yellow
	 * @property {string} blue
	 * @property {string} magenta
	 * @property {string} cyan
	 * @property {string} gray
	 * @property {string} grey
	 * @property {string} lightgray
	 * @property {string} lightgrey
	 * @property {string} lightred
	 * @property {string} lightgreen
	 * @property {string} lightyellow
	 * @property {string} lightblue
	 * @property {string} lightmagenta
	 * @property {string} lightcyan
	 * @property {string} white
	 * @property {string} #008000 green
	 * @property {string} #008000 green
	 * @property {Array} [255,0,0] red
	 * @property {Array} [229,50%,50%] blue
	 */

	/**
	 * @memberof SkyraConsole
	 * @typedef {*} BackgroundColorTypes - One of these strings, HexStrings, RGB, or HSL are valid types.
	 * @property {string} black
	 * @property {string} red
	 * @property {string} green
	 * @property {string} blue
	 * @property {string} magenta
	 * @property {string} cyan
	 * @property {string} gray
	 * @property {string} grey
	 * @property {string} lightgray
	 * @property {string} lightgrey
	 * @property {string} lightred
	 * @property {string} lightgreen
	 * @property {string} lightyellow
	 * @property {string} lightblue
	 * @property {string} lightmagenta
	 * @property {string} lightcyan
	 * @property {string} white
	 * @property {string} #008000 green
	 * @property {Array} [255,0,0] red
	 * @property {Array} [229,50%,50%] blue
	 */

	/**
	 * @memberof SkyraConsole
	 * @typedef {*} StyleTypes
	 * @property {string} normal
	 * @property {string} bold
	 * @property {string} dim
	 * @property {string} italic
	 * @property {string} underline
	 * @property {string} inverse
	 * @property {string} hidden
	 * @property {string} strikethrough
	 */

	/**
	 * Constructs our SkyraConsole instance
	 * @since 2.0.0
	 * @param  {SkyraConsoleConfig} [options] The options for the console.
	 */
	constructor({ stdout, stderr, timestamps = false }) {
		super(stdout, stderr);

		/**
		 * The standard output stream for this console, defaulted to process.stderr.
		 * @since 2.0.0
		 * @name SkyraConsole#stdout
		 * @type {WritableStream}
		 */
		Object.defineProperty(this, 'stdout', { value: stdout });

		/**
		 * The standard error output stream for this console, defaulted to process.stderr.
		 * @since 2.0.0
		 * @name SkyraConsole#stderr
		 * @type {WritableStream}
		 */
		Object.defineProperty(this, 'stderr', { value: stderr });

		/**
		 * Whether or not timestamps should be enabled for this console.
		 * @since 2.0.0
		 * @type {(boolean|string)}
		 */
		this.timestamps = timestamps;

		/**
		 * The colors for this console.
		 * @since 2.0.0
		 * @name SkyraConsole#colors
		 * @type  {boolean|Colors}
		 */
		this.colors = {
			debug: {
				type: 'log',
				message: { background: null, text: null, style: null },
				time: { background: null, text: 'magenta', style: null }
			},
			error: {
				type: 'error',
				message: { background: null, text: null, style: null },
				time: { background: 'red', text: 'white', style: null }
			},
			log: {
				type: 'log',
				message: { background: null, text: null, style: null },
				time: { background: null, text: 'lightblue', style: null }
			},
			info: {
				type: 'log',
				message: { background: null, text: 'gray', style: null },
				time: { background: null, text: 'lightyellow', style: null }
			},
			verbose: {
				type: 'log',
				message: { background: null, text: 'gray', style: null },
				time: { background: null, text: 'gray', style: null }
			},
			warn: {
				type: 'warn',
				message: { background: null, text: 'lightyellow', style: null },
				time: { background: null, text: 'lightyellow', style: null }
			},
			wtf: {
				type: 'error',
				message: { background: null, text: 'red', style: null },
				time: { background: 'red', text: 'white', style: null }
			}
		};
	}

	/**
	 * Logs everything to the console/writable stream.
	 * @since 2.0.0
	 * @param {*} data The data we want to print.
	 * @param {string} [type="log"] The type of log, particularly useful for coloring.
	 */
	write(data, type = 'log') {
		data = SkyraConsole.flatten(data);
		const color = this.colors[type.toLowerCase()] || {};
		const message = color.message || {};
		const time = color.time || {};
		const timestamp = this.timestamps ? `${this.timestamp(`[${moment().format(this.timestamps)}]`, time)} ` : '';
		super[color.type || 'log'](data.split('\n').map(str => `${timestamp}${this.messages(str, message)}`).join('\n'));
	}

	/**
	 * Calls a log write with everything to the console/writable stream.
	 * @since 2.1.1
	 * @param {...*} data The data we want to print.
	 * @returns {void}
	 */
	log(...data) {
		this.write(data, 'log');
	}

	/**
	 * Calls a warn write with everything to the console/writable stream.
	 * @since 2.1.1
	 * @param {...*} data The data we want to print.
	 * @returns {void}
	 */
	warn(...data) {
		this.write(data, 'warn');
	}

	/**
	 * Calls an error write with everything to the console/writable stream.
	 * @since 2.1.1
	 * @param {...*} data The data we want to print.
	 * @returns {void}
	 */
	error(...data) {
		this.write(data, 'error');
	}

	/**
	 * Calls a debug write with everything to the console/writable stream.
	 * @since 2.1.1
	 * @param {...*} data The data we want to print.
	 * @returns {void}
	 */
	debug(...data) {
		this.write(data, 'debug');
	}

	/**
	 * Calls a verbose write with everything to the console/writable stream.
	 * @since 2.1.1
	 * @param {...*} data The data we want to print.
	 * @returns {void}
	 */
	verbose(...data) {
		this.write(data, 'verbose');
	}

	/**
	 * Calls a wtf (what a terrible failure) write with everything to the console/writable stream.
	 * @since 2.1.1
	 * @param {...*} data The data we want to print.
	 * @returns {void}
	 */
	wtf(...data) {
		this.write(data, 'wtf');
	}

	/**
	 * Logs everything to the console/writable stream.
	 * @since 2.1.1
	 * @param {Date} timestamp The timestamp to maybe format
	 * @param {string} time The time format used for coloring
	 * @returns {string}
	 */
	timestamp(timestamp, time) {
		return Colors.format(timestamp, time);
	}

	/**
	 * Logs everything to the console/writable stream.
	 * @since 2.1.1
	 * @param {string} string The data we want to print.
	 * @param {string} message The message format used for coloring
	 * @returns {string}
	 */
	messages(string, message) {
		return Colors.format(string, message);
	}

	/**
	 * Flattens our data into a readable string.
	 * @since 2.1.1
	 * @param {*} data Some data to flatten
	 * @return {string}
	 */
	static flatten(data) {
		if (typeof data === 'undefined' || typeof data === 'number' || data === null) return String(data);
		if (typeof data === 'string') return data;
		if (typeof data === 'object') {
			if (Array.isArray(data)) return data.join('\n');
			return data.stack || data.message || inspect(data, { depth: 0, colors: true });
		}
		return String(data);
	}

}

module.exports = SkyraConsole;
