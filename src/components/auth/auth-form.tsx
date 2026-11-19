"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";
import { loginSchema, signupSchema } from "@/modules/auth/schemas";
import styles from "./auth.module.css";

type ApiError = { error?: { code?: string; message?: string; details?: Record<string, string> } };

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const signup = mode === "signup";
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const summary = useRef<HTMLDivElement>(null);

  // Server HTML must not accept credentials before the JSON submit handler exists.
  useEffect(() => { setReady(true); }, []);

  function showErrors(message: string, details: Record<string, string> = {}) {
    setError(message); setFields(details);
    requestAnimationFrame(() => summary.current?.focus());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || submitting.current) return;
    setError(""); setFields({});
    const form = new FormData(event.currentTarget);
    const input = { email: form.get("email"), password: form.get("password"), ...(signup ? { name: form.get("name") } : {}) };
    const parsed = (signup ? signupSchema : loginSchema).safeParse(input);
    if (!parsed.success) {
      const details: Record<string, string> = {};
      for (const issue of parsed.error.issues) details[String(issue.path[0])] ??= issue.message;
      showErrors("Please check the highlighted fields.", details);
      return;
    }
    submitting.current = true; setPending(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "same-origin", body: JSON.stringify(parsed.data),
      });
      if (response.ok) {
        // Full navigation keeps private content out of the previous router cache.
        window.location.assign("/account"); return;
      }
      const payload: ApiError = await response.json().catch(() => ({}));
      const retry = response.status === 429 ? " Please wait before trying again." : "";
      showErrors((payload.error?.message ?? "We couldn’t complete that request. Please try again.") + retry, payload.error?.details);
    } catch { showErrors("We couldn’t connect. Check your connection and try again."); }
    finally { submitting.current = false; setPending(false); }
  }

  return <>
    <p className={styles.eyebrow}>{signup ? "A beautiful beginning" : "Welcome to your shared space"}</p>
    <h1>{signup ? "Your story starts here." : "Welcome back."}</h1>
    <p className={styles.intro}>{signup ? "Create your account, and take the first step towards your celebrations." : "Log in to your Make My Marriage account."}</p>
    <noscript><p className={styles.errorSummary}>Enable JavaScript to log in or create an account.</p></noscript>
    <form className={styles.form} method="post" action={`/api/auth/${mode}`} onSubmit={submit} noValidate aria-busy={!ready || pending}>
      {error && <div ref={summary} tabIndex={-1} role="alert" className={styles.errorSummary}>{error}</div>}
      <fieldset disabled={!ready || pending}>
        {signup && <div className={styles.field}>
          <label htmlFor="name">Your name</label>
          <input id="name" name="name" type="text" autoComplete="name" required maxLength={120} placeholder="Your full name" aria-invalid={Boolean(fields.name)} aria-describedby={fields.name ? "name-error" : undefined} />
          {fields.name && <p id="name-error" className={styles.fieldError}>{fields.name}</p>}
        </div>}
        <div className={styles.field}>
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required maxLength={254} placeholder="you@example.com" aria-invalid={Boolean(fields.email)} aria-describedby={fields.email ? "email-error" : undefined} />
          {fields.email && <p id="email-error" className={styles.fieldError}>{fields.email}</p>}
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <div className={styles.passwordInput}>
            <input id="password" name="password" type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} required minLength={signup ? 15 : undefined} maxLength={128} placeholder={signup ? "Create a strong passphrase" : "Enter your password"} aria-invalid={Boolean(fields.password)} aria-describedby={[signup ? "password-hint" : "", fields.password ? "password-error" : ""].filter(Boolean).join(" ") || undefined} />
            <button type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}>{visible ? "Hide" : "Show"}</button>
          </div>
          {signup && <p id="password-hint" className={styles.hint}>Use 15–128 characters. A few memorable words work well.</p>}
          {fields.password && <p id="password-error" className={styles.fieldError}>{fields.password}</p>}
        </div>
        <button type="submit" className={styles.submit}>{pending ? (signup ? "Creating your account…" : "Logging in…") : (signup ? "Create your account" : "Log in")}<Icon name="arrow" /></button>
      </fieldset>
      <p className={styles.sessionNote}><Icon name="lock" /> You’ll stay signed in for up to seven days.</p>
    </form>
    <p className={styles.switchLink}>{signup ? "Already have an account?" : "New to Make My Marriage?"} <Link href={signup ? "/login" : "/signup"}>{signup ? "Log in" : "Create an account"}</Link></p>
    <p className={styles.releaseNote}>Account access is ready. Wedding setup and planning tools are coming next.</p>
  </>;
}
