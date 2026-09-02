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
   * An `interpreter` must be specified. By default, the interpreter is executed directly, with no shell involved and a minimal,
   * deterministic environment: exactly `PATH=/usr/bin:/bin:/usr/sbin:/sbin` and
   * `LANG=en_US.UTF-8`, plus anything given in `env` (which may override both); the
   * `shellMode` option can route the run through the user's shell instead. The working directory is the
   * extension's package directory.
   *
   * Any shebang line (`#!`) is ignored, and the `stdin` and `arguments` options are also ignored
   * -- these apply to shell script **files** only.
   *
   * To pass data into the script, use an environment variable. To compose text into the
   * command string itself, use the {@link ShellTag | $} tag instead, which escapes its
   * interpolations — for shell one-liners it is usually the more convenient form anyway.
   *
   * Bad input throws immediately, and nothing runs — including any option key that is not
   * recognized. A script that could not be run, exits with
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
   * // any interpreter works, not just shells
   * const { stdout } = await popclip.runShellScript("print(2 ** 100)", {
   *   interpreter: "python3",
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
   * The same as {@link runShellScript | runShellScript()} except where the script
   * comes from: `path` names a script file inside the package, relative to the package root;
   * paths outside the package are refused. The `stdin`
   * and `arguments` options are available. Without an `interpreter`, the file must be
   * executable with a shebang (`#!`) line.
   *
   * To pass data into the script, use an environment variable, stdin, or positional
   * parameter — they need no escaping.
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
  /**
   * A line prepended to the script before it runs. Inline form only. Default none — pass
   * `null` (or `""`) to be explicit about wanting none. (The {@link ShellTag | $} tag
   * defaults this to `"set -euo pipefail"`.)
   */
  prefix?: string | null;
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
  /**
   * The result's text form: `stdout` with trailing newlines stripped — the same rule as
   * shell command substitution. This is what you get interpolating a result into a template
   * or string, and a result returned from an action feeds the `-result` after-steps as this
   * text too.
   */
  toString(): string;
}

/**
 * The global `$` — the shell tag, implementing {@link ShellTag}. The convenient way to run a
 * shell command:
 *
 * ```js
 * // #popclip speak definition example
 * // name: Speak Definition
 * // entitlements: [script]
 * const word = popclip.input.text.trim();
 * const definition = util.getDictionaryDefinition(word) ?? "no definition";
 * await $`say ${definition}`;
 * ```
 */
declare const $: ShellTag;

/**
 * The shell tag, available as the global {@link $}. Runs the template text with `/bin/zsh`
 * in strict mode (`set -euo pipefail`), with each interpolated value shell-escaped into the
 * command as a literal word — selected text, file paths, anything: it can never become shell
 * syntax. Requires the `script` entitlement, and may only be used during the action phase —
 * the same gate, failure rules and result as {@link PopClip.runShellScript | runShellScript}.
 *
 * ```js
 * const result = await $`date +%A`;
 * popclip.showText(`Today is ${result}`);
 * ```
 *
 * The template text is used **raw**: everything between the backticks goes to the shell
 * exactly as written, so backslashes survive (`` $`grep -c '\.txt'` `` works) and JavaScript
 * escape sequences are not interpreted. Two consequences: don't put your own quotes around
 * an interpolation (it arrives already quoted), and write shell variables as `$VAR` rather
 * than `${VAR}` (which JavaScript would claim).
 *
 * Interpolated values may be strings, finite numbers, a {@link ShellScriptResult} (spliced
 * as its trimmed stdout, so one command's output feeds the next), or arrays of any of those
 * (spliced as separate words). Anything else throws.
 *
 * Calling `$` with an options object instead returns a configured tag, which can be kept and
 * reused:
 *
 * ```js
 * const py = $({ interpreter: "python3", quote: JSON.stringify, prefix: null });
 * const answer = await py`print(${popclip.input.text}.upper())`;
 * ```
 */
interface ShellTag {
  (
    strings: TemplateStringsArray,
    ...values: ShellTagValue[]
  ): Promise<ShellScriptResult>;
  (options: ShellTagOptions): ShellTag;
}

/**
 * What may be interpolated into a {@link ShellTag | $} template.
 */
type ShellTagValue =
  | string
  | number
  | ShellScriptResult
  | (string | number | ShellScriptResult)[];

/**
 * Options for configuring the {@link ShellTag | $} tag. Unknown keys throw.
 */
interface ShellTagOptions {
  /**
   * What runs the script; a path or bare name, as for
   * {@link ShellScriptOptions.interpreter}. Default `/bin/zsh` — the fixed path, not
   * whatever `zsh` is on the PATH, so behavior is the same on every Mac. Note the default
   * escaping and prefix assume a POSIX shell; for anything else, set `quote` and `prefix`
   * to match.
   */
  interpreter?: string;
  /** As {@link ShellScriptOptions.shellMode}. */
  shellMode?: "none" | "login" | "nonlogin";
  /** As {@link ShellScriptOptions.env}. */
  env?: Record<string, string>;
  /**
   * A line prepended to the script. Default `"set -euo pipefail"` — strict mode: a failed
   * command, an unset variable (mind bare `$VAR` probes; use `${VAR:-}` forms), or a failing
   * pipeline head fails the run. Pass `null` (or `""`) for no prefix. Note the prefix
   * shifts stderr line numbers by one. When `quote` is set, the default becomes no prefix.
   */
  prefix?: string | null;
  /**
   * Replaces the built-in POSIX shell escaping for this tag's interpolations. This
   * redefines what interpolation means, so with a matching `quote` the tag can compose for
   * any interpreter — `JSON.stringify` makes a passable quoter for several languages. Must
   * return a string. Setting `quote` also changes the default `prefix` to none.
   */
  quote?: (text: string) => string;
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
