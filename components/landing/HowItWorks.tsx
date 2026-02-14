"use client";

import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Connect Gmail",
    description: "Secure OAuth connection. We only request read and archive permissions to scan your inbox. No emails are ever stored.",
  },
  {
    number: "02",
    title: "Get Roasted",
    description: "Our AI analyzes your unread chaos and delivers a hilarious, personality-based roast to motivate you.",
  },
  {
    number: "03",
    title: "Clear Everything",
    description: "Bulk archive newsletters, promotional emails, and social alerts in one click. Reach Inbox Zero instantly.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50 border-t border-gray-200">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-semibold text-black mb-4">
            Inbox Zero in 3 Steps
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We built the tool we wanted to use. Simple, effective, and slightly sarcastic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gray-200 z-0"></div>

          {STEPS.map((step, i) => (
            <div key={step.number} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-md bg-black text-white flex items-center justify-center mb-6 font-mono text-lg font-semibold">
                {step.number}
              </div>
              
              <h3 className="text-xl font-semibold text-black mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-xs text-sm">
                {step.description}
              </p>
              
              {i < STEPS.length - 1 && (
                <ArrowRight className="md:hidden w-5 h-5 text-gray-300 mt-8 rotate-90" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
