"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { AccessButton } from "./access-button";
import styles from "./home.module.css";

const navigation = [
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
  ["Wedding website", "#wedding-website"],
  ["Vendors", "#vendors"],
] as const;

export function SiteHeader() {
  const [expanded, setExpanded] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <header className={styles.header} onKeyDown={(event) => {
      if (event.key === "Escape" && expanded) { setExpanded(false); toggle.current?.focus(); }
    }}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brand} aria-label="Make My Marriage home"><span>Make My Marriage</span><small>Beautifully together</small></Link>
        <nav aria-label="Primary" className={styles.desktopNav}>{navigation.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
        <div className={styles.headerActions}>
          <AccessButton intent="login" className={styles.loginButton}>Log in</AccessButton>
          <AccessButton className={styles.headerCta}>Create your wedding <Icon name="arrow" /></AccessButton>
          <button ref={toggle} type="button" className={styles.menuToggle} aria-expanded={expanded} aria-controls="mobile-navigation" aria-label={expanded ? "Close navigation" : "Open navigation"} onClick={() => setExpanded(!expanded)}><Icon name={expanded ? "close" : "menu"} /></button>
        </div>
      </div>
      <nav id="mobile-navigation" aria-label="Mobile" className={styles.mobileNav} hidden={!expanded}>
        {navigation.map(([label, href]) => <a key={href} href={href} onClick={() => setExpanded(false)}>{label}<Icon name="arrow" /></a>)}
        <AccessButton intent="login" className={styles.mobileLogin}>Log in <Icon name="arrow" /></AccessButton>
      </nav>
    </header>
  );
}
