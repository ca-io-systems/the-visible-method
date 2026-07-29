import type { Metadata } from "next";
import { HtmlPage } from "@/components/HtmlPage";
import { loadPage } from "@/lib/load-page";

export const metadata: Metadata = {
  title: "Waitlist",
};

export default function WaitlistPage() {
  return <HtmlPage html={loadPage("waitlist")} />;
}
