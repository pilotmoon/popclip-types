/* ==========================================================================
   PopClip JavaScript API -- TypeScript definitions
   ==========================================================================

   Version 2.6159.0, describing PopClip build 6159.

   This file declares everything an extension's JavaScript can see. It is the
   `@popclip/types` npm package, and is also served at
   https://www.popclip.app/dev/popclip.d.ts

   Changes between versions are listed at
   https://github.com/pilotmoon/popclip-types/blob/main/CHANGELOG.md

   It is in four sections:

     Runtime API              the `popclip`, `util` and `pasteboard` globals,
                              and the other objects a running script works with
     Module-based extensions  writing an extension as a module:
                              `defineExtension()`, `Extension`, `Action`,
                              options, `require`
     Static config            the extension config format, which `Extension`
                              extends
     Environment              `Buffer`, `Blob`, `URL`, `XMLHttpRequest`,
                              timers, and the rest of the environment

   Every declaration is ambient and global. Nothing needs to be imported.

   Setting up a TypeScript project
   -------------------------------

   This file is self-contained. A tsconfig needs only:

       {
         "compilerOptions": {
           "lib": ["ES2023"],
           "types": ["@popclip/types"],
           "module": "preserve",
           "moduleResolution": "bundler",
           "verbatimModuleSyntax": true,
           "strict": true,
           "noEmit": true
         }
       }

   Do not add "dom" to `lib` or "node" to `types`. Both declare large APIs
   PopClip does not provide, and both give `Blob` and `TextEncoder` shapes
   wider than the ones PopClip implements. With them present, code that
   cannot run will type check.

   Writing an extension in TypeScript
   ----------------------------------

   Call `defineExtension()` with the extension object. Its parameter is typed,
   so the whole object is checked and autocompleted in place with no
   annotations. See that function's documentation for the options pattern.

   The prose documentation, with tutorials and worked examples, is at
   https://www.popclip.app/dev/
   ========================================================================== */

/* ==========================================================================
   Runtime API
   ==========================================================================

   The objects and functions available to an extension's JavaScript while it
   runs: the `popclip` global, through which a script reads its input and acts
   on it; `util` and `pasteboard`; and a few free functions.
   ========================================================================== */

/**
 * The global `popclip` object encapsulates the user's current interaction with PopClip, and provides methods
 * for performing various actions. It implements  {@link PopClip}.
 */
declare const popclip: PopClip;

/**
 * This interface describes the methods and properties of the global {@link popclip} object.
 *
 */
interface PopClip {
  /**
   * The state of the modifier keys when the action was invoked in PopClip.
   *
   * During the execution of the population function, all the modifiers will read as false.
   */
  readonly modifiers: Modifiers;

  /**
   * The current selection.
   */
  readonly input: Input;

  /**
   * The current context.
   */
  readonly context: Context;

  /**
   * The current values of the options.
   */
  readonly options: Options & AuthOptions;

  /**
   * If the target app's Paste command is available, this method places the given string on the pasteboard
   * and then invokes the target app's Paste command. If the `restore` flag is set in the options, it will
   * then restore the original pasteboard contents.
   *
   * If the target app's Paste command is not available, it behaves as {@link copyText} instead.
   *
   * Returns a promise that resolves once the paste command has been delivered to the app,
   * after the pasteboard write was confirmed and — if `restore` is set — after the
   * pasteboard was restored. It rejects if the write never appears on the
   * pasteboard or the restore fails.
   *
   * @example
   *
   * ```js
   * // place "Hello" on the clipboard and invoke Paste
   * await popclip.pasteText("Hello");
   * // place "Hello", then restore the original pasteboard contents
   * await popclip.pasteText("Hello", {restore: true});
   * ```
   *
   * @param text The plain text string to paste
   * @param options
   */
  pasteText(text: string, options?: PasteOptions): Promise<void>;

  /**
   * Paste mixed pasteboard content. Same promise semantics as {@link pasteText}.
   */
  pasteContent(
    content: PasteboardContent,
    options?: PasteOptions,
  ): Promise<void>;

  /**
   * Place the given string on the pasteboard, optionally showing "Copied" notification to the user.
   *
   * Returns a promise that resolves once the items are committed to the pasteboard, and
   * rejects if the pasteboard refuses the write.
   *
   * @param text The plain text string to copy
   */
  copyText(text: string, options?: CopyOptions): Promise<void>;

  /**
   * Place mixed content on the pasteboard, optionally showing "Copied" notification to the user.
   * Same promise semantics as {@link copyText}.
   */
  copyContent(content: PasteboardContent, options?: CopyOptions): Promise<void>;

  /**
   * Invokes a command in the target app.
   *
   * Returns a promise. For `cut` and `copy` it resolves once the app has placed the
   * resulting content on the pasteboard and any transform has been applied.
   * For `paste` it resolves once the command has been delivered to the app. An unknown
   * command or transform value throws immediately, doing nothing.
   *
   * @param command Either `cut`, `copy` or `paste`.
   * @param options Options for the command.
   *
   * @example
   * ```js
   * await popclip.performCommand("copy")
   * ```
   */
  performCommand(
    command: "cut" | "copy" | "paste",
    options?: {
      /** Transformation to apply to the pasteboard contents. (Default: `none`)
       * - `none`: regular pasteboard operation
       * - `plain`: strips away everything but plain text
       */
      transform?: "none" | "plain";
    },
  ): Promise<void>;

  /**
   * Display text to the user.
   * @param text The text to display.
   * @param options Options.
   */
  showText(
    text: string,
    options?: {
      /**
       * Display style:
       * - `compact` (default): Show the text inside PopClip's popup. It will be truncated to 160 characters when shown.
       * - `large`: Show as "Large Type" in full screen.
       */
      style?: "compact" | "large";
      /**
       * Applies to `compact` display mode only. If `true`, and the app's Paste command is available,
       * the displayed text will be in a clickable button which, when clicked, pastes the full text.
       */
      preview?: boolean;
    },
  ): void;

  /**
   * PopClip will show a checkmark symbol to indicate success.
   */
  showSuccess(): void;

  /**
   * PopClip will show an "X" symbol to indicate failure.
   */
  showFailure(): void;

  /**
   * PopClip will open the settings UI for this extension.
   *
   * If the extension has no settings, this method does nothing.
   */
  showSettings(): void;

  /**
   * Returns an `Error` to **throw** when the stored sign-in credential is no longer valid
   * (for example the server rejected or revoked the token). PopClip clears the saved secret
   * — so the extension appears signed out — and opens the settings UI to sign in again.
   *
   * @example
   * if (isAuthError(e)) throw popclip.signInRequiredError();
   *
   * @param message Optional message for logs/diagnostics.
   */
  signInRequiredError(message?: string): Error;

  /**
   * Returns an `Error` to **throw** to send the user to the settings UI **without** clearing
   * the sign-in (for example a required option is missing or invalid).
   *
   * @param message Optional message for logs/diagnostics.
   */
  settingsRequiredError(message?: string): Error;

  /**
   * Trigger PopClip to appear again with the current selection.
   */
  appear(): void;

  /**
   * Simulate a key press by the user.
   *
   * Some key code and modifier constants are available in {@link Util.constant | util.constant}.
   *
   * To press a sequence of combos, with waits between them if needed, see
   * {@link pressKeys | pressKeys()}.
   *
   * @example
   *
   * ```js
   * // press the key combo ⌘B
   * await popclip.pressKey('command B');
   * // press the key combo ⌥⌘H
   * await popclip.pressKey('option command H');
   * // press the return key
   * await popclip.pressKey('return');
   * await popclip.pressKey(util.constant.KEY_RETURN); // equivalent
   * // press option and the page down key
   * await popclip.pressKey('option 0x79');
   * await popclip.pressKey(0x79, util.constant.MODIFIER_OPTION); // equivalent
   * ```
   *
   * ```js
   * await popclip.pressKey('command c');
   * popclip.pressKey('command space', 0, { target: 'hid' });
   * ```
   *
   * @param key The key to press. When this parameter is a string, PopClip will interpret it as in
   * [Key Press actions](https://www.popclip.app/dev/key-press-actions).
   * When this parameter is a number, PopClip will use that exact key code.
   *
   * @param modifiers An optional bit mask specifying additional modifier keys, if any.
   *
   * @param options Options for the key press.
   *
   * The `target` option says where PopClip posts the key events:
   *
   * - `session` (the default) posts to the session event tap, `kCGSessionEventTap`.
   * - `app` posts to the process of the application PopClip is acting on, using
   *   `CGEventPostToPid()`. This is the only target aimed at a particular process, so the keys
   *   arrive there whatever holds keyboard focus at the time.
   * - `hid` posts to the HID event tap, `kCGHIDEventTap`.
   *
   * Where the events go from a tap is up to the system. If a key combo does not have the effect
   * you expect with one target, it is worth trying the others.
   *
   * @returns A promise that resolves once the press has been made, and rejects if it fails.
   * Await it when a later step depends on the press completing.
   */
  pressKey(
    key: string | number,
    modifiers?: number,
    options?: { target?: "session" | "app" | "hid" },
  ): Promise<void>;

  /**
   * Simulate a sequence of key presses, with optional waits between them.
   *
   * The sequence runs as one unit: PopClip makes the presses in order on its key-press queue,
   * and no other press can interleave mid-sequence.
   *
   * @param sequence The presses to make, in order. Each entry is a key press in the same form
   * as {@link pressKey | pressKey()}'s `key` parameter — a string such as `'command b'` or a
   * numeric key code — or a wait, written `'wait <milliseconds>'` (up to 5000). If any entry
   * does not parse, the call throws and nothing is pressed.
   *
   * @param options The same options as {@link pressKey | pressKey()}: `target` says where the
   * presses are posted (`session`, the default, or `app` or `hid`).
   *
   * @returns A promise that resolves once the whole sequence has run, and rejects if the presses
   * could not be made.
   *
   * ```js
   * // press ⌘space, give Spotlight a moment, then paste
   * await popclip.pressKeys(['command space', 'wait 100', 'command v'], { target: 'hid' });
   * ```
   */
  pressKeys(
    sequence: (string | number)[],
    options?: { target?: "session" | "app" | "hid" },
  ): Promise<void>;

  /**
   * Run an AppleScript, supplied as source text.
   *
   * Requires the `script` entitlement, and may only be called during the action phase.
   *
   * To call a specific handler (subroutine) in the script, name it in the options — see {@link AppleScriptOptions}.
   *
   * Bad input throws immediately, and nothing runs. A script that runs and errors rejects the promise with an
   * error carrying the AppleScript error number as its `errorNumber` property. No error number
   * is special here — the static config's error-502 settings convention belongs to that
   * wrapper; to send the user to the extension's settings, branch on `errorNumber` and throw
   * {@link PopClip.settingsRequiredError | settingsRequiredError()}.
   *
   * @param source The AppleScript source text.
   * @param options See {@link AppleScriptOptions}.
   * @returns A promise for the script's return value — see {@link AppleScriptResult}.
   *
   * @example
   * ```js
   * const script = `
   * on addReminder(theName)
   *   tell application id "com.apple.reminders"
   *     make new reminder with properties {name:theName}
   *   end tell
   * end addReminder`;
   * await popclip.runAppleScript(script, {
   *   handler: "addReminder",
   *   parameters: [popclip.input.text],
   *   permissions: ["reminders"],
   * });
   * ```
   */
  runAppleScript(
    source: string,
    options?: AppleScriptOptions,
  ): Promise<AppleScriptResult>;

  /**
   * Run an AppleScript from a file in the extension package.
   *
   * The same as {@link runAppleScript | runAppleScript()} in every way except where the
   * script comes from: `path` names a script file inside the package, relative to the
   * package root. An `.applescript` file is read as source text; an `.scpt` (compiled
   * script) file is opened by the script runner directly. Other file types, and paths
   * outside the package, are refused.
   *
   * @param path Package-relative path of the `.applescript` or `.scpt` file.
   * @param options See {@link AppleScriptOptions}.
   * @returns A promise for the script's return value — see {@link AppleScriptResult}.
   *
   * @example
   * ```js
   * const result = await popclip.runAppleScriptFile("scripts/lookup.applescript", {
   *   handler: "lookup",
   *   parameters: [popclip.input.text],
   * });
   * ```
   */
  runAppleScriptFile(
    path: string,
    options?: AppleScriptOptions,
  ): Promise<AppleScriptResult>;

  /**
   * Run a shortcut from the user's Shortcuts library, by name.
   *
   * May only be called during the action phase.
   *
   * Bad input (a missing name, a non-string input) throws immediately, and nothing runs.
   * A shortcut that could not be run, or that errors, rejects the promise.
   *
   * @param name The name of the shortcut, exactly as it appears in the Shortcuts app.
   * @param options `input`: text passed to the shortcut as its input; omitted means none.
   * @returns A promise for the shortcut's result — see {@link AppleScriptResult}. The result
   * is the shortcut's output: what its last action produces, or what it passes to a "Stop
   * and Output" action. A shortcut that produces no output resolves to undefined.
   *
   * @example
   * ```js
   * const result = await popclip.runShortcut("My Shortcut", { input: popclip.input.text });
   * ```
   */
  runShortcut(
    name: string,
    options?: { input?: string },
  ): Promise<AppleScriptResult>;

  /**
   * Run a shell script, given as source text.
   *
   * Requires the `script` entitlement, and may only be called during the action phase.
   *
   * By default the interpreter is executed directly, with no shell involved and a minimal,
   * deterministic environment: exactly `PATH=/usr/bin:/bin:/usr/sbin:/sbin` and
   * `LANG=en_US.UTF-8`, plus anything given in `env` (which may override both); the
   * `shellMode` option can route the run through the user's shell instead. The working directory is the
   * extension's package directory. The source is delivered to the interpreter on standard
   * input, so an `interpreter` is required for this form, and the `stdin` and `arguments`
   * options are not available — they belong to
   * {@link runShellScriptFile | runShellScriptFile()}.
   *
   * To pass data into the script, prefer an environment variable since it needs no escaping.
   * To compose text into the
   * command string itself, escape it with {@link Util.shellEscape | util.shellEscape}.
   *
   * Bad input throws immediately, and nothing runs. A script that could not be run, exits with
   * a nonzero status, or is killed by a signal rejects the promise with an error carrying
   * `status`, `stdout`, `stderr` and `terminationReason` (`"exit"` or `"uncaughtSignal"`)
   * properties.
   *
   * There is no timeout; a run ends when the script exits, or when the user cancels the
   * action by clicking the spinner, which kills the script.
   *
   * @param source The script source text.
   * @param options See {@link ShellScriptOptions}. `interpreter` is required.
   * @returns A promise for the script's output — see {@link ShellScriptResult}.
   *
   * @example
   * ```js
   * // #popclip speak definition example
   * // name: Speak Definition
   * // language: javascript
   * // entitlements: [script]
   * const word = popclip.input.text.trim();
   * const definition = util.getDictionaryDefinition(word) ?? "no definition";
   * await popclip.runShellScript("say $definition", {
   *  interpreter: "zsh",
   *  env: { definition },
   * });
   * ```
   */
  runShellScript(
    source: string,
    options: ShellScriptOptions,
  ): Promise<ShellScriptResult>;

  /**
   * Run a shell script from a file in the extension package.
   *
   * The same as {@link runShellScript | runShellScript()} in every way except where the script
   * comes from: `path` names a script file inside the package, relative to the package root;
   * paths outside the package are refused. Standard input is free in this form, so the `stdin`
   * and `arguments` options are available. Without an `interpreter`, the file must be
   * executable with a shebang (`#!`) line.
   *
   * To pass data into the script, prefer an environment variable, stdin, or positional parameter,
   * since they need no escaping. To compose text into the
   * command string itself, escape it with {@link Util.shellEscape | util.shellEscape}.
   *
   * @param path Package-relative path of the script file.
   * @param options See {@link ShellScriptOptions}.
   * @returns A promise for the script's output — see {@link ShellScriptResult}.
   *
   * @example
   * ```js
   * const { stdout } = await popclip.runShellScriptFile("scripts/convert.sh", {
   *   arguments: [popclip.input.text],
   *   stdin: popclip.input.html,
   * });
   * ```
   */
  runShellScriptFile(
    path: string,
    options?: ShellScriptOptions,
  ): Promise<ShellScriptResult>;

  /**
   * Perform a macOS Service — one of the entries in the app's Services menu — with the given
   * input.
   *
   * May only be called during the action phase.
   *
   * Note the name to use is the service's *default* menu item name, which for some of
   * Apple's own services differs from the localized name the Services menu displays. For
   * example, the Stickies service appears in an English-language menu as "Make New Sticky
   * Note", but its name for this call is `"Make Sticky"`.
   *
   * Bad input throws immediately, and nothing runs: a missing name, missing input, or a
   * content dictionary with no usable string entry. A service macOS could not perform — an
   * unknown name, or the providing app refused — rejects the promise. Resolves with
   * undefined once the service call returns; any content the service writes back is not
   * read.
   *
   * @param name The service's default menu item name.
   * @param input What the service acts on: a string of plain text, or a content dictionary
   * of pasteboard types to strings, such as {@link Input.content | popclip.input.content}.
   *
   * @example
   * ```js
   * await popclip.performService("Make Sticky", popclip.input.text);
   * ```
   */
  performService(
    name: string,
    input: string | Record<string, string>,
  ): Promise<void>;

  /**
   * Show a file or folder in the Finder. A file is selected inside its enclosing folder; a
   * folder is opened as the window's own root.
   *
   * The path must be an absolute path on the user's disk — the kind found in
   * {@link Input.data | popclip.input.data.paths}.
   *
   * Throws if the path is omitted or does not exist.
   *
   * @param path An absolute path to an existing file or folder. A leading `~` is expanded to the user's
   * home folder.
   *
   * @example
   * ```js
   * popclip.revealFile(popclip.input.data.paths[0]);
   * popclip.revealFile("~/Downloads");
   * ```
   */
  revealFile(path: string): void;

  /**
   * Open a URL in a browser or other application.
   *
   * If a target application bundle identifier is specified via the `app` option, PopClip will ask that app to open the URL.
   *
   * If no target app is specified:
   *
   * - If the URL is a web URL (http or https scheme) and the current app is a browser, the URL is opened in the current app.
   * - Otherwise, PopClip asks macOS to open the URL in the default handler for its scheme.
   *
   * Any parameters etc. in the URL must be appropriately percent-encoded. JavaScript provides the
   * [encodeURIComponent()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)
   * function for this. Alternatively you can use the {@link URL} class,
   * which is available as a global in PopClip's JavaScript environment. When a `URL`
   * instance is passed, any `+` characters in it are first replaced with `%20`: a query
   * built with {@link URLSearchParams} encodes spaces as `+` (form encoding), which not
   * every receiver interprets as a space, whereas `%20` is unambiguous.
   *
   * Returns a promise that resolves once the request has been delivered to the browser or
   * OS.
   *
   * @example
   * ```js
   * // examples using string URLs
   * popclip.openUrl("https://xkcd.com"); // open in current/default browser
   * popclip.openUrl("https://xkcd.com", {app: "com.brave.Browser"}); // open in Brave browser
   *
   * // example using URL class
   * const mailUrl=new URL("mailto:support@pilotmoon.com");
   * mailUrl.searchParams.append("subject", "What's up?");
   * popclip.openUrl(mailUrl); // the mailto: link will open in the default mail application
   * ```
   *
   * @param url The URL to open: a string, used exactly as given, or a {@link URL} instance.
   * @param options Options.
   */
  openUrl(
    url: string | URL,
    options?: {
      /**
       * Bundle identifier of the app to open the URL with. For example `"com.google.Chrome"`.
       */
      app?: string;
      /**
       * Whether to request that macOS activate the target app. (Default: `true`)
       */
      activate?: boolean;
      /**
       * When opening a web URL in a supported browser, whether to open the URL in a background tab. (Default: `false`)
       */
      backgroundTab?: boolean;
    },
  ): Promise<void>;

  /**
   * Fill a query into a template URL and open it. This is the mechanism used by
   * [URL actions](https://www.popclip.app/dev/url-actions), exposed to JavaScript.
   *
   * The query is trimmed of surrounding whitespace and URL-encoded, then substituted
   * into the template in place of the placeholders `***` and `{popclip text}`. Any
   * `{popclip option <name>}` placeholders are replaced with the URL-encoded values
   * supplied in the `options` sub-dictionary. The resulting URL is then opened as
   * by {@link openUrl}, and that open's promise is returned.
   *
   * When the `copy` option is set, the query text is also copied to the clipboard.
   *
   * @example
   * ```js
   * popclip.openTemplateUrl("https://www.google.com/search?q=***", popclip.input.text);
   * ```
   *
   * @param urlTemplate The URL template containing placeholders.
   * @param query The text to substitute into the template's query placeholders.
   * @param options Options.
   */
  openTemplateUrl(
    urlTemplate: string,
    query: string,
    options?: {
      /**
       * Collapse runs of internal whitespace in the query to a single space.
       * Mirrors the `clean query` property of URL actions. (Default: `false`)
       */
      clean?: boolean;
      /**
       * Encode spaces in the query as `+` instead of `%20`. Some search engines
       * (for example Amazon) expect this format. Mirrors the `spaces as plus`
       * property of URL actions. (Default: `false`)
       */
      plus?: boolean;
      /**
       * Wrap the query in double quotes for an exact-phrase search. If unspecified,
       * defaults to the state of the Option (⌥) key when the action was invoked.
       */
      verbatim?: boolean;
      /**
       * Whether to copy the query text to the clipboard, overriding the app's
       * default behaviour for this call.
       */
      copy?: boolean;
      /**
       * A mapping of option names to values, used to fill any
       * `{popclip option <name>}` placeholders in the template.
       */
      options?: { [key: string]: string };
      /**
       * Bundle identifier of the app to open the URL with. For example `"com.google.Chrome"`.
       */
      app?: string;
      /**
       * Whether to request that macOS activate the target app. (Default: `true`)
       */
      activate?: boolean;
      /**
       * When opening a web URL in a supported browser, whether to open the URL in a background tab. (Default: `false`)
       */
      backgroundTab?: boolean;
    },
  ): Promise<void>;

  /**
   * Share items with a named macOS sharing service.
   *
   * @example
   * ```js
   * // share a string with the Messages service
   * popclip.share("com.apple.share.Messages.window", ["Hello, world!"]);
   * // share a URL with the Safari Reading List service
   * popclip.share("com.apple.share.System.add-to-safari-reading-list", [new URL("https://example.com")]);
   * // share an html string with the Notes service
   * const item = new RichString("Some <b>simple</b> html", { format: "html" })
   * popclip.share("com.apple.Notes.SharingExtension", [item]);
   * ```
   *
   * The list of available sharing services is determined by the user's system configuration.
   *
   * Returns a promise that resolves when the share completes (or when the user cancels the
   * share UI), and rejects if macOS reports that the share failed.
   * The share UI can stay open indefinitely, so only await this if your action needs to
   * wait for the outcome.
   *
   * @param serviceName The name of the sharing service to use.
   * @param items An array of items to share. A string is shared as plain text; a
   * {@link RichString} as rich text; a {@link URL} instance, or an object with a
   * `url` string property, as a URL. (The `{ url }` form uses the string exactly
   * as given; a `URL` instance gets the `+` to `%20` replacement described at
   * {@link openUrl}.)
   * @throws If the service name is not recognized, or if the service cannot handle the supplied items, an error is thrown.
   */
  share(
    serviceName: string,
    items: (string | RichString | URL | { url: string })[],
  ): Promise<void>;
}

/**
 * Input defines properties to access the input text contents.
 */
interface Input {
  /**
   * The plain text selected by the user. If there is no selected text, this will be the empty string.
   */
  text: string;

  /**
   * If the action specified {@link Action.requirements} or a {@link Action.regex} to match the input, this will be the matching part of the text.
   * Otherwise, it will be the same string as  {@link text}.
   */
  matchedText: string;

  /**
   * If the action specified a {@link Action.regex | regex} to match the input, this will be the result of the match.
   *
   * You can use this to access any capture groups from the regex.
   *
   * If the regex was specified as a JavaScript regex, the value is a return value from JavaScript's
   * [RegExp.prototype.exec()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec) method.
   *
   * If the regex was specified as an ICU regex in the static config, the value is the array of capture components.
   *
   * @example
   * ```js
   * // text: "apple", regex: /.(.)/
   * popclip.input.regexResult[0] // "ap" (full match)
   * popclip.input.regexResult[1] // "p" (capture group 1)
   * ```
   */
  regexResult?: RegExpMatchArray | string[] | null;

  /**
   * HTML content (if `captureHtml` is true).
   */
  html: string;

  /**
   * XHTML content (if `captureHtml` is true).
   */
  xhtml: string;

  /**
   * Markdown content (if `captureHtml` is true).
   */
  markdown: string;

  /**
   * RTF content (if `captureRtf` is true).
   */
  rtf: string;

  /**
   * Data of various kinds, that PopClip detected in the selected text.
   */
  data: {
    /**
     * HTTP or HTTPS urls.
     */
    urls: RangedStrings;
    /**
     * Other protocols or app urls e.g. `ftp:`, `omnifocus:`, `craftdocs:` etc. (PopClip has a pre-defined allowlist
     * for custom URL schemes.)
     */
    nonHttpUrls: RangedStrings;
    /**
     * Email addresses.
     */
    emails: RangedStrings;
    /**
     * Local file paths.
     * */
    paths: RangedStrings;
  };

  /**
   * Unprocessed selection contents indexed by UTI.
   */
  content: PasteboardContent;

  /**
  Indicate if the text content is *just* a web URL (or URL-like string
  such as `popclip.app`), allowing for leading and trailing whitespace.
  */
  isUrl: boolean;
}

/**
 * Represents a generic range, as a location and length
 */
interface Range {
  location: number;
  length: number;
}

/**
 * An array of strings with an additional `ranges` property defining the source of the data in the original string.
 */
interface RangedStrings extends Array<string> {
  ranges: Range[];
}

/**
 * Represents the state of the four modifier keys. The value is true when the key is held down
 * at the time the action is invoked.
 * See {@link PopClip.modifiers}.
 */
interface Modifiers {
  /** Shift (⇧) key state. */
  shift: boolean;
  /** Control (⌃) key state. */
  control: boolean;
  /** Option (⌥) key state. */
  option: boolean;
  /** Command (⌘) key state. */
  command: boolean;
}

/**
 *  Properties relating the context surrounding the selected text.
 */
interface Context {
  /**
   * Indicates whether the text area supports formatting.
   */
  hasFormatting: boolean;

  /**
   * This property is true iff the Paste command is enabled in the current app.
   */
  canPaste: boolean;

  /**
   * This property is true iff text was selected.
   */
  canCopy: boolean;

  /**
   * This property is true iff text was selected and the app's Cut command is enabled.
   */
  canCut: boolean;

  /**
   * If the current app is a compatible browser, this will be the page URL.
   */
  browserUrl: string;

  /**
   * If the current app is a compatible browser, this will be the page title.
   */
  browserTitle: string;

  /**
   * The name of the current app, for example `Drafts`.
   */
  appName: string;

  /**
   * The bundle identifier of the current app, for example `com.agiletortoise.Drafts-OSX`.
   */
  appIdentifier: string;
}

/**
 * Represents the current values of the extension's settings.
 */
interface Options {
  readonly [identifier: string]: string | boolean;
}

/**
 * The `authsecret` property has the special behaviour of throwing an `Error` with the message 'Not signed in' if it is accessed while either
 * undefined or holding an empty string.
 */
interface AuthOptions {
  /**
   * The stored value that was returned from the `auth()` function.
   */
  authsecret: string;
}

/**
 * The value an AppleScript returns: a string, number or boolean, an array for a list result
 * (possibly nested), or undefined when the script returns no value. Results of any other type
 * (such as records or object specifiers) come through in their string form, or undefined when
 * they have none.
 */
type AppleScriptResult =
  | string
  | number
  | boolean
  | undefined
  | AppleScriptResult[];

/**
 * Options for {@link PopClip.runAppleScript} and {@link PopClip.runAppleScriptFile}.
 */
interface AppleScriptOptions {
  /**
   * Name of a handler (subroutine) in the script to call. Without it, the script runs from
   * top to bottom.
   */
  handler?: string;
  /**
   * Arguments for the handler, in order — strings and booleans only. Requires `handler`.
   * Passing values as handler parameters is preferable to interpolating them into the script
   * source, which invites escaping bugs.
   */
  parameters?: (string | boolean)[];
  /**
   * System permissions the script needs, resolved right before it runs. PopClip shows the
   * system consent prompt for any the user has not yet decided; if access is denied, the
   * call rejects and PopClip directs the user to the relevant System Settings pane. The only
   * recognised value is currently `reminders`.
   */
  permissions?: "reminders"[];
}

/**
 * Options for {@link PopClip.runShellScript} and {@link PopClip.runShellScriptFile}.
 */
interface ShellScriptOptions {
  /**
   * What runs the script: an absolute path, or a bare name (for example `"zsh"`,
   * `"python3"`) resolved through the login shell's PATH — in every `shellMode`, since
   * resolution and execution are separate. Required for inline source; optional for a script
   * file that is executable with a shebang line.
   */
  interpreter?: string;
  /**
   * How the run is executed:
   *
   * - `"none"` (default): execute the interpreter — or the shebang script file itself —
   *   directly, with `arguments` as its real argument vector. No shell is involved: the
   *   fastest and most deterministic mode, with no shell profile output mixed into stdout.
   * - `"login"`: run via the user's shell as a login shell (`-lc`), sourcing their profile —
   *   the script sees the user's own PATH and environment, at the cost of whatever the
   *   profile does.
   * - `"nonlogin"`: run via the user's shell without `-l` — for setups whose environment
   *   lives in `.zshenv` alone.
   */
  shellMode?: "none" | "login" | "nonlogin";
  /**
   * Extra environment variables for the script, string values only. The escaping-free way to
   * pass data in.
   */
  env?: Record<string, string>;
  /**
   * Text delivered to the script on standard input. File form only.
   */
  stdin?: string;
  /**
   * Positional arguments for the script, arriving as `$1`, `$2`, … — strings only. File form
   * only.
   */
  arguments?: string[];
}

/**
 * What a successful shell script run resolves with. A failed run does not produce this — it
 * rejects, with the same fields (plus `terminationReason`) carried on the error.
 */
interface ShellScriptResult {
  /** The script's standard output. */
  stdout: string;
  /** The script's standard error output (also logged to the extension's debug output). */
  stderr: string;
  /** The exit status — always 0 here, since a nonzero exit rejects. */
  status: number;
}

/**
 * The global `util` object acts as a container for various utility functions and constants. It implements  {@link Util}.
 */
declare const util: Util;

/**
 * A container for various utility functions and constants, available as the global {@link util} object.
 */
interface Util {
  /**
   * Localize an English string into the current user interface language, if possible.
   * This will work for strings which match the name of a built-in action.
   *
   * @param string The string to localize.
   * @returns The localized string, or the original string if no localized version was available.
   * @deprecated This is only used by the Paste and Enter and Paste and Match Style extensions
   * to localise their displayed action titles and is not recommended for general use.
   */
  localize(string: string): string;

  /**
   * Whether macOS's Dictionary Services has a definition for this text — that is, whether the
   * text as a whole is a term in one of the dictionaries the user has enabled.
   *
   * @param text The text to look up.
   *
   * @example
   * ```js
   * if (util.hasDictionaryDefinition(popclip.input.text)) { ... }
   * ```
   */
  hasDictionaryDefinition(text: string): boolean;

  /**
   * The definition of this text from macOS's Dictionary Services, as plain text, or
   * `undefined` if the text has no definition.
   *
   * To open the text in the Dictionary app instead of reading its definition, use
   * {@link PopClip.openUrl | popclip.openUrl} with a `dict://` URL.
   *
   * @param text The text to define.
   */
  getDictionaryDefinition(text: string): string | undefined;

  /**
   * Escape text for literal inclusion in a POSIX shell (sh, bash, zsh) command line: the
   * result is wrapped in single quotes, and every character of the original — quotes, spaces,
   * `$`, backticks — arrives in the command as literal text, with nothing expanded or
   * interpreted.
   *
   * For composing {@link PopClip.runShellScript | runShellScript} command strings; where they
   * fit, prefer the channels that need no escaping at all: `env`, `stdin` and `arguments`.
   *
   * @param text The text to escape.
   *
   * @example
   * ```js
   * // count the lines of a selected file — the path may contain spaces or quotes
   * const { stdout } = await popclip.runShellScript(
   *   `wc -l < ${util.shellEscape(popclip.input.data.paths[0])}`,
   *   { interpreter: "sh" },
   * );
   * ```
   */
  shellEscape(text: string): string;

  /**
   * The languages the system spell checker can check on this Mac, as objects pairing the spell
   * checker's language code (for example `"en"`, `"de"`, `"pt_BR"`) with a display name
   * localized for the user's locale. Suitable for building a language option's `values` and
   * `valueLabels`.
   */
  getSpellingLanguages(): { code: string; name: string }[];

  /**
   * The user's preferred languages (per macOS Language settings), filtered to those the spell
   * checker can check.
   */
  getPreferredSpellingLanguages(): string[];

  /**
   * Whether the text contains no misspellings, checked in the given language.
   *
   * The language must be a code from {@link Util.getSpellingLanguages | getSpellingLanguages};
   * any other value throws, so intersect a saved option value with the available list before
   * passing it — a saved language can go stale.
   *
   * @param text The text to check.
   * @param options `language`: the spell checker language code to check in.
   */
  checkSpelling(text: string, options: { language: string }): boolean;

  /**
   * Replacement guesses for a misspelled word, in the given language. Guesses are returned
   * only when the whole text is a single misspelled word — a sentence containing a
   * misspelling is not a candidate for replacement, so it yields an empty array, as do
   * correctly-spelled words and misspellings or non-words that the checker has no suggestions for.
   *
   * The same language rule as {@link Util.checkSpelling | checkSpelling} applies.
   *
   * @param text The text to get guesses for.
   * @param options `language`: the spell checker language code; `limit`: cap the number of
   * guesses returned (omit for all).
   */
  getSpellingGuesses(
    text: string,
    options: { language: string; limit?: number },
  ): string[];

  /**
   * Information about the user's locale, as configured in macOS settings.
   * Values are read afresh on each access. A value the locale does not
   * define is the empty string.
   */
  localeInfo: {
    /** Locale identifier, e.g. `"en_GB"`. */
    localeIdentifier: string;
    /** ISO 3166 region code, e.g. `"GB"`. */
    regionCode: string;
    /** ISO 639 language code, e.g. `"en"`. */
    languageCode: string;
    /** Decimal separator for numbers, e.g. `"."`. */
    decimalSeparator: string;
    /** Thousands separator for numbers, e.g. `","`. */
    groupingSeparator: string;
    /** ISO 4217 currency code, e.g. `"GBP"`. */
    currencyCode: string;
    /** Currency symbol, e.g. `"£"`. */
    currencySymbol: string;
  };

  /**
   * Information about the current time zone, as configured in macOS settings.
   * Values are read afresh on each access.
   */
  timeZoneInfo: {
    /** Zone identifier from the IANA database, e.g. `"Europe/London"`. */
    identifier: string;
    /** Abbreviation for the zone in its current state, e.g. `"GMT"` or `"BST"`. */
    abbreviation: string;
    /** Current offset from GMT in seconds, including any daylight saving offset. */
    secondsOffset: number;
    /** Whether daylight saving time is currently in effect. */
    daylightSaving: boolean;
  };

  /**
   * Converts an HTML string to Markdown, using
   * [Turndown](https://github.com/mixmark-io/turndown).
   *
   * @param html The HTML to convert.
   * @param options Turndown options. Defaults to `{ headingStyle: "atx" }`.
   */
  htmlToMarkdown(html: string, options?: object): string;

  /**
   * Sanitizes an HTML string, removing scripts, styles and other unsafe
   * markup, using
   * [sanitize-html](https://github.com/apostrophecms/sanitize-html).
   *
   * @param html The HTML to sanitize.
   * @param options Reserved; the current implementation ignores it.
   */
  cleanHtml(html: string, options?: object): string;

  /**
   * Base-64 encode a string or an array of bytes, such as the output of
   * {@link Util.hash} or {@link Util.hmac}.
   *
   * The output is a single unbroken string: no line breaks are inserted,
   * however long it is.
   *
   * @param data The string or bytes to encode.
   * @param options
   */
  base64Encode(
    data: string | Uint8Array,
    options?: {
      /**
       * Whether to encode using the URL-safe variant, with `-` and `_` substituted for `+` and `/`. Default is no.
       */
      urlSafe?: boolean;
      /**
       * Whether to trim the `=`/`==` padding from the string. Default is no.
       */
      trimmed?: boolean;
    },
  ): string;

  /**
   * Decode a Base-64 string.
   *
   * Accepts both standard and URL-safe variants as input. Also accepts input with or without the `=`/`==` end padding.
   *
   * Whitespace and other characters outside the base64 alphabet are ignored,
   * so input wrapped into lines, as in email or PEM files, decodes as-is.
   *
   * Returns the decoded data as a string, and throws an error if it is not text. Pass `bytes: true` to receive the bytes themselves instead, which places no such requirement on the data.
   *
   * @param string
   * @param options
   * @returns The decoded string, or the decoded bytes when `bytes` is true.
   */
  base64Decode(string: string, options?: { bytes?: false }): string;
  base64Decode(string: string, options: { bytes: true }): Uint8Array;
  base64Decode(
    string: string,
    options?: {
      /**
       * Whether to return the decoded bytes as a `Uint8Array` rather than as a string. Default is no.
       */
      bytes?: boolean;
    },
  ): string | Uint8Array;

  /** Builds a URL query string from an object of parameters. */
  buildQuery: (params: { [key: string]: string }) => string;

  /** Parses a URL query string into an object of parameters. */
  parseQuery: (query: string) => any;

  /** Decipher a JSON object that has been lightly obscured to prevent constants such as
   * API client identifiers appearing in plaintext in the source files.
   *
   * This function will ROT13 decipher the text, apply Base64 decoding, and parse the result as JSON. */
  clarify(obscuredString: string): any;

  /**
   * Identical to the global {@link sleep}, which is the recommended form.
   * Declared so that existing code calling `util.sleep()` still compiles.
   *
   * @param durationMilliseconds How long to sleep in milliseconds.
   * @hidden
   */
  sleep(durationMilliseconds: number): Promise<void>;

  /**
   * Fill the provided `TypedArray` with cryptographically secure random values.
   * This aims to work like `crypto.getRandomValues()` from Web Crypto API.
   * Internally, it is implemented using Apple's `SecRandomCopyBytes`.
   *
   * @example
   *
   * ```js
   * const array = new Uint8Array(16); // array of 16 bytes
   * util.getRandomValues(array);      // array is now filled with random bytes
   * ```
   *
   * @param typedArray The array to fill with random values. This will be modified in place.
   */
  getRandomValues(
    typedArray:
      | Int8Array
      | Uint8Array
      | Uint8ClampedArray
      | Int16Array
      | Uint16Array
      | Int32Array
      | Uint32Array
      | BigInt64Array
      | BigUint64Array,
  ): void;

  /**
   * Generate a random integer in range [0, max] with uniform distribution using a cryptographically secure random source.
   *
   * @example
   *
   * ```js
   * const coinFlip = util.randomUniform(1); // coinFlip has value 0 or 1
   * const dieRoll = util.randomUniform(5) + 1; // dieRoll has value from 1 to 6
   * ```
   * @param max Maximum value to generate. Supplied value will be coerced to a 32-bit unsigned integer.
   */
  randomUniform(max: number): number;

  /**
   * Generate a RFC 4122 version 4 UUID using a cryptographically secure random number generator.
   * @returns UUID string such as "e621e1f8-c36c-495a-93fc-0c247a3e6e5f".
   */
  randomUuid(): string;

  /**
   * Generate hash-based message authentication code (HMAC) using the supplied data, key and algorithm.
   * Implemented internally by Apple's CommonCrypto.
   */
  hmac(
    data: Uint8Array,
    key: Uint8Array,
    algorithm: "sha1" | "md5" | "sha256" | "sha384" | "sha512" | "sha224",
  ): Uint8Array;

  /**
   * Generate the hash (message digest) of the supplied data using the specified algorithm.
   * Implemented internally by Apple's CommonCrypto.
   */
  hash(
    data: Uint8Array,
    algorithm: "sha1" | "md5" | "sha256" | "sha384" | "sha512" | "sha224",
  ): Uint8Array;

  /**
   * The `constant` property is a container for pre-defined constants.
   */
  readonly constant: {
    /**
     * Bit mask for the Shift (⇧) key.
     */
    readonly MODIFIER_SHIFT: 131072;
    /**
     * Bit mask for the Control (⌃) key.
     */
    readonly MODIFIER_CONTROL: 262144;
    /**
     * Bit mask for the Option (⌥) key.
     */
    readonly MODIFIER_OPTION: 524288;
    /**
     * Bit mask for the Command (⌘) key.
     */
    readonly MODIFIER_COMMAND: 1048576;
    /**
     * Key code for the Return (↵) key.
     */
    readonly KEY_RETURN: 0x24;
    /**
     * Key code for the Tab (⇥) key.
     */
    readonly KEY_TAB: 0x30;
    /**
     * Key code for the space bar.
     */
    readonly KEY_SPACE: 0x31;
    /**
     * Key code for the Delete (⌫) key.
     */
    readonly KEY_DELETE: 0x33;
    /**
     * Key code for the Escape key.
     */
    readonly KEY_ESCAPE: 0x35;
    /**
     * Key code for the Left Arrow key.
     */
    readonly KEY_LEFTARROW: 0x7b;
    /**
     * Key code for the Right Arrow key.
     */
    readonly KEY_RIGHTARROW: 0x7c;
    /**
     * Key code for the Down Arrow key.
     */
    readonly KEY_DOWNARROW: 0x7d;
    /**
     * Key code for the Up Arrow key.
     */
    readonly KEY_UPARROW: 0x7e;
  };
}

/**
 * The global `pasteboard` object provides access to the contents of the macOS general pasteboard (i.e. the system clipboard). It implements  {@link Pasteboard}.
 */
declare const pasteboard: Pasteboard;

/**
 * A simplified interface to the macOS pasteboard. Implemented by the global object,  {@link pasteboard}.
 */
interface Pasteboard {
  /**
   * Get and set the plain text content of the pasteboard.
   *
   * This property corresponds with the pasteboard type `public.utf8-plain-text`.
   *
   * When placing text on the pasteboard this way, PopClip's "Copied" notification will not appear.
   * (Typically, scripts should use  {@link PopClip.copyText} instead, so that the user gets the "Copied" notification.)
   *
   * The value of this property will always be a string. If there is no plain text value on the
   * pasteboard, reading this property will give an empty string (`""`).
   *
   * @example
   * ```js
   * let x = pasteboard.text;
   * pasteboard.text = "new text";
   * ```
   */
  text: string;

  /**
   * Get and set the content of the pasteboard, of the specified types
   */
  content: PasteboardContent;
}

/**
 * Represents the raw pasteboard content, indexed by UTI. Supports string data only.
 */
interface PasteboardContent {
  /**
   * The UTF-8 plain text content of the pasteboard.
   */
  "public.utf8-plain-text"?: string;
  /**
   * The HTML content of the pasteboard.
   */
  "public.html"?: string;
  /**
   * The RTF content of the pasteboard.
   */
  "public.rtf"?: string;
}

/**
 * Options for Paste operations.
 */
interface PasteOptions {
  /**
   * Whether to restore the original contents of the pasteboard after the paste
   * operation. Default is `false`.
   */
  restore?: boolean;
}

/**
 * Options for Copy operations.
 */
interface CopyOptions {
  /**
   * Whether to show the "Copied" notification to the user. (Default: `true`)
   */
  notify?: boolean;
}

/**
 * Represents a formatted text string. The underlying implementation uses a macOS Attributed String (`NSAttributedString`) object.
 * Can be constructed from a plain string in RTF, HTML, or Markdown format.
 *
 * @example
 * ```js
 * // create a RichString object from a html string
 * const item = new RichString("<b>bold</b> and <i>italic</i>.", {format: 'html'});
 * // create a RichString object from a markdown string
 * const item = new RichString("# Title\n\nBody.", {format: 'markdown'});
 * ```
 */
declare class RichString {
  /**
   * Create a new RichString object from a string.
   *
   * @param source The string to convert to a RichString object.
   * @param options Options for the conversion.
   */
  constructor(
    source: string,
    options?: {
      /**
       Format of the source string. Default is 'rtf'.
       */
      format?: "rtf" | "html" | "markdown";
    },
  );
  /**
   * An RTF representation of the content.
   */
  readonly rtf: string;
  /**
   * An HTML representation of the content.
   */
  readonly html: string;
}


/**
 * Output a string for debugging purposes. By default it is not output anywhere,  but
 * you can configure PopClip to output to the Console app by running the following command in Terminal:
 *
 * `defaults write com.pilotmoon.popclip EnableExtensionDebug -bool YES`
 *
 * then Quit and restart PopClip.
 *
 * @example
 * ```js
 * print("Hello, world!")
 * // print: Hello, world!
 * print(1, Math.PI, 2/3, ['a','b','c'])
 * // print: 1 3.141592653589793 0.6666666666666666 a,b,c
 * ```
 *
 * @param args One or more values, which will be coerced to strings. Multiple parameters will be separated by a space.
 */
declare function print(...args: any[]): void;

/**
 * A promise-based sleep function. Included as a more convenient alternative
 * to  setTimeout for performing simple delays. Call as `await sleep(1000)`.
 * @param durationMilliseconds How long to sleep in milliseconds
 */
declare function sleep(durationMilliseconds: number): Promise<void>;

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
   * For snippets using the inverted syntax: how to interpret the snippet body.
   * With {@link module} set, the body is loaded as a module.
   * @hidden
   */
  language?: "javascript" | "typescript" | "applescript";

  /**
   * Path to a JavaScript or TypeScript module to load. In an inverted-syntax
   * snippet, set it to `true` to load the snippet body itself as the module.
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
  readonly type: "password" | "secret";
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

/* ==========================================================================
   Static config
   ==========================================================================

   The extension config format, as written in a snippet or a package's Config
   file (YAML, JSON or plist). It is in this file because `Extension` and
   `Action` extend `ActionProperties`, which is what lets `defineExtension()`
   type check a whole extension object, and because module actions share the
   action flags (title, icon, requirements, regex, before, after and so on).

   The action-type properties -- url, keyCombo, shellScript and the rest --
   are different: PopClip reads them from static config only. A module action
   runs its `code` function instead, and setting them on one has no effect.

   Property names here are camelCase. In YAML, JSON and plist config the same
   key may be written either way: `captureHtml` or `capture html`. The prose
   documentation uses the spaced form. https://www.popclip.app/dev/config

   The action-type keys in this section are excluded from the generated API
   reference; the shared action flags and their value types are included.
   ========================================================================== */

/**
 * Properties common to Action and Extension
 */
interface ActionProperties extends IconProperties {
  /**
   * A unique identifying string. An identifier for an action can be any string of your choosing.
   */
  identifier?: string;

  /**
   * The action's title.
   *
   * If no title is defined here, the extension's `name` will be used, if any.
   */
  title?: LocalizableString;

  /**
   * A string to define the action's icon.
   *
   * If no icon is defined here, the extension's {@link Extension.icon | icon} will be used, if any.
   * Setting to `null` explicitly sets the action to have no icon.
   */
  icon?: string | null;

  /**
   * An array of conditions which must be met for this action to appear — see  {@link Requirement}.
   *
   * * If no array is specified here, the action takes the value of  {@link Extension.requirements}.
   * * If no array is specified there either, the action takes the default value `["text"]`.
   *
   * When multiple conditions are specified, all of them must be satisfied.
   *
   * An empty array (`[]`) indicates no requirements at all, meaning the action will always appear.
   *
   * This property has no effect on dynamically generated actions.
   */
  requirements?: Array<Requirement | NegatedRequirement>;

  /**
   * Array of bundle identifiers for which the extension should appear. The action will only
   * appear if PopClip is used in one of the specified apps.
   *
   * This property has no effect on dynamically generated actions.
   */
  requiredApps?: string[];

  /**
   * Array of bundle identifiers for which the extension should not appear. The action will not
   * appear if PopClip is used in any of the specified apps.
   *
   * This property has no effect on dynamically generated actions.
   */
  excludedApps?: string[];

  /**
   * A regular expression to decide whether this action appears in the popup.
   *
   * * If no regex is specified here, the action takes the value of  {@link Extension.regex}.
   * * If no regex is specified there either, the action will match any input.
   *
   * You may express the value either as a
   * [JavaScript regular expression literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
   * (or otherwise constructed `RegExp` object), or as a string.
   *
   * * If you supply a `RegExp` it will be evaluated in the JavaScript engine.
   * * If you supply a string it will be evaluated by macOS natively using the `NSRegularExpression` API (same as for 'classic' PopClip extensions).
   *
   * If the regex matches the selected text, the action will be shown in the popup and
   * the first occurrence of the matched text is accessible later via {@link Input.matchedText | matchedText}.
   *
   * If there is no match, the action is excluded from the popup.
   *
   * The regex's `lastIndex` is reset before and after each invocation, so the `g` (global) and `y` (sticky) flags have no effect.
   *
   * This property has no effect on dynamically generated actions.
   *
   * @example
   * ```js
   * regex = /abc/i   // Example regex 'abc' with 'i' (case insensitive) flag
   *                  // Matches abc, ABC, Abc, etc.
   * ```
   */
  regex?: RegExp | string;

  /**
   * Declares the application or website associated with this action, if any.
   */
  app?: AssociatedApp;
  apps?: AssociatedApp[];

  /**
   * An optional step to perform before the main action.
   */
  before?: BeforeStep;

  /**
   * An optional step to perform after the main action.
   */
  after?: AfterStep;

  /**
   * Whether PopClip will capture HTML and Markdown content for the selection. Default is no.
   */
  captureHtml?: boolean;

  /**
   * Whether PopClip will capture RTF (Rich Text Format) content for the selection. Default is no.
   */
  captureRtf?: boolean;

  /**
   * Whether PopClip's popup should stay on screen after clicking this action's button. Default is no.
   */
  stayVisible?: boolean;

  /**
   * Whether the pasteboard should be restored to its original state after `paste-result`.
   */
  restorePasteboard?: boolean;

  // Action-type-specific properties: these say what the action actually does.
  // Exactly one action type's properties should be set on any given action.
  //
  // These are read from static config only. A module's actions run their `code`
  // function instead, so setting any of these on a module action has no effect.
  // (The action flags -- title, icon, requirements, regex, before, after and so
  // on -- do apply to module actions.)
  //
  // Documented in full at https://www.popclip.app/dev/actions

  /**
   * Name of a macOS Shortcut to run, exactly as it appears in the Shortcuts app.
   * @hidden
   */
  shortcutName?: string;

  /**
   * Name of a macOS Service to invoke.
   * @hidden
   */
  serviceName?: string;

  /**
   * URL to open. Use `***` or `{popclip text}` as the placeholder for the text.
   * @hidden
   */
  url?: string;

  /**
   * With {@link url}: collapse whitespace in the inserted text before encoding it.
   * @hidden
   */
  cleanQuery?: boolean;

  /**
   * With {@link url}: encode spaces in the inserted text as `+` rather than `%20`.
   * @hidden
   */
  spacesAsPlus?: boolean;

  /**
   * Key combination to press, e.g. `"command shift ="`, or a virtual key code.
   * @hidden
   */
  keyCombo?: string | number;

  /**
   * Key combinations to press in sequence. An entry may also be `"wait <milliseconds>"`.
   * @hidden
   */
  keyCombos?: Array<string | number>;

  /**
   * Where to post the key events: the session event tap (the default), the
   * target app's process, or the HID event tap.
   * @hidden
   */
  keyComboTarget?: "session" | "app" | "hid";

  /**
   * AppleScript source to run. Supports `{popclip text}` and other placeholders.
   * @hidden
   */
  applescript?: string;

  /**
   * Path to an `.applescript` or `.scpt` file in the package.
   * @hidden
   */
  applescriptFile?: string;

  /**
   * Call a named handler in the script, rather than running it top to bottom.
   * @hidden
   */
  applescriptCall?: {
    handler: string;
    /** Names of script variables to pass as parameters, e.g. `["text", "browser url"]`. */
    parameters?: string[];
  };

  /**
   * Shell script source, passed to {@link interpreter} on standard input.
   * @hidden
   */
  shellScript?: string;

  /**
   * Path to a script file in the package.
   * @hidden
   */
  shellScriptFile?: string;

  /**
   * Interpreter for {@link shellScript} or {@link shellScriptFile}. A bare name
   * such as `"ruby"` is resolved against the user's shell `PATH`; an absolute
   * path is used as given.
   * @hidden
   */
  interpreter?: string;

  /**
   * With {@link shellScriptFile}: name of a script variable to pass on standard input.
   * @hidden
   */
  stdin?: string;

  /**
   * JavaScript source to run. It is wrapped in an async function, so a top-level
   * `return` of a string passes that string to the {@link after} step.
   * @hidden
   */
  javascript?: string;

  /**
   * Path to a `.js` or `.ts` file in the package.
   * @hidden
   */
  javascriptFile?: string;
}

/**
 * Properties that define how an icon is interpreted.
 */
interface IconProperties {
  /**
   * If true, the supplied icon will be displayed with its original color instead of being filled in white/black. Default is false.
   */
  preserveColor?: boolean;
  /**
   * If true, the supplied icon will be displayed with its original aspect ratio instead of being scaled to fit a square. Default is false.
   */
  preserveAspect?: boolean;
  /**
   * If true, the supplied icon will be drawn horizontally flipped. Default is false.
   */
  flipX?: boolean;
  /**
   * If true, the supplied icon will be drawn vertically flipped. Default is false.
   */
  flipY?: boolean;

  /**
   * Move the icon horizontally by the specified distance, expressed as percentage of the icon's width.
   */
  moveX?: number;

  /**
   * Move the icon vertically by the specified distance, expressed as percentage of the icon's height.
   */
  moveY?: number;

  /**
   * Scale the icon by the specified factor, expressed as a percentage of the original size.
   */
  scale?: number;

  /**
   * Rotate the icon anticlockwise by the specified angle, expressed in degrees.
   */
  rotate?: number;

  /**
    Draw the icon inside a square.
    */
  square?: boolean;

  /**
   * Draw the icon inside a circle.
   */
  circle?: boolean;

  /**
   * Draw the icon inside a magnifying glass shape.
   */
  search?: boolean;

  /**
   * Draw a strike-through line over the icon.
   */
  strike?: boolean;

  /**
   * Draw the enclosing shape as a solid shape.
   */
  filled?: boolean;

  /**
   * For text icons only. Draw the text using a monospaced font.
   */
  monospaced?: boolean;
}

/**
 * A requirement is specified in the {@link Action.requirements} array as a string.
 *
 * @example
 * ```js
 * ["paste", "!urls", "option-goFishing=1"]
 * ```
 */
type Requirement =
  /** One or more characters of text must be selected. */
  | "text"
  /** Synonym for `text`, retained for backward compatibility. */
  | "copy"
  /** Text must be selected and the app's Cut command must be available. */
  | "cut"
  /** The app's Paste command must be available. */
  | "paste"
  /** The selected text control must support formatting. */
  | "formatting"
  /** The text must *contain* exactly one web URL. Narrows the text to that URL. */
  | "url"
  /** The text must *be* a web URL, with nothing but whitespace around it. Narrows the text to that URL. */
  | "isurl"
  /** The text must contain one or more web URLs. */
  | "urls"
  /** The text must contain exactly one email address. Narrows the text to that address. */
  | "email"
  /** The text must contain one or more email addresses. */
  | "emails"
  /** The text must be a local file path that exists. Narrows and standardizes the path. */
  | "path"
  /** The option with the given identifier must equal the given string. Boolean options map to `1` and `0`. */
  | `option-${string}=${string}`;

/** Negated form of  {@link Requirement}. */
type NegatedRequirement = `!${Requirement}`;

/**
 * Strings which can be used to specify the  {@link Action.before} action.
 */
type BeforeStep = "cut" | "copy" | "paste" | "paste-plain";

/**
 * Strings which can be used to specify the  {@link Action.after} action.
 */
type AfterStep =
  | BeforeStep
  /** Trigger PopClip to appear again with the current selection. */
  | "popclip-appear"
  /** Place the originally selected text on the clipboard. */
  | "copy-selection"
  /** Show a tick or an 'X', depending on whether the action succeeded. */
  | "show-status"
  /** Copy the result to the clipboard. */
  | "copy-result"
  /** Paste the result if the app's Paste command is available, else copy it. */
  | "paste-result"
  /** Copy the result and show it, truncated to 160 characters. */
  | "show-result"
  /** As `show-result`, but the preview can be clicked to paste. */
  | "preview-result";

/**
 * Declares information about an app or website that this extension interacts with.
 */
interface AssociatedApp {
  /**
   * Name of the app. For example "Scrivener"
   */
  name: string;

  /**
   * Web page where user can obtain the app, e.g. "https://www.literatureandlatte.com/scrivener".
   */
  link: string;

  /**
   * Indicates whether PopClip should check for the presence of the app on the computer. Default is false.
   */
  checkInstalled?: boolean;

  /**
   * List of possible bundle identifiers of this app.
   * Required if {@link checkInstalled} is true.
   */
  bundleIdentifiers?: string[];

  /**
   * A single bundle identifier, as an alternative to {@link bundleIdentifiers}.
   */
  bundleIdentifier?: string;
}

/**
 * An object giving strings for the different languages PopClip supports. See  {@link LocalizableString}.
 */
interface StringTable {
  /** English (US) language string. */
  en: string;
  /** English (UK) language string. */
  "en-GB"?: string;
  /** Danish language string. */
  da?: string;
  /** German language string. */
  de?: string;
  /** Spanish language string. */
  es?: string;
  /** French language string. */
  fr?: string;
  /** Italian language string. */
  it?: string;
  /** Japanese language string. */
  ja?: string;
  /** Korean language string. */
  ko?: string;
  /** Dutch language string. */
  nl?: string;
  /** Polish language string. */
  pl?: string;
  /** Brazilian Portuguese language string. */
  "pt-BR"?: string;
  /** Russian language string. */
  ru?: string;
  /** Slovak language string. */
  sk?: string;
  /** Turkish language string. */
  tr?: string;
  /** Vietnamese language string. */
  vi?: string;
  /** Simplified Chinese language string. */
  "zh-Hans"?: string;
  /** Traditional Chinese language string. */
  "zh-Hant"?: string;
  /** Any other strings. */
  [code: string]: string | undefined;
}

/**
 * A type to represent a localizable string.
 *
 * The value may be either a string or an object.
 * If you supply a string, that string is used.
 * If you supply a  {@link StringTable} object, PopClip will
 * display the string for the user's preferred language if possible, with fallback to the `en` string.
 *
 * @example
 * ```js
 * option.label = "Color" // just use this string
 * option.label = { en: "Color", "en-GB": "Colour", fr: "Couleur", "zh-Hans": "颜色" }
 * ```
 */
type LocalizableString = string | StringTable;

/**
 * A capability the extension's JavaScript needs: `network` allows
 * `XMLHttpRequest`; `dynamic` allows dynamically generated actions; `script`
 * allows `popclip.runAppleScript()` and `popclip.runAppleScriptFile()`.
 * @hidden
 */
type Entitlement = "network" | "dynamic" | "script";

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
