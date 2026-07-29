import type { Metadata } from "next";
import { HtmlPage } from "@/components/HtmlPage";
import { loadPage } from "@/lib/load-page";

export const metadata: Metadata = {
  title: "Studio Session",
};

export default function StudioSessionPage() {
  return <HtmlPage html={loadPage("studio-session")} />;
}
