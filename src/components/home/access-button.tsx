"use client";

import { useId, useRef, useState, useEffect, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import styles from "./home.module.css";

export function AccessButton({ children, className, intent = "create" }: { children: ReactNode; className?: string; intent?: "create" | "login" }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const descriptionId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  function showDialog() {
    dialog.current?.showModal();
    setOpen(true);
  }

  return (
    <>
      <button type="button" className={className} onClick={showDialog}>{children}</button>
      <dialog ref={dialog} className={styles.accessDialog} aria-labelledby={headingId} aria-describedby={descriptionId} onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className={styles.dialogContent}>
          <button type="button" className={styles.dialogClose} aria-label="Close" onClick={() => dialog.current?.close()}><Icon name="close" /></button>
          <span className={styles.dialogIcon}><Icon name="flower" /></span>
          <p className={styles.eyebrow}>A little more time, a beautiful beginning</p>
          <h2 id={headingId}>{intent === "login" ? "Your wedding workspace is on its way." : "Something beautiful is coming."}</h2>
          <p id={descriptionId}>Make My Marriage is taking shape. {intent === "login" ? "Sign-in" : "Account creation"} isn’t available yet. In the meantime, discover how your celebrations, family, and memories will come together.</p>
          <button type="button" className={styles.primaryButton} onClick={() => dialog.current?.close()}>Continue exploring <Icon name="arrow" /></button>
        </div>
      </dialog>
    </>
  );
}
