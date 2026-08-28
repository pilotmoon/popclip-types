/* ==========================================================================
   Environment
   ==========================================================================

   The globals PopClip's JavaScript environment provides beyond the language
   itself. The engine is macOS's JavaScriptCore; it is not a browser and not
   Node. ES2023 is the guaranteed language baseline on every macOS version
   PopClip runs on. Built-in objects and methods from ES2024 and ES2025 — for
   example `Object.groupBy`, `Promise.withResolvers`, the iterator helpers and
   the `Set` operations — are also available on every macOS version (the
   exceptions: `ArrayBuffer.prototype.transfer` needs macOS 14.4, and
   `Float16Array` needs macOS 15.2). New *syntax* is capped by the system
   engine, however, and may not parse on older macOS: the regular expression
   `v` flag (ES2024) requires macOS 14, and regular expression modifiers
   `(?i:…)` (ES2025) require macOS 26. Only what is declared here
   exists: there is no `fetch`, `document`, `localStorage` or `process`, and
   `Blob` and `TextEncoder` are narrower than their Web API namesakes.
   ========================================================================== */

/**
 * Node-compatible `Buffer`, a `Uint8Array` subclass for working with binary
 * data. PopClip installs it as a global and it is also loadable as
 * `require("buffer")`. The implementation is a modified
 * version of the `buffer` npm package (6.0.3).
 *
 * Refer also to the [Node.js `Buffer` documentation](https://nodejs.org/api/buffer.html):
 * the API follows Node's, though only the members declared here are
 * guaranteed to be present.
 *
 * The usual way in is {@link Buffer.from}, and the way back out is
 * {@link Buffer.toString}: together they convert between strings, binary
 * data and binary-to-text encodings. The supported encodings are `"utf8"`
 * (the default), `"utf16le"`, `"latin1"`, `"ascii"`, `"base64"`,
 * `"base64url"` and `"hex"`.
 *
 * @example
 * ```js
 * // Buffer.from() encodes a string into bytes
 * const b = Buffer.from("hello"); // 5 bytes of UTF-8: 68 65 6c 6c 6f
 * print(b.length); // 5
 *
 * // toString() renders the bytes in any encoding
 * print(b.toString("hex")); // 68656c6c6f
 * print(b.toString("base64")); // aGVsbG8=
 *
 * // pass an encoding to Buffer.from() to decode from it
 * print(Buffer.from("aGVsbG8=", "base64").toString()); // hello
 * print(Buffer.from("68656c6c6f", "hex").toString()); // hello
 *
 * // bytes can also come from an array, or any Uint8Array
 * print(Buffer.from([0xfb, 0xef, 0xff]).toString("base64url")); // --__
 *
 * // byte length is not string length, once outside ASCII
 * print("héllo".length, Buffer.byteLength("héllo")); // 5 6
 *
 * // wrap a Uint8Array with Buffer.from() to use Buffer's methods on it
 * const digest = Buffer.from(util.hash(b, "sha256"));
 * print(digest.toString("hex")); // 2cf24dba5fb0a30e26e83b2ac5b9e29e…
 * ```
 */
declare class Buffer extends Uint8Array {
  /** Length of the buffer in bytes. */
  length: number
  /** Writes `string` into the buffer at `offset`, in the given encoding (default `"utf8"`). Returns the number of bytes written. */
  write(string: string, offset?: number, length?: number, encoding?: string): number;
  /** Decodes the buffer, or the byte range [start, end), into a string using the given encoding (default `"utf8"`). */
  toString(encoding?: string, start?: number, end?: number): string;
  /** Returns a `{ type: "Buffer", data: [...] }` representation of the buffer. (Called by `JSON.stringify()`.) */
  toJSON(): { type: 'Buffer', data: any[] };
  /** Returns whether this buffer contains exactly the same bytes as `otherBuffer`. */
  equals(otherBuffer: Buffer): boolean;
  /** Compares this buffer (or a range of it) with `otherBuffer` (or a range of it), returning -1, 0 or 1 for use in sorting. */
  compare(otherBuffer: Uint8Array, targetStart?: number, targetEnd?: number, sourceStart?: number, sourceEnd?: number): number;
  /** Copies a byte range of this buffer into `targetBuffer`, even where the ranges overlap. Returns the number of bytes copied. */
  copy(targetBuffer: Buffer, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
  /** Returns a new `Buffer` for the byte range [start, end), sharing this buffer's memory. (Unlike `Uint8Array.prototype.slice`, which copies.) */
  slice(start?: number, end?: number): Buffer;
  /** Writes `value` at `offset` as an unsigned little-endian integer of `byteLength` bytes (up to 6). Returns `offset` plus the bytes written. */
  writeUIntLE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as an unsigned big-endian integer of `byteLength` bytes (up to 6). Returns `offset` plus the bytes written. */
  writeUIntBE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as a signed little-endian integer of `byteLength` bytes (up to 6). Returns `offset` plus the bytes written. */
  writeIntLE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as a signed big-endian integer of `byteLength` bytes (up to 6). Returns `offset` plus the bytes written. */
  writeIntBE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
  /** Reads `byteLength` bytes (up to 6) at `offset` as an unsigned little-endian integer. */
  readUIntLE(offset: number, byteLength: number, noAssert?: boolean): number;
  /** Reads `byteLength` bytes (up to 6) at `offset` as an unsigned big-endian integer. */
  readUIntBE(offset: number, byteLength: number, noAssert?: boolean): number;
  /** Reads `byteLength` bytes (up to 6) at `offset` as a signed little-endian integer. */
  readIntLE(offset: number, byteLength: number, noAssert?: boolean): number;
  /** Reads `byteLength` bytes (up to 6) at `offset` as a signed big-endian integer. */
  readIntBE(offset: number, byteLength: number, noAssert?: boolean): number;
  /** Reads an unsigned 8-bit integer at `offset`. */
  readUInt8(offset: number, noAssert?: boolean): number;
  /** Reads an unsigned little-endian 16-bit integer at `offset`. */
  readUInt16LE(offset: number, noAssert?: boolean): number;
  /** Reads an unsigned big-endian 16-bit integer at `offset`. */
  readUInt16BE(offset: number, noAssert?: boolean): number;
  /** Reads an unsigned little-endian 32-bit integer at `offset`. */
  readUInt32LE(offset: number, noAssert?: boolean): number;
  /** Reads an unsigned big-endian 32-bit integer at `offset`. */
  readUInt32BE(offset: number, noAssert?: boolean): number;
  /** Reads an unsigned little-endian 64-bit integer at `offset`, as a `bigint`. */
  readBigUInt64LE(offset: number): bigint;
  /** Reads an unsigned big-endian 64-bit integer at `offset`, as a `bigint`. */
  readBigUInt64BE(offset: number): bigint;
  /** Reads a signed 8-bit integer at `offset`. */
  readInt8(offset: number, noAssert?: boolean): number;
  /** Reads a signed little-endian 16-bit integer at `offset`. */
  readInt16LE(offset: number, noAssert?: boolean): number;
  /** Reads a signed big-endian 16-bit integer at `offset`. */
  readInt16BE(offset: number, noAssert?: boolean): number;
  /** Reads a signed little-endian 32-bit integer at `offset`. */
  readInt32LE(offset: number, noAssert?: boolean): number;
  /** Reads a signed big-endian 32-bit integer at `offset`. */
  readInt32BE(offset: number, noAssert?: boolean): number;
  /** Reads a signed little-endian 64-bit integer at `offset`, as a `bigint`. */
  readBigInt64LE(offset: number): bigint;
  /** Reads a signed big-endian 64-bit integer at `offset`, as a `bigint`. */
  readBigInt64BE(offset: number): bigint;
  /** Reads a little-endian 32-bit float at `offset`. */
  readFloatLE(offset: number, noAssert?: boolean): number;
  /** Reads a big-endian 32-bit float at `offset`. */
  readFloatBE(offset: number, noAssert?: boolean): number;
  /** Reads a little-endian 64-bit double at `offset`. */
  readDoubleLE(offset: number, noAssert?: boolean): number;
  /** Reads a big-endian 64-bit double at `offset`. */
  readDoubleBE(offset: number, noAssert?: boolean): number;
  /** Reverses the buffer in place and returns it. */
  reverse(): this;
  /** Swaps the buffer's byte order in place, treating it as an array of 16-bit values. Throws if the length is not a multiple of 2. */
  swap16(): Buffer;
  /** Swaps the buffer's byte order in place, treating it as an array of 32-bit values. Throws if the length is not a multiple of 4. */
  swap32(): Buffer;
  /** Swaps the buffer's byte order in place, treating it as an array of 64-bit values. Throws if the length is not a multiple of 8. */
  swap64(): Buffer;
  /** Writes `value` at `offset` as an unsigned 8-bit integer. Returns `offset` plus the bytes written. */
  writeUInt8(value: number, offset: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as an unsigned little-endian 16-bit integer. Returns `offset` plus the bytes written. */
  writeUInt16LE(value: number, offset: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as an unsigned big-endian 16-bit integer. Returns `offset` plus the bytes written. */
  writeUInt16BE(value: number, offset: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as an unsigned little-endian 32-bit integer. Returns `offset` plus the bytes written. */
  writeUInt32LE(value: number, offset: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as an unsigned big-endian 32-bit integer. Returns `offset` plus the bytes written. */
  writeUInt32BE(value: number, offset: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as an unsigned little-endian 64-bit integer. Returns `offset` plus the bytes written. */
  writeBigUInt64LE(value: bigint, offset: number): number;
  /** Writes `value` at `offset` as an unsigned big-endian 64-bit integer. Returns `offset` plus the bytes written. */
  writeBigUInt64BE(value: bigint, offset: number): number;
  /** Writes `value` at `offset` as a signed 8-bit integer. Returns `offset` plus the bytes written. */
  writeInt8(value: number, offset: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as a signed little-endian 16-bit integer. Returns `offset` plus the bytes written. */
  writeInt16LE(value: number, offset: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as a signed big-endian 16-bit integer. Returns `offset` plus the bytes written. */
  writeInt16BE(value: number, offset: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as a signed little-endian 32-bit integer. Returns `offset` plus the bytes written. */
  writeInt32LE(value: number, offset: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as a signed big-endian 32-bit integer. Returns `offset` plus the bytes written. */
  writeInt32BE(value: number, offset: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as a signed little-endian 64-bit integer. Returns `offset` plus the bytes written. */
  writeBigInt64LE(value: bigint, offset: number): number;
  /** Writes `value` at `offset` as a signed big-endian 64-bit integer. Returns `offset` plus the bytes written. */
  writeBigInt64BE(value: bigint, offset: number): number;
  /** Writes `value` at `offset` as a little-endian 32-bit float. Returns `offset` plus the bytes written. */
  writeFloatLE(value: number, offset: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as a big-endian 32-bit float. Returns `offset` plus the bytes written. */
  writeFloatBE(value: number, offset: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as a little-endian 64-bit double. Returns `offset` plus the bytes written. */
  writeDoubleLE(value: number, offset: number, noAssert?: boolean): number;
  /** Writes `value` at `offset` as a big-endian 64-bit double. Returns `offset` plus the bytes written. */
  writeDoubleBE(value: number, offset: number, noAssert?: boolean): number;
  /** Fills the buffer, or the byte range [offset, end), with `value`, repeating or truncating it as necessary. Returns the buffer. */
  fill(value: any, offset?: number, end?: number): this;
  /** Returns the index of the first occurrence of `value` at or after `byteOffset`, or -1. Strings are interpreted in `encoding` (default `"utf8"`). */
  indexOf(value: string | number | Buffer, byteOffset?: number, encoding?: string): number;
  /** Returns the index of the last occurrence of `value`, searching backwards from `byteOffset`, or -1. */
  lastIndexOf(value: string | number | Buffer, byteOffset?: number, encoding?: string): number;
  /** Returns whether the buffer contains `value`. */
  includes(value: string | number | Buffer, byteOffset?: number, encoding?: string): boolean;

  /** Allocates a new buffer containing the string `str`, in the given encoding (default `"utf8"`). Prefer {@link Buffer.from}. */
  constructor (str: string, encoding?: string);
  /** Allocates a new buffer of `size` bytes. Prefer {@link Buffer.alloc}. */
  constructor (size: number);
  /** Allocates a new buffer containing a copy of the given bytes. Prefer {@link Buffer.from}. */
  constructor (array: Uint8Array);
  /** Creates a buffer viewing the same memory as `arrayBuffer`. Prefer {@link Buffer.from}. */
  constructor (arrayBuffer: ArrayBuffer);
  /** Allocates a new buffer containing the given array of bytes. Prefer {@link Buffer.from}. */
  constructor (array: any[]);
  /** Copies the data of `buffer` into a new buffer. Prefer {@link Buffer.from}. */
  constructor (buffer: Buffer);
  prototype: Buffer;
  /** Allocates a new buffer containing the given array of bytes. */
  static from(array: any[]): Buffer;
  /**
   * Creates a buffer viewing the same memory as `arrayBuffer` (for example,
   * the `.buffer` property of a typed array), optionally restricted to the
   * range given by `byteOffset` and `length`.
   */
  static from(arrayBuffer: ArrayBuffer, byteOffset?: number, length?: number): Buffer;
  /** Copies the bytes of `buffer` into a new buffer. */
  static from(buffer: Buffer | Uint8Array): Buffer;
  /** Creates a new buffer containing the string `str`, in the given encoding (default `"utf8"`). */
  static from(str: string, encoding?: string): Buffer;
  /** Returns whether `obj` is a `Buffer`. */
  static isBuffer(obj: any): obj is Buffer;
  /** Returns whether `encoding` names a supported encoding, such as `"utf8"`, `"utf16le"`, `"latin1"`, `"base64"`, `"base64url"` or `"hex"`. */
  static isEncoding(encoding: string): boolean;
  /**
   * Returns the byte length of `string` in the given encoding (default
   * `"utf8"`). Not the same as `String.prototype.length`, which counts
   * UTF-16 code units rather than bytes.
   */
  static byteLength(string: string, encoding?: string): number;
  /**
   * Concatenates the buffers in `list` into a new buffer. If `totalLength`
   * (the total length of the buffers) is not provided, it is measured from
   * the list, which is slower.
   */
  static concat(list: Uint8Array[], totalLength?: number): Buffer;
  /** The same as `buf1.compare(buf2)`. Useful for sorting an array of buffers. */
  static compare(buf1: Uint8Array, buf2: Uint8Array): number;
  /**
   * Allocates a new buffer of `size` bytes, filled with zeros — or, if
   * `fill` is given, initialized by calling `buf.fill(fill)` (with
   * `encoding`, if given).
   */
  static alloc(size: number, fill?: string | Buffer | number, encoding?: string): Buffer;
  /**
   * Allocates a new buffer of `size` bytes without initializing the memory.
   * The buffer's contents are unknown and may contain sensitive data; fill
   * it completely before use.
   */
  static allocUnsafe(size: number): Buffer;
  /**
   * Like {@link Buffer.allocUnsafe} — a new buffer of `size` bytes with
   * uninitialized memory — but never allocated from the internal pool.
   */
  static allocUnsafeSlow(size: number): Buffer;
}

/**
 * A binary large object. Present for compatibility, since some libraries
 * expect to find it; prefer {@link Buffer} for working with binary data.
 *
 * PopClip's implementation is the `node-blob` package,
 * which is smaller than the Web API
 * [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob): there is
 * no `text()`, `arrayBuffer()` or `stream()` method. Read the contents through
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
 * the `Uint8Array` returned by the Web API
 * [`TextEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder). (`Buffer` is a `Uint8Array`
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
 * Parses a URL string into its components, and builds URL strings from
 * components. This is the standard Web API
 * [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) class: MDN
 * documents it in further depth, though only the members declared here are
 * guaranteed to be present.
 *
 * The component properties may be assigned to modify the URL in place; each
 * assignment updates {@link href}, percent-encoding characters where the URL
 * syntax requires it. Use {@link searchParams} to read and edit the query
 * string.
 *
 * Instances may be passed directly to {@link PopClip.openUrl} and
 * {@link PopClip.share}.
 *
 * @example
 * ```js
 * const url = new URL("https://example.com/docs?q=hello#top");
 * print(url.host);     // example.com
 * print(url.pathname); // /docs
 * url.searchParams.set("q", "goodbye");
 * url.hash = "";
 * print(url.href);     // https://example.com/docs?q=goodbye
 * ```
 */
declare class URL {
  /**
   * Parses a URL from a string. Throws a `TypeError` if the result is not a
   * valid URL.
   *
   * @param url The URL string. May be relative if `base` is given.
   * @param base A base URL to resolve `url` against.
   */
  constructor(url: string, base?: string | URL);
  /** The fragment, with its leading `#` — e.g. `"#top"`. Empty string if the URL has no fragment. */
  hash: string;
  /** The hostname, plus `:` and the port if one is specified — e.g. `"example.com:8080"`. */
  host: string;
  /** The hostname alone, without the port — e.g. `"example.com"`. */
  hostname: string;
  /** The whole URL as a string. Assigning to it replaces the entire URL, throwing a `TypeError` if the new value cannot be parsed. */
  href: string;
  /** The scheme, hostname and port — e.g. `"https://example.com:8080"`. */
  readonly origin: string;
  /** The password given before the hostname. Empty string if there is none. */
  password: string;
  /** The path, beginning with `/` — e.g. `"/docs/index.html"`. */
  pathname: string;
  /** The port number as a string — e.g. `"8080"`. Empty string if no port is specified or it is the default for the scheme. */
  port: string;
  /** The scheme, with its trailing `:` — e.g. `"https:"`. */
  protocol: string;
  /** The query string, with its leading `?` — e.g. `"?q=hello"`. Empty string if the URL has no query. Assigning replaces the whole query. */
  search: string;
  /** A live {@link URLSearchParams} view of the query string. Changes made through it are reflected in {@link search} and {@link href}. */
  readonly searchParams: URLSearchParams;
  /** The username given before the hostname. Empty string if there is none. */
  username: string;
  /** Returns {@link href}. */
  toString(): string;
  /** Returns {@link href}. (Called by `JSON.stringify()`.) */
  toJSON(): string;
}

/**
 * An ordered list of name–value pairs, representing a parsed URL query
 * string. This is the standard Web API
 * [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
 * class: MDN documents it in further depth, though only the members declared
 * here are guaranteed to be present.
 *
 * Obtain one from a {@link URL}'s `searchParams` property, or construct one
 * standalone. Names and values are stored in decoded form; percent-decoding
 * happens on parsing and encoding on serialization. The same name may appear
 * in more than one pair: {@link append} adds a pair unconditionally while
 * {@link set} replaces, and {@link get} returns the first value while
 * {@link getAll} returns all of them.
 *
 * Note that {@link toString} serializes in `application/x-www-form-urlencoded`
 * form, which encodes spaces as `+` rather than `%20`. See
 * {@link PopClip.openUrl} for how PopClip compensates for this.
 *
 * @example
 * ```js
 * const params = new URLSearchParams("a=1&b=2");
 * params.append("b", "3");
 * print(params.get("a"));            // 1
 * print(params.getAll("b").join(",")); // 2,3
 * print(params.toString());          // a=1&b=2&b=3
 * ```
 */
declare class URLSearchParams {
  /**
   * @param init The initial pairs: a query string (an initial `?`, if
   * present, is ignored), an array of `[name, value]` pairs, an object of
   * names to values, or another `URLSearchParams` to copy. Omit for an
   * empty list.
   */
  constructor(
    init?: string | string[][] | Record<string, string> | URLSearchParams,
  );
  /** Adds a pair to the end of the list, keeping any existing pairs with the same name. */
  append(name: string, value: string): void;
  /** Removes all pairs with the given name. */
  delete(name: string): void;
  /** Returns the value of the first pair with the given name, or `null` if there is none. */
  get(name: string): string | null;
  /** Returns the values of all pairs with the given name, in order. */
  getAll(name: string): string[];
  /** Returns whether at least one pair with the given name exists. */
  has(name: string): boolean;
  /** Sets the value of the first pair with the given name and removes any others — or appends the pair if the name is not present. */
  set(name: string, value: string): void;
  /** Sorts the pairs by name, keeping the relative order of pairs with the same name. */
  sort(): void;
  /** Calls a function once for each pair, in order. */
  forEach(
    callback: (value: string, name: string, parent: URLSearchParams) => void,
  ): void;
  /** Iterates over the names, in pair order. A repeated name appears once per pair. */
  keys(): IterableIterator<string>;
  /** Iterates over the values, in pair order. */
  values(): IterableIterator<string>;
  /** Iterates over the pairs as `[name, value]` arrays. */
  entries(): IterableIterator<[string, string]>;
  /** Same as {@link entries}: iterating the object itself yields `[name, value]` pairs. */
  [Symbol.iterator](): IterableIterator<[string, string]>;
  /** Serializes the pairs as a query string in `application/x-www-form-urlencoded` form (spaces become `+`), without a leading `?`. */
  toString(): string;
}

/**
 * Makes an HTTP request. PopClip implements the subset of the Web API
 * [`XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
 * declared here; there is no `fetch()`. MDN documents general `XMLHttpRequest`
 * usage in further depth.
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

/**
 * Calls a function after at least the given delay in milliseconds, following
 * the Web API
 * [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)
 * in the form declared here (there is no extra-arguments form).
 *
 * See also {@link sleep}, a promise-based wrapper around this.
 *
 * @returns An id that may be passed to {@link clearTimeout}.
 */
declare function setTimeout(
  handler: () => void,
  timeoutMilliseconds?: number,
): number;

/** Cancels a timeout created by {@link setTimeout}. */
declare function clearTimeout(id?: number): void;

/**
 * Calls a function repeatedly, with the given interval in milliseconds,
 * following the Web API
 * [`setInterval`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)
 * in the form declared here (there is no extra-arguments form).
 *
 * @returns An id that may be passed to {@link clearInterval}.
 */
declare function setInterval(
  handler: () => void,
  intervalMilliseconds?: number,
): number;

/** Cancels an interval created by {@link setInterval}. */
declare function clearInterval(id?: number): void;

/**
 * Decodes a base64-encoded string, per the Web API
 * [`atob`](https://developer.mozilla.org/en-US/docs/Web/API/Window/atob).
 * Present for compatibility, since some libraries expect to find it; prefer
 * {@link Util.base64Decode} or `Buffer.from(encodedData, "base64")`.
 * @hidden
 */
declare function atob(encodedData: string): string;

/**
 * Encodes a string as base64, per the Web API
 * [`btoa`](https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa).
 * Present for compatibility, since some libraries expect to find it; prefer
 * {@link Util.base64Encode} or
 * `Buffer.from(stringToEncode).toString("base64")`.
 * @hidden
 */
declare function btoa(stringToEncode: string): string;

/**
 * Deep-copies a value using the structured clone algorithm, following the
 * Web API
 * [`structuredClone`](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone)
 * (without the `transfer` option).
 */
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
