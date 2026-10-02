// Register page — name/email/password sign-up that emails a verification code.
import { useMutation } from "@tanstack/react-query";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerPageStyles as s } from "../assets/dummyStyles";
import { Input } from "../assets/ui";
import AuthShell from "../components/AuthShell";
import { apiError, register } from "../utils/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitError, setSubmitError] = useState("");
  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (result) => {
      const params = new URLSearchParams({ email: result.email });
      navigate(`/verify-email?${params.toString()}`);
    },
    onError: (error) => setSubmitError(apiError(error)),
  });

  // Returns an onChange handler that updates one form field and clears its error.
  function update(field: "name" | "email" | "password") {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: undefined }));
      setSubmitError("");
    };
  }

  // Validates the fields, calls register, then sends the user to the verify-email page.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.name.trim().length < 2) er.name = "Enter your name";
    if (!form.email.includes("@")) er.email = "Enter a valid email";
    if (form.password.length < 6) er.password = "At least 6 characters";
    setErrors(er);
    if (Object.keys(er).length) return;
    setSubmitError("");
    registerMutation.mutate(form);
  }

  return (
    <AuthShell
      title="Sign Up"
      subtitle="Enter your information to create an account"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className={s.signInLink}
          >
            Sign In
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={s.form}>
        <Input
          label="Name"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={update("name")}
          error={errors.name}
          autoComplete="name"
        />
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
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={update("password")}
          error={errors.password}
          autoComplete="new-password"
        />

        {submitError && (
          <p className={s.submitError}>{submitError}</p>
        )}

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className={s.submitButton}
        >
          {registerMutation.isPending ? "Sending code..." : "Send verification code"}
        </button>

        <div className={s.infoBox}>
          <div className={s.infoRow}>
            <span className={s.infoDotIndigo} />
            We'll email you a 6-digit code. Enter it to verify, then sign in.
          </div>
          <div className={s.infoRow}>
            <span className={s.infoDotEmerald} />
            You get{" "}
            <span className={s.infoHighlight}>20 free credits</span> on
            first login.
          </div>
        </div>
      </form>
    </AuthShell>
  );
}