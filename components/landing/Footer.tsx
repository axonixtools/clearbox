"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import styles from "./landing-redesign.module.css";
import { FOOTER_GROUPS } from "./content";

export function Footer() {
  return (
    <footer className={styles.pageFooter}>
      <div className={`section-container ${styles.footerInner}`}>
        <div className={styles.footerBrand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark} aria-hidden>
              <Check className={styles.logoIcon} />
            </span>
            <span className={styles.logoText}>ClearBox</span>
          </Link>
          <p>A focused inbox cleanup product for people who want space, clarity, and a repeatable system.</p>
        </div>

        <div className={styles.footerLinks}>
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("#") ? (
                      <a href={`/${link.href}`}>{link.label}</a>
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
  );
}
