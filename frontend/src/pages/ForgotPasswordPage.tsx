// Forgot password page — email → verify the code → set a new password → sign in.
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordPageStyles as s } from "../assets/dummyStyles";
import { Input } from "../assets/ui";
import AuthShell from "../components/AuthShell";
import {
  apiError,
  forgotRequest,
  forgotReset,
  forgotVerifyCode,
} from "../utils/api";

const RESEND_COOLDOWN_SECONDS = 60;

// Multi-step forgot-password page: renders the email, code, or new-password step based on state.
export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);
  const requestMutation = useMutation({
    mutationFn: ({ email: address, initial }: { email: string; initial: boolean }) =>
      forgotRequest(address).then((result) => ({ result, initial })),
    onSuccess: ({ initial }) => {
      setCooldown(RESEND_COOLDOWN_SECONDS);
      if (initial) setStep("otp");
    },
    onError: (requestError) => setError(apiError(requestError)),
  });
  const verifyMutation = useMutation({
    mutationFn: ({ address, code }: { address: string; code: string }) =>
      forgotVerifyCode(address, code),
    onSuccess: () => setStep("password"),
    onError: (verificationError) => setError(apiError(verificationError)),
  });
  const resetMutation = useMutation({
    mutationFn: ({ address, code, newPassword }: { address: string; code: string; newPassword: string }) =>
      forgotReset(address, code, newPassword),
    onSuccess: () => {
      toast.success("Password reset — please sign in with your new password.");
      navigate("/login");
    },
    onError: (resetError) => setError(apiError(resetError)),
  });
  const loading =
    requestMutation.isPending ||
    verifyMutation.isPending ||
    resetMutation.isPending;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === "otp") otpRef.current?.focus();
  }, [step]);

  // Step 1 — email the 6-digit code.
  function requestCode(initial = false) {
    setError("");
    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }
    requestMutation.mutate({ email, initial });
  }

  // Step 2 — check the code, then move to the new-password step.
  async function verifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code");
      return;
    }
    verifyMutation.mutate({ address: email, code: otp });
  }

  // Step 3 — set the new password, then send the user to sign in again.
  async function resetPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    resetMutation.mutate({ address: email, code: otp, newPassword: password });
  }

  // ─────────────────── Step 1: email ───────────────────
  if (step === "email") {
    return (
      <AuthShell
        title="Forgot your password?"
        subtitle="Enter the email tied to your account and we'll send a 6-digit code."
        footer={
          <Link
            to="/login"
            className={s.backLink}
          >
            <ArrowLeft className={s.backLinkIcon} /> Back to sign in
          </Link>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestCode(true);
          }}
          className={s.form}
        >
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            error={error}
            autoComplete="email"
          />

          <div className={s.infoBox}>
            <ShieldCheck className={s.infoIcon} />
            We only send codes to registered accounts.
          </div>

          <button
            type="submit"
            disabled={loading}
            className={s.buttonPrimary}
          >
            <Mail className={s.buttonPrimaryIcon} />
            {loading ? "Sending code..." : "Send verification code"}
          </button>
        </form>
      </AuthShell>
    );
  }

  // ─────────────────── Step 3: new password ───────────────────
  if (step === "password") {
    return (
      <AuthShell
        title="Set a new password"
        subtitle="Code verified. Choose a new password for your account."
        footer={
          <Link
            to="/login"
            className={s.backLink}
          >
            <ArrowLeft className={s.backLinkIcon} /> Back to sign in
          </Link>
        }
      >
        <form onSubmit={resetPassword} className={s.form}>
          <Input
            label="New password"
            name="new-password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            error={error}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={loading || password.length < 6}
            className={s.buttonSecondary}
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </AuthShell>
    );
  }

  // ─────────────────── Step 2: verify the code ───────────────────
  return (
    <AuthShell
      title="Enter your code"
      subtitle={`We've emailed a 6-digit code to ${email}. It expires in 10 minutes.`}
      footer={
        <button
          onClick={() => {
            setStep("email");
            setOtp("");
            setPassword("");
            setError("");
          }}
          className={s.backLink}
        >
          <ArrowLeft className={s.backLinkIcon} /> Use a different email
        </button>
      }
    >
      <form onSubmit={verifyCode} className={s.form}>
        <div>
          <label htmlFor="otp" className={s.label}>
            Verification code
          </label>
          <input
            ref={otpRef}
            id="otp"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            placeholder="••••••"
            className={s.otpInput}
          />
          {error && <p className={s.error}>{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className={s.buttonSecondary}
        >
          {loading ? "Verifying..." : "Verify code"}
        </button>

        <div className={s.resendRow}>
          <span>Didn't get a code?</span>
          <button
            type="button"
            disabled={cooldown > 0 || loading}
            onClick={() => requestCode(false)}
            className={s.resendButton}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}