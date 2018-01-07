/*
	UTIL NOT LONGER MAINTAINED
	MOVED DEVELOPMENT TO FRAMEWORK
*/

// class Clock {

// 	/**
// 	 * @typedef  {Object} Timeout
// 	 * @property {boolean} _called
// 	 * @property {number} _idleTimeout
// 	 * @property {Object} _idlePrev
// 	 * @property {Object} _idleNext
// 	 * @property {number} _idleStart
// 	 * @property {function} _onTimeout
// 	 * @property {any[]} _timerArgs
// 	 * @property {number} _repeat
// 	 * @property {boolean} _destroyed
// 	 */

// 	/**
// 	 * @typedef  {Object} ClockOptions
// 	 * @property {string} [provider]
// 	 */

// 	/**
// 	 * Create a new Clock singleton instance
// 	 * @since 2.0.0
// 	 * @param {Skyra} client The Client that initialized this instance
// 	 * @param {ClockOptions} [options={}] The options for this clock
// 	 */
// 	constructor(client, options = {}) {
// 		/**
// 		 * The client this Clock was created with.
// 		 * @since 2.0.0
// 		 * @name Clock#client
// 		 * @type {Skyra}
// 		 * @readonly
// 		 */
// 		Object.defineProperty(this, 'client', { value: client });

// 		/**
// 		 * The cached scheduled tasks.
// 		 * @since 3.0.0
// 		 * @type {any[]}
// 		 * @private
// 		 */
// 		this._tasks = [];

// 		/**
// 		 * The cached interval.
// 		 * @type {?Timeout}
// 		 * @since 3.0.0
// 		 */
// 		this._interval = null;

// 		this._providerName = 'provider' in options ? options.provider : this.client.options.provider.engine;
// 	}

// 	get provider() {
// 		return this.client.providers.get(this._providerName);
// 	}

// 	async init() {
// 		const provider = this.provider;
// 		if (!provider) throw new Error(`The provider ${this._providerName} is not available in your system.`);
// 		if (!await provider.hasTable('tasks')) {
// 			await provider.createTable('tasks');
// 			return [];
// 		}
// 		return provider.getAll('tasks');
// 	}

//	 async create(task) {

//	 }

// }

// module.exports = Clock;
