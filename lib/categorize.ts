import { EmailMetadata } from "./gmail";

export type EmailCategory = "newsletters" | "social" | "receipts" | "other";

export interface CategorizedEmails {
  newsletters: EmailMetadata[];
  social: EmailMetadata[];
  receipts: EmailMetadata[];
  other: EmailMetadata[];
}

export interface EmailStats {
  total: number;
  newsletters: number;
  social: number;
  receipts: number;
  other: number;
  oldestDate: string;
  topSenders: { name: string; count: number }[];
  topDomains: { domain: string; count: number }[];
  newsletterDomains: string[];
  socialBreakdown: { platform: string; count: number }[];
}

// ===== DOMAIN PATTERNS =====

const NEWSLETTER_DOMAINS = new Set([
  "mailchimp.com",
  "sendgrid.net",
  "sendgrid.com",
  "constantcontact.com",
  "mailgun.com",
  "mailgun.net",
  "sparkpostmail.com",
  "amazonses.com",
  "postmarkapp.com",
  "campaign-archive.com",
  "list-manage.com",
  "email.mg",
  "substack.com",
  "beehiiv.com",
  "convertkit.com",
  "buttondown.email",
  "revue.email",
  "ghost.io",
  "hubspot.com",
  "hubspotemail.net",
  "klaviyo.com",
  "drip.com",
  "sendinblue.com",
  "brevo.com",
  "getresponse.com",
  "aweber.com",
  "activecampaign.com",
  "mailerlite.com",
  "e.medium.com",
  "medium.com",
  "quora.com",
  "digest-noreply@quora.com",
]);

const SOCIAL_DOMAINS = new Set([
  "linkedin.com",
  "linkedinmail.com",
  "facebookmail.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "instagram.com",
  "tiktok.com",
  "pinterest.com",
  "reddit.com",
  "redditmail.com",
  "tumblr.com",
  "snapchat.com",
  "discord.com",
  "discordapp.com",
  "slack.com",
  "slackbot.com",
  "youtube.com",
  "github.com",
  "gitlab.com",
  "stackoverflow.email",
  "twitch.tv",
  "mastodon.social",
  "threads.net",
  "whatsapp.com",
  "telegram.org",
]);

const RECEIPT_DOMAINS = new Set([
  "amazon.com",
  "amazon.co.uk",
  "ebay.com",
  "shopify.com",
  "stripe.com",
  "paypal.com",
  "squareup.com",
  "venmo.com",
  "doordash.com",
  "ubereats.com",
  "uber.com",
  "lyft.com",
  "grubhub.com",
  "instacart.com",
  "walmart.com",
  "target.com",
  "bestbuy.com",
  "apple.com",
  "google.com",
  "steamcommunity.com",
  "steampowered.com",
  "playstation.com",
  "xbox.com",
  "airbnb.com",
  "booking.com",
  "expedia.com",
  "etsy.com",
]);

// ===== SUBJECT PATTERNS =====

const NEWSLETTER_SUBJECT_PATTERNS = [
  /\bunsubscribe\b/i,
  /\bnewsletter\b/i,
  /\bdigest\b/i,
  /\bweekly\b/i,
  /\bdaily\b/i,
  /\bmonthly\b/i,
  /\bround\s*up\b/i,
  /\btop\s+stories\b/i,
  /\byour\s+\w+\s+update\b/i,
];

const SOCIAL_SUBJECT_PATTERNS = [
  /\bliked\s+your\b/i,
  /\bmentioned\s+you\b/i,
  /\bsent\s+you\s+a\s+message\b/i,
  /\bconnection\s+request\b/i,
  /\bfollowed\s+you\b/i,
  /\bfriend\s+request\b/i,
  /\btagged\s+you\b/i,
  /\bcommented\s+on\b/i,
  /\breacted\s+to\b/i,
  /\binvited\s+you\b/i,
  /\bnew\s+follower\b/i,
  /\bshared\s+a\s+post\b/i,
  /\bjoin\s+.+\s+on\b/i,
];

const RECEIPT_SUBJECT_PATTERNS = [
  /\breceipt\b/i,
  /\border\s+confirm/i,
  /\byour\s+order\b/i,
  /\bshipped\b/i,
  /\bdelivered\b/i,
  /\binvoice\b/i,
  /\bpayment\s+(received|confirmed|processed)\b/i,
  /\btransaction\b/i,
  /\bpurchase\b/i,
  /\bsubscription\s+(renewed|confirmed|receipt)\b/i,
  /\brefund\b/i,
  /\btracking\s+(number|update)\b/i,
];

const NEWSLETTER_SENDER_PATTERNS = [
  /\bnewsletter\b/i,
  /\bnoreply\b/i,
  /\bno-reply\b/i,
  /\bdo-not-reply\b/i,
  /\bdo_not_reply\b/i,
  /\bmailer\b/i,
  /\bnotifications?\b/i,
  /\bupdates?\b/i,
  /\bdigest\b/i,
  /\binfo@\b/i,
];

// ===== CATEGORIZATION ENGINE =====

function matchesDomain(domain: string, domainSet: Set<string>): boolean {
  if (domainSet.has(domain)) return true;
  // Check parent domain (e.g., "mail.linkedin.com" → "linkedin.com")
  const parts = domain.split(".");
  if (parts.length > 2) {
    const parent = parts.slice(-2).join(".");
    return domainSet.has(parent);
  }
  return false;
}

function matchesPatterns(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function categorizeEmail(email: EmailMetadata): EmailCategory {
  const { fromDomain, from, subject } = email;

  // Domain-based matching first (most reliable)
  if (matchesDomain(fromDomain, SOCIAL_DOMAINS)) return "social";
  if (matchesDomain(fromDomain, RECEIPT_DOMAINS)) return "receipts";
  if (matchesDomain(fromDomain, NEWSLETTER_DOMAINS)) return "newsletters";

  // Subject-based matching
  if (matchesPatterns(subject, SOCIAL_SUBJECT_PATTERNS)) return "social";
  if (matchesPatterns(subject, RECEIPT_SUBJECT_PATTERNS)) return "receipts";
  if (matchesPatterns(subject, NEWSLETTER_SUBJECT_PATTERNS)) return "newsletters";

  // Sender pattern matching (newsletters often have these patterns)
  if (matchesPatterns(from, NEWSLETTER_SENDER_PATTERNS)) return "newsletters";

  return "other";
}

/**
 * Categorize a list of emails into newsletters, social, receipts, and other.
 */
export function categorizeEmails(emails: EmailMetadata[]): CategorizedEmails {
  const result: CategorizedEmails = {
    newsletters: [],
    social: [],
    receipts: [],
    other: [],
  };

  for (const email of emails) {
    const category = categorizeEmail(email);
    result[category].push(email);
  }

  return result;
}

/**
 * Generate statistics from email data for the roast and dashboard.
 */
export function generateStats(
  emails: EmailMetadata[],
  categorized: CategorizedEmails
): EmailStats {
  // Find oldest email
  const dates = emails
    .map((e) => new Date(e.date))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  const oldestDate = dates.length > 0 ? dates[0].toISOString() : "";

  // Count senders
  const senderCounts = new Map<string, number>();
  const domainCounts = new Map<string, number>();

  for (const email of emails) {
    const sender = email.from;
    senderCounts.set(sender, (senderCounts.get(sender) || 0) + 1);
    if (email.fromDomain) {
      domainCounts.set(
        email.fromDomain,
        (domainCounts.get(email.fromDomain) || 0) + 1
      );
    }
  }

  const topSenders = [...senderCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const topDomains = [...domainCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([domain, count]) => ({ domain, count }));

  // Newsletter domains (top 3)
  const nlDomainCounts = new Map<string, number>();
  for (const email of categorized.newsletters) {
    nlDomainCounts.set(
      email.fromDomain,
      (nlDomainCounts.get(email.fromDomain) || 0) + 1
    );
  }
  const newsletterDomains = [...nlDomainCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([d]) => d);

  // Social platform breakdown
  const socialPlatforms = new Map<string, number>();
  for (const email of categorized.social) {
    let platform = "Other";
    if (email.fromDomain.includes("linkedin")) platform = "LinkedIn";
    else if (
      email.fromDomain.includes("twitter") ||
      email.fromDomain.includes("x.com")
    )
      platform = "Twitter/X";
    else if (email.fromDomain.includes("facebook"))
      platform = "Facebook";
    else if (email.fromDomain.includes("instagram"))
      platform = "Instagram";
    else if (email.fromDomain.includes("github")) platform = "GitHub";
    else if (email.fromDomain.includes("discord")) platform = "Discord";
    else if (email.fromDomain.includes("reddit")) platform = "Reddit";
    else if (email.fromDomain.includes("youtube")) platform = "YouTube";

    socialPlatforms.set(platform, (socialPlatforms.get(platform) || 0) + 1);
  }

  const socialBreakdown = [...socialPlatforms.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([platform, count]) => ({ platform, count }));

  return {
    total: emails.length,
    newsletters: categorized.newsletters.length,
    social: categorized.social.length,
    receipts: categorized.receipts.length,
    other: categorized.other.length,
    oldestDate,
    topSenders,
    topDomains,
    newsletterDomains,
    socialBreakdown,
  };
}

/**
 * Calculate "Shame Score" — a 0-100 metric based on email habits.
 * Higher = worse inbox hygiene.
 */
export function calculateShameScore(stats: EmailStats): {
  score: number;
  label: string;
  description: string;
} {
  let score = 0;

  // Total unread (up to 40 points)
  if (stats.total > 5000) score += 40;
  else if (stats.total > 2000) score += 32;
  else if (stats.total > 1000) score += 24;
  else if (stats.total > 500) score += 18;
  else if (stats.total > 100) score += 12;
  else if (stats.total > 50) score += 6;

  // Newsletter ratio (up to 20 points)
  const nlRatio = stats.newsletters / Math.max(stats.total, 1);
  score += Math.round(nlRatio * 20);

  // Age of oldest email (up to 20 points)
  if (stats.oldestDate) {
    const daysOld = Math.floor(
      (Date.now() - new Date(stats.oldestDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysOld > 365) score += 20;
    else if (daysOld > 180) score += 16;
    else if (daysOld > 90) score += 12;
    else if (daysOld > 30) score += 8;
    else if (daysOld > 7) score += 4;
  }

  // Social notification hoarding (up to 10 points)
  if (stats.social > 500) score += 10;
  else if (stats.social > 200) score += 7;
  else if (stats.social > 50) score += 4;

  // Receipt hoarding (up to 10 points)
  if (stats.receipts > 200) score += 10;
  else if (stats.receipts > 100) score += 7;
  else if (stats.receipts > 30) score += 4;

  score = Math.min(100, Math.max(0, score));

  let label: string;
  let description: string;

  if (score >= 90) {
    label = "Clinically Unhinged";
    description = "Your inbox is a war crime. Seek professional help.";
  } else if (score >= 75) {
    label = "Email Hoarder Deluxe";
    description = "You collect unread emails like they're Pokémon.";
  } else if (score >= 60) {
    label = "Serial Ignorer";
    description = "The 'I'll read that later' type. Spoiler: you won't.";
  } else if (score >= 45) {
    label = "Casual Disaster";
    description = "Not great, not terrible. But mostly terrible.";
  } else if (score >= 30) {
    label = "Mild Mess";
    description = "You're trying, but your inbox has other plans.";
  } else if (score >= 15) {
    label = "Almost Human";
    description = "A few emails slipped through. It happens. Barely.";
  } else {
    label = "Inbox Saint";
    description = "Why are you even here? Go flex on Twitter.";
  }

  return { score, label, description };
}
