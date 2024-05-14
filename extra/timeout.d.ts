/**
 * Call a function after a specified time interval.
 *
 * #### Notes
 *
 * This is PopClip's own implementation of the standard
 * [setTimeout](http://developer.mozilla.org/en-US/docs/Web/API/SetTimeout) function,
 * as found in browsers.
 * Ordinarily you shouldn't need to use this. It is is mainly included for
 * compatibility with libraries that might need it.
 *
 * @param callback A function to be called after the timer expires.
 * @param timeout Timeout in milliseconds. If this parameter is omitted, a value of 0 is used,
 * @param args Additional arguments to be passed to the callback function.
 * @returns Numeric identifier for the timer which can be passed to  {@link clearTimeout} to cancel it.
 */
declare function setTimeout(
	callback: (...args: any) => void,
	timeout?: number,
	...args: any
): number;

/**
 * Cancels a timeout prevouly created with  {@link setTimeout}.
 * @param timeoutId Identifier of the timeout to cancel.
 */
declare function clearTimeout(timeoutId: number): void;
