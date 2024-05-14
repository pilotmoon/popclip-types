/**
 * Export an object for use by another file.
 *
 * #### Notes
 *
 * The _define_ function family exports an arbitrary object, which other files can import using  {@link require}.
 *
 * It should be called only once in any file; if it is called more than once, only the
 * final call will have any effect.
 *
 * Partially implements AMD spec: https://github.com/amdjs/amdjs-api/wiki/AMD
 *
 * Recommendation: instead of this, use  {@link defineExtension} or `module.exports = ...`.
 */
declare function define(object: object): void;
declare function define(factory: () => object): void;
declare function define(dependencies: string[], factory: () => object): void;
declare function define(id: string, factory: () => object): void;
declare function define(
	id: string,
	dependencies: string[],
	factory: () => object,
): void;
