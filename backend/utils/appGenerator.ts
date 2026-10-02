import type { ProjectMessage } from "../models/Project.ts";
import type {
  GeneratedSourceFile,
  ProjectFramework,
} from "../types/projects.ts";
import { callLLM, isLLMConfigured } from "./llm.ts";

const FILE_PATTERN = /<<<MINTSITE_FILE:([^>\r\n]+)>>>\s*\r?\n([\s\S]*?)<<<MINTSITE_END_FILE>>>/g;
const SUMMARY_PATTERN = /<<<MINTSITE_APP_SUMMARY>>>([\s\S]*?)<<<END_MINTSITE_APP_SUMMARY>>>/;
const MAX_FILES = 24;
const MAX_FILE_LENGTH = 80_000;
const MAX_TOTAL_LENGTH = 300_000;

export interface AppGenerationResult {
  files: GeneratedSourceFile[];
  summary: string;
  source: "llm" | "mock-no-key" | "mock-error";
  truncated: boolean;
}

interface AppGenerationOptions {
  previousFiles?: GeneratedSourceFile[];
  history?: ProjectMessage[];
}

const requiredFiles: Record<"react" | "nextjs", string[]> = {
  react: ["package.json", "index.html", "src/main.jsx", "src/App.jsx", "src/index.css"],
  nextjs: ["package.json", "app/layout.jsx", "app/page.jsx", "app/globals.css"],
};

function starterFiles(
  framework: "react" | "nextjs",
  prompt: string,
): GeneratedSourceFile[] {
  const title = prompt.trim().slice(0, 72) || "A fresh new website";
  const safeTitle = JSON.stringify(title);
  const css = `:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#152321;background:#f5f7f2;font-synthesis:none;text-rendering:optimizeLegibility}*{box-sizing:border-box}body{margin:0}main{min-height:100vh;display:grid;place-items:center;padding:32px;background:radial-gradient(circle at 85% 15%,#d9efdf,transparent 30%),#f5f7f2}.hero{width:min(920px,100%);padding:clamp(32px,8vw,88px);border:1px solid #dce5dc;border-radius:24px;background:#fff;box-shadow:0 24px 80px #21422b14}.eyebrow{color:#16744e;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.hero h1{max-width:720px;margin:18px 0;font-size:clamp(40px,8vw,76px);line-height:1.02;letter-spacing:-.04em}.hero p{max-width:580px;color:#62716a;font-size:18px;line-height:1.7}.action{display:inline-flex;margin-top:20px;padding:14px 20px;border-radius:999px;background:#176b4b;color:white;text-decoration:none;font-weight:700}`;

  if (framework === "react") {
    return [
      {
        path: "package.json",
        content: JSON.stringify(
          {
            name: "mintsite-generated-app",
            private: true,
            version: "1.0.0",
            type: "module",
            scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
            dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
            devDependencies: { "@vitejs/plugin-react": "^4.3.0", vite: "^6.0.0" },
          },
          null,
          2,
        ),
      },
      {
        path: "index.html",
        content: `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title.replace(/[<>&\"]+/g, "")}</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`,
      },
      {
        path: "src/main.jsx",
        content: `import React from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App.jsx";\nimport "./index.css";\n\ncreateRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);\n`,
      },
      {
        path: "src/App.jsx",
        content: `export default function App(){return <main><section className="hero"><span className="eyebrow">Made for what comes next</span><h1>{${safeTitle}}</h1><p>A considered digital experience, designed around your idea and the people it serves.</p><a className="action" href="#discover">Explore the experience</a></section></main>}`,
      },
      { path: "src/index.css", content: css },
    ];
  }

  return [
    {
      path: "package.json",
      content: JSON.stringify(
        {
          name: "mintsite-generated-next-app",
          private: true,
          version: "1.0.0",
          scripts: { dev: "next dev", build: "next build", start: "next start" },
          dependencies: { next: "^15.0.0", react: "^19.0.0", "react-dom": "^19.0.0" },
        },
        null,
        2,
      ),
    },
    {
      path: "app/layout.jsx",
      content: `import "./globals.css";\n\nexport const metadata = { title: ${safeTitle}, description: "A considered digital experience." };\n\nexport default function RootLayout({ children }) { return <html lang="en"><body>{children}</body></html>; }\n`,
    },
    {
      path: "app/page.jsx",
      content: `export default function HomePage(){return <main><section className="hero"><span className="eyebrow">Made for what comes next</span><h1>{${safeTitle}}</h1><p>A considered digital experience, designed around your idea and the people it serves.</p><a className="action" href="#discover">Explore the experience</a></section></main>}`,
    },
    { path: "app/globals.css", content: css },
  ];
}

function cleanFilePath(path: string): string | null {
  const normalized = path.trim().replace(/\\/g, "/").replace(/^\.\//, "");
  const segments = normalized.split("/");
  if (
    !normalized ||
    normalized.startsWith("/") ||
    segments.some((segment) => segment === ".." || segment === "") ||
    !/^[\w./-]+$/.test(normalized)
  ) {
    return null;
  }
  return normalized;
}

function parseFiles(raw: string): GeneratedSourceFile[] {
  const files: GeneratedSourceFile[] = [];
  let totalLength = 0;
  for (const match of raw.matchAll(FILE_PATTERN)) {
    const path = cleanFilePath(match[1]);
    const content = match[2].trim();
    if (!path || !content || content.length > MAX_FILE_LENGTH) continue;
    if (files.length >= MAX_FILES || totalLength + content.length > MAX_TOTAL_LENGTH) {
      break;
    }
    files.push({ path, content });
    totalLength += content.length;
  }
  return [...new Map(files.map((file) => [file.path, file])).values()];
}

export async function generateAppFiles(
  framework: Exclude<ProjectFramework, "html">,
  prompt: string,
  { previousFiles = [], history = [] }: AppGenerationOptions = {},
): Promise<AppGenerationResult> {
  if (!isLLMConfigured()) {
    return {
      files: starterFiles(framework, prompt),
      summary: "A starter project is ready to customize.",
      source: "mock-no-key",
      truncated: false,
    };
  }

  const frameworkName = framework === "react" ? "React with Vite" : "Next.js App Router";
  const fileList =
    framework === "react"
      ? "package.json, index.html, src/main.jsx, src/App.jsx, src/index.css"
      : "package.json, app/layout.jsx, app/page.jsx, app/globals.css";
  const previous = previousFiles
    .map((file) => `\n<<<MINTSITE_FILE:${file.path}>>>\n${file.content}\n<<<MINTSITE_END_FILE>>>`)
    .join("\n");
  const recentHistory = history
    .slice(-4)
    .map((message) => `${message.role}: ${message.text}`)
    .join("\n");
  const system = `You generate complete, polished ${frameworkName} website projects. Return every required source file in full using this exact format, with no markdown fences:\n<<<MINTSITE_FILE:path/to/file>>>\nfile contents\n<<<MINTSITE_END_FILE>>>\nAfter all files, return a short plain-language summary between <<<MINTSITE_APP_SUMMARY>>> and <<<END_MINTSITE_APP_SUMMARY>>>. Required files: ${fileList}. Use valid, self-contained JavaScript/JSX and CSS. Do not use TypeScript. Keep imports consistent with generated paths. Build the whole requested website, not a placeholder. When editing, preserve the existing design and unrelated code. Never include secrets or explain the markers inside the generated files.`;
  const user = `Framework: ${frameworkName}\nWebsite request: ${prompt}${recentHistory ? `\n\nRecent conversation:\n${recentHistory}` : ""}${previous ? `\n\nExisting source files to update:\n${previous}` : ""}\n\nGenerate the complete project files now.`;

  try {
    const raw = await callLLM(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.45, maxTokens: 18000 },
    );
    const files = parseFiles(raw);
    const paths = new Set(files.map((file) => file.path));
    const missing = requiredFiles[framework].filter((path) => !paths.has(path));
    if (missing.length) {
      throw new Error(`The generated project is missing required files: ${missing.join(", ")}`);
    }
    const summary = raw.match(SUMMARY_PATTERN)?.[1]?.trim() ?? "Your project source is ready.";
    return { files, summary, source: "llm", truncated: false };
  } catch {
    return {
      files: starterFiles(framework, prompt),
      summary: "A starter project is ready because the code generator could not finish this request.",
      source: "mock-error",
      truncated: false,
    };
  }
}
