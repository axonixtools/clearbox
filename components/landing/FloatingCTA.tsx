"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-24"
      }`}
    >
      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="btn btn-primary shadow-lg"
      >
        <span>Fix My Inbox Now</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
