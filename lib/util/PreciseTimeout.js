/**
 * The PreciseTimeout class in charge to perform high-precision promisified and cancellable timeouts
 * @since 3.0.0
 * @version 1.0.0
 */
class PreciseTimeout {

	/**
	 * Create a new PreciseTimeout
	 * @since 3.0.0
	 * @param {number} time The time in milliseconds to run
	 */
	constructor(time) {
		/**
		 * @since 3.0.0
		 * @type {number}
		 */
		this.endsAt = Date.now() + time;

		/**
		 * @since 3.0.0
		 * @type {boolean}
		 */
		this.stopped = false;

		/**
		 * @since 3.0.0
		 * @type {?Function}
		 * @private
		 */
		this.resolve = null;

		/**
		 * @since 3.0.0
		 * @type {?Timeout}
		 * @private
		 */
		this.timeout = null;
	}

	/**
	 * Run the timeout
	 * @since 3.0.0
	 * @returns {Promise<boolean>}
	 */
	async run() {
		if (this.stopped) return false;

		while (!this.stopped && Date.now() < this.endsAt) {
			await new Promise(resolve => {
				this.resolve = resolve;
				this.timeout = setTimeout(() => this.resolve(), Date.now() - this.endsAt);
			});
		}

		this.stopped = true;
		return true;
	}

	/**
	 * Stop the timeout
	 * @since 3.0.0
	 * @returns {boolean}
	 */
	stop() {
		if (this.stopped) return false;

		this.stopped = true;
		if (this.timeout) clearTimeout(this.timeout);
		if (this.resolve) this.resolve();
		return true;
	}

}

module.exports = PreciseTimeout;
