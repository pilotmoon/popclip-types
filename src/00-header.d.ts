/* ==========================================================================
   PopClip JavaScript API -- TypeScript definitions
   ==========================================================================

   Version {{VERSION}}, describing PopClip build {{POPCLIP_BUILD}}.

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
