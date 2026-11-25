# Roveon

Roveon is an AI-powered development environment built around a focused, keyboard-first workspace.

## Current increment

Roveon now has a real Monaco editor. In Chromium based browsers, Open folder grants access to one local project. The explorer lists supported text files; tabs edit those files, and Ctrl/Cmd+S saves to disk. Roveon detects an external modification before saving and refuses to overwrite it. Refresh files rescans the folder. Browser file handles are held only for the current session.

The previous sample project and simulated assistant/terminal interactions have been removed. Agent execution, terminal processes, desktop packaging, persistent project access, and live preview are future milestones. The current implementation is a browser workspace foundation, not yet a desktop application.

## Architecture direction

The editor is a React client component, while Monaco runs in the browser. Folder access uses the File System Access API, scoped to the folder chosen by the user. A future Electron host should expose a narrow, validated workspace API from its preload bridge; renderer code must not receive unrestricted Node.js or filesystem access. Project local agent definitions will live under `.roveon/`, with credentials stored outside the project and explicit permissions enforced by the host rather than by agent instructions.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.
