# Roveon architecture

Generated from the current TypeScript source tree with `npm run docs:architecture`.

## Runtime boundaries

- Next.js App Router renders the entrypoint in `app/page.tsx`.
- `components/real-workspace.tsx` is a client component that owns browser folder access and Monaco editing.
- Browser filesystem access is constrained to the directory selected through the File System Access API.
- No agent runtime, model provider, terminal executor, persistence layer, or server-side API is currently implemented.

## Source dependency graph

```mermaid
graph TD
  n0["app/layout.tsx"]
  n1["app/page.tsx"]
  n2["components/real-workspace.tsx"]
  n1 --> n2
```

## Planned agent boundary

```mermaid
flowchart LR
  UI[Workspace UI] --> API[Typed server API]
  API --> Policy[Permission and approval policy]
  Policy --> Runtime[Agent runtime]
  Runtime --> Router[Message router]
  Runtime --> Workspace[Workspace file service]
  Runtime --> Executor[Sandboxed executor]
  Runtime --> Models[Model provider adapters]
  Workspace --> Git[Git and GitHub service]
```

The planned boundary is documentation only until each service is implemented and verified.
