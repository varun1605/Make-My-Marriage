import Link from "next/link";
import type { ReactNode } from "react";

export function AccessButton({ children, className, intent = "create" }: {
  children: ReactNode; className?: string; intent?: "create" | "login";
}) {
  return <Link href={intent === "login" ? "/login" : "/signup"} className={className}>{children}</Link>;
}
