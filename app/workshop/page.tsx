import type { Metadata } from "next";
import { HtmlPage } from "@/components/HtmlPage";
import { loadPage } from "@/lib/load-page";

export const metadata: Metadata = {
  title: "Free Live Workshop",
};

export default function WorkshopPage() {
  return <HtmlPage html={loadPage("workshop")} />;
}
