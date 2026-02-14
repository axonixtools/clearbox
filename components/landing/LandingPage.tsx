"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronRight, Moon, Star, Sun } from "lucide-react";
import styles from "./landing-redesign.module.css";
import { useTheme } from "@/components/theme-provider";
import {
  FAQ_ITEMS,
  FEATURES,
  FOOTER_GROUPS,
  HERO_BADGES,
  METRICS,
  NAV_ITEMS,
  TESTIMONIALS,
  TRUST_POINTS,
  WORKFLOW_STEPS,
} from "./content";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className={styles.sectionHeader}>
      <p className={styles.sectionEyebrow}>{eyebrow}</p>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionDescription}>{description}</p>
    </div>
  );
}

export function LandingPage() {
  const { toggleTheme } = useTheme();
  const { status } = useSession();
  const router = useRouter();

  function startCleanup() {
    if (status === "authenticated") {
      router.push("/dashboard");
      return;
    }

    signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className={styles.page}>
      <div className={styles.backdropGlow} aria-hidden />

      <header className={styles.navShell}>
        <div className={`section-container ${styles.nav}`}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark} aria-hidden>
              <Check className={styles.logoIcon} />
            </span>
            <span className={styles.logoText}>ClearBox</span>
          </Link>

          <nav className={styles.navLinks} aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className={styles.navLink}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className={styles.navRight}>
            <button
              onClick={toggleTheme}
              className={styles.themeToggle}
              aria-label="Toggle color mode"
            >
              <Moon className={styles.themeIconLight} />
              <Sun className={styles.themeIconDark} />
            </button>
            <button onClick={startCleanup} className={`${styles.navCta} btn btn-primary`}>
              Start cleanup
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={`section-container ${styles.hero}`}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>Inbox cleanup that feels modern and controlled</p>
            <h1 className={styles.heroTitle}>
              Finally give your
              <span className={styles.heroAccent}> unread inbox </span>
              a proper reset
            </h1>
            <p className={styles.heroDescription}>
              ClearBox helps you sort inbox clutter into clear categories, take action in batches, and
              finish with confidence instead of endless email scrolling.
            </p>

            <div className={styles.heroActions}>
              <button onClick={startCleanup} className="btn btn-primary btn-xl">
                Connect Gmail
                <ArrowRight className={styles.buttonIcon} />
              </button>
              <a href="#how-it-works" className="btn btn-secondary btn-xl">
                See the workflow
              </a>
            </div>

            <ul className={styles.badgeRow} aria-label="Trust indicators">
              {HERO_BADGES.map((badge) => (
                <li key={badge}>
                  <Check className={styles.badgeCheck} />
                  <span>{badge}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.heroPanel}>
            <p className={styles.heroPanelLabel}>Cleanup preview</p>
            <div className={styles.heroPanelBlock}>
              <p className={styles.heroPanelTitle}>What you get in one pass</p>
              <ul className={styles.panelList}>
                {WORKFLOW_STEPS.map((step, index) => (
                  <li key={step.title}>
                    <span>{`0${index + 1}`}</span>
                    <p>{step.title}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.trustCard}>
              {TRUST_POINTS.map((item) => (
                <div key={item.label} className={styles.trustRow}>
                  <item.icon className={styles.trustIcon} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`section-container ${styles.metrics}`} aria-label="ClearBox impact">
          {METRICS.map((metric) => (
            <article key={metric.label} className={styles.metricCard}>
              <p className={styles.metricValue}>{metric.value}</p>
              <p className={styles.metricLabel}>{metric.label}</p>
            </article>
          ))}
        </section>

        <section id="how-it-works" className={`section-container ${styles.section}`}>
          <SectionHeader
            eyebrow="How it works"
            title="Simple steps, clear decisions"
            description="Every stage is designed to remove clutter without losing control. Scan, review, archive, done."
          />
          <div className={styles.stepGrid}>
            {WORKFLOW_STEPS.map((step, index) => (
              <article key={step.title} className={styles.stepCard}>
                <div className={styles.stepHead}>
                  <span className={styles.stepIndex}>{`0${index + 1}`}</span>
                  <step.icon className={styles.stepIcon} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className={styles.featureSection}>
          <div className="section-container">
            <SectionHeader
              eyebrow="Core features"
              title="Designed to be fast and repeatable"
              description="Reusable cleanup blocks let you run the same reliable process whenever your inbox drifts."
            />
            <div className={styles.featureGrid}>
              {FEATURES.map((feature) => (
                <article key={feature.title} className={styles.featureCard}>
                  <div className={styles.featureIconWrap}>
                    <feature.icon className={styles.featureIcon} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="proof" className={`section-container ${styles.section}`}>
          <SectionHeader
            eyebrow="Social proof"
            title="People are actually finishing cleanup runs"
            description="Clear wins from users who started with messy inboxes and left with a sustainable reset."
          />
          <div className={styles.reviewGrid}>
            {TESTIMONIALS.map((review) => (
              <article key={review.name} className={styles.reviewCard}>
                <div className={styles.reviewStars} aria-label="Five stars">
                  <Star className={styles.star} />
                  <Star className={styles.star} />
                  <Star className={styles.star} />
                  <Star className={styles.star} />
                  <Star className={styles.star} />
                </div>
                <p className={styles.reviewQuote}>&quot;{review.quote}&quot;</p>
                <div className={styles.reviewMeta}>
                  <div>
                    <p className={styles.reviewName}>{review.name}</p>
                    <p className={styles.reviewRole}>{review.role}</p>
                  </div>
                  <span className={styles.reviewResult}>{review.result}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className={styles.faqSection}>
          <div className="section-container">
            <SectionHeader
              eyebrow="FAQ"
              title="Everything important, up front"
              description="No hidden surprises. Here are the answers users ask before connecting their inbox."
            />
            <div className={styles.faqGrid}>
              {FAQ_ITEMS.map((item) => (
                <article key={item.question} className={styles.faqCard}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`section-container ${styles.finalCta}`}>
          <p className={styles.finalEyebrow}>Ready to clear the backlog?</p>
          <h2>Start your first cleanup session now</h2>
          <p>
            Sign in with Google, scan unread messages, and clean your inbox in guided batches with
            full control over what gets archived.
          </p>
          <button onClick={startCleanup} className="btn btn-primary btn-xl">
            Fix my inbox
            <ChevronRight className={styles.buttonIcon} />
          </button>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`section-container ${styles.footerInner}`}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoMark} aria-hidden>
                <Check className={styles.logoIcon} />
              </span>
              <span className={styles.logoText}>ClearBox</span>
            </Link>
            <p>
              A focused inbox cleanup product for people who want space, clarity, and a repeatable system.
            </p>
          </div>

          <div className={styles.footerLinks}>
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      {link.href.startsWith("#") ? (
                        <a href={link.href}>{link.label}</a>
                      ) : (
                        <Link href={link.href}>{link.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className={`section-container ${styles.footerMeta}`}>
          <p>{`Copyright ${new Date().getFullYear()} ClearBox. All rights reserved.`}</p>
        </div>
      </footer>
    </div>
  );
}
