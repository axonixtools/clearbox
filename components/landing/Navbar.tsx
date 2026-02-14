"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Check, Home, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import styles from "./landing-redesign.module.css";

export function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("clearbox-last-scan");
    }
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--surface-50)] backdrop-blur-[14px]">
      <div className={`section-container ${styles.nav}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark} aria-hidden>
            <Check className={styles.logoIcon} />
          </span>
          <span className={styles.logoText}>ClearBox</span>
        </Link>

        <div className={styles.navRight}>
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="mx-auto h-4 w-4" />
            ) : (
              <Sun className="mx-auto h-4 w-4" />
            )}
          </button>

          {session ? (
            <>
              <Link href="/" className="btn btn-secondary" aria-label="Go to home page">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <button onClick={handleSignOut} className="btn btn-ghost" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className={`${styles.navCta} btn btn-primary`}
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
