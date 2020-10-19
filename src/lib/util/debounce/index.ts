/* eslint-disable @typescript-eslint/init-declarations */
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

interface DebounceSettings {
	/**
	 * The number of milliseconds to delay.
	 * @default 0
	 */
	wait?: number;

	/**
	 * The maximum time `func` is allowed to be delayed before it's invoked
	 * @default null
	 */
	maxWait?: number | null;
}

interface DebouncedFunc<FnArgumentsType extends any[], FnReturnType> {
	/**
	 * Call the original function, but applying the debounce rules.
	 *
	 * If the debounced function can be run immediately, this calls it and returns its return
	 * value.
	 *
	 * Otherwise, it returns the return value of the last invokation, or undefined if the debounced
	 * function was not invoked yet.
	 */
	(...args: FnArgumentsType): FnReturnType | undefined;

	/**
	 * Throw away any pending invokation of the debounced function.
	 */
	cancel(): void;

	/**
	 * If there is a pending invokation of the debounced function, invoke it immediately and return
	 * its return value.
	 *
	 * Otherwise, return the value from the last invokation, or undefined if the debounced function
	 * was never invoked.
	 */
	flush(): FnReturnType | undefined;
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed since
 * the last time the debounced function was invoked. The debounced function comes with a cancel method to
 * cancel delayed invocations and a flush method to immediately invoke them. Provide an options object to
 * indicate that func should be invoked on the leading and/or trailing edge of the wait timeout. Subsequent
 * calls to the debounced function return the result of the last func invocation.
 *
 * Note: If leading and trailing options are true, func is invoked on the trailing edge of the timeout only
 * if the the debounced function is invoked more than once during the wait timeout.
 *
 * See David Corbacho’s article for details over the differences between _.debounce and _.throttle.
 *
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay.
 * @param options The options object.
 * @return Returns the new debounced function.
 */
export function debounce<FnArgumentsType extends any[], FnReturnType>(
	func: (...args: FnArgumentsType) => FnReturnType,
	options: DebounceSettings = {}
): DebouncedFunc<FnArgumentsType, FnReturnType> {
	let lastArgs: FnArgumentsType | undefined;
	let result: FnReturnType | undefined;
	let timerId: NodeJS.Timeout | undefined;
	let lastCallTime: number | undefined;
	let lastInvokeTime = 0;

	const wait = options.wait ?? 0;
	const maxWait = typeof options.maxWait === 'number' ? Math.max(options.maxWait, wait) : null;

	function invokeFunc(time: number) {
		let args = lastArgs;

		lastArgs = undefined;
		lastInvokeTime = time;
		result = func(...args!);
		return result;
	}

	function leadingEdge(time: number) {
		// Reset any `maxWait` timer.
		lastInvokeTime = time;
		// Start the timer for the trailing edge.
		timerId = setTimeout(timerExpired, wait);
		// Invoke the leading edge.
		return result;
	}

	function remainingWait(time: number) {
		let timeSinceLastCall = time - lastCallTime!;
		let timeSinceLastInvoke = time - lastInvokeTime;
		let result = wait - timeSinceLastCall;

		return maxWait === null ? result : Math.min(result, maxWait - timeSinceLastInvoke);
	}

	function shouldInvoke(time: number) {
		let timeSinceLastCall = time - lastCallTime!;
		let timeSinceLastInvoke = time - lastInvokeTime;

		// Either this is the first call, activity has stopped and we're at the
		// trailing edge, the system time has gone backwards and we're treating
		// it as the trailing edge, or we've hit the `maxWait` limit.
		return (
			lastCallTime === undefined || //
			timeSinceLastCall >= wait ||
			timeSinceLastCall < 0 ||
			(maxWait !== null && timeSinceLastInvoke >= maxWait)
		);
	}

	function timerExpired() {
		let time = Date.now();
		if (shouldInvoke(time)) {
			return trailingEdge(time);
		}
		// Restart the timer.
		timerId = setTimeout(timerExpired, remainingWait(time));
	}

	function trailingEdge(time: number) {
		timerId = undefined;
		return invokeFunc(time);
	}

	function cancel() {
		if (timerId !== undefined) {
			clearTimeout(timerId);
		}

		lastInvokeTime = 0;
		lastArgs = undefined;
		lastCallTime = undefined;
		timerId = undefined;
	}

	function flush() {
		return timerId === undefined ? result : trailingEdge(Date.now());
	}

	function debounced(...args: FnArgumentsType) {
		let time = Date.now();
		let isInvoking = shouldInvoke(time);

		lastArgs = args;
		lastCallTime = time;

		if (isInvoking) {
			if (timerId === undefined) {
				return leadingEdge(lastCallTime);
			}
			if (maxWait !== null) {
				// Handle invocations in a tight loop.
				timerId = setTimeout(timerExpired, wait);
				return invokeFunc(lastCallTime);
			}
		}

		if (timerId === undefined) {
			timerId = setTimeout(timerExpired, wait);
		}

		return result;
	}

	debounced.cancel = cancel;
	debounced.flush = flush;

	return debounced;
}
