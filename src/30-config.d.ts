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
