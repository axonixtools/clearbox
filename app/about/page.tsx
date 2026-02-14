import Link from "next/link";
import { ArrowLeft, Heart, Shield, Sparkles, Zap } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import styles from "../info-pages.module.css";

export const metadata = {
  title: "About Us | ClearBox",
  description:
    "Learn about the team behind ClearBox and why we built a faster, cleaner way to recover messy inboxes.",
};

const VALUES = [
  {
    title: "Privacy First",
    description: "We do not build around harvesting inbox data. Session safety and trust come first.",
    icon: Shield,
    iconBg: "var(--primary-100)",
    iconColor: "var(--primary-600)",
  },
  {
    title: "Speed Matters",
    description: "Large unread counts should not mean hours of manual work. Fast triage is the baseline.",
    icon: Zap,
    iconBg: "var(--accent-100)",
    iconColor: "var(--accent-600)",
  },
  {
    title: "Human UX",
    description: "Email cleanup is emotional overhead. We keep the flow clear, direct, and motivating.",
    icon: Heart,
    iconBg: "var(--brand-100)",
    iconColor: "var(--brand-700)",
  },
];

export default function AboutPage() {
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
            <p className={styles.eyebrow}>About ClearBox</p>
            <h1 className={styles.title}>We built the inbox tool we wanted to use ourselves</h1>
            <p className={styles.subtitle}>
              ClearBox started after seeing how quickly unread email grows into digital stress. We wanted a
              product that is fast, honest, and actually pleasant to use.
            </p>
          </header>

          <section className={`${styles.panel} ${styles.story}`}>
            <div className={styles.storyCopy}>
              <p>
                The first version was created as a weekend project to clean a deeply neglected inbox with
                thousands of unread messages. Existing tools felt either overly corporate or too rigid for real
                cleanup workflows.
              </p>
              <p>
                We focused on one goal: make high-volume inbox cleanup simple enough to finish in one session.
                That means clear category views, fast batch actions, and a dashboard that gives you control.
              </p>
              <p>
                The product keeps evolving, but the principle is fixed: less clutter, less anxiety, more focus.
              </p>
            </div>

            <aside className={styles.storyAside}>
              <p className={styles.asideTitle}>What we optimize for</p>
              <ul className={styles.asideList}>
                <li>
                  <span className={styles.asideDot} />
                  <span>Minimal permission footprint and safer defaults</span>
                </li>
                <li>
                  <span className={styles.asideDot} />
                  <span>Readable actions and clear category-level control</span>
                </li>
                <li>
                  <span className={styles.asideDot} />
                  <span>Speed across inboxes with very large unread counts</span>
                </li>
              </ul>
            </aside>
          </section>

          <section className={styles.cards}>
            {VALUES.map((value) => (
              <article key={value.title} className={styles.card}>
                <div className={styles.iconWrap} style={{ background: value.iconBg }}>
                  <value.icon className="h-5 w-5" style={{ color: value.iconColor }} />
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </section>

          <section className={`${styles.panel} p-5 mt-3`}>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-4 w-4 text-[var(--brand-700)]" />
              <p className="font-semibold text-[var(--text-primary)]">Want to talk with the team?</p>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Visit the contact page for support, feedback, partnerships, or product collaboration.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
