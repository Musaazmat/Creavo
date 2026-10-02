// Builder — the main editor: chat on the left, live preview on the right.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUp,
  Bot,
  Check,
  Cloud,
  Code2,
  Copy,
  Download,
  Eye,
  GitBranch,
  Globe,
  Loader2,
  Monitor,
  RefreshCcw,
  Rocket,
  Smartphone,
  Sparkles,
  Tablet,
  User,
  Wand2,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { builderPageStyles as s } from "../assets/dummyStyles";
import { FullScreenMessage, Logo } from "../assets/ui";
import GitHubUploadModal from "../components/modal/GitHubUploadModal";
import VercelDeployModal from "../components/modal/VercelDeployModal";
import { BuilderPageSkeleton } from "../components/Skeletons";
import { useAuth } from "../context/AuthContext";
import { queryKeys } from "../queryKeys";
import type {
  AuthUser,
  GeneratedSourceFile,
  Project,
  ProjectFramework,
  ProjectMessage,
  ProjectUpdate,
} from "../types";
import {
  apiError,
  apiStatus,
  generateProject,
  getProject,
  updateProject,
} from "../utils/api";
import { safePreviewHtml } from "../utils/safePreview";

const devices = [
  { value: "desktop", icon: Monitor, label: "Desktop" },
  { value: "tablet", icon: Tablet, label: "Tablet" },
  { value: "mobile", icon: Smartphone, label: "Mobile" },
 ] as const;
type DeviceOption = (typeof devices)[number];
type DeviceWidth = DeviceOption["value"];

// Main builder page: loads the project, runs AI generation, and wires up the top bar, chat, and preview.
export default function BuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const [device, setDevice] = useState<DeviceWidth>("desktop");
  const [name, setName] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState("");
  const [genError, setGenError] = useState("");
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoFiredForRef = useRef<string | null>(null);

  const projectQueryKey = queryKeys.projects.detail(id ?? "");
  const projectQuery = useQuery({
    queryKey: projectQueryKey,
    queryFn: () => {
      if (!id) throw new Error("Project id is missing");
      return getProject(id);
    },
    enabled: Boolean(id),
  });
  const project = projectQuery.data?.project;
  const generateMutation = useMutation({
    mutationFn: ({ prompt }: { prompt: string }) => {
      if (!id) throw new Error("Project id is missing");
      return generateProject(id, prompt);
    },
    onSuccess: ({ project: updatedProject, user: updatedUser }) => {
      queryClient.setQueryData<{ project: Project }>(projectQueryKey, {
        project: updatedProject,
      });
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    onMutate: async ({ prompt }) => {
      await queryClient.cancelQueries({ queryKey: projectQueryKey });
      const previous = queryClient.getQueryData<{ project: Project }>(
        projectQueryKey,
      );
      queryClient.setQueryData<{ project: Project }>(
        projectQueryKey,
        (current) => {
          if (!current) return current;
          const messages = current.project.messages ?? [];
          const lastMessage = messages[messages.length - 1];
          if (lastMessage?.role === "user" && lastMessage.text === prompt) {
            return current;
          }
          return {
            ...current,
            project: {
              ...current.project,
              messages: [
                ...messages,
                { role: "user", text: prompt, createdAt: new Date().toISOString() },
              ],
            },
          };
        },
      );
      return { previous };
    },
  });
  const saveMutation = useMutation({
    mutationFn: (body: ProjectUpdate) => {
      if (!id) throw new Error("Project id is missing");
      return updateProject(id, body);
    },
    onSuccess: ({ project: updatedProject }) => {
      queryClient.setQueryData<{ project: Project }>(projectQueryKey, {
        project: updatedProject,
      });
      setSavedAt(new Date());
      setSaveError("");
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    onError: (error) => setSaveError(apiError(error)),
  });
  const generating = generateMutation.isPending;
  const saving = saveMutation.isPending;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (project) setName(project.name);
  }, [project?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function runGenerate(prompt: string) {
    setGenError("");
    try {
      await generateMutation.mutateAsync({ prompt });
    } catch (err) {
      setGenError(apiError(err));
      // 402 = out of credits → take user straight to the pricing page
      if (apiStatus(err) === 402) navigate("/pricing");
    }
  }

  async function savePatch(body: ProjectUpdate) {
    try {
      await saveMutation.mutateAsync(body);
    } catch {
      // Save errors are exposed by the mutation state.
    }
  }

  // --- Auto-generate the very first time a project loads with a prompt
  // but no HTML yet. Uses intrinsic project state (no sessionStorage hops).
  useEffect(() => {
    if (!project) return;
    if (autoFiredForRef.current === project.id) return;
    autoFiredForRef.current = project.id;
    const hasOutput =
      (project.framework ?? "html") === "html"
        ? Boolean(project.html)
        : (project.sourceFiles?.length ?? 0) > 0;
    const needsFirstGen = Boolean(project.prompt) && !hasOutput;
    // First generation now costs 5 credits (vs 2 for iterations).
    const hasCredits = (user?.credits ?? 0) >= 5;
    if (needsFirstGen && hasCredits && !generating) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      runGenerate(project.prompt);
    }
  }, [project?.id, project?.prompt, project?.html]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save on name change (debounced)
  useEffect(() => {
    if (!project || name === project.name) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      savePatch({ name });
    }, 800);
    const timer = debounceRef.current;
    return () => {
      if (timer !== null) clearTimeout(timer);
    };
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  // Surface generation errors inline in the chat as an assistant message.
  const chatMessages = useMemo<BuilderChatMessage[]>(() => {
    const base = project?.messages || [];
    if (!genError) return base;
    return [
      ...base,
      {
        role: "assistant",
        text: `Generation failed: ${genError}\n\nCheck the server logs, then click Try again below.`,
        isError: true,
      },
    ];
  }, [project?.messages, genError]);

  function handleDownload() {
    if (!project) return;
    const isHtml = (project.framework ?? "html") === "html";
    const contents = isHtml
      ? project.html
      : (project.sourceFiles ?? [])
          .map((file) => `// ${file.path}\n${file.content}`)
          .join("\n\n");
    if (!contents) return;
    const blob = new Blob([contents], {
      type: isHtml ? "text/html" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const extension = isHtml ? "html" : "source.txt";
    a.download = `${(project.name || "site").toLowerCase().replace(/\s+/g, "-")}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function handleTogglePublish() {
    if (!project) return;
    await savePatch({ published: !project.published });
  }
  function handlePreview() {
    if (!project) return;
    window.open(`/preview/${project.id}`, "_blank", "noopener");
  }

  if (projectQuery.isPending) {
    return <BuilderPageSkeleton />;
  }
  if (projectQuery.isError) {
    return (
      <FullScreenMessage>
        <p className={s.errorTitle}>Couldn't load project</p>
        <p className={s.errorSub}>{apiError(projectQuery.error)}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className={s.gradientButton + " mt-5 px-4 py-2 text-[13px]"}
        >
          Back to projects
        </button>
      </FullScreenMessage>
    );
  }
  if (!project) return null;

  // Cost depends on whether this is a first-build or an iteration
  const hasGeneratedOutput =
    (project.framework ?? "html") === "html"
      ? project.html.length > 100
      : (project.sourceFiles?.length ?? 0) > 0;
  const generationCost = hasGeneratedOutput ? 2 : 5;
  const canRetry =
    Boolean(genError) && !generating && (user?.credits ?? 0) >= generationCost;

  return (
    <div className={s.container}>
      <BuilderTopbar
        project={project}
        name={name}
        setName={setName}
        device={device}
        setDevice={setDevice}
        devices={devices}
        user={user}
        saving={saving}
        savedAt={savedAt}
        saveError={saveError}
        generating={generating}
        onBack={() => navigate("/dashboard")}
        onBuyCredits={() => navigate("/pricing")}
        onPreview={handlePreview}
        onDownload={handleDownload}
        onShowGithub={() => setShowGithubModal(true)}
        onShowDeploy={() => setShowDeployModal(true)}
        onTogglePublish={handleTogglePublish}
      />

      {project.published && (
        <div className={s.publishedBanner}>
          <Globe className={s.iconSm} />
          Live in Community ·{" "}
          <Link
            to={`/preview/${project.id}`}
            className={s.publishedLink}
          >
            View preview
          </Link>
        </div>
      )}

      <div className={s.mainFlex}>
        <div className={s.chatPanel}>
          <BuilderChat
            messages={chatMessages}
            onGenerate={(p) => runGenerate(p)}
            generating={generating}
            credits={user?.credits ?? 0}
            cost={generationCost}
            retry={canRetry ? () => runGenerate(project.prompt) : null}
          />
        </div>
        <BuilderPreview
          html={project.html}
          framework={project.framework ?? "html"}
          sourceFiles={project.sourceFiles ?? []}
          device={device}
          generating={generating}
          canGenerate={
            !project.html &&
            !generating &&
            (user?.credits ?? 0) >= 5 &&
            Boolean(project.prompt)
          }
          onGenerate={() => runGenerate(project.prompt)}
        />
      </div>

      <div className={s.mobileWarning}>
        <Eye className={s.iconSm + " shrink-0"} />
        Builder works best on larger screens.{" "}
        <Link to="/dashboard" className={s.mobileWarningBack}>
          Back
        </Link>
      </div>

      <GitHubUploadModal
        open={showGithubModal}
        onClose={() => setShowGithubModal(false)}
        project={project}
      />
      <VercelDeployModal
        open={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        project={project}
        onDeployed={(url) => {
          // Optimistically update local state so the deploy URL banner shows
          queryClient.setQueryData<{ project: Project }>(projectQueryKey, (current) =>
            current?.project
              ? {
                  ...current,
                  project: {
                    ...current.project,
                    deployUrl: url,
                    deployedAt: new Date().toISOString(),
                  },
                }
              : current,
          );
        }}
      />
    </div>
  );
}

// BuilderChat — the left-hand chat panel where you prompt the AI to build/edit.
const suggestions = [
  "Make the hero section more vibrant",
  "Add a testimonials section",
  "Change to a warm colour palette",
  "Add a pricing table with 3 tiers",
];

type BuilderChatMessage = ProjectMessage & { isError?: boolean };

function BuilderChat({
  messages,
  onGenerate,
  generating,
  credits,
  retry,
  cost,
}: {
  messages: BuilderChatMessage[];
  onGenerate: (prompt: string) => void;
  generating: boolean;
  credits: number;
  retry: (() => void) | null;
  cost: number;
}) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, generating]);

  function handleSend(text?: string) {
    const prompt = (text ?? input).trim();
    if (!prompt || credits < cost || generating) return;
    setInput("");
    onGenerate?.(prompt);
  }

  const outOfCredits = credits < cost;
  const empty = messages.length === 0;

  return (
    <div className={s.chatContainer}>
      <div className={s.chatHeader}>
        <div className={s.chatHeaderIcon}>
          <Sparkles className={s.chatHeaderIconInner} />
        </div>
        <div className={s.chatHeaderTitleContainer}>
          <h3 className={s.chatHeaderTitle}>AI Builder</h3>
          <p className={s.chatHeaderCredits}>
            {credits} {credits === 1 ? "credit" : "credits"} remaining
          </p>
        </div>
      </div>

      <div ref={listRef} className={s.chatMessages}>
        {empty && !generating && (
          <div className={s.emptyChat}>
            <p className={s.emptyChatSub}>Describe what you want to build.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <Message key={i} role={m.role} text={m.text} isError={m.isError} />
        ))}
        {generating && <TypingIndicator />}

        {retry && (
          <button
            onClick={retry}
            className={s.retryButton}
          >
            <RefreshCcw className={s.iconSm} /> Try generating again
          </button>
        )}

        {empty && !generating && (
          <div className={s.suggestionsContainer}>
            <p className={s.suggestionsLabel}>Try one of these:</p>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className={s.suggestionButton}
              >
                <Wand2 className={s.suggestionIcon} />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={s.chatInputArea}>
        {outOfCredits && (
          <div className={s.creditsWarning}>
            <Zap className={s.creditsWarningIcon} />
            <span className={s.creditsWarningText}>
              <span className={s.creditsWarningBold}>
                Need {cost - credits} more credit
                {cost - credits === 1 ? "" : "s"}.
              </span>{" "}
              This {cost === 5 ? "new site" : "change"} costs {cost}.
            </span>
            <button
              onClick={() => navigate("/pricing")}
              className={s.buyCreditsButton}
            >
              Buy credits
            </button>
          </div>
        )}
        <div className={s.inputContainer}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              outOfCredits
                ? "No credits left..."
                : "Describe your website or request changes..."
            }
            rows={2}
            disabled={outOfCredits || generating}
            className={s.textarea}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || generating || outOfCredits}
            className={`${s.sendButtonBase} ${
              input.trim() && !generating && !outOfCredits
                ? s.gradientButton
                : s.sendButtonDisabled
            }`}
            aria-label="Send"
          >
            <ArrowUp className={s.sendIcon} />
          </button>
        </div>
        <p className={s.inputHint}>
          Enter to send · Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}

// Tiny markdown-ish renderer for assistant messages — handles bold,
// bullet lists, and paragraph breaks. Enough for our summaries.
function renderInline(text: string): ReactNode[] {
  // bold: **text**
  const parts = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <strong key={`b-${i++}`} className="text-white">
        {m[1]}
      </strong>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// Renders one message's text as paragraphs and bullet lists.
function MessageBody({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  function flushBullets(key: string | number) {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`ul-${key}`} className={s.messageUl}>
        {bullets.map((b, i) => (
          <li key={i}>{renderInline(b)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  }
  const lines = (text || "").split(/\r?\n/);
  lines.forEach((line, i) => {
    const m = line.match(/^\s*[-*]\s+(.*)$/);
    if (m) {
      bullets.push(m[1]);
    } else {
      flushBullets(i);
      const trimmed = line.trim();
      if (trimmed) {
        blocks.push(
          <p key={`p-${i}`} className={s.messageP}>
            {renderInline(line)}
          </p>,
        );
      } else if (blocks.length) {
        blocks.push(<div key={`s-${i}`} className={s.messageSpacer} />);
      }
    }
  });
  flushBullets("end");
  return <div className={s.messageBodyWrapper}>{blocks}</div>;
}

// Renders one chat message bubble (user, assistant, or error).
function Message({
  role,
  text,
  isError,
}: {
  role: ProjectMessage["role"];
  text: string;
  isError?: boolean;
}) {
  const isUser = role === "user";
  if (isError) {
    return (
      <div className={s.messageContainer}>
        <div className={s.errorIconContainer}>
          <AlertTriangle className={s.errorIcon} />
        </div>
        <div className={s.errorMessage}>{text}</div>
      </div>
    );
  }
  return (
    <div className={`${s.messageContainer} ${isUser ? s.messageRowReverse : ""}`}>
      <div
        className={`${s.avatarBase} ${
          isUser ? s.avatarUser : s.avatarAssistant
        }`}
      >
        {isUser ? <User className={s.avatarIcon} /> : <Bot className={s.avatarIcon} />}
      </div>
      <div
        className={`${s.messageBubbleBase} ${
          isUser ? s.messageBubbleUser : s.messageBubbleAssistant
        }`}
      >
        {isUser ? text : <MessageBody text={text} />}
      </div>
    </div>
  );
}

// Shows animated dots while the AI is generating a reply.
function TypingIndicator() {
  return (
    <div className={s.typingContainer}>
      <div className={s.typingAvatar}>
        <Bot className={s.typingAvatarIcon} />
      </div>
      <div className={s.typingDotsContainer}>
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className={s.typingDot}
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// BuilderPreview — the live iframe preview of the generated site.
const deviceWidths = {
  desktop: "w-full",
  tablet: "w-[768px] mx-auto",
  mobile: "w-[390px] mx-auto",
};

function BuilderPreview({
  html,
  framework,
  sourceFiles,
  device = "desktop",
  generating,
  canGenerate = false,
  onGenerate,
}: {
  html: string;
  framework: ProjectFramework;
  sourceFiles: GeneratedSourceFile[];
  device: DeviceWidth;
  generating: boolean;
  canGenerate: boolean;
  onGenerate: () => void;
}) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [selectedPath, setSelectedPath] = useState("");
  const [copied, setCopied] = useState(false);
  const files: GeneratedSourceFile[] =
    framework === "html"
      ? html
        ? [{ path: "index.html", content: html }]
        : []
      : sourceFiles;
  const selectedFile = files.find((file) => file.path === selectedPath) ?? files[0];
  const empty = files.length === 0;

  useEffect(() => {
    if (!files.some((file) => file.path === selectedPath)) {
      setSelectedPath(files[0]?.path ?? "");
    }
  }, [files, selectedPath]);

  async function copySource() {
    if (!selectedFile) return;
    await navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className={s.previewContainer}>
      <div className={s.previewToolbar}>
        <div className={s.previewTabs} role="tablist" aria-label="Project view">
          <button
            type="button"
            role="tab"
            aria-selected={view === "preview"}
            onClick={() => setView("preview")}
            className={`${s.previewTab} ${view === "preview" ? s.previewTabActive : ""}`}
          >
            <Eye className={s.iconSm} /> Preview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "code"}
            onClick={() => setView("code")}
            className={`${s.previewTab} ${view === "code" ? s.previewTabActive : ""}`}
          >
            <Code2 className={s.iconSm} /> Code
          </button>
        </div>
        {view === "code" && (
          <div className={s.codeToolbarActions}>
            {files.length > 1 && (
              <select
                aria-label="Source file"
                value={selectedFile?.path ?? ""}
                onChange={(event) => setSelectedPath(event.target.value)}
                className={s.codeFileSelect}
              >
                {files.map((file) => (
                  <option key={file.path} value={file.path}>{file.path}</option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={copySource}
              disabled={!selectedFile}
              title="Copy source file"
              className={s.copyCodeButton}
            >
              <Copy className={s.iconSm} /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
      <div
        className={`${s.previewInnerWrapper} ${view === "preview" ? deviceWidths[device] || "" : ""}`}
      >
        <div className={s.previewBox}>
          {generating && view === "preview" && (
            <div className={s.generatingOverlay}>
              <Loader2 className={s.generatingSpinner} />
              <p className={s.generatingText}>Generating your website...</p>
              <p className={s.generatingSub}>
                AI is enhancing your prompt and writing the HTML. This can take
                10–20 seconds.
              </p>
            </div>
          )}

          {view === "code" ? (
            <div className={s.codeView}>
              {generating && (
                <div className={s.codeGenerating}>
                  <Loader2 className={s.iconSm + " animate-spin"} />
                  Updating source code…
                </div>
              )}
              {selectedFile ? (
                <pre className={s.codePre}><code>{selectedFile.content}</code></pre>
              ) : (
                <div className={s.codeEmpty}>
                  {generating ? "Your generated source will appear here." : "No source yet. Send a prompt to generate your project."}
                </div>
              )}
            </div>
          ) : framework !== "html" ? (
            <div className={s.codePreviewNotice}>
              <Code2 className={s.emptyIcon} />
              <h3 className={s.emptyTitle}>{framework === "react" ? "React project" : "Next.js project"}</h3>
              <p className={s.emptyDesc}>Switch to Code to inspect the generated project files. Embedded live preview is available for HTML projects.</p>
            </div>
          ) : empty && !generating ? (
            <EmptyState canGenerate={canGenerate} onGenerate={onGenerate} />
          ) : (
            <iframe
              title="preview"
              srcDoc={safePreviewHtml(html || "")}
              sandbox="allow-scripts allow-same-origin allow-modals allow-popups"
              className="w-full h-full border-0 bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Placeholder shown in the preview area before any site is generated.
function EmptyState({
  canGenerate,
  onGenerate,
}: {
  canGenerate: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className={s.emptyStateContainer}>
      <div className={s.emptyIconContainer}>
        <Zap className={s.emptyIcon} />
      </div>
      <h3 className={s.emptyTitle}>Your website will appear here</h3>
      <p className={s.emptyDesc}>
        Describe what you want to build in the chat panel — your AI-generated
        site will render here in seconds.
      </p>
      {canGenerate && (
        <button
          onClick={onGenerate}
          className={s.gradientButton + " px-4 py-2 text-[13px]"}
        >
          <Zap className={s.iconSm} /> Generate now
        </button>
      )}
    </div>
  );
}

// BuilderTopbar — builder's top bar: name, device toggle, save status, and actions.
function BuilderTopbar({
  project,
  name,
  setName,
  device,
  setDevice,
  devices,
  user,
  saving,
  savedAt,
  saveError,
  generating,
  onBack,
  onBuyCredits,
  onPreview,
  onDownload,
  onShowGithub,
  onShowDeploy,
  onTogglePublish,
}: {
  project: Project;
  name: string;
  setName: (name: string) => void;
  device: DeviceWidth;
  setDevice: (device: DeviceWidth) => void;
  devices: readonly DeviceOption[];
  user: AuthUser | null;
  saving: boolean;
  savedAt: Date | null;
  saveError: string;
  generating: boolean;
  onBack: () => void;
  onBuyCredits: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onShowGithub: () => void;
  onShowDeploy: () => void;
  onTogglePublish: () => void;
}) {
  return (
    <header className={s.topbar}>
      <div className={s.topbarLeft}>
        <button
          onClick={onBack}
          className={s.topbarBack}
          aria-label="Back"
        >
          <ArrowLeft className={s.topbarBackIcon} />
        </button>
        <div className={s.topbarLogo}>
          <Logo />
        </div>
        <span className={s.topbarSlash}>/</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={s.topbarNameInput}
        />
      </div>

      <div className={s.deviceToggle}>
        {devices.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setDevice(value)}
            title={label}
            className={`${s.deviceButtonBase} ${
              device === value ? s.deviceButtonActive : s.deviceButtonInactive
            }`}
          >
            <Icon className={s.deviceIcon} />
          </button>
        ))}
      </div>

      <div className={s.actionsContainer}>
        <SaveStatus
          saving={saving}
          savedAt={savedAt}
          error={saveError}
          generating={generating}
        />
        <button
          onClick={onBuyCredits}
          className={s.creditsButton}
          title="Buy more credits"
        >
          <Zap className={s.creditsIcon} />
          <span className={s.creditsLabel}>Credits :</span>
          <span className={s.creditsNumber}>{user?.credits ?? 0}</span>
        </button>
        <button
          onClick={onPreview}
          disabled={!project.html}
          title="Preview"
          className={s.actionButton}
        >
          <Eye className={s.actionButtonIcon} />
          <span className={s.actionButtonText}> Preview</span>
        </button>
        <button
          onClick={onDownload}
          disabled={!project.html && !project.sourceFiles?.length}
          title="Download"
          className={s.actionButton}
        >
          <Download className={s.actionButtonIcon} />
          <span className={s.actionButtonText}> Download</span>
        </button>
        <button
          onClick={onShowGithub}
          disabled={!project.html}
          title="Push to a GitHub repo"
          className={s.githubButton}
        >
          <GitBranch className={s.actionButtonIcon} /> GitHub
        </button>
        <button
          onClick={onShowDeploy}
          disabled={!project.html}
          title="Deploy to Vercel (free hosting + shareable URL)"
          className={s.actionButton}
        >
          <Cloud className={s.actionButtonIcon} />
          <span className={s.actionButtonText}> Deploy</span>
        </button>
        <button
          onClick={onTogglePublish}
          disabled={!project.html || saving}
          className={`${s.publishButtonBase} ${
            project.published
              ? s.publishButtonPublished
              : s.gradientButton
          }`}
        >
          {project.published ? (
            <>
              <Check className={s.publishIcon} /> Published
            </>
          ) : (
            <>
              <Rocket className={s.publishIcon} /> Publish
            </>
          )}
        </button>
      </div>
    </header>
  );
}

// Shows the current save state: generating, saving, saved, or failed.
function SaveStatus({
  saving,
  savedAt,
  error,
  generating,
}: {
  saving: boolean;
  savedAt: Date | null;
  error: string;
  generating: boolean;
}) {
  if (generating)
    return (
      <span className={s.saveStatusGenerating}>
        <Loader2 className={s.saveStatusSpinner} /> Generating…
      </span>
    );
  if (error)
    return (
      <span className={s.saveStatusError}>Save failed</span>
    );
  if (saving)
    return (
      <span className={s.saveStatusSaving}>Saving…</span>
    );
  if (savedAt)
    return (
      <span className={s.saveStatusSaved}>Saved</span>
    );
  return null;
}