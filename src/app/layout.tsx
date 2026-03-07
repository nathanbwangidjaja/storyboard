import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Storyboard AI - Create Visual Stories with AI",
  description: "Sketch scenes, upload references, add cinematic instructions, and generate consistent storyboard frames with AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface-50 text-surface-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
