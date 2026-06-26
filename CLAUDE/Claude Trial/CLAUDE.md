# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a TypeScript utility library with associated unit tests. The main source file is `utils.ts` which exports a `calc` function for basic arithmetic operations. Tests are written using Vitest in `utils.test.ts`.

## Development Commands

The following npm scripts are available in the root of this repository (where `package.json` is located):

- `npm test` or `npm run test` - Runs the test suite using Vitest
- `npm run build` - Compiles TypeScript to JavaScript using `tsc`
- `npm run dev` - Runs TypeScript compiler in watch mode (`tsc -w`)

## Project Structure

- `utils.ts` - Contains the `calc` function for addition, subtraction, multiplication, and division
- `utils.test.ts` - Unit tests for the `calc` function using Vitest
- `package.json` - Defines project dependencies and scripts
- `package-lock.json` - Locked dependency versions
- `node_modules/` - Installed npm packages
- `.vscode/` - VS Code configuration (currently empty)

Note: The `Claude Trial` subdirectory is intended for experimentation and contains a `Trial.md` file and `.vscode` settings.

## Testing

To run the test suite:
```bash
npm test
```

This will execute the Vitest tests defined in `utils.test.ts`.

## TypeScript Compilation

The project uses TypeScript. To compile the source files:
```bash
npm run build
```

For continuous compilation during development:
```bash
npm run dev
```

## Code Style

The project uses TypeScript with explicit type annotations. Follow the existing patterns in `utils.ts` when adding new functionality.

## Notes

- The repository root is the directory containing `package.json`.
- Ensure Node.js and npm are installed to run the provided scripts.
- When adding new features, update both the implementation in `utils.ts` and corresponding tests in `utils.test.ts`.