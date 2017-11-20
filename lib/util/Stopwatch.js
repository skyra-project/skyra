const { performance } = require('perf_hooks');

/**
 * The Stopwatch class, uses native node to replicate/extend previous performance now dependancy.
 */
class Stopwatch {

	/**
	 * Starts a new Stopwatch
	 * @since 2.1.0
	 * @param {number} [digits = 2] The number of digits to appear after the decimal point when returning the friendly duration
	 */
	constructor(digits = 2) {
		/**
		 * The start time of this stopwatch
		 * @since 2.1.0
		 * @private
		 * @type {number}
		 */
		this._start = performance.now();

		/**
		 * The end time of this stopwatch
		 * @since 2.1.0
		 * @private
		 * @type {?number}
		 */
		this._end = null;

		/**
		 * The number of digits to appear after the decimal point when returning the friendly duration.
		 * @since 2.1.0
		 * @type {number}
		 */
		this.digits = digits;
	}

	/**
	 * The duration of this stopwatch since start or start to end if this stopwatch has stopped.
	 * @since 2.1.0
	 * @readonly
	 * @type {number}
	 */
	get duration() {
		return this._end ? this._end - this._start : performance.now() - this._start;
	}

	/**
	 * The duration formatted in a friendly string
	 * @since 2.1.0
	 * @readonly
	 * @type {string}
	 */
	get friendlyDuration() {
		const time = this.duration;
		if (time >= 1000) return `${(time / 1000).toFixed(this.digits)}s`;
		if (time >= 1) return `${time.toFixed(this.digits)}ms`;
		return `${(time * 1000).toFixed(this.digits)}μs`;
	}

	/**
	 * If the stopwatch is running or not
	 * @since 2.1.1
	 * @readonly
	 * @type {boolean}
	 */
	get running() {
		return Boolean(!this._end);
	}

	/**
	 * Restarts the Stopwatch (Returns a running state)
	 * @since 2.1.1
	 * @returns {Stopwatch}
	 */
	restart() {
		this._start = performance.now();
		this._end = null;
		return this;
	}

	/**
	 * Resets the Stopwatch to 0 duration (Returns a stopped state)
	 * @since 2.1.1
	 * @returns {Stopwatch}
	 */
	reset() {
		this._start = performance.now();
		this._end = this._start;
		return this;
	}

	/**
	 * Starts the Stopwatch
	 * @since 2.1.1
	 * @returns {Stopwatch}
	 */
	start() {
		if (!this.running) {
			this._start = performance.now() - this.duration;
			this._end = null;
		}
		return this;
	}

	/**
	 * Stops the Stopwatch, freezing the duration
	 * @since 2.1.0
	 * @returns {Stopwatch}
	 */
	stop() {
		if (this.running) this._end = performance.now();
		return this;
	}

	/**
	 * Defines toString behavior o return the friendlyDuration
	 * @since 2.1.0
	 * @returns {string}
	 */
	toString() {
		return this.friendlyDuration;
	}

}

module.exports = Stopwatch;
