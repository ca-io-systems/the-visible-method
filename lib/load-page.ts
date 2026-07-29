import { readFileSync } from "fs";
import path from "path";

/**
 * Loads a content HTML page and normalizes it for App Router rendering.
 *
 * @param name - Content filename without extension (e.g. "waitlist")
 * @returns HTML fragment (styles + body markup + scripts) with public asset paths
 */
export function loadPage(name: string): string {
  const filePath = path.join(process.cwd(), "content", `${name}.html`);
  let html = readFileSync(filePath, "utf8");

  html = html
    .replace(/(src|href)="images\//g, '$1="/images/')
    .replace(/(src|href)='images\//g, "$1='/images/");

  const headLinks = Array.from(
    html.matchAll(/<link\b[^>]*>/gi),
    (match) => match[0],
  ).join("\n");

  const styles = Array.from(
    html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi),
    (match) => match[0],
  ).join("\n");

  const scripts = Array.from(
    html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi),
    (match) => match[0],
  ).join("\n");

  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] ?? html;

  body = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<link\b[^>]*>/gi, "")
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<\/?html\b[^>]*>/gi, "")
    .replace(/<\/?head\b[^>]*>/gi, "")
    .replace(/<\/?body\b[^>]*>/gi, "")
    .trim();

  return [headLinks, styles, body, scripts].filter(Boolean).join("\n");
}
