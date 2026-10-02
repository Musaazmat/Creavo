// Small shared UI building blocks, all in one file: Card, Logo, Input, and the iframe thumbnail.

import { Eye, EyeOff, ImageOff } from "lucide-react";
import {
    forwardRef,
    useEffect,
    useRef,
    useState,
    type HTMLAttributes,
    type InputHTMLAttributes,
    type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { sharedUiStyles as s } from "../assets/dummyStyles";
import { safePreviewHtml } from "../utils/safePreview";
import logo from "./logo.svg";

// ── Card ────────────────────────────────────────────────────────────────────
// Reusable box container with optional hover styling.
type CardProps = HTMLAttributes<HTMLDivElement> & { hover?: boolean };

export function Card({ children, className, hover = false, ...props }: CardProps) {
  const hoverClass = hover ? s.cardHover : "";
  return (
    <div
      className={`${s.card} ${hoverClass} ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Logo ────────────────────────────────────────────────────────────────────
// App logo image that links back to the home page.
export function Logo({ to = "/", className = "" }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={`${s.logoLink} ${className || ""}`}>
      <img src={logo} alt="Creova" className={s.logoImg} />
      <span className={s.logoSpan}>Creova</span>
    </Link>
  );
}

// ── Input (with show/hide for passwords)
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: ReactNode;
  error?: string;
  rightSlot?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, type = "text", className, id, rightSlot, ...props },
  ref,
) {
  const inputId = id || props.name;
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword && show ? "text" : type;
  const hasRight = isPassword || rightSlot;

  const inputClasses = `
    ${s.inputBase}
    ${error ? s.inputError : s.inputDefault}
    ${hasRight ? s.inputWithRight : ""}
    ${className || ""}
  `.trim();

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={s.inputLabel}>
          {label}
        </label>
      )}
      <div className={s.inputWrapper}>
        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          className={inputClasses}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className={s.inputToggle}
          >
            {show ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
        )}
        {!isPassword && rightSlot && (
          <div className={s.inputRightSlot}>{rightSlot}</div>
        )}
      </div>
      {(error || hint) && (
        <p
          className={`${s.inputHint} ${error ? s.inputHintError : s.inputHintMuted}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
});

// ── ProjectThumbnail (scaled iframe preview for cards) ──────────────────────
const RENDER_WIDTH = 1280;
const RENDER_HEIGHT = 800;

export function ProjectThumbnail({
  html,
  className = "",
  ratio = "16/10",
}: {
  html: string;
  className?: string;
  ratio?: string;
}) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.25);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setScale(w / RENDER_WIDTH);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Reset loaded state when html changes so the skeleton shows briefly again
  useEffect(() => {
    setLoaded(false);
  }, [html]);

  const hasHtml = Boolean(html && html.length > 80);

  return (
    <div
      ref={wrapRef}
      className={`${s.thumbnailWrapper} ${className || ""}`}
      style={{ aspectRatio: ratio }}
    >
      {hasHtml ? (
        <>
          {!loaded && (
            <div className={s.thumbnailLoading}>Loading preview…</div>
          )}
          <iframe
            title="Project preview"
            srcDoc={safePreviewHtml(html)}
            sandbox=""
            loading="lazy"
            onLoad={() => setLoaded(true)}
            aria-hidden="true"
            tabIndex={-1}
            className={s.thumbnailIframe}
            style={{
              width: `${RENDER_WIDTH}px`,
              height: `${RENDER_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              pointerEvents: "none",
            }}
          />
        </>
      ) : (
        <div className={s.thumbnailEmpty}>
          <ImageOff className={s.thumbnailEmptyIcon} />
          No preview yet
        </div>
      )}
      {/* Capture pointer events so cards stay clickable */}
      <div className={s.thumbnailOverlay} />
    </div>
  );
}

// ── FullScreenMessage (centered full-viewport status/message screen) ─────────
export function FullScreenMessage({ children }: { children: ReactNode }) {
  return (
    <div className={s.fullScreen}>
      {children}
    </div>
  );
}

// Full-page background gradient, with an optional grid overlay.
export function PageBackdrop({ grid = false }) {
  return (
    <>
        <div
        className={s.backdropGradient}
        style={s.backdropGradientStyle}   
      />
      {grid && (
        <div
          className={s.backdropGrid}
          style={s.backdropGridStyle}     
        />
      )}
    </>
  );
}