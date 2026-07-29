import type { Metadata } from "next";
import { HtmlPage } from "@/components/HtmlPage";
import { loadPage } from "@/lib/load-page";

export const metadata: Metadata = {
  title: "You're confirmed",
};

export default function WorkshopConfirmationPage() {
  return <HtmlPage html={loadPage("workshop-confirmation")} />;
}
