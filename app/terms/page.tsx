import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import styles from "../info-pages.module.css";

const TERMS_DESCRIPTION =
  "Review the terms that govern access to ClearBox and responsibilities when using inbox cleanup features.";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: TERMS_DESCRIPTION,
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "ClearBox Terms of Service",
    description: TERMS_DESCRIPTION,
    url: "/terms",
    type: "article",
  },
  twitter: {
    title: "ClearBox Terms of Service",
    description: TERMS_DESCRIPTION,
  },
};

const SECTIONS = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    paragraphs: [
      "By using ClearBox, you agree to these Terms of Service. If you do not agree, please do not use the product.",
    ],
  },
  {
    id: "service-description",
    title: "Service Description",
    paragraphs: [
      "ClearBox analyzes inbox metadata and lets authorized users archive categories in bulk. The product may generate AI-based commentary from those stats.",
    ],
  },
  {
    id: "user-responsibilities",
    title: "User Responsibilities",
    paragraphs: [
      "You represent that you are authorized to access any account connected to ClearBox.",
      "You are responsible for all actions triggered from your authenticated session.",
    ],
  },
  {
    id: "disclaimer",
    title: "Disclaimer of Warranties",
    paragraphs: [
      "The service is provided as-is and as-available. We do not guarantee uninterrupted operation or specific outcomes in all environments.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    paragraphs: [
      "ClearBox is not liable for indirect or consequential damages, including lost profit, lost data, or business interruption related to product usage.",
    ],
  },
  {
    id: "changes",
    title: "Changes to Terms",
    paragraphs: [
      "We may update these terms periodically. Continued use after updates indicates acceptance of the revised terms.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    paragraphs: ["Questions about these terms can be sent to axonixtools@gmail.com."],
  },
] as const;

export default function TermsPage() {
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
            <p className={styles.eyebrow}>Legal</p>
            <h1 className={styles.title}>Terms of Service</h1>
            <p className={styles.subtitle}>
              These terms define the rules for using ClearBox and your responsibilities during product use.
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
