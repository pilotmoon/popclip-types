/* Declare ambient module + exports for CommonJS-style exporting */
declare const module: { exports: any };
declare const exports: any;

/**
 * Import an object from another file.
 *
 * #### Notes
 *
 * PopClip's `require()` implementation attempts to import from the following module formats:
 *
 * - AMD modules, which use `define(...)`.
 * - CommonJS modules, which use `module.exports = ...` or `exports.name = ...`
 * - TypeScript-compiled ES modules, which use `exports.default = ...`
 *
 * #### Notes
 *
 * Paths beginning with `./` or `../` are resolved relative to the the location of the current file.
 *
 * Otherwise, the path is resolved relative to the extensions's package root.
 * If there is no file in the extension, PopClip will look in its internal module repository.
 *
 * If no file extension is given, PopCLip will try adding the extensions `.js`, `.ts`, `.json` in that order.
 *
 * TypeScript files are transpiled to JavaScript on the fly.
 *
 * JSON files are parsed and returned as an object.å
 *
 * @param file Path to the file to import.
 * @return The imported object.
 */
declare function require(file: string): object;
