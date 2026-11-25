import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(process.cwd());
const sourceRoots = ["app", "components", "lib"].map((part) => join(root, part));
const allowed = new Set([".ts", ".tsx", ".js", ".jsx"]);

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(path));
    else if (allowed.has(extname(entry.name))) files.push(path);
  }
  return files;
}

const files = (await Promise.all(sourceRoots.map(filesIn))).flat().sort();
const nodes = new Map(files.map((file) => [relative(root, file).replaceAll("\\", "/"), `n${files.indexOf(file)}`]));
const edges = [];
const importPattern = /(?:import|export)\s+(?:[^"']+from\s+)?["']([^"']+)["']/g;

function resolveImport(source) {
  if (!source.startsWith("@/")) return null;
  const base = join(root, source.slice(2));
  const candidates = [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")];
  return candidates.map((candidate) => relative(root, candidate).replaceAll("\\", "/")).find((candidate) => nodes.has(candidate)) ?? null;
}

for (const file of files) {
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(importPattern)) {
    const target = resolveImport(match[1]);
    if (target) edges.push(`  ${nodes.get(relative(root, file).replaceAll("\\", "/"))} --> ${nodes.get(target)}`);
  }
}

const labels = files.map((file) => {
  const name = relative(root, file).replaceAll("\\", "/");
  return `  ${nodes.get(name)}["${name}"]`;
});
const graph = ["graph TD", ...labels, ...[...new Set(edges)]].join("\n");
const output = `# Roveon architecture\n\nGenerated from the current TypeScript source tree with \`npm run docs:architecture\`.\n\n## Runtime boundaries\n\n- Next.js App Router renders the entrypoint in \`app/page.tsx\`.\n- \`components/real-workspace.tsx\` is a client component that owns browser folder access and Monaco editing.\n- Browser filesystem access is constrained to the directory selected through the File System Access API.\n- No agent runtime, model provider, terminal executor, persistence layer, or server-side API is currently implemented.\n\n## Source dependency graph\n\n\\\`\\\`\\\`mermaid\n${graph}\n\\\`\\\`\\\`\n\n## Planned agent boundary\n\n\\\`\\\`\\\`mermaid\nflowchart LR\n  UI[Workspace UI] --> API[Typed server API]\n  API --> Policy[Permission and approval policy]\n  Policy --> Runtime[Agent runtime]\n  Runtime --> Router[Message router]\n  Runtime --> Workspace[Workspace file service]\n  Runtime --> Executor[Sandboxed executor]\n  Runtime --> Models[Model provider adapters]\n  Workspace --> Git[Git and GitHub service]\n\\\`\\\`\\\`\n\nThe planned boundary is documentation only until each service is implemented and verified.\n`;
await mkdir(join(root, "docs"), { recursive: true });
await writeFile(join(root, "docs/architecture.md"), output.replaceAll(/\\`/g, "`"));
console.log(`Wrote docs/architecture.md for ${files.length} source files.`);
