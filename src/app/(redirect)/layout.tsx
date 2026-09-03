import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Conviva",
  description: "Contemporary residences on the coast of Niteroi, Brazil.",
  icons: { icon: "/images/favicon.webp" },
};

export default function RedirectLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
