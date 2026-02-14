"use client";

import html2canvas from "html2canvas";

/**
 * Captures an element and downloads it as a PNG image
 */
export async function downloadElementAsImage(elementId: string, fileName: string = "clearbox-roast") {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2, // Better resolution
      logging: false,
      useCORS: true,
    });
    
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `${fileName}.png`;
    link.click();
  } catch (err) {
    console.error("Failed to generate image:", err);
  }
}

/**
 * Opens a Twitter share intent with pre-populated text
 */
export function shareOnTwitter(text: string, url: string = window.location.origin) {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, "_blank", "width=550,height=420");
}
