// Settings page — edit name and password (email is fixed), or delete your account.
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Lock } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { settingsPageStyles as s } from "../assets/dummyStyles";
import { Input } from "../assets/ui";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  apiError,
  changePassword,
  deleteMyAccount,
  updateProfile,
} from "../utils/api";

type HintTone = "muted" | "error" | "ok";

interface SettingsRowProps {
  title: string;
  desc: string;
  hint: string;
  hintTone?: HintTone;
  onSave: () => void;
  children: ReactNode;
  saveLabel?: string;
  saving: boolean;
}

interface SettingsState {
  nameHint: string;
  nameTone: HintTone;
  pwHint: string;
  pwTone: HintTone;
  savingName: boolean;
  savingPw: boolean;
}

interface RunSaveOptions {
  hintKey: "nameHint" | "pwHint";
  toneKey: "nameTone" | "pwTone";
  savingKey: "savingName" | "savingPw";
  validate: () => string | null;
  action: () => Promise<unknown>;
  okHint: string;
}

// One settings card: title, description, its input(s), a hint line, and a Save button.
function SettingsRow({
  title,
  desc,
  hint,
  hintTone = "muted",
  onSave,
  children,
  saveLabel = "Save",
  saving,
}: SettingsRowProps) {
  const hintClass =
    hintTone === "error"
      ? s.rowHintError
      : hintTone === "ok"
        ? s.rowHintOk
        : s.rowHintMuted;

  return (
    <section className={s.rowCard}>
      <div className={s.rowInner}>
        <h2 className={s.rowTitle}>{title}</h2>
        <p className={s.rowDesc}>{desc}</p>
        <div className={s.rowChildren}>{children}</div>
      </div>
      <div className={s.rowFooter}>
        <p className={hintClass}>{hint}</p>
        <button onClick={onSave} disabled={saving} className={s.rowSaveButton}>
          {saving ? "Saving..." : saveLabel}
        </button>
      </div>
    </section>
  );
}

// Account settings page: edit name, change password, and delete the account.
export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser, logoutUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [pwForm, setPwForm] = useState({ current: "", next: "" });
  const [state, setState] = useState<SettingsState>({
    nameHint: "Please use 32 characters at maximum.",
    nameTone: "muted",
    pwHint: "Use at least 6 characters.",
    pwTone: "muted",
    savingName: false,
    savingPw: false,
  });
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: ({ user: updatedUser }) => updateUser(updatedUser),
  });
  const passwordMutation = useMutation({ mutationFn: changePassword });
  const deleteMutation = useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      logoutUser();
      navigate("/");
    },
    onError: (error) => alert(apiError(error)),
  });

  // Merge the given fields into the shared UI state object.
  function setStatePatch(p: Partial<SettingsState>) {
    setState((s) => ({ ...s, ...p }));
  }

  // Shared save flow: validate, show saving, run the action, then set an ok or error hint.
  async function runSave({
    hintKey,
    toneKey,
    savingKey,
    validate,
    action,
    okHint,
  }: RunSaveOptions): Promise<void> {
    const error = validate();
    if (error) {
      setStatePatch({ [hintKey]: error, [toneKey]: "error" });
      return;
    }
    setStatePatch({ [savingKey]: true });
    try {
      await action();
      setStatePatch({ [hintKey]: okHint, [toneKey]: "ok", [savingKey]: false });
    } catch (err) {
      setStatePatch({
        [hintKey]: apiError(err),
        [toneKey]: "error",
        [savingKey]: false,
      });
    }
  }

  // Validate and save the profile name.
  const saveName = () =>
    runSave({
      hintKey: "nameHint",
      toneKey: "nameTone",
      savingKey: "savingName",
      validate: () =>
        name.trim().length < 2 ? "Enter at least 2 characters." : null,
      action: () => profileMutation.mutateAsync({ name: name.trim() }),
      okHint: "Saved.",
    });

  // Validate and save the new password.
    const savePassword = () =>
      runSave({
        hintKey: "pwHint",
        toneKey: "pwTone",
        savingKey: "savingPw",
        validate: () =>
          pwForm.next.length < 6
            ? "New password must be at least 6 characters."
            : null,
        action: async () => {
          await passwordMutation.mutateAsync({
            current: pwForm.current,
            nextPw: pwForm.next,
          });
          setPwForm({ current: "", next: "" });
        },
        okHint: "Password updated.",
      });

  // Delete the account, log out, and go to the home page.
  function handleDelete() {
    deleteMutation.mutate();
  }

  return (
    <div className={s.container}>
      <Navbar />
      <main className={s.main}>
        <div className={s.inner}>
          <header className={s.pageHeader}>
            <h1 className={s.pageTitle}>Account settings</h1>
            <p className={s.pageSub}>
              Manage your profile, security and account preferences.
            </p>
          </header>

          <div className={s.rowsContainer}>
            <SettingsRow
              title="Name"
              desc="Please enter your full name, or a display name."
              hint={state.nameHint}
              hintTone={state.nameTone}
              onSave={saveName}
              saving={state.savingName}
            >
              <Input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={32}
              />
            </SettingsRow>

            <section className={s.emailCard}>
              <h2 className={s.emailTitle}>Email</h2>
              <p className={s.emailDesc}>
                This is the email you sign in with. It can't be changed.
              </p>
              <div className={s.emailWrapper}>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className={s.emailInput}
                />
                <Lock className={s.emailLock} />
              </div>
            </section>

            <SettingsRow
              title="Change Password"
              desc="Enter your current password and a new password."
              hint={state.pwHint}
              hintTone={state.pwTone}
              onSave={savePassword}
              saving={state.savingPw}
              saveLabel="Update password"
            >
              <div className="space-y-3">
                <Input
                  label="Current Password"
                  name="current-password"
                  type="password"
                  value={pwForm.current}
                  onChange={(e) =>
                    setPwForm((f) => ({ ...f, current: e.target.value }))
                  }
                />
                <Input
                  label="New Password"
                  name="new-password"
                  type="password"
                  value={pwForm.next}
                  onChange={(e) =>
                    setPwForm((f) => ({ ...f, next: e.target.value }))
                  }
                />
              </div>
            </SettingsRow>

            <section className={s.deleteCard}>
              <div className={s.deleteInner}>
                <AlertTriangle className={s.deleteIcon} />
                <div>
                  <h2 className={s.deleteTitle}>Delete account</h2>
                  <p className={s.deleteDesc}>
                    Permanently delete your Creova account and all generated
                    projects. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className={s.deleteFooter}>
                {confirmingDelete ? (
                  <>
                    <button
                      onClick={() => setConfirmingDelete(false)}
                      className={s.deleteCancel}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className={s.deleteConfirm}
                    >
                      {deleteMutation.isPending
                        ? "Deleting..."
                        : "Yes, delete my account"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className={s.deleteTrigger}
                  >
                    Delete account
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
