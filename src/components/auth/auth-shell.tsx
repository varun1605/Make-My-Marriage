import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import palace from "../../../public/images/palace-wedding.jpg";
import styles from "./auth.module.css";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#auth-content">Skip to content</a>
      <aside className={styles.story} aria-label="Make My Marriage">
        <Link href="/" className={styles.brand}><span>Make My Marriage</span><small>Beautifully together</small></Link>
        <div className={styles.portrait}>
          <Image src={palace} alt="A couple beneath the sandstone arches of a Rajasthan palace" fill sizes="(max-width: 760px) 0px, 40vw" placeholder="blur" />
        </div>
        <div className={styles.storyCaption}><h2>Your wedding,<br />beautifully organized.</h2><span /><p>For your family. For your celebrations.<br />For the moments that become forever.</p></div>
        <p className={styles.storyFoot}>Many celebrations. One beautiful beginning.</p>
      </aside>
      <main id="auth-content" tabIndex={-1} className={styles.main}>
        <div className={styles.topline}><Link href="/" className={styles.backLink}>← Back to home</Link><span><Icon name="heart" /> Made for your family</span></div>
        <Link href="/" className={styles.mobileBrand}>Make My Marriage</Link>
        <div className={styles.formWrap}>{children}</div>
        <footer className={styles.footer}>© {new Date().getFullYear()} Make My Marriage<span>Beautifully organized. Lovingly shared.</span></footer>
      </main>
    </div>
  );
}
