import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const lexend = Lexend({ variable: "--font-lexend", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og-change-lab.png`;
  const title = "ChangeLab | Year 8 Science simulations";
  const description = "Interactive Year 8 science simulations for energy transfer, energy stores and a growing study of change.";

  return {
    title,
    description,
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: imageUrl, width: 1672, height: 936, alt: "ChangeLab energy systems with a rover, lifted crate, spring, insulated pod and battery" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-AU"><body className={lexend.variable}>{children}</body></html>;
}
