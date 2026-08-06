"use client";

import { useEffect, useRef } from "react";

type HtmlPageProps = {
  html: string;
};

declare global {
  interface Window {
    smoothNavigate?: (url: string) => void;
  }
}

const EXIT_MS = 340;

/**
 * Fades the current page out, then navigates.
 *
 * @param url - Absolute path or full URL to navigate to
 * @returns void
 */
function smoothNavigate(url: string): void {
  if (typeof window === "undefined") return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.location.href = url;
    return;
  }

  if (document.documentElement.classList.contains("is-leaving")) {
    window.location.href = url;
    return;
  }

  document.documentElement.classList.remove("is-entering");
  document.documentElement.classList.add("is-leaving");

  window.setTimeout(() => {
    window.location.href = url;
  }, EXIT_MS);
}

/**
 * Renders a full marketing HTML document (styles + markup + scripts) inside Next.js.
 *
 * @param html - Full or partial HTML document string from content/
 * @returns A client-mounted shell that re-runs inline scripts after mount
 */
export function HtmlPage({ html }: HtmlPageProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("is-leaving");
    root.classList.add("is-entering");
    window.smoothNavigate = smoothNavigate;

    const enterTimer = window.setTimeout(() => {
      root.classList.remove("is-entering");
    }, 480);

    const host = hostRef.current;
    if (!host) {
      return () => {
        window.clearTimeout(enterTimer);
      };
    }

    const scripts = Array.from(host.querySelectorAll("script"));
    for (const oldScript of scripts) {
      const script = document.createElement("script");
      for (const attr of oldScript.attributes) {
        script.setAttribute(attr.name, attr.value);
      }
      script.textContent = oldScript.textContent;
      oldScript.replaceWith(script);
    }

    return () => {
      window.clearTimeout(enterTimer);
    };
  }, [html]);

  return (
    <div
      ref={hostRef}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
