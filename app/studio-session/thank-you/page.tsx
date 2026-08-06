import type { Metadata } from "next";
import { HtmlPage } from "@/components/HtmlPage";
import { loadPage } from "@/lib/load-page";

export const metadata: Metadata = {
  title: "You're in",
};

export default function StudioSessionThankYouPage() {
  return <HtmlPage html={loadPage("studio-session-thank-you")} />;
}
