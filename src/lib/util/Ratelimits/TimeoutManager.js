class TimeoutManager {

	/**
	 * @typedef {Object} RatelimitEntry
	 * @property {string} id The id of this entry
	 * @property {number} time The time this entry expires at
	 * @property {function():void} callback The callback for this entry
	 */

	/**
	 * Construct the TimeoutManager instance
	 * @since 3.3.0
	 * @version 1.0.0
	 * @param {Skyra} client The client instance that manages the ratelimits
	 */
	constructor(client) {
		/**
		 * The Client that manages this instance
		 * @since 3.3.0
		 * @type {Skyra}
		 */
		this.client = client;

		/**
		 * The cache for this manager
		 * @since 3.3.0
		 * @type {RatelimitEntry[]}
		 * @private
		 */
		this._cache = [];

		/**
		 * The interval for this manager
		 * @since 3.3.0
		 * @type {NodeJS.Timer}
		 * @private
		 */
		this._interval = null;
	}

	_run() {
		const now = Date.now();
		let i = 0;
		while (i < this._cache.length && now > this._cache[i].time) i++;
		if (i === 0) return;

		for (const entry of this._cache.splice(0, i)) {
			try {
				entry.callback();
			} catch (error) {
				this.client.emit('wtf', error);
			}
		}
		if (!this._cache.length) {
			this.client.clearInterval(this._interval);
			this._interval = null;
		}
	}

	next() {
		return this._cache.length ? this._cache[0] : null;
	}

	set(id, time, cb, rerun = false) {
		const valueIndex = this._cache.findIndex(entry => entry.id === id);
		if (valueIndex !== -1) {
			if (!rerun) return false;
			this._cache.splice(valueIndex, 1);
		}

		const index = this._cache.findIndex(entry => entry.time > time);
		if (index === -1) this._cache.push({ id, time, callback: cb });
		else this._cache.splice(index, 0, { id, time, callback: cb });

		if (!this._interval) this._interval = this.client.setInterval(this._run.bind(this), 500);
		return true;
	}

	get(id) {
		return this._cache.find(entry => entry.id === id) || null;
	}

	has(id) {
		return this._cache.some(entry => entry.id === id);
	}

	delete(id) {
		const index = this._cache.findIndex(entry => entry.id === id);
		if (index === -1) return false;

		this._cache.splice(index, 1);
		return true;
	}

	dispose() {
		if (this._interval) {
			this.client.clearInterval(this._interval);
			this._interval = null;
		}

		if (this._cache.length) {
			for (const entry of this._cache) entry.callback();
			this._cache.length = 0;
		}
	}

	*keys() {
		for (const entry of this._cache) yield entry.id;
	}

	*values() {
		yield* this._cache;
	}

	*[Symbol.iterator]() {
		yield* this._cache;
	}

}

module.exports = TimeoutManager;
