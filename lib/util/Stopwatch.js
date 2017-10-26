const { performance } = require('perf_hooks');

/**
 * Stopwatch class, uses native node to replicate/extend previous performance now dependancy.
 */
class Stopwatch {

    /**
	 * Starts a new Stopwatch
	 * @param {number} [digits = 2] The number of digits to appear after the decimal point when returning the friendly duration
	 */
    constructor(digits = 2) {
        /**
		 * The start time of this stopwatch
		 * @type {number}
		 */
        this.start = performance.now();

        /**
		 * The end time of this stopwatch
		 * @type {?number}
		 */
        this.end = null;

        /**
		 * The number of digits to appear after the decimal point when returning the friendly duration.
		 * @type {number}
		 */
        this.digits = digits;
    }

    /**
	 * The duration of this stopwatch since start or start to end if this stopwatch has stopped.
	 * @type {number}
	 */
    get duration() {
        return this.end ? this.end - this.start : performance.now() - this.start;
    }

    /**
	 * The duration formatted in a friendly string
	 * @type {string}
	 */
    get friendlyDuration() {
        const time = this.duration;
        if (time >= 1000) return `${(time / 1000).toFixed(this.digits)}s`;
        if (time >= 1) return `${time.toFixed(this.digits)}ms`;
        return `${(time * 1000).toFixed(this.digits)}μs`;
    }

    /**
	 * Stops the Stopwatch, freezing the duration
	 * @returns {Stopwatch}
	 */
    stop() {
        if (!this.end) this.end = performance.now();
        return this;
    }

    /**
	 * Defines toString behavior o return the friendlyDuration
	 * @returns {string}
	 */
    toString() {
        return this.friendlyDuration;
    }

}

module.exports = Stopwatch;
