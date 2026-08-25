# Changelog

Versions are `<generation>.<PopClip build>.<edit>`: the middle number is the
PopClip build the definitions describe, and the last is bumped for edits that
do not correspond to a new build. Only significant changes are listed.

## 2.6159.0

Reorganised and made self-contained. The file now declares PopClip's whole
JavaScript environment, so a project needs only `"lib": ["ES2023"]` and
`"types": ["@popclip/types"]`.

- **Breaking:** declares `window`, `Blob`, `URL`, `URLSearchParams`,
  `XMLHttpRequest` and `TextEncoder`. Projects with `"dom"` in `lib` will see
  duplicate-identifier errors; remove it. Likewise remove `"node"` from
  `types`: `Buffer`, `require`, `module` and `exports` are declared here.
- `Blob` and `TextEncoder` now have the shapes PopClip actually implements.
  `Blob` has no `text()`, `arrayBuffer()` or `stream()`; read `blob.buffer`.
  `TextEncoder.encode()` returns a `Buffer`.
- Added `setInterval` and `clearInterval`, which PopClip has always provided.
- **Breaking (type level):** removed `UrlObject` and the internal helper types
  `OptionTypeMapping`, `ExtractType` and `ExcludeNever` (`InferOptions` is now
  self-contained). `openUrl()` takes `string | URL`; `share()` items are
  `string | RichString | URL | { url: string }`, with the item kinds and the
  `+`/`%20` handling documented at those methods.
- `atob`, `btoa`, `Blob` and `TextEncoder` are hidden from the API reference
  and documented as compatibility shims: prefer `util.base64Encode` /
  `util.base64Decode` and `Buffer`.
- `define()` factories are typed as returning `unknown`, and the docs state
  the AMD rule that a truthy return value becomes the exported value.
- Added `BundledModule`, the names of the bundled libraries, and a
  `require()` overload that accepts it, so the names autocomplete.
- Added `util.htmlToMarkdown()` and `util.cleanHtml()`; removed
  `util.htmlToRtf()`, which was never implemented.
- Config: added `isurl` and `copy` to `Requirement`, `copy-selection` to
  `AfterStep`, and the `cleanQuery`, `spacesAsPlus`, `keyComboTarget`,
  `stdin`, `multiline`, `description`, `keywords`, `language` and
  `bundleIdentifier` properties. `authAccountLabel` is now `authServiceLabel`.
  `module` accepts `true`.
- Config properties are excluded from the generated API reference; they are
  in the file so that `defineExtension()` can type check a whole extension.
- `define` declared with its AMD overloads. `define`, `window` and
  `util.sleep()` are documented as present but discouraged.
- File reorganised into four sections, runtime API first, with a header.
  The `extra/` directory is gone; everything is in the one file.

## 1.6959.1

The middle number was meant to be 6159. Superseded by 2.6159.0.
