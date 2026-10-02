// GitHubUploadModal — dialog to push the generated site to a GitHub repo.
import { useMutation } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  GitBranch,
  Globe,
  Loader2,
  Lock,
  X,
} from "lucide-react";
import type {
  Dispatch,
  FormEvent,
  ReactNode,
  SetStateAction,
} from "react";
import { useEffect, useState } from "react";
import { githubModalStyles as s } from "../../assets/dummyStyles";
import { Input } from "../../assets/ui";
import type {
  GitHubUploadRequest,
  GitHubUploadResult,
  Project,
} from "../../types";
import { apiError, uploadToGithub } from "../../utils/api";

const TOKEN_HINT_KEY = "Creova-github-token";

// Cleans a name into a valid GitHub repo slug (lowercase, dashes, max 60 chars).
function slugRepoName(s?: string): string {
  return (
    (s || "Creova-site")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_.]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "Creova-site"
  );
}

interface GitHubUploadModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
}

export default function GitHubUploadModal({
  open,
  onClose,
  project,
}: GitHubUploadModalProps) {
  const [token, setToken] = useState("");
  const [repoName, setRepoName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [enablePages, setEnablePages] = useState(true);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const uploadMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GitHubUploadRequest }) =>
      uploadToGithub(id, data),
    onSuccess: () => {
      if (remember) localStorage.setItem(TOKEN_HINT_KEY, token);
      else localStorage.removeItem(TOKEN_HINT_KEY);
    },
    onError: (uploadError) => setError(apiError(uploadError)),
  });
  const result = uploadMutation.data;
  const uploading = uploadMutation.isPending;

  useEffect(() => {
    if (!open) return;
    setError("");
    uploadMutation.reset();
    setRepoName(slugRepoName(project?.name));
    const saved = localStorage.getItem(TOKEN_HINT_KEY);
    if (saved) {
      setToken(saved);
      setRemember(true);
    }
  }, [open, project?.name]);

  function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!token || token.length < 20) {
      setError("Paste a GitHub Personal Access Token");
      return;
    }
    uploadMutation.mutate({
      id: project.id,
      data: {
        token,
        repoName: slugRepoName(repoName),
        isPrivate,
        enablePages,
      },
    });
  }

  if (!open) return null;
  return (
    <div className={s.overlay} onClick={onClose}>
      <div
        className={s.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className={s.closeButton}
        >
          <X className="w-4 h-4" />
        </button>

        <div className={s.header}>
          <div className={s.headerIconWrapper}>
            <GitBranch className={s.headerIcon} />
          </div>
          <div>
            <h2 className={s.headerTitle}>Upload to GitHub</h2>
            <p className={s.headerSub}>
              Push this site to a new (or existing) repo in your account.
            </p>
          </div>
        </div>

        <div className={s.scrollContainer}>
          {result ? (
            <UploadSuccess result={result} onClose={onClose} />
          ) : (
            <UploadForm
              token={token}
              setToken={setToken}
              repoName={repoName}
              setRepoName={setRepoName}
              isPrivate={isPrivate}
              setIsPrivate={setIsPrivate}
              enablePages={enablePages}
              setEnablePages={setEnablePages}
              remember={remember}
              setRemember={setRemember}
              uploading={uploading}
              error={error || (uploadMutation.isError ? apiError(uploadMutation.error) : "")}
              onSubmit={handleUpload}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// The form for entering the token, repo name, visibility, and Pages options.
interface UploadFormProps {
  token: string;
  setToken: Dispatch<SetStateAction<string>>;
  repoName: string;
  setRepoName: Dispatch<SetStateAction<string>>;
  isPrivate: boolean;
  setIsPrivate: Dispatch<SetStateAction<boolean>>;
  enablePages: boolean;
  setEnablePages: Dispatch<SetStateAction<boolean>>;
  remember: boolean;
  setRemember: Dispatch<SetStateAction<boolean>>;
  uploading: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function UploadForm({
  token,
  setToken,
  repoName,
  setRepoName,
  isPrivate,
  setIsPrivate,
  enablePages,
  setEnablePages,
  remember,
  setRemember,
  uploading,
  error,
  onSubmit,
}: UploadFormProps) {
  return (
    <form onSubmit={onSubmit} className={s.form}>
      <div className={s.infoBox}>
        <p className={s.infoTitle}>What this does:</p>
        <ul className={s.infoList}>
          <li>
            • Creates a new repo in YOUR GitHub account (or updates an existing
            one with the same name)
          </li>
          <li>
            • Commits <code className={s.code}>index.html</code> + a generated{" "}
            <code className={s.code}>README.md</code>
          </li>
          <li>
            • Optionally turns on GitHub Pages so your site is live at{" "}
            <code className={s.code}>username.github.io/repo</code>
          </li>
          <li>
            • Re-running with the same repo name PUSHES updates (overwrites old
            files)
          </li>
        </ul>
      </div>

      <Input
        label="GitHub Personal Access Token"
        type="password"
        name="token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="ghp_... or github_pat_..."
        hint={
          <>
            Easiest: a{" "}
            <span className="font-semibold text-white/80">classic</span> token (
            <code className="font-mono">ghp_…</code>) with the{" "}
            <code className="font-mono">repo</code> scope ticked —{" "}
            <a
              href="https://github.com/settings/tokens/new"
              target="_blank"
              rel="noopener noreferrer"
              className={s.inlineLink}
            >
              create one here
            </a>
            . A fine-grained token (
            <code className="font-mono">github_pat_…</code>) must have
            Repository access = All, plus Contents, Administration &amp; Pages
            set to Read and write.
          </>
        }
      />

      <Input
        label="Repository name"
        name="repoName"
        value={repoName}
        onChange={(e) => setRepoName(e.target.value)}
        placeholder="my-portfolio"
        hint="If a repo with this name already exists in your account, we'll push to it."
      />

      <div className={s.visibilityGrid}>
        <VisibilityBtn
          active={!isPrivate}
          onClick={() => setIsPrivate(false)}
          Icon={Globe}
          label="Public"
          sub="Anyone can view the repo"
        />
        <VisibilityBtn
          active={isPrivate}
          onClick={() => setIsPrivate(true)}
          Icon={Lock}
          label="Private"
          sub="Only you can see it"
        />
      </div>

      <Checkbox
        checked={enablePages}
        onChange={setEnablePages}
        label={
          <>
            Enable GitHub Pages (free hosting on{" "}
            <code className="font-mono text-[11px]">username.github.io</code>)
          </>
        }
        size={s.checkboxSizeLarge}
      />
      <Checkbox
        checked={remember}
        onChange={setRemember}
        label="Remember this token in my browser"
        size={s.checkboxSizeSmall}
      />

      {error && (
        <div className={s.errorBox}>
          <AlertTriangle className={s.errorIcon} />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={uploading || !token || !repoName}
        className={s.submitButton}
      >
        {uploading ? (
          <>
            <Loader2 className={s.submitSpinner} /> Pushing to GitHub...
          </>
        ) : (
          <>
            <GitBranch className="w-4 h-4" /> Push to GitHub
          </>
        )}
      </button>
    </form>
  );
}

// One selectable Public or Private choice button.
function VisibilityBtn({
  active,
  onClick,
  Icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  Icon: LucideIcon;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={s.visibilityBtn(active)}
    >
      <Icon className={s.visibilityIcon} />
      <div>
        <p className={s.visibilityLabel}>{label}</p>
        <p className={s.visibilitySub}>{sub}</p>
      </div>
    </button>
  );
}

// A labeled checkbox row.
function Checkbox({
  checked,
  onChange,
  label,
  size,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  size: string;
}) {
  return (
    <label className={`flex items-center gap-2 ${size} cursor-pointer select-none`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-indigo-500"
      />
      {label}
    </label>
  );
}

// Success screen shown after upload, with links to the repo and live site.
function UploadSuccess({
  result,
  onClose,
}: {
  result: GitHubUploadResult;
  onClose: () => void;
}) {
  return (
    <div className={s.successContainer}>
      <div className={s.successBox}>
        <Check className={s.successIcon} />
        <div>
          <p className={s.successTitle}>
            {result.alreadyExisted ? "Updated existing repo" : "Repo created"}
          </p>
          <p className={s.successSub}>
            {result.owner}/{result.repoName}
          </p>
        </div>
      </div>

      <ResultLink
        href={result.repoUrl}
        Icon={GitBranch}
        variant="default"
        label="Repository"
        value={result.repoUrl}
      />
      {result.pagesUrl && (
        <ResultLink
          href={result.pagesUrl}
          Icon={Globe}
          variant="indigo"
          label="Live site (Pages can take 1-2 min to build)"
          value={result.pagesUrl}
        />
      )}

      <button
        onClick={onClose}
        className={s.doneButton}
      >
        Done
      </button>
    </div>
  );
}

// A clickable card that links out to the repo or the live site.
function ResultLink({
  href,
  Icon,
  variant,
  label,
  value,
}: {
  href: string;
  Icon: LucideIcon;
  variant: "default" | "indigo";
  label: string;
  value: string;
}) {
  const cardClass = variant === "indigo" ? s.cardLinkIndigo : s.cardLinkDefault;
  const iconClass = variant === "indigo" ? s.linkIconIndigo : s.linkIconDefault;
  const labelClass = variant === "indigo" ? s.linkLabelIndigo : s.linkLabelDefault;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${s.cardLink} ${cardClass}`}
    >
      <div className={s.resultLinkContent}>
        <Icon className={`${s.linkIcon} ${iconClass}`} />
        <div className="min-w-0">
          <p className={`text-[12px] ${labelClass}`}>{label}</p>
          <p className={s.linkValue}>{value}</p>
        </div>
      </div>
      <ExternalLink className={`${s.externalIcon} ${iconClass}`} />
    </a>
  );
}