import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import styles from "./info-pages.module.css";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <header className={styles.hero}>
            <p className={styles.eyebrow}>Error 404</p>
            <h1 className={styles.title}>This page could not be found</h1>
            <p className={styles.subtitle}>
              The URL may be incorrect, outdated, or no longer available. Use the links below to continue.
            </p>
          </header>

          <section className={`${styles.panel} p-6 md:p-8`}>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className={`${styles.iconWrap} !mb-0`} style={{ background: "var(--primary-100)" }}>
                  <SearchX className="h-5 w-5 text-[var(--primary-600)]" />
                </div>
                <div className="space-y-2">
                  <p className="text-[var(--text-primary)] font-semibold">Need help navigating?</p>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Return to the homepage to restart, or contact support if you expected this page to exist.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/" className="btn btn-primary">
                  <Home className="h-4 w-4" />
                  Go to Home
                </Link>
                <Link href="/contact" className="btn btn-secondary">
                  Contact Support
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
