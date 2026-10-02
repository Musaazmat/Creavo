// VercelDeployModal — dialog to deploy the site to Vercel and share its URL.
import { useMutation } from "@tanstack/react-query";
import {
    Check,
    Cloud,
    Copy,
    ExternalLink,
    Loader2,
    Sparkles,
    X,
} from "lucide-react";
import type {
    Dispatch,
    FormEvent,
    SetStateAction
} from "react";
import { useEffect, useState } from "react";
import { vercelModalStyles as s } from "../../assets/dummyStyles";
import type {
    Project,
    VercelDeployRequest,
    VercelDeployResult,
} from "../../types";
import { apiError, deployToVercel } from "../../utils/api";

const TOKEN_KEY = "Creova-vercel-token";

// Turns a name into a URL-safe slug (lowercase, dashes only, max 60 chars).
function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function VercelDeployModal({
  open,
  onClose,
  project,
  onDeployed,
}: {
  open: boolean;
  onClose: () => void;
  project: Project;
  onDeployed?: (url: string) => void;
}) {
  const [token, setToken] = useState("");
  const [remember, setRemember] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const deployMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VercelDeployRequest }) =>
      deployToVercel(id, data),
    onSuccess: (deployment) => {
      const trimmedToken = token.trim();
      if (trimmedToken) {
        if (remember) localStorage.setItem(TOKEN_KEY, trimmedToken);
        else localStorage.removeItem(TOKEN_KEY);
      }
      onDeployed?.(deployment.url);
    },
    onError: (deployError) => setError(apiError(deployError)),
  });
  const result = deployMutation.data;
  const busy = deployMutation.isPending;

  useEffect(() => {
    if (!open) return;
    setError("");
    deployMutation.reset();
    setCopied(false);
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      setRemember(true);
    }
    setProjectName(slugify(project?.name || "my-site"));
  }, [open, project?.id, project?.name]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  // Sends the deploy request to Vercel, remembers the token, and stores the result.
  function handleDeploy(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const data: VercelDeployRequest = {
      token: token.trim() || undefined,
      projectName: projectName.trim() || undefined,
    };
    deployMutation.mutate({ id: project.id, data });
  }

  // Copies the deployed URL to the clipboard and briefly shows a "copied" state.
  function copyUrl() {
    if (!result) return;
    navigator.clipboard.writeText(result.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      className={s.overlay}
      onClick={(e) => e.target === e.currentTarget && !busy && onClose?.()}
    >
      <div className={s.modal}>
        <button
          onClick={onClose}
          disabled={busy}
          className={s.closeButton}
          aria-label="Close"
        >
          <X className={s.iconSm} />
        </button>
        {result ? (
          <SuccessView
            result={result}
            copied={copied}
            onCopy={copyUrl}
            onClose={onClose}
          />
        ) : (
          <DeployForm
            token={token}
            setToken={setToken}
            remember={remember}
            setRemember={setRemember}
            projectName={projectName}
            setProjectName={setProjectName}
            busy={busy}
            error={error || (deployMutation.isError ? apiError(deployMutation.error) : "")}
            onSubmit={handleDeploy}
          />
        )}
      </div>
    </div>
  );
}

// Renders the deploy form: token input, project name, remember checkbox, and submit button.
interface DeployFormProps {
  token: string;
  setToken: Dispatch<SetStateAction<string>>;
  remember: boolean;
  setRemember: Dispatch<SetStateAction<boolean>>;
  projectName: string;
  setProjectName: Dispatch<SetStateAction<string>>;
  busy: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function DeployForm({
  token,
  setToken,
  remember,
  setRemember,
  projectName,
  setProjectName,
  busy,
  error,
  onSubmit,
}: DeployFormProps) {
  return (
    <>
      <div className={s.headerRow}>
        <div className={s.headerIconBox}>
          <Cloud className={s.headerIcon} />
        </div>
        <h2 className={s.headerTitle}>Deploy to Vercel</h2>
      </div>
      <p className={s.descText}>
        Push this site to Vercel as a free static deployment. You'll get a
        public{" "}
        <code className={s.inlineCode}>*.vercel.app</code> URL you can open on
        your phone or share with anyone.
      </p>

      <form onSubmit={onSubmit} className={s.form}>
        <div>
          <label className={s.label}>Vercel API token</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="prj_... or your personal token"
            className={s.field}
            autoComplete="off"
            required
            disabled={busy}
          />
          <p className={s.hint}>
            Create one at{" "}
            <a
              href="https://vercel.com/account/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className={s.inlineLink}
            >
              vercel.com/account/tokens
            </a>{" "}
            — needs full account scope. We never store it on our server.
          </p>
        </div>

        <div>
          <label className={s.label}>Project name (becomes the subdomain)</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="my-fruit-shop"
            className={`${s.field} ${s.fieldMono}`}
            disabled={busy}
            maxLength={50}
          />
          <p className={s.hint}>
            Will be live at{" "}
            <code className="text-white/70 text-[11px]">
              {slugify(projectName) || "your-project"}.vercel.app
            </code>
          </p>
        </div>

        <label className={s.checkboxWrapper}>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className={s.checkboxInput}
            disabled={busy}
          />
          Remember this token in my browser
        </label>

        {error && <div className={s.errorBox}>{error}</div>}

        <button
          type="submit"
          disabled={busy || !token.trim()}
          className={s.submitButton}
        >
          {busy ? (
            <>
              <Loader2 className={s.submitSpinner} /> Deploying...
            </>
          ) : (
            <>
              <Cloud className={s.iconSm} /> Push to Vercel
            </>
          )}
        </button>
      </form>
    </>
  );
}

// Renders the success screen after deploy: live URL, copy button, and QR code.
function SuccessView({
  result,
  copied,
  onCopy,
  onClose,
}: {
  result: VercelDeployResult;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}) {
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(result.url)}&bgcolor=0c0d0f&color=ffffff`;
  return (
    <>
      <div className={s.headerRow}>
        <div className={s.successIconBox}>
          <Check className={s.successIcon} />
        </div>
        <h2 className={`${s.headerTitle} ${s.headerTitleSuccess}`}>
          Deployed <Sparkles className={s.successSparkle} />
        </h2>
      </div>
      <p className={s.descTextSuccess}>
        Your site is live. Scan the QR with your phone or copy the link.
        Re-deploying with the same name updates the existing site.
      </p>

      <div className={s.urlBox}>
        <code className={s.urlText}>{result.url}</code>
        <button onClick={onCopy} className={s.iconButton} aria-label="Copy URL">
          {copied ? (
            <Check className={s.iconXs} />
          ) : (
            <Copy className={s.iconXs} />
          )}
        </button>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className={s.iconButton}
          aria-label="Open"
        >
          <ExternalLink className={s.iconXs} />
        </a>
      </div>

      <div className="flex justify-center mb-4">
        <img
          src={qrSrc}
          alt="QR code to open on phone"
          className={s.qrImage}
        />
      </div>

      {result.readyState && result.readyState !== "READY" && (
        <p className={s.statusText}>
          Status: {result.readyState} — wait 30s if QR shows a build screen
        </p>
      )}

      <button onClick={onClose} className={s.doneButton}>
        Done
      </button>
    </>
  );
}