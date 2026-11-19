import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { currentUser } from "@/modules/auth/service";
import { SESSION_COOKIE } from "@/server/auth/session";
import { AppError } from "@/server/http/errors";
import { LogoutButton } from "@/components/auth/logout-button";
import { Icon } from "@/components/icon";
import styles from "@/components/auth/auth.module.css";

export const metadata: Metadata = { title: "Your account — Make My Marriage", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const cookieStore = await cookies();
  let account;
  try { account = await currentUser(cookieStore.get(SESSION_COOKIE)?.value); }
  catch (error) {
    if (error instanceof AppError && error.code === "UNAUTHENTICATED") redirect("/login");
    // Do not let driver errors containing connection details reach Next.js logs.
    return <><p className={styles.eyebrow}>Your account</p><h1>A little interruption.</h1><p className={styles.intro}>We couldn’t load your account. Please refresh the page and try again.</p></>;
  }
  return <>
    <span className={styles.accountIcon}><Icon name="check" /></span>
    <p className={styles.eyebrow}>You’re signed in</p>
    <h1>A beautiful beginning.</h1>
    <p className={styles.intro}>Welcome, {account.user.name}. Your account is ready.</p>
    <dl className={styles.accountCard}><dt>Name</dt><dd>{account.user.name}</dd><dt>Email</dt><dd>{account.user.email}</dd>
      {account.wedding && <><dt>Wedding</dt><dd>{account.wedding.brideName} &amp; {account.wedding.groomName}</dd></>}
    </dl>
    <p className={styles.intro}>Wedding setup and your planning workspace are coming next. You can return to this account whenever you’re ready.</p>
    <div className={styles.form}><LogoutButton /></div>
  </>;
}
