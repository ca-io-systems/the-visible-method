import type { Metadata } from "next";
import { HtmlPage } from "@/components/HtmlPage";
import { loadPage } from "@/lib/load-page";

export const metadata: Metadata = {
  title: "You're on the list",
};

export default function WaitlistThankYouPage() {
  return <HtmlPage html={loadPage("waitlist-thank-you")} />;
}
