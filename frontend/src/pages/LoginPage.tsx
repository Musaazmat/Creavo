// Login page — email + password sign-in form.
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle2 } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginPageStyles as s } from "../assets/dummyStyles";
import { Input } from "../assets/ui";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";
import { apiError, apiStatus, login } from "../utils/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [params] = useSearchParams();
  // Pre-fill email if redirected from /verify-email or /register
  const initialEmail = params.get("email") || "";
  const justVerified = params.get("verified") === "1";
  const [form, setForm] = useState({ email: initialEmail, password: "" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitError, setSubmitError] = useState("");
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: ({ token, user }) => {
      loginUser(token, user);
      navigate("/dashboard");
    },
    onError: (error) => {
      if (
        apiStatus(error) === 403 &&
        axios.isAxiosError<{ needsVerification?: boolean; email?: string }>(error) &&
        error.response?.data.needsVerification &&
        error.response.data.email
      ) {
        navigate(
          `/verify-email?email=${encodeURIComponent(error.response.data.email)}`,
        );
        return;
      }
      setSubmitError(apiError(error));
    },
  });

  // Returns an onChange handler that updates one field and clears its error.
  function update(field: "email" | "password") {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: undefined }));
      setSubmitError("");
    };
  }

  // Validates inputs, logs the user in, and redirects to the dashboard.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!form.email.includes("@")) er.email = "Enter a valid email";
    if (form.password.length < 6) er.password = "At least 6 characters";
    setErrors(er);
    if (Object.keys(er).length) return;
    setSubmitError("");
    loginMutation.mutate(form);
  }

  return (
    <AuthShell
      title="Sign In"
      subtitle="Enter your email below to login to your account"
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/register"
            className={s.signUpLink}
          >
            Sign Up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={s.form}>
        {justVerified && (
          <div className={s.verifiedBanner}>
            <CheckCircle2 className={s.verifiedIcon} />
            Email verified — sign in to get your 20 free credits.
          </div>
        )}
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="m@example.com"
          value={form.email}
          onChange={update("email")}
          error={errors.email}
          autoComplete="email"
        />

        <div>
          <div className={s.passwordRow}>
            <label htmlFor="password" className={s.passwordLabel}>
              Password
            </label>
            <Link
              to="/forgot"
              className={s.forgotLink}
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={update("password")}
            error={errors.password}
            autoComplete="current-password"
          />
        </div>

        {submitError && (
          <p className={s.submitError}>{submitError}</p>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className={s.submitButton}
        >
          {loginMutation.isPending ? "Signing in..." : "Login"}
        </button>
      </form>
    </AuthShell>
  );
}