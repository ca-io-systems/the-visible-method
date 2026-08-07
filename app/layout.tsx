import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://masterclass.thevisiblemethod.com";
const ogImage = {
  url: "/images/og-workshop.png",
  width: 1200,
  height: 630,
  alt: "Free Live Workshop · The Visible Method",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Visible Method",
    template: "%s · The Visible Method",
  },
  description:
    "Private workshop and waitlist for The Visible Method with Jamie Gabrielle.",
  openGraph: {
    type: "website",
    siteName: "The Visible Method",
    title: "Free Live Workshop · The Visible Method",
    description:
      "Private workshop and waitlist for The Visible Method with Jamie Gabrielle.",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Live Workshop · The Visible Method",
    description:
      "Private workshop and waitlist for The Visible Method with Jamie Gabrielle.",
    images: [ogImage.url],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
