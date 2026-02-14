"use client";

import { Zap, Target, Flame, Shield, Clock, Share2 } from "lucide-react";

const FEATURES = [
  {
    title: "Lightning Fast",
    description: "Process thousands of unread emails in seconds. Our engine is built for scale, ensuring a swift cleanup experience.",
    icon: Zap,
  },
  {
    title: "Smart Categories",
    description: "Automatic sorting for newsletters, social alerts, and receipts using intelligent pattern matching.",
    icon: Target,
  },
  {
    title: "The AI Roast",
    description: "Get a brutal (or mild) analysis of your email personality. A fun, psychological intervention for your inbox.",
    icon: Flame,
  },
  {
    title: "Privacy First",
    description: "Read-only access. We never store your email content or any personal data. Zero data footprint by design.",
    icon: Shield,
  },
  {
    title: "Session Based",
    description: "No accounts, no databases. Your session expires after an hour and everything is wiped instantly.",
    icon: Clock,
  },
  {
    title: "Shareable Victory",
    description: "Generate beautiful images of your roast and 'before/after' stats to share your success on social media.",
    icon: Share2,
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <div key={i} className="clean-card p-8">
              <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center mb-6">
                <feature.icon className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
