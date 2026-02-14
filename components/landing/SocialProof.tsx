"use client";

import { Star } from "lucide-react";

const REVIEWS = [
  {
    name: "Alex Rivera",
    role: "Senior Developer",
    text: "I had 14,289 unread emails. ClearBox roasted me hard, then archived 12,000 newsletters in seconds.",
    stats: "14,289 -> 0",
    initials: "AR",
  },
  {
    name: "Sarah Chen",
    role: "Product Designer",
    text: "Savage mode is very real. The roast was brutal and the cleanup flow was exactly what I needed.",
    stats: "2,401 -> 12",
    initials: "SC",
  },
  {
    name: "Marcus Miller",
    role: "Founder",
    text: "Existing tools were expensive and clunky. I reached inbox zero for the first time in years.",
    stats: "8,922 -> 0",
    initials: "MM",
  },
];

export function SocialProof() {
  return (
    <section className="py-20 bg-white border-y border-gray-200">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-black mb-4">Join the recovering hoarders</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Thousands of people are reaching inbox zero and building better email habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review, index) => (
            <div key={index} className="clean-card p-8 flex flex-col h-full">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, starIndex) => (
                  <Star key={starIndex} className="w-4 h-4 text-gray-400 fill-gray-400" />
                ))}
              </div>

              <p className="text-gray-600 mb-6 flex-grow leading-relaxed text-sm">
                &quot;{review.text}&quot;
              </p>

              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-black font-semibold text-sm">
                  {review.initials}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-black text-sm">{review.name}</div>
                  <div className="text-xs text-gray-500">{review.role}</div>
                </div>
                <div className="text-xs font-mono py-1 px-2 bg-gray-100 text-black rounded">{review.stats}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
