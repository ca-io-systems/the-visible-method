"use client";

import { useEffect, useRef } from "react";

type HtmlPageProps = {
  html: string;
};

/**
 * Renders a full marketing HTML document (styles + markup + scripts) inside Next.js.
 *
 * @param html - Full or partial HTML document string from content/
 * @returns A client-mounted shell that re-runs inline scripts after mount
 */
export function HtmlPage({ html }: HtmlPageProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scripts = Array.from(host.querySelectorAll("script"));
    for (const oldScript of scripts) {
      const script = document.createElement("script");
      for (const attr of oldScript.attributes) {
        script.setAttribute(attr.name, attr.value);
      }
      script.textContent = oldScript.textContent;
      oldScript.replaceWith(script);
    }
  }, [html]);

  return (
    <div
      ref={hostRef}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
