import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock3, Github, HelpCircle, Mail, MessageSquare, Users } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import styles from "../info-pages.module.css";

const CONTACT_DESCRIPTION =
  "Contact the ClearBox team for product support, feedback, partnerships, or press inquiries.";

export const metadata: Metadata = {
  title: "Contact",
  description: CONTACT_DESCRIPTION,
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact ClearBox",
    description: CONTACT_DESCRIPTION,
    url: "/contact",
    type: "website",
  },
  twitter: {
    title: "Contact ClearBox",
    description: CONTACT_DESCRIPTION,
  },
};

const CONTACT_OPTIONS = [
  {
    title: "Support",
    description: "Technical issues, account access, or workflow questions.",
    email: "axonixtools@gmail.com",
    icon: HelpCircle,
    iconBg: "var(--primary-100)",
    iconColor: "var(--primary-600)",
  },
  {
    title: "General Inquiries",
    description: "Partnerships, press requests, and product feedback.",
    email: "axonixtools@gmail.com",
    icon: Mail,
    iconBg: "var(--brand-100)",
    iconColor: "var(--brand-700)",
  },
];

export default function ContactPage() {
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
            <p className={styles.eyebrow}>Contact</p>
            <h1 className={styles.title}>Talk to the ClearBox team</h1>
            <p className={styles.subtitle}>
              Whether you need support or want to collaborate, we keep communication direct and fast.
            </p>
          </header>

          <section className={styles.contactGrid}>
            {CONTACT_OPTIONS.map((option) => (
              <article key={option.title} className={styles.contactCard}>
                <div className={styles.iconWrap} style={{ background: option.iconBg }}>
                  <option.icon className="h-5 w-5" style={{ color: option.iconColor }} />
                </div>
                <h2 className="text-lg font-semibold">{option.title}</h2>
                <p>{option.description}</p>
                <a className="btn btn-secondary w-full" href={`mailto:${option.email}`}>
                  {option.email}
                </a>
              </article>
            ))}
          </section>

          <section className={styles.contactMeta}>
            <article className={styles.responseCard}>
              <div className={styles.responseHeader}>
                <Clock3 className={`h-4 w-4 ${styles.responseIcon}`} />
                <h3>Response times</h3>
              </div>
              <p className={styles.responseBody}>
                Support requests are typically answered within one business day. Partnership and press inquiries
                may take slightly longer.
              </p>
            </article>

            <article className={styles.responseCard}>
              <div className={styles.responseHeader}>
                <Users className={`h-4 w-4 ${styles.responseIcon}`} />
                <h3>Social updates</h3>
              </div>
              <p className={styles.responseBody}>Follow product updates, release notes, and tips on X and GitHub.</p>
              <div className={styles.socialLinks}>
                <a
                  href="https://x.com/axonixtools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLinkPrimary}
                >
                  <span className={styles.socialLinkIcon}>
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <span className={styles.socialLinkLabel}>@axonixtools</span>
                  <ArrowUpRight className={`h-4 w-4 ${styles.socialLinkArrow}`} />
                </a>
                <a
                  href="https://github.com/axonixtools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLinkSecondary}
                >
                  <span className={styles.socialLinkIcon}>
                    <Github className="h-4 w-4" />
                  </span>
                  <span className={styles.socialLinkLabel}>github.com/axonixtools</span>
                  <ArrowUpRight className={`h-4 w-4 ${styles.socialLinkArrow}`} />
                </a>
              </div>
            </article>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
