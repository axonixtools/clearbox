import {
  type LucideIcon,
  BadgeCheck,
  Clock3,
  DatabaseZap,
  Inbox,
  LockKeyhole,
  MailCheck,
  MessageSquareWarning,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
};

export type MetricItem = {
  label: string;
  value: string;
};

export type WorkflowStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  result: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FooterGroup = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Proof", href: "#proof" },
  { label: "FAQ", href: "#faq" },
];

export const HERO_BADGES: string[] = [
  "Google OAuth",
  "Read-only by default",
  "No long-term storage",
];

export const METRICS: MetricItem[] = [
  { value: "16k+", label: "Unread emails cleaned in one session" },
  { value: "5 min", label: "Average time to first cleanup" },
  { value: "99.9%", label: "Session data wiped after completion" },
];

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    title: "Connect your Gmail securely",
    description:
      "Use Google sign-in and grant only the permissions needed to analyze and archive inbox clutter.",
    icon: ShieldCheck,
  },
  {
    title: "Get instant inbox intelligence",
    description:
      "ClearBox groups unread emails into practical buckets so you can decide quickly, not manually sort for hours.",
    icon: DatabaseZap,
  },
  {
    title: "Clean up in focused batches",
    description:
      "Archive whole categories in a click, then review any edge cases with full control before finalizing.",
    icon: MailCheck,
  },
];

export const FEATURES: FeatureItem[] = [
  {
    title: "Roast mode with a purpose",
    description:
      "Motivating, personality-driven summaries that turn inbox cleanup into a task you actually finish.",
    icon: WandSparkles,
  },
  {
    title: "Smart category triage",
    description:
      "Newsletters, social alerts, receipts, and everything else are separated so you can act with confidence.",
    icon: Inbox,
  },
  {
    title: "Low-friction speed",
    description:
      "Built for people with thousands of unread emails and very little patience.",
    icon: Zap,
  },
  {
    title: "Security-first architecture",
    description:
      "OAuth authentication, strict scope usage, and no permanent inbox content storage.",
    icon: LockKeyhole,
  },
  {
    title: "Session-only processing",
    description:
      "Your cleanup run is transient. Start, process, finish, and leave no long-lived data trail.",
    icon: Clock3,
  },
  {
    title: "Clear status feedback",
    description:
      "See counts, categories, and cleanup progress clearly so every action feels deliberate.",
    icon: MessageSquareWarning,
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I had over 12,000 unread emails and expected chaos. The flow made decisions obvious and I cleared most of it before lunch.",
    name: "Avery R.",
    role: "Product Manager",
    result: "12,487 -> 34",
  },
  {
    quote:
      "Most inbox tools feel generic. This one feels intentional, quick, and actually respectful of privacy.",
    name: "Nina K.",
    role: "Frontend Engineer",
    result: "7,921 -> 0",
  },
  {
    quote:
      "The category cleanup alone is worth it. The roast made me laugh, then immediately fix my inbox habits.",
    name: "Marcus T.",
    role: "Founder",
    result: "9,402 -> 11",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Do you store my emails?",
    answer:
      "No. ClearBox is designed around temporary processing. Your inbox content is not stored as long-term application data.",
  },
  {
    question: "Can I review before archiving?",
    answer:
      "Yes. Categories are shown with sample messages so you can decide what to archive before executing cleanup actions.",
  },
  {
    question: "Is this only for Gmail?",
    answer:
      "Today the best experience is Gmail via Google OAuth. The current workflow and permissions are optimized for that stack.",
  },
];

export const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export const TRUST_POINTS: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Google verified sign-in", icon: BadgeCheck },
  { label: "Scoped read + archive permissions", icon: ShieldCheck },
  { label: "Built for fast cleanup sessions", icon: Sparkles },
];
