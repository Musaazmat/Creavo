// Verify email page — enter the 6-digit code to activate a new account.
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Mail } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmailPageStyles as s } from "../assets/dummyStyles";
import { Input } from "../assets/ui";
import AuthShell from "../components/AuthShell";
import { apiError, registerResend, registerVerify } from "../utils/api";

const RESEND_COOLDOWN_SECONDS = 60;

// Page that lets a new user type the emailed 6-digit code and activate their account.
export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const email = (params.get("email") || "").toLowerCase();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const otpRef = useRef<HTMLInputElement>(null);
  const verifyMutation = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      registerVerify(email, code),
    onSuccess: () => {
      setVerified(true);
      setTimeout(() => {
        navigate(`/login?email=${encodeURIComponent(email)}&verified=1`, {
          replace: true,
        });
      }, 1400);
    },
    onError: (error) => setError(apiError(error)),
  });
  const resendMutation = useMutation({
    mutationFn: registerResend,
    onSuccess: () => setCooldown(RESEND_COOLDOWN_SECONDS),
    onError: (error) => setError(apiError(error)),
  });

  useEffect(() => {
    otpRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // No email param? Send them back to register — they shouldn't be here.
  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  // Checks the code, calls the verify API, then shows success and sends them to login.
  function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code");
      return;
    }
    verifyMutation.mutate({ email, code: otp });
  }

  // Asks the API to send a fresh code and restarts the resend cooldown timer.
  function handleResend() {
    if (cooldown > 0) return;
    setError("");
    resendMutation.mutate(email);
  }

  if (verified) {
    return (
      <AuthShell title="Verified" subtitle="">
        <div className={s.verifiedContainer}>
          <div className={s.verifiedIconWrapper}>
            <CheckCircle2 className={s.verifiedIcon} />
          </div>
          <p className={s.verifiedTitle}>Email verified</p>
          <p className={s.verifiedSub}>
            Taking you to the sign-in page...
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle={
        <>
          We sent a 6-digit code to{" "}
          <span className="text-white font-medium">{email}</span>. Enter it
          below to finish creating your account.
        </>
      }
      footer={
        <>
          Wrong email?{" "}
          <Link
            to="/register"
            className={s.signUpLink}
          >
            Sign up again
          </Link>
        </>
      }
    >
      <form onSubmit={handleVerify} className={s.form}>
        <Input
          ref={otpRef}
          label="Verification code"
          name="otp"
          value={otp}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setOtp(v);
            setError("");
          }}
          placeholder="123456"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          error={error}
          className={s.otpInput}
        />

        <button
          type="submit"
          disabled={verifyMutation.isPending || otp.length !== 6}
          className={s.submitButton}
        >
          {verifyMutation.isPending ? "Verifying..." : "Verify email"}
        </button>

        <div className={s.resendRow}>
          <span className={s.resendLeft}>
            <Mail className={s.resendIcon} /> Didn't get it?
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resendMutation.isPending}
            className={s.resendButton}
          >
            {resendMutation.isPending
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend code"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}