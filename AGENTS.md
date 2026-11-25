# Roveon agent setup

## Setup script

Run these commands from the repository root in a fresh container:

```sh
node --version
npm --version
npm ci
```

Roveon uses npm with the committed `package-lock.json`; `npm ci` installs the exact locked dependency graph. Node.js 18.18 or newer is required by Next.js 15 (the validated container used Node.js 24.22.3 and npm 11.19.1).

## Verification commands

```sh
npm run lint
npm run build
npx tsc --noEmit
npm run docs:architecture
```

`npm run lint` uses ESLint with the Next.js ruleset. The production build performs Next.js compilation, type validation, and static generation. Run the build before the standalone `tsc` command because `tsconfig.json` includes generated `.next/types` declarations.

There is currently no test script, test directory, or test runner configured in this repository. Do not report unit or integration tests as passing; add a test runner and tests when that becomes part of the product.

`npm run docs:architecture` regenerates `docs/architecture.md` and its Mermaid source dependency graph from the TypeScript files under `app/`, `components/`, and `lib/`.

## Environment quirks

- No environment variables, external services, databases, or secrets are required for the current frontend-only build.
- `.env.example` is not needed at this stage because the app reads no environment variables.
- The app is a Next.js App Router project. `npm run dev` starts the local server at `http://localhost:3000`.
- `next lint` is not used: it is interactive in this repository when no legacy ESLint config exists. The `lint` script calls the non-interactive ESLint CLI instead.
