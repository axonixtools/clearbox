import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

const HOME_DESCRIPTION =
  "Clear unread Gmail faster with AI categorization, bulk inbox actions, and a privacy-first cleanup workflow.";

export const metadata: Metadata = {
  title: "Gmail Inbox Cleaner",
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ClearBox | AI Inbox Cleaner for Gmail",
    description: HOME_DESCRIPTION,
    url: "/",
    type: "website",
  },
  twitter: {
    title: "ClearBox | AI Inbox Cleaner for Gmail",
    description: HOME_DESCRIPTION,
  },
};

export default function Home() {
  return <LandingPage />;
}
