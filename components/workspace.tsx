"use client";

import { useMemo, useState } from "react";
import {
  Bell, Bot, ChevronDown, ChevronRight, CircleDot, Code2, Command, Download, Ellipsis,
  FileCode2, FileJson2, FileText, Folder, GitBranch, Github, LayoutDashboard, Maximize2,
  MessageSquare, MoreHorizontal, PanelLeft, Play, Plus, RefreshCw, Search, Send, Settings2,
  Sparkles, SquareTerminal, UserRound, X, Zap,
} from "lucide-react";
import { initialMessages, projectFiles, type FileItem } from "@/lib/project-data";

function FileIcon({ item }: { item: FileItem }) {
  if (item.icon === "folder") return <Folder size={14} className="file-icon folder-icon" />;
  if (item.icon === "json") return <FileJson2 size={14} className="file-icon json-icon" />;
  if (item.icon === "md") return <FileText size={14} className="file-icon md-icon" />;
  if (item.icon === "css") return <Code2 size={14} className="file-icon css-icon" />;
  return <FileCode2 size={14} className="file-icon tsx-icon" />;
}

function CodeView({ content }: { content: string }) {
  return <pre className="code-view">{content.split("\n").map((line, index) => <span className="code-line" key={`${index}-${line}`}><span className="line-number">{String(index + 1).padStart(2, "0")}</span><span className="line-content">{line || " "}</span></span>)}</pre>;
}

export function Workspace() {
  const [activePath, setActivePath] = useState("app/page.tsx");
  const [openPaths, setOpenPaths] = useState(["app/page.tsx", "app/globals.css"]);
  const [messages, setMessages] = useState(initialMessages);
  const [prompt, setPrompt] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const activeFile = projectFiles.find((file) => file.path === activePath) ?? projectFiles[1];
  const openFiles = useMemo(() => openPaths.map((path) => projectFiles.find((file) => file.path === path)).filter(Boolean) as FileItem[], [openPaths]);

  function openFile(file: FileItem) {
    if (file.icon === "folder") return;
    setActivePath(file.path);
    setOpenPaths((paths) => paths.includes(file.path) ? paths : [...paths, file.path]);
  }

  function submitPrompt(event: React.FormEvent) {
    event.preventDefault();
    if (!prompt.trim() || isThinking) return;
    const nextPrompt = prompt.trim();
    setMessages((current) => [...current, { role: "user", text: nextPrompt }]);
    setPrompt("");
    setIsThinking(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { role: "assistant", text: "I’ll inspect the relevant files and outline the smallest safe change first. Approval will be required before any files are modified." }]);
      setIsThinking(false);
    }, 900);
  }

  return <main className="ide-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Zap size={14} fill="currentColor" /></div><span>roveon</span><span className="brand-divider">/</span><span className="workspace-name">northstar</span></div>
      <div className="topbar-center"><button className="branch-button"><GitBranch size={13} /> main <ChevronDown size={12} /></button><span className="sync-status"><CircleDot size={11} /> All changes saved</span></div>
      <div className="topbar-actions"><button className="icon-button"><Bell size={15} /></button><button className="icon-button"><Settings2 size={15} /></button><div className="avatar">AK</div></div>
    </header>

    <div className="workspace-grid">
      <aside className="activitybar">
        <div className="activity-top"><button className="activity-button active"><LayoutDashboard size={17} /></button><button className="activity-button"><Search size={17} /></button><button className="activity-button"><GitBranch size={17} /><span className="badge">2</span></button><button className="activity-button"><Github size={17} /></button></div>
        <div className="activity-bottom"><button className="activity-button"><UserRound size={17} /></button><button className="activity-button"><Settings2 size={17} /></button></div>
      </aside>

      <aside className="explorer-pane">
        <div className="pane-heading"><span>Explorer</span><div><button className="small-icon"><Plus size={14} /></button><button className="small-icon"><MoreHorizontal size={14} /></button></div></div>
        <div className="project-label"><ChevronDown size={13} /><span>NORTHSTAR</span><Ellipsis size={14} /></div>
        <div className="file-tree">
          <button className="tree-item folder-row"><ChevronDown size={13} /><FileIcon item={projectFiles[0]} /><span>app</span></button>
          <button className={`tree-item nested ${activePath === "app/page.tsx" ? "selected" : ""}`} onClick={() => openFile(projectFiles[1])}><FileIcon item={projectFiles[1]} /><span>page.tsx</span></button>
          <button className={`tree-item nested ${activePath === "app/layout.tsx" ? "selected" : ""}`} onClick={() => openFile(projectFiles[2])}><FileIcon item={projectFiles[2]} /><span>layout.tsx</span></button>
          <button className={`tree-item nested ${activePath === "app/globals.css" ? "selected" : ""}`} onClick={() => openFile(projectFiles[3])}><FileIcon item={projectFiles[3]} /><span>globals.css</span></button>
          <button className="tree-item folder-row"><ChevronRight size={13} /><FileIcon item={projectFiles[4]} /><span>components</span></button>
          <button className={`tree-item nested ${activePath === "components/header.tsx" ? "selected" : ""}`} onClick={() => openFile(projectFiles[5])}><FileIcon item={projectFiles[5]} /><span>header.tsx</span></button>
          <button className={`tree-item nested ${activePath === "components/overview.tsx" ? "selected" : ""}`} onClick={() => openFile(projectFiles[6])}><FileIcon item={projectFiles[6]} /><span>overview.tsx</span></button>
          <button className={`tree-item ${activePath === "package.json" ? "selected" : ""}`} onClick={() => openFile(projectFiles[7])}><FileIcon item={projectFiles[7]} /><span>package.json</span></button>
          <button className={`tree-item ${activePath === "README.md" ? "selected" : ""}`} onClick={() => openFile(projectFiles[8])}><FileIcon item={projectFiles[8]} /><span>README.md</span></button>
        </div>
        <div className="explorer-footer"><div className="footer-row"><span><GitBranch size={13} /> main</span><span className="muted">2 changes</span></div><div className="footer-row"><span><Download size={13} /> Sync changes</span><span className="muted">⌘K</span></div></div>
      </aside>

      <section className="editor-area">
        <div className="editor-toolbar"><div className="tabs">{openFiles.map((file) => <button className={`editor-tab ${file.path === activePath ? "active" : ""}`} key={file.path} onClick={() => setActivePath(file.path)}><FileIcon item={file} /><span>{file.name}</span>{file.path === "app/page.tsx" && <span className="dirty-dot" />}<X size={12} /></button>)}</div><div className="editor-actions"><button className="small-icon"><PanelLeft size={14} /></button><button className="small-icon"><Maximize2 size={14} /></button><button className="small-icon"><MoreHorizontal size={14} /></button></div></div>
        <div className="breadcrumb"><span>app</span><ChevronRight size={12} /><span className="current-crumb">{activeFile.name}</span><span className="breadcrumb-spacer" /><span className="language-pill">{activeFile.language}</span><button className="run-button" onClick={() => setPreviewMode((value) => !value)}><Play size={12} fill="currentColor" /> {previewMode ? "Previewing" : "Run"}</button></div>
        <div className="editor-content"><CodeView content={activeFile.content ?? ""} /></div>
        {showTerminal && <div className="terminal-panel"><div className="terminal-heading"><div className="terminal-tabs"><button className="terminal-tab active"><SquareTerminal size={13} /> Terminal</button><button className="terminal-tab">Problems <span className="problem-count">0</span></button><button className="terminal-tab">Output</button></div><div className="terminal-tools"><button className="small-icon"><Plus size={13} /></button><button className="small-icon"><X size={13} onClick={() => setShowTerminal(false)} /></button></div></div><div className="terminal-body"><div><span className="terminal-prompt">➜</span> <span className="terminal-path">northstar</span> <span className="terminal-command">git status --short</span></div><div className="terminal-output"><span className="green"> M</span> app/page.tsx<br /><span className="green"> M</span> app/globals.css</div><div className="terminal-cursor"><span className="terminal-prompt">➜</span> <span className="terminal-path">northstar</span> <span className="cursor-block" /></div></div></div>}
        {!showTerminal && <button className="show-terminal" onClick={() => setShowTerminal(true)}><SquareTerminal size={13} /> Show terminal</button>}
      </section>

      <aside className="assistant-pane"><div className="assistant-heading"><div className="assistant-title"><div className="ai-mark"><Sparkles size={14} /></div><span>Roveon AI</span><span className="beta-pill">BETA</span></div><div><button className="small-icon"><MoreHorizontal size={14} /></button></div></div><div className="context-bar"><span className="context-dot" /> Working in <strong>northstar</strong><ChevronDown size={12} /></div><div className="conversation">{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}>{message.role === "assistant" ? <div className="message-avatar"><Bot size={13} /></div> : <div className="message-avatar user-avatar"><span>AK</span></div>}<div className="message-body"><div className="message-meta">{message.role === "assistant" ? "Roveon" : "You"}<span>{index === 0 ? "now" : `${index + 1}m`}</span></div><p>{message.text}</p>{index === 2 && <div className="file-suggestion"><FileCode2 size={13} /><span>components/overview.tsx</span><ChevronRight size={13} /></div>}</div></div>)}{isThinking && <div className="thinking"><div className="message-avatar"><Bot size={13} /></div><div className="thinking-dots"><i /><i /><i /></div></div>}</div><form className="prompt-box" onSubmit={submitPrompt}><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask Roveon to build, fix, or explain..." rows={2} /><div className="prompt-footer"><div className="prompt-hints"><span><Command size={11} /> Enter</span><span>to send</span></div><button className="send-button" aria-label="Send prompt" type="submit"><Send size={14} /></button></div></form><div className="assistant-status"><span><CircleDot size={11} /> Ready</span><span>GPT-4.1 <ChevronDown size={11} /></span></div></aside>
    </div>
  </main>;
}
