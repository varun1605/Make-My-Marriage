"use client";
import { useState } from "react";
import styles from "./auth.module.css";

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return <div>
    <button className={styles.submit} type="button" disabled={pending} onClick={async () => {
      setPending(true); setError("");
      try {
        const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
        if (response.ok || response.status === 401) { window.location.replace("/login"); return; }
        setError("We couldn’t log you out. Please try again.");
      } catch { setError("We couldn’t connect. Please try again."); }
      finally { setPending(false); }
    }}>{pending ? "Logging out…" : "Log out"}</button>
    {error && <p role="alert" className={styles.fieldError}>{error}</p>}
  </div>;
}
