"use client";

import { signIn } from "next-auth/react";
import { ArrowRight, Shield, CheckCircle, Lock } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32">
      <div className="section-container flex flex-col items-center text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 border border-gray-200 text-sm font-medium text-gray-600 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
          AI-Powered Inbox Hygiene
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-black mb-6">
          Your Inbox,<br />Roasted & Rescued
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl text-lg md:text-xl text-gray-600 mb-12 leading-relaxed">
          Connect your Gmail, get a brutal AI analysis, and achieve Inbox Zero in minutes.
        </p>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mb-16">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="btn btn-primary btn-xl group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Connect Gmail
            <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>
          
          <a href="#how-it-works" className="btn btn-secondary btn-xl">
            See How It Works
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Read-only access</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>No data stored</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Google Verified App</span>
          </div>
        </div>
      </div>
    </section>
  );
}
