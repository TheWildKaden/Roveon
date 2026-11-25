export type FileItem = {
  name: string;
  path: string;
  language: string;
  icon: "tsx" | "css" | "json" | "md" | "folder";
  content?: string;
};

export const projectFiles: FileItem[] = [
  { name: "app", path: "app", language: "folder", icon: "folder" },
  { name: "page.tsx", path: "app/page.tsx", language: "TypeScript React", icon: "tsx", content: `import { Header } from "@/components/header";\nimport { Overview } from "@/components/overview";\n\nexport default function Dashboard() {\n  return (\n    <main className="min-h-screen bg-slate-950">\n      <Header />\n      <Overview />\n    </main>\n  );\n}` },
  { name: "layout.tsx", path: "app/layout.tsx", language: "TypeScript React", icon: "tsx", content: `import type { Metadata } from "next";\n\nexport const metadata: Metadata = {\n  title: "Northstar dashboard",\n};\n\nexport default function RootLayout({ children }) {\n  return <>{children}</>;\n}` },
  { name: "globals.css", path: "app/globals.css", language: "CSS", icon: "css", content: `@import "tailwindcss";\n\n:root {\n  color-scheme: dark;\n  --background: #080b12;\n  --foreground: #e8edf6;\n}\n\nbody {\n  background: var(--background);\n  color: var(--foreground);\n}` },
  { name: "components", path: "components", language: "folder", icon: "folder" },
  { name: "header.tsx", path: "components/header.tsx", language: "TypeScript React", icon: "tsx", content: `export function Header() {\n  return (\n    <header className="flex items-center justify-between">\n      <span>Northstar</span>\n    </header>\n  );\n}` },
  { name: "overview.tsx", path: "components/overview.tsx", language: "TypeScript React", icon: "tsx", content: `const stats = [\n  { label: "Active users", value: "12,842" },\n  { label: "Conversion", value: "18.4%" },\n];\n\nexport function Overview() {\n  return <section>{stats.map((stat) => <div key={stat.label}>{stat.value}</div>)}</section>;\n}` },
  { name: "package.json", path: "package.json", language: "JSON", icon: "json", content: `{"name":"northstar","private":true,"scripts":{"dev":"next dev","build":"next build"}}` },
  { name: "README.md", path: "README.md", language: "Markdown", icon: "md", content: `# Northstar\n\nA focused analytics workspace for growing teams.\n\n## Getting started\n\nRun npm run dev to start the development server.` },
];

export const initialMessages = [
  { role: "assistant" as const, text: "I’m ready to work in northstar. Ask me to inspect, explain, or change anything in the project." },
  { role: "user" as const, text: "Can you improve the dashboard empty state?" },
  { role: "assistant" as const, text: "I found the dashboard surface in overview.tsx. I can make the empty state more useful with a clear next step and a compact example preview." },
];
