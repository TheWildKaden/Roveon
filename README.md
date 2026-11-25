# Roveon

Roveon is an AI-powered development environment built around a focused, keyboard-first workspace.

## Current increment

Roveon is now packaged as an Electron desktop application. The installed app loads its bundled interface through a private desktop protocol; it does not run a localhost web server. Open folder uses a native folder picker, and the explorer, Monaco editor, tabs, and Ctrl/Cmd+S operate on local project files through a scoped preload bridge. Save rejects a file modified externally since it was opened.

The previous sample project and simulated assistant/terminal interactions have been removed. Agent execution, terminal processes, persistent project access, and live preview are future milestones. Roveon is a desktop editor foundation; AI and human workflows will share this workspace as the agent runtime is built.

## Architecture direction

The renderer is React and Monaco. Electron's main process owns the selected project root. Its preload exposes only open, list, read, and write operations. Paths are checked against the root, including symlink resolution; the renderer has no Node.js access. Agent definitions will live under `.roveon/`, with credentials outside the project and permissions enforced by the host.

## Run locally

```bash
npm ci
npm run desktop
```

For a local desktop run, use `npm run desktop`. For a Windows installer, use `npm run package:win` on Windows. Tags matching `v*` trigger a Windows GitHub Actions build and publish `Roveon-Setup-<version>.exe` in GitHub Releases. The installer is currently unsigned and Windows may show a SmartScreen warning.
