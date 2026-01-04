# Tasks

Due diligence to meet all requirements before merging.

## Working Solution

- File copy and handle configuration file logic
- Debugging works - do I need source map overrides like in the Electron debugging blog link?
- Release build tested locally in Docker

## ESM Output

- Release licenses to separate file and understand legal aspects
- Reviewable - Dev server writes bundles to disk
- Clean ESM output syntax
- Release build sizes no greater than with webpack
- No incremental bundles due to hot reloading

## Development Server

- CSP works during development
- Handles paths outside /spa/

## Dynamic Bundles Test

- Dynamic bundles work with extra1, extra2, mustache and shared
