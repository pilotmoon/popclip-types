/* WebAPI and Node.js Globals
 * The following functions and objects are available in PopClip via polyfills.
 * TODO: Not sure how to improve typings for these?
 */

// these are from WebAPI, and are implemented in PopClip with polyfills from `core-js` library
declare function btoa(string: string): string;
declare function atob(string: string): string;
declare function structuredClone<T>(value: T): T;
declare const URL: any;
declare const URLSearchParams: any;

// XMLHttpRequest is implemented natively in PopClip
declare const XMLHttpRequest: any;

// Blob is is a WebAPI object, implemented in PopClip with 'node-blob` library
declare const Blob: any;

// Buffer is a node.js object, implemented in PopClip with 'buffer' library
declare const Buffer: any;
