import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { assetPath } from "@/src/asset-path";
import "./globals.css";

const lexend = Lexend({ variable: "--font-lexend", subsets: ["latin"] });
const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://year8-heat-transfer-lab.irvz87.chatgpt.site";
const imageUrl = `${siteOrigin}${assetPath("/og-change-lab.png")}`;
const title = "ChangeLab | Year 8 Science simulations";
const description = "Interactive Year 8 science simulations for energy transfer, energy stores and a growing study of change.";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title,
  description,
  icons: { icon: assetPath("/favicon.svg"), shortcut: assetPath("/favicon.svg") },
  openGraph: {
    title,
    description,
    type: "website",
    images: [{ url: imageUrl, width: 1672, height: 936, alt: "ChangeLab energy systems with a rover, lifted crate, spring, insulated pod and battery" }],
  },
  twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-AU"><body className={lexend.variable}>{children}</body></html>;
}
