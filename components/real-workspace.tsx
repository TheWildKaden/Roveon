"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { FileCode2, FolderOpen, Save, Zap } from "lucide-react";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
type OpenFile = { handle: FileSystemFileHandle; text: string; saved: string; modified: number };
const extensions = new Set(["ts", "tsx", "js", "jsx", "json", "css", "html", "md", "py", "sql", "rs", "java", "c", "cpp", "go", "php", "yaml", "yml", "sh", "txt"]);
type Directory = FileSystemDirectoryHandle & { entries(): AsyncIterable<[string, FileSystemHandle]> };
async function scan(dir: Directory, prefix = "", depth = 0): Promise<string[]> {
  const result: string[] = [];
  for await (const [name, handle] of dir.entries()) {
    if (["node_modules", ".git", ".next", "dist"].includes(name) || name.startsWith(".")) continue;
    if (handle.kind === "directory" && depth < 8) result.push(...await scan(handle as Directory, prefix + name + "/", depth + 1));
    if (handle.kind === "file" && extensions.has(name.split(".").pop() ?? "")) result.push(prefix + name);
  }
  return result.sort();
}
async function locate(dir: FileSystemDirectoryHandle, path: string) {
  const parts = path.split("/");
  for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part);
  return dir.getFileHandle(parts.at(-1)!);
}
export function RealWorkspace() {
  const [folder, setFolder] = useState<FileSystemDirectoryHandle>();
  const [paths, setPaths] = useState<string[]>([]);
  const [files, setFiles] = useState<Record<string, OpenFile>>({});
  const [tabs, setTabs] = useState<string[]>([]);
  const [active, setActive] = useState("");
  const [message, setMessage] = useState("Open a folder to begin.");
  const current = files[active];
  async function choose() {
    if (!("showDirectoryPicker" in window)) { setMessage("Folder access needs a Chromium based browser."); return; }
    try {
      const picked = await window.showDirectoryPicker({ mode: "readwrite" });
      setFolder(picked); setPaths(await scan(picked as Directory)); setFiles({}); setTabs([]); setActive(""); setMessage(`Opened ${picked.name}.`);
    } catch (error) { if ((error as DOMException).name !== "AbortError") setMessage(String(error)); }
  }
  async function open(path: string) {
    if (!folder) return;
    if (files[path]) { setActive(path); return; }
    try {
      const handle = await locate(folder, path); const file = await handle.getFile();
      if (file.size > 1024 * 1024) { setMessage("Files over 1 MB are not supported."); return; }
      const text = await file.text();
      setFiles((old) => ({ ...old, [path]: { handle, text, saved: text, modified: file.lastModified } }));
      setTabs((old) => [...old, path]); setActive(path); setMessage(`Opened ${path}.`);
    } catch (error) { setMessage(`Open failed: ${String(error)}`); }
  }
  async function save() {
    if (!current || current.text === current.saved) return;
    try {
      if ((await current.handle.getFile()).lastModified !== current.modified) { setMessage("File changed on disk. Reopen it before saving."); return; }
      const writer = await current.handle.createWritable(); await writer.write(current.text); await writer.close();
      const modified = (await current.handle.getFile()).lastModified;
      setFiles((old) => ({ ...old, [active]: { ...old[active], saved: current.text, modified } })); setMessage(`Saved ${active}.`);
    } catch (error) { setMessage(`Save failed: ${String(error)}`); }
  }
  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); void save(); } };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  });
  return <main className="ide-shell real-workspace"><header className="topbar"><div className="brand"><div className="brand-mark"><Zap size={14} /></div>roveon <span className="brand-divider">/</span><span className="workspace-name">{folder?.name ?? "No workspace"}</span></div><div className="topbar-actions"><button className="top-action" onClick={choose}><FolderOpen size={15} /> Open folder</button><button className="top-action" disabled={!folder} onClick={async () => { if (folder) { setPaths(await scan(folder as Directory)); setMessage("Files refreshed."); } }}>Refresh</button></div></header><div className="workspace-grid real-grid"><aside className="explorer-pane"><div className="pane-heading">Explorer</div><div className="project-label">{folder?.name ?? "NO FOLDER OPEN"}</div><div className="file-tree live-tree">{paths.map((path) => <button key={path} className={`tree-item ${active === path ? "selected" : ""}`} onClick={() => void open(path)}><FileCode2 size={14} />{path}</button>)}</div></aside><section className="editor-area"><div className="editor-toolbar"><div className="tabs">{tabs.map((path) => <button key={path} className={`editor-tab ${active === path ? "active" : ""}`} onClick={() => setActive(path)}>{path.split("/").at(-1)}{files[path].text !== files[path].saved ? " •" : ""}</button>)}</div><div className="editor-actions"><button className="small-icon" onClick={() => void save()} title="Save"><Save size={15} /></button></div></div>{current ? <div className="monaco-container"><Editor path={active} value={current.text} theme="vs-dark" onChange={(text) => setFiles((old) => ({ ...old, [active]: { ...old[active], text: text ?? "" } }))} options={{ automaticLayout: true, minimap: { enabled: true }, fontSize: 13 }} /></div> : <div className="empty-editor"><h1>Build in context.</h1><p>Open a local project to edit its real files in Monaco.</p><button onClick={choose}><FolderOpen size={16} /> Open folder</button></div>}<div className="statusbar"><span>{message}</span><span>{current?.text !== current?.saved ? "Unsaved" : "Ready"}</span></div></section><aside className="assistant-pane"><div className="assistant-heading">Agents</div><div className="feature-note"><h2>Agent workspace</h2><p>Project local agents and controlled execution are planned for future milestones. No agents run here yet.</p></div></aside></div></main>;
}
