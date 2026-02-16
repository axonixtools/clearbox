import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import styles from "../info-pages.module.css";

const PRIVACY_DESCRIPTION =
  "How ClearBox handles Gmail metadata, OAuth access, and security with strict data minimization.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: PRIVACY_DESCRIPTION,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "ClearBox Privacy Policy",
    description: PRIVACY_DESCRIPTION,
    url: "/privacy",
    type: "article",
  },
  twitter: {
    title: "ClearBox Privacy Policy",
    description: PRIVACY_DESCRIPTION,
  },
};

type PrivacySection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  link?: {
    href: string;
    label: string;
  };
};

const SECTIONS: PrivacySection[] = [
  {
    id: "data-minimization",
    title: "Data Minimization",
    paragraphs: [
      "We access only the data required to run the inbox cleanup workflow you request.",
      "ClearBox does not store full email bodies as long-term application data.",
    ],
  },
  {
    id: "google-data",
    title: "Google User Data",
    paragraphs: [
      "Our use and transfer of information from Google APIs follows the Google API Services User Data Policy and its Limited Use requirements.",
    ],
    link: {
      href: "https://developers.google.com/terms/api-services-user-data-policy",
      label: "Google API Services User Data Policy",
    },
  },
  {
    id: "what-we-process",
    title: "Information We Process",
    paragraphs: [
      "When you connect Gmail, we process message metadata such as sender and subject to categorize inbox content during a cleanup session.",
      "Secure OAuth tokens are used only for authenticated access and authorized actions while your session is active.",
    ],
    bullets: [
      "Temporary metadata processing for category analysis",
      "Session-scoped authentication and authorization handling",
    ],
  },
  {
    id: "how-we-use",
    title: "How We Use Information",
    paragraphs: [
      "Data access is used to calculate inbox statistics, generate roast output, and execute category actions you explicitly trigger.",
      "We never sell or trade personal data to third parties.",
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "Traffic between your browser and our services is encrypted with SSL/TLS. Access control and scoped permissions are enforced at the application level.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    paragraphs: ["Privacy questions can be sent to axonixtools@gmail.com."],
  },
];

export default function PrivacyPage() {
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
            <p className={styles.eyebrow}>Policy</p>
            <h1 className={styles.title}>Privacy Policy</h1>
            <p className={styles.subtitle}>
              We designed ClearBox around temporary processing and clear permission boundaries.
            </p>
          </header>

          <section className={styles.policyWrap}>
            <aside className={styles.policyNav}>
              <h3>On this page</h3>
              <ol>
                {SECTIONS.map((section, index) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{`${index + 1}. ${section.title}`}</a>
                  </li>
                ))}
              </ol>
            </aside>

            <article className={styles.policyBody}>
              <p className={styles.lastUpdated}>
                Last Updated{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>

              {SECTIONS.map((section) => (
                <section key={section.id} id={section.id} className={styles.policySection}>
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.link ? (
                    <p>
                      Reference:{" "}
                      <a href={section.link.href} target="_blank" rel="noopener noreferrer">
                        {section.link.label}
                      </a>
                      .
                    </p>
                  ) : null}
                  {section.bullets ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </article>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
