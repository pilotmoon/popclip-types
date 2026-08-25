/* ==========================================================================
   Environment
   ==========================================================================

   The globals PopClip's JavaScript environment provides beyond the language
   itself. The engine is JavaScriptCore with core-js polyfills and a small set
   of shims; it is not a browser and not Node. Only what is declared here
   exists: there is no `fetch`, `document`, `localStorage` or `process`, and
   `Blob` and `TextEncoder` are narrower than their Web API namesakes.
   ========================================================================== */

/**
 * Node-compatible `Buffer`, a `Uint8Array` subclass for working with binary
 * data. PopClip installs it as a global; the implementation is the `buffer`
 * npm package (6.0.3), which is also loadable as `require("buffer")`.
 *
 * @example
 * ```js
 * const b = Buffer.from("hello", "utf8");
 * print(b.toString("base64")); // aGVsbG8=
 * ```
 */
declare class Buffer extends Uint8Array {
  length: number
  write(string: string, offset?: number, length?: number, encoding?: string): number;
  toString(encoding?: string, start?: number, end?: number): string;
  toJSON(): { type: 'Buffer', data: any[] };
  equals(otherBuffer: Buffer): boolean;
  compare(otherBuffer: Uint8Array, targetStart?: number, targetEnd?: number, sourceStart?: number, sourceEnd?: number): number;
  copy(targetBuffer: Buffer, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
  slice(start?: number, end?: number): Buffer;
  writeUIntLE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
  writeUIntBE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
  writeIntLE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
  writeIntBE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
  readUIntLE(offset: number, byteLength: number, noAssert?: boolean): number;
  readUIntBE(offset: number, byteLength: number, noAssert?: boolean): number;
  readIntLE(offset: number, byteLength: number, noAssert?: boolean): number;
  readIntBE(offset: number, byteLength: number, noAssert?: boolean): number;
  readUInt8(offset: number, noAssert?: boolean): number;
  readUInt16LE(offset: number, noAssert?: boolean): number;
  readUInt16BE(offset: number, noAssert?: boolean): number;
  readUInt32LE(offset: number, noAssert?: boolean): number;
  readUInt32BE(offset: number, noAssert?: boolean): number;
  readBigUInt64LE(offset: number): bigint;
  readBigUInt64BE(offset: number): bigint;
  readInt8(offset: number, noAssert?: boolean): number;
  readInt16LE(offset: number, noAssert?: boolean): number;
  readInt16BE(offset: number, noAssert?: boolean): number;
  readInt32LE(offset: number, noAssert?: boolean): number;
  readInt32BE(offset: number, noAssert?: boolean): number;
  readBigInt64LE(offset: number): bigint;
  readBigInt64BE(offset: number): bigint;
  readFloatLE(offset: number, noAssert?: boolean): number;
  readFloatBE(offset: number, noAssert?: boolean): number;
  readDoubleLE(offset: number, noAssert?: boolean): number;
  readDoubleBE(offset: number, noAssert?: boolean): number;
  reverse(): this;
  swap16(): Buffer;
  swap32(): Buffer;
  swap64(): Buffer;
  writeUInt8(value: number, offset: number, noAssert?: boolean): number;
  writeUInt16LE(value: number, offset: number, noAssert?: boolean): number;
  writeUInt16BE(value: number, offset: number, noAssert?: boolean): number;
  writeUInt32LE(value: number, offset: number, noAssert?: boolean): number;
  writeUInt32BE(value: number, offset: number, noAssert?: boolean): number;
  writeBigUInt64LE(value: bigint, offset: number): number;
  writeBigUInt64BE(value: bigint, offset: number): number;
  writeInt8(value: number, offset: number, noAssert?: boolean): number;
  writeInt16LE(value: number, offset: number, noAssert?: boolean): number;
  writeInt16BE(value: number, offset: number, noAssert?: boolean): number;
  writeInt32LE(value: number, offset: number, noAssert?: boolean): number;
  writeInt32BE(value: number, offset: number, noAssert?: boolean): number;
  writeBigInt64LE(value: bigint, offset: number): number;
  writeBigInt64BE(value: bigint, offset: number): number;
  writeFloatLE(value: number, offset: number, noAssert?: boolean): number;
  writeFloatBE(value: number, offset: number, noAssert?: boolean): number;
  writeDoubleLE(value: number, offset: number, noAssert?: boolean): number;
  writeDoubleBE(value: number, offset: number, noAssert?: boolean): number;
  fill(value: any, offset?: number, end?: number): this;
  indexOf(value: string | number | Buffer, byteOffset?: number, encoding?: string): number;
  lastIndexOf(value: string | number | Buffer, byteOffset?: number, encoding?: string): number;
  includes(value: string | number | Buffer, byteOffset?: number, encoding?: string): boolean;

  /**
   * Allocates a new buffer containing the given {str}.
   *
   * @param str String to store in buffer.
   * @param encoding encoding to use, optional.  Default is 'utf8'
   */
  constructor (str: string, encoding?: string);
  /**
   * Allocates a new buffer of {size} octets.
   *
   * @param size count of octets to allocate.
   */
  constructor (size: number);
  /**
   * Allocates a new buffer containing the given {array} of octets.
   *
   * @param array The octets to store.
   */
  constructor (array: Uint8Array);
  /**
   * Produces a Buffer backed by the same allocated memory as
   * the given {ArrayBuffer}.
   *
   *
   * @param arrayBuffer The ArrayBuffer with which to share memory.
   */
  constructor (arrayBuffer: ArrayBuffer);
  /**
   * Allocates a new buffer containing the given {array} of octets.
   *
   * @param array The octets to store.
   */
  constructor (array: any[]);
  /**
   * Copies the passed {buffer} data onto a new {Buffer} instance.
   *
   * @param buffer The buffer to copy.
   */
  constructor (buffer: Buffer);
  prototype: Buffer;
  /**
   * Allocates a new Buffer using an {array} of octets.
   *
   * @param array
   */
  static from(array: any[]): Buffer;
  /**
   * When passed a reference to the .buffer property of a TypedArray instance,
   * the newly created Buffer will share the same allocated memory as the TypedArray.
   * The optional {byteOffset} and {length} arguments specify a memory range
   * within the {arrayBuffer} that will be shared by the Buffer.
   *
   * @param arrayBuffer The .buffer property of a TypedArray or a new ArrayBuffer()
   * @param byteOffset
   * @param length
   */
  static from(arrayBuffer: ArrayBuffer, byteOffset?: number, length?: number): Buffer;
  /**
   * Copies the passed {buffer} data onto a new Buffer instance.
   *
   * @param buffer
   */
  static from(buffer: Buffer | Uint8Array): Buffer;
  /**
   * Creates a new Buffer containing the given JavaScript string {str}.
   * If provided, the {encoding} parameter identifies the character encoding.
   * If not provided, {encoding} defaults to 'utf8'.
   *
   * @param str
   */
  static from(str: string, encoding?: string): Buffer;
  /**
   * Returns true if {obj} is a Buffer
   *
   * @param obj object to test.
   */
  static isBuffer(obj: any): obj is Buffer;
  /**
   * Returns true if {encoding} is a valid encoding argument.
   * Valid string encodings in Node 0.12: 'ascii'|'utf8'|'utf16le'|'ucs2'(alias of 'utf16le')|'base64'|'binary'(deprecated)|'hex'
   *
   * @param encoding string to test.
   */
  static isEncoding(encoding: string): boolean;
  /**
   * Gives the actual byte length of a string. encoding defaults to 'utf8'.
   * This is not the same as String.prototype.length since that returns the number of characters in a string.
   *
   * @param string string to test.
   * @param encoding encoding used to evaluate (defaults to 'utf8')
   */
  static byteLength(string: string, encoding?: string): number;
  /**
   * Returns a buffer which is the result of concatenating all the buffers in the list together.
   *
   * If the list has no items, or if the totalLength is 0, then it returns a zero-length buffer.
   * If the list has exactly one item, then the first item of the list is returned.
   * If the list has more than one item, then a new Buffer is created.
   *
   * @param list An array of Buffer objects to concatenate
   * @param totalLength Total length of the buffers when concatenated.
   *   If totalLength is not provided, it is read from the buffers in the list. However, this adds an additional loop to the function, so it is faster to provide the length explicitly.
   */
  static concat(list: Uint8Array[], totalLength?: number): Buffer;
  /**
   * The same as buf1.compare(buf2).
   */
  static compare(buf1: Uint8Array, buf2: Uint8Array): number;
  /**
   * Allocates a new buffer of {size} octets.
   *
   * @param size count of octets to allocate.
   * @param fill if specified, buffer will be initialized by calling buf.fill(fill).
   *    If parameter is omitted, buffer will be filled with zeros.
   * @param encoding encoding used for call to buf.fill while initializing
   */
  static alloc(size: number, fill?: string | Buffer | number, encoding?: string): Buffer;
  /**
   * Allocates a new buffer of {size} octets, leaving memory not initialized, so the contents
   * of the newly created Buffer are unknown and may contain sensitive data.
   *
   * @param size count of octets to allocate
   */
  static allocUnsafe(size: number): Buffer;
  /**
   * Allocates a new non-pooled buffer of {size} octets, leaving memory not initialized, so the contents
   * of the newly created Buffer are unknown and may contain sensitive data.
   *
   * @param size count of octets to allocate
   */
  static allocUnsafeSlow(size: number): Buffer;
}

/**
 * A binary large object. Present for compatibility, since some libraries
 * expect to find it; prefer {@link Buffer} for working with binary data.
 *
 * PopClip's implementation is the `node-blob` package,
 * which is smaller than the Web API `Blob`: there is no `text()`,
 * `arrayBuffer()` or `stream()` method. Read the contents through
 * {@link buffer} instead.
 *
 * A `Blob` may be passed as the body of an {@link XMLHttpRequest}.
 *
 * @example
 * ```js
 * const blob = new Blob(["hello"], { type: "text/plain" });
 * print(blob.size, blob.type, blob.buffer.toString("utf8"));
 * ```
 * @hidden
 */
declare class Blob {
  /**
   * @param blobParts Parts to concatenate. Strings, `Buffer`s, `ArrayBuffer`s,
   * typed arrays and other `Blob`s are used directly; anything else is
   * converted to a string first.
   * @param options `type` sets the blob's MIME type.
   */
  constructor(
    blobParts?: Array<string | Buffer | ArrayBuffer | ArrayBufferView | Blob>,
    options?: { type?: string },
  );

  /** The blob's contents. */
  buffer: Buffer;

  /** Length of the contents in bytes, or 0 once the blob has been closed. */
  readonly size: number;

  /** The blob's MIME type, or the empty string if none was given. */
  readonly type: string;

  /** Whether {@link close} has been called. */
  readonly isClosed: boolean;

  /**
   * Returns a new blob containing the given byte range. Negative values count
   * back from the end of the blob.
   */
  slice(start?: number, end?: number, type?: string): Blob;

  /** Marks the blob closed, after which {@link size} reads as 0. */
  close(): void;
}

/**
 * Encodes a string as UTF-8. Present for compatibility, since some libraries
 * expect to find it; prefer `Buffer.from(string, "utf8")`.
 *
 * PopClip's implementation supports only UTF-8, via the `encode()` method
 * and the `encoding` property, and returns a {@link Buffer} rather than
 * the `Uint8Array` returned by the Web API. (`Buffer` is a `Uint8Array`
 * subclass, so it may be used wherever one is expected.)
 * @hidden
 */
declare class TextEncoder {
  /** Always `"utf-8"`. */
  readonly encoding: string;

  /** Encodes the given string as UTF-8. */
  encode(input: string): Buffer;
}

/**
 * Parsed URL, as provided by core-js. Instances may be passed directly to
 * {@link PopClip.openUrl} and {@link PopClip.share}.
 */
declare class URL {
  constructor(url: string, base?: string | URL);
  hash: string;
  host: string;
  hostname: string;
  href: string;
  readonly origin: string;
  password: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  readonly searchParams: URLSearchParams;
  username: string;
  toString(): string;
  toJSON(): string;
}

/** Parsed query string, as provided by core-js. */
declare class URLSearchParams {
  constructor(
    init?: string | string[][] | Record<string, string> | URLSearchParams,
  );
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  set(name: string, value: string): void;
  sort(): void;
  forEach(
    callback: (value: string, name: string, parent: URLSearchParams) => void,
  ): void;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
  entries(): IterableIterator<[string, string]>;
  [Symbol.iterator](): IterableIterator<[string, string]>;
  toString(): string;
}

/**
 * Makes an HTTP request. PopClip implements the subset of the Web API
 * declared here; there is no `fetch()`.
 *
 * Requires the `network` entitlement. Most extensions use the bundled `axios`
 * library, which is built on this.
 *
 * @example
 * ```js
 * const xhr = new XMLHttpRequest();
 * xhr.open("GET", "https://example.com/", true);
 * xhr.onload = () => print(xhr.status, xhr.responseText);
 * xhr.send();
 * ```
 */
declare class XMLHttpRequest {
  /** The response body, decoded according to {@link responseType}. */
  readonly response: any;
  /** The response body as text. */
  readonly responseText: string;
  /** How to interpret the response body, e.g. `"text"`, `"json"`, `"blob"`. */
  responseType: string;
  /** The final URL, after any redirects. */
  readonly responseURL: string;
  /** Request state: 0 unsent, 1 opened, 2 headers received, 3 loading, 4 done. */
  readonly readyState: number;
  /** HTTP status code. */
  readonly status: number;
  /** HTTP status message. */
  readonly statusText: string;
  /** Timeout in milliseconds. 0, the default, means no timeout. */
  timeout: number;

  onreadystatechange: (() => void) | null;
  onerror: (() => void) | null;
  onabort: (() => void) | null;
  ontimeout: (() => void) | null;
  onload: (() => void) | null;
  onloadstart: (() => void) | null;
  onloadend: (() => void) | null;

  /** Initializes the request. */
  open(httpMethod: string, url: string, async?: boolean): void;
  /** Sends the request, with an optional body. */
  send(body?: string | Blob | ArrayBuffer | ArrayBufferView | null): void;
  /** Aborts the request. */
  abort(): void;
  /** Sets a request header. Call after {@link open} and before {@link send}. */
  setRequestHeader(name: string, value: string): void;
  /** All response headers as a single string, with lowercased names. */
  getAllResponseHeaders(): string;
  /** A single response header, or null if not present. */
  getResponseHeader(name: string): string | null;
}

/** Calls a function after at least the given delay in milliseconds. */
declare function setTimeout(
  handler: () => void,
  timeoutMilliseconds?: number,
): number;

/** Cancels a timeout created by {@link setTimeout}. */
declare function clearTimeout(id?: number): void;

/** Calls a function repeatedly, with the given interval in milliseconds. */
declare function setInterval(
  handler: () => void,
  intervalMilliseconds?: number,
): number;

/** Cancels an interval created by {@link setInterval}. */
declare function clearInterval(id?: number): void;

/**
 * Decodes a base64-encoded string. Present for compatibility, since some
 * libraries expect to find it; prefer {@link Util.base64Decode}.
 * @hidden
 */
declare function atob(encodedData: string): string;

/**
 * Encodes a string as base64. Present for compatibility, since some libraries
 * expect to find it; prefer {@link Util.base64Encode}.
 * @hidden
 */
declare function btoa(stringToEncode: string): string;

/** Deep-copies a value using the structured clone algorithm. */
declare function structuredClone<T>(value: T): T;

/**
 * A reference to the global object, defined only so that bundled libraries
 * which probe for a browser environment still work. There is no DOM behind it
 * and no other browser API is implied by its presence. Declared so that such
 * code compiles; extensions should not use it.
 *
 * @hidden
 */
declare const window: typeof globalThis;
