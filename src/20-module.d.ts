/* ==========================================================================
   Module-based extensions
   ==========================================================================

   The types for writing an extension as a JavaScript or TypeScript module:
   `defineExtension()`, the `Extension` and `Action` objects it takes, the
   functions they may carry, the options array and `InferOptions`, and the
   module mechanism itself (`require`, `module`, `exports`).
   ========================================================================== */

/**
 * Exports the extension object from a module-based extension. This is a module's
 * entry point: PopClip loads the module, and the object given here defines the
 * extension's actions, options and behaviour.
 *
 * At runtime this is simply `module.exports = extension`, and the difference is
 * entirely one of types. Because the parameter is typed, every property of the
 * object literal written inside the call is checked and autocompleted in place,
 * with no type annotations anywhere. Assigning to `module.exports` carries no
 * type information, so nothing in the object is checked unless you first declare
 * a separate variable annotated as {@link Extension} — restating a type that is
 * already known here. For that reason this is the recommended way to write a
 * module extension.
 *
 * Note that a module's actions are invoked through their `code` function. The
 * action flags — `title`, `icon`, `requirements`, `regex`, `before`, `after` and
 * so on — work as they do in a static config, but the action-type properties
 * such as `url`, `keyCombo` and `shellScript` are static config only, and are
 * ignored here.
 *
 * @example
 * ```js
 * // the options array is declared first so its type can be inferred
 * const options = [
 *   { identifier: "prefix", type: "string", defaultValue: ">" },
 * ] as const;
 *
 * defineExtension<InferOptions<typeof options>>({
 *   options,
 *   action: (input, options) => {
 *     popclip.pasteText(options.prefix + input.text);
 *   },
 * });
 * ```
 *
 * Specifying the `CustomOptions` generic type parameter, as above, extends the
 * checking to the `options` parameter of action functions and the population
 * function, so `options.prefix` is known to exist and to be a string.
 * {@link InferOptions} derives that type from the options array itself, which
 * again avoids restating it.
 *
 * @param extension The extension object to export.
 */
declare function defineExtension<CustomOptions = Options>(
  extension: Extension<CustomOptions>,
): void;

/**
 * The Extension object defines the PopClip extension.
 */
interface Extension<CustomOptions = Options> extends ActionProperties {
  /**
   * Defines the user-configurable options for this extension.
   */
  options?: readonly Option[];

  /**
   * If you define this function then PopClip will display a 'sign in' button in the options UI. When the user clicks the button,
   * PopClip will call this function with an `info` object and a `flow` callback.
   *
   * If the sign in needs a username and password, you'll also need to define `username` and `password` options. PopClip will then pass the values
   * of those options in the info parameter. */
  auth?: AuthFunction;

  /**
   * Define the actions to go in PopClip's popup. This can be an array or a function.
   *
   * - If it's an array, the supplied actions are used in the popup, subject to meeting the
   *   requirements and regex conditions.
   *
   * - If it's a population function, it is called by PopClip to dynamically populate the popup with actions from this extension.
   *   Setting requirements and regex keys has no effect on dynamic actions — the function itself is responsible for deciding what actions to show.
   *   Population function requires the `dynamic` entitlement.
   */
  actions?:
    | (Action<CustomOptions> | ActionFunction<CustomOptions>)[]
    | PopulationFunction<CustomOptions>;

  /**
   * Simplified property to define a single action.
   */
  action?: Action<CustomOptions> | ActionFunction<CustomOptions>;

  /**
   * Makes the whole extension a single button that opens a submenu of child actions, as an
   * alternative to `actions`/`action`. Same shape as {@link Action.submenu}: a static array
   * of actions, or a population function (requires the `dynamic` entitlement).
   */
  submenu?:
    | (Action<CustomOptions> | ActionFunction<CustomOptions>)[]
    | PopulationFunction<CustomOptions>;

  /**
   * Exported test function for use during development.
   */
  test?: TestFunction;

  // Static-only properties: these can be set only in the extension's static
  // config, and cannot be overridden by a module.

  /**
   * Display name of the extension. In the static config this is the only
   * property that is always required. It cannot be set from a module, which
   * is why it is optional in this interface.
   * @hidden
   */
  name?: LocalizableString;

  /**
   * Unique identifier, e.g. `"com.example.myextension"`. Allowed characters are
   * `A-Z`, `a-z`, `0-9`, `.` and `-`. The prefix `com.pilotmoon.` is reserved.
   * If omitted, the package directory name or {@link name} is used. Static
   * config only.
   * @hidden
   */
  identifier?: string;

  /**
   * Capabilities the extension's JavaScript needs.
   * @hidden
   */
  entitlements?: Entitlement[];

  /**
   * Minimum PopClip version required, as an integer build number, e.g. `6134`.
   * @hidden
   */
  popclipVersion?: number;

  /**
   * Minimum macOS version required, e.g. `"12.0"`. Quote it in YAML.
   * @hidden
   */
  macosVersion?: string;

  /**
   * Default presentation of the extension's actions in the bar.
   * @hidden
   */
  showAs?: "icon" | "text";

  /** @hidden */
  color?: string;

  /**
   * Label for the service the user signs in to, used in prompts such as
   * "Sign in to your [label] account". Defaults to {@link name}.
   * @hidden
   */
  authServiceLabel?: LocalizableString;

  /**
   * Which keychain the sign-in secret goes in: `sync` (the default) — the
   * synchronizable keychain, shared across the user's devices via iCloud
   * Keychain — or `local`, kept only on the Mac where the user signed in.
   * The top-level counterpart of the per-option `keychain` key, for the
   * internal auth secret which has no declared option.
   * @hidden
   */
  authKeychain?: "sync" | "local";

  /**
   * Overrides PopClip's automatic decision about allowing multiple instances.
   * @hidden
   */
  offersMultipleInstances?: boolean;

  /**
   * Why this extension needs a shell script action. Required for directory submission.
   * @hidden
   */
  shellScriptRationale?: string;

  /**
   * Short description of the extension. Shown in the extensions directory.
   * @hidden
   */
  description?: LocalizableString;

  /**
   * Space-separated words to help people find the extension in the directory.
   * @hidden
   */
  keywords?: string;

  /**
   * For code snippets: the language of the snippet body. Defaults to
   * `typescript` when the header's comment style is `//`, and to
   * `applescript` when it is `--`.
   * @hidden
   */
  language?: "javascript" | "typescript" | "applescript";

  /**
   * Path to a JavaScript or TypeScript module to load. In an inverted-syntax
   * snippet, whether the body is a module is detected from its code (whether
   * it exports anything); set `true` or `false` to override the detection.
   * @hidden
   */
  module?: string | boolean;
}

/**
 * **Action** represents the properties of a single action.
 * An action with no `code` function displays a disabled title/icon only
 * (unless it is a {@link separator} or has a {@link submenu}).
 */
interface Action<CustomOptions = Options> extends ActionProperties {
  readonly code?: ActionFunction<CustomOptions>;

  /**
   * If `true`, this entry is a separator, rather than an action. It causes a section break
   * between buttons in a submenu. It has no effect outside submenus. Use it on its own; other properties are ignored.
   *
   * @example
   * ```js
   * actions: [
   *   { title: ..., icon: ... },
   *   { separator: true },
   *   { title: ..., icon: ... },
   * ]
   * ```
   */
  readonly separator?: boolean;

  /**
   * If set, clicking this action opens a submenu containing these child actions.
   *
   * - If it's an array, the supplied actions are used in the submenu.
   * - If it's a population function, it is called when the submenu opens to generate its
   *   actions dynamically. A submenu function requires the `dynamic` entitlement.
   *
   * The action's own title and icon label the submenu. If the action also defines `code`,
   * it stays directly clickable in addition to offering the submenu.
   */
  readonly submenu?:
    | (Action<CustomOptions> | ActionFunction<CustomOptions>)[]
    | PopulationFunction<CustomOptions>;

  /**
   * The action asks to be the popup's primary button — the one that is centred above
   * the pointer when the popup appears. Used by the built-in Copy and Paste actions.
   * If more than one visible button wants primary display, the leftmost button wins.
   */
  readonly wantsPrimaryDisplay?: boolean;

  /**
   * A submenu asks to be already open when the popup appears, instead of waiting to be
   * clicked. PopClip opens it directly, with a back button to reach the rest of the popup.
   * This is used by the built-in Spelling action.
   *
   * If more than one submenu asks for initial display, the first one found wins (left-to-right
   * search including subfolders). It has no effect on an action that is not a submenu.
   */
  readonly wantsInitialDisplay?: boolean;
}

/**
 * An action function is called when the user clicks the action button in PopClip. This is where
 * the extension does its main work.
 * @param input The selected text and related properties. (Same object as  {@link PopClip.input}.)
 * @param options Current values of the options for this extension. (Same object as  {@link PopClip.options}.)
 * @param context Information about the context surrounding the selection. (Same object as  {@link PopClip.context}.)
 */
type ActionFunction<CustomOptions = Options> = (
  input: Input,
  options: CustomOptions & AuthOptions,
  context: Context,
) => Promise<string | void> | string | void;

/**
 * A population function dynamically generates the actions for the extension. See  {@link Extension.actions}.
 * @param input The selected text and related properties. (Same object as  {@link PopClip.input}.)
 * @param options Current values of the options for this extension. (Same object as  {@link PopClip.options}.)
 * @param context Information about the context surrounding the selection. (Same object as  {@link PopClip.context}.)
 * @returns A single action or action function, an array of them, or nothing.
 */
type PopulationFunction<CustomOptions = Options> = (
  input: Input,
  options: CustomOptions,
  context: Context,
) => (Action | ActionFunction)[] | Action | ActionFunction | void;

/**
 * A function that can be used to verify the extension's functionality.
 * The test function should throw an error if the test fails, and exit normally if it succeeds.
 * PopClip doesn't currently call the test function but you can use it to test your extension
 * during development.
 */
type TestFunction = () => Promise<void> | void;

/**
 * Function signature of the  {@link Extension.auth} method.
 */
type AuthFunction = (
  info: AuthInfo,
  flow: AuthFlowFunction,
) => Promise<string | AuthResult>;

/**
 * The callback passed to the {@link Extension.auth} function as its second
 * parameter, for kicking off an authorization flow.
 */
type AuthFlowFunction = (
  url: string,
  params?: { [key: string]: string | undefined },
  expect?: string[],
) => Promise<any>;

/**
 * Credentials used in auth function
 * */
interface AuthInfo {
  /** Value of `username` option (will be empty string if none defined) */
  username: string;
  /** Value of `password` option (will be empty string if none defined) */
  password: string;
  /** An appropriate value to use as the redirection URL in authorization flows for this extension.
   * Example output:
   * `http://localhost:58906/callback/com.pilotmoon.popclip.extension.todoist/auth`
   */
  redirect: string;
  /** Extension display name */
  name: string;
  /** Extension identifier */
  identifier: string;
}

/**
 * Object form of the value returned by {@link Extension.auth}, for when the extension has
 * more than just the secret to hand back. Returning a bare string is equivalent to
 * returning `{ secret: theString }`.
 */
interface AuthResult {
  /** The secret to store (e.g. an access token). Saved as the extension's `authsecret`. */
  secret: string;
  /** Optional account identifier to display, e.g. an email or username ("Signed in as …"). */
  label?: string;
  /** Optional token lifetime in seconds, as reported by the auth server (its `expires_in`).
   * PopClip records it with the sign-in time; once it elapses the app treats the extension
   * as signed out and prompts the user to sign in again. */
  expiresIn?: number;
}

/**
 * The possible values for `type` of {@link Option}.
 */
type OptionType =
  | "string"
  | "boolean"
  | "multiple"
  | "password"
  | "heading"
  | "secret";

/**
 * Defines a single extension option.
 */
interface OptionBase {
  /**
   * An identifying string for this option.
   */
  readonly identifier: string;

  /**
   * The kind of option, one of:
   *  * `string`: a text box for free text entry,
   *  * `boolean`: a check box,
   *  * `multiple`: multiple-choice drop-down with predefined options,
   *  * `secret`: concealed text entry field (persisted in user's keychain),
   *  * `password`: concealed text entry field (not persisted, only passed to auth function),
   *  * `heading`: adds a heading in the user interface, but does not actually define an option
   */
  readonly type: OptionType;

  /**
   * A short label for this option.
   */
  readonly label?: LocalizableString;

  /**
   * An optional longer explanation of this option, to be shown in the UI.
   */
  readonly description?: LocalizableString;

  /**
   * If true, this option will be hidden in the prefs window. Default is false.
   */
  readonly hidden?: boolean;

  /**
   * If true, this option will be inset to the right of its label, instead of below it. Default is false.
   */
  readonly inset?: boolean;
}

/**
 A string-valued option.

*/
interface StringOption extends OptionBase {
  readonly type: "string";
  /**
   * The default value of the option. If omitted, `string` options default to the empty string.
   */
  readonly defaultValue?: string;

  /**
   * If true, show a multi-line text field instead of a single-line one.
   * Useful for longer inputs such as prompts. Default is false.
   */
  readonly multiline?: boolean;

  /**
   * Identifier of a removed option whose stored value should carry over to this option.
   * While that value is a non-empty string, it is used as this option's value; the first
   * change the user makes to this option clears it.
   */
  readonly migrateFrom?: string;
}

/**
 * A multiple-choice option.
 */
interface MultipleOption extends OptionBase {
  readonly type: "multiple";
  /**
   * The default value of the option. If omitted, `multiple` options default to None if `allowNone`
   * is set, or else the first item in the list.
   */
  readonly defaultValue?: string;

  /**
   * The possible values for a `multiple` option.
   */
  readonly values?: readonly string[];

  /**
   * Display names corresponding to the entries in the {@link values} array. These are shown in the option UI.
   * If omitted, the raw value strings are shown instead.
   */
  readonly valueLabels?: readonly LocalizableString[];

  /**
   * If true, the UI offers an "Other…" row in addition to the defined {@link values},
   * allowing the user to type a value of their own.
   */
  readonly allowOther?: boolean;

  /**
   * If true, the option UI offers a "None" row in addition to the defined {@link values}, whose value is the
   * empty string. An option with `allowNone` and no {@link defaultValue} defaults to None
   * rather than to the first value.
   */
  readonly allowNone?: boolean;

  /**
   * Identifier of a removed option whose stored value should carry over to this option.
   * While that value is a non-empty string, it is used as this option's value; the first
   * change the user makes to this option clears it. Useful with {@link allowOther}, to
   * consolidate a former free-text companion option into this one.
   */
  readonly migrateFrom?: string;
}

/**
 * A boolean option.
 */
interface BooleanOption extends OptionBase {
  readonly type: "boolean";
  /**
   * The default value of the option. If omitted, `boolean` options default to true.
   */
  readonly defaultValue?: boolean;
  /**
   * An icon for this option. It is only displayed for boolean options, next to the check box.
   */
  readonly icon?: string;
}

/**
 * A concealed string option.
 */
interface PasswordOption extends OptionBase {
  readonly type: "password";
}

/**
 * A concealed string option, persisted in the user's keychain.
 */
interface SecretOption extends OptionBase {
  readonly type: "secret";

  /**
   * Which keychain the secret goes in: `sync` (the default) — the
   * synchronizable keychain, shared across the user's devices via iCloud
   * Keychain — or `local`, kept only on the Mac where it was entered.
   */
  readonly keychain?: "sync" | "local";
}

/**
 * A heading option, which does not define an actual option, but adds a heading in the preferences window.
 */
interface HeadingOption extends OptionBase {
  readonly type: "heading";
}

/**
 Represents a single option in the extension's preferences.
*/
type Option =
  | StringOption
  | MultipleOption
  | BooleanOption
  | PasswordOption
  | SecretOption
  | HeadingOption;

/**
 * The type of the `options` object, derived from an options array. Pass it as
 * the type parameter of {@link defineExtension} so that action functions and
 * the population function see the real option identifiers and value types,
 * instead of the generic {@link Options}.
 *
 * The array must be declared `as const`, so that the identifiers and types are
 * literal. `heading` and `password` options carry no value and are omitted.
 *
 * @example
 * ```js
 * const options = [
 *   { identifier: "prefix", type: "string", defaultValue: ">" },
 *   { identifier: "loud", type: "boolean", defaultValue: false },
 * ] as const;
 *
 * // { readonly prefix: string; readonly loud: boolean }
 * type MyOptions = InferOptions<typeof options>;
 *
 * defineExtension<MyOptions>({ options, action: (input, options) => { ... } });
 * ```
 */
type InferOptions<T extends readonly Option[]> = {
  readonly [K in T[number]["identifier"] as Extract<
    T[number],
    { identifier: K }
  > extends { type: "string" | "secret" | "multiple" | "boolean" }
    ? K
    : never]: Extract<T[number], { identifier: K }> extends { type: "boolean" }
    ? boolean
    : string;
};

/**
 * Loads a module or data file. The argument is resolved as follows:
 *
 * - starting with `./` or `../`: a path relative to the current file;
 * - otherwise: a path relative to the root of the package directory;
 * - failing that: the name of one of the libraries bundled with PopClip.
 *
 * Loads `.js` (CommonJS), `.ts` (ES module syntax, transpiled) and `.json`
 * files. Results are cached, so requiring the same argument twice returns the
 * same instance. Returns `undefined` if nothing is found. Paths beginning with
 * `/`, or using `..` to escape the package directory, are not valid.
 *
 * TypeScript files may use `import` syntax instead; it is transpiled to
 * `require()` calls.
 *
 * @param id Module name, or path to a file in the package.
 */
declare function require(id: BundledModule): any;
declare function require(id: string): any;

/**
 * The names of the libraries bundled with PopClip, which `require()` (or
 * `import`) can load without the extension shipping them. The bundled
 * versions are listed in the documentation:
 * https://www.popclip.app/dev/js-environment#bundled-libraries
 *
 * To type check code that uses one, install the same version as a dev
 * dependency of the extension project; the library's own types are used.
 */
type BundledModule =
  | "axios"
  | "buffer"
  | "case-anything"
  | "content-type"
  | "dom-serializer"
  | "emoji-regex"
  | "entities"
  | "fast-json-stable-stringify"
  | "fast-plist"
  | "htmlparser2"
  | "js-yaml"
  | "linkedom"
  | "linkifyjs"
  | "oauth-1.0a"
  | "rot13-cipher"
  | "sanitize-html"
  | "sucrase"
  | "turndown"
  | "valibot";

/**
 * The CommonJS module object. Assigning to `module.exports` exports the
 * extension object, though {@link defineExtension} is preferred because it
 * type checks what you pass it.
 */
declare const module: { exports: any };

/**
 * Shorthand for `module.exports`. Individual properties may be assigned, as in
 * `exports.actions = [...]`.
 */
declare const exports: any;

/**
 * Exports an arbitrary object for use by another file, which imports it with
 * {@link require}. Partially implements the
 * [AMD spec](https://github.com/amdjs/amdjs-api/wiki/AMD).
 *
 * Call it at most once per file; if called more than once, only the final call
 * has any effect. `defineExtension` is this same function, with a typed
 * parameter.
 *
 * A factory function is called with the resolved dependencies as arguments.
 * With no dependency list, it receives `require`, `exports` and `module`, per
 * the spec. A truthy return value becomes the exported value; a factory may
 * instead return nothing and assign to `exports` itself. A module id, if
 * given, is ignored.
 *
 * Declared so that existing code using it still compiles. Prefer
 * {@link defineExtension}, or `module.exports = ...`.
 *
 * @hidden
 */
declare const define: {
  (factory: (...dependencies: any[]) => unknown): void;
  (dependencies: string[], factory: (...dependencies: any[]) => unknown): void;
  (id: string, factory: (...dependencies: any[]) => unknown): void;
  (
    id: string,
    dependencies: string[],
    factory: (...dependencies: any[]) => unknown,
  ): void;
  (object: object): void;
  /** Present, as the AMD spec requires, to signal AMD support. */
  amd: object;
};
