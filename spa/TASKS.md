# Tasks

Due diligence to meet all requirements before merging.

## Development Server Bug

This occurs in the browser console for the development server, but works OK in Express:

- Uncaught TypeError: Cannot set properties of undefined (setting 'unstable_now')
  at scheduler.development.js:182:5
    at scheduler.development.js:364:4
    at requireScheduler_development (scheduler.development.js:364:7)
    at requireScheduler (index.js:6:20)
    at react-dom-client.development.js:24190:21
    at requireReactDomClient_development (react-dom-client.development.js:28121:4)
    at requireClient (client.js:37:20)
    at client.js:38:1


These warnings occur during the build as warnings, which seem OK to ignore:

- (!) node_modules/react-router/dist/development/index.mjs (11:0): Module level directives cause errors when bundled, "use client" in "node_modules/react-router/dist/development/index.mjs" was ignored.

- (!) node_modules/react-router/dist/development/dom-export.mjs (11:0): Module level directives cause errors when bundled, "use client" in "node_modules/react-router/dist/development/dom-export.mjs" was ignored.

## Refined Working Solution

- Exception stack trace only shows in development builds
- Live reloading works in a satisfactory way
- Debugging works - do I need source map overrides like in the Electron debugging blog link?
- CSP works during development
- Handles paths outside /spa/

## ESM Output

- Release licenses to separate file and understand legal aspects
- Reviewable - Dev server writes bundles to disk
- Clean ESM output syntax
- No incremental bundles when reloading
- Remove sourcemap final line from release bundles in a clean way?

## Dynamic Bundles Test

- Dynamic bundles work with extra1, extra2, mustache and shared
