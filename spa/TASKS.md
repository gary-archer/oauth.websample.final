# Tasks

Meet all requirements before merging.\
Test Electron and Serverless next.

## Development Server Bug

This occurs in the browser console for the development server, but works OK in Express.\
Seems to be a React Tools and browser / Node HTTPS server incompatibility issue.

- Uncaught TypeError: Cannot set properties of undefined (setting 'unstable_now')
  at scheduler.development.js:182:5
    at scheduler.development.js:364:4
    at requireScheduler_development (scheduler.development.js:364:7)
    at requireScheduler (index.js:6:20)
    at react-dom-client.development.js:24190:21
    at requireReactDomClient_development (react-dom-client.development.js:28121:4)
    at requireClient (client.js:37:20)
    at client.js:38:1

## Refined Working Solution

- Exception stack trace only shows in development builds
- Live reloading works in a satisfactory way, with no incremental bundles
- Debugging works - do I need source map overrides like in the Electron debugging blog link?
- Security headers during development
- Handles paths outside /spa/

## ESM Output

- Release licenses to separate file and understand legal aspects
- Reviewable - Dev server writes bundles to disk
- Remove sourcemap final line from release bundles in a clean way?

## Dynamic Bundles Test

- Dynamic bundles work with extra1, extra2, mustache and shared
