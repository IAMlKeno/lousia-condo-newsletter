import React from "react";
import { Metadata } from "next";
import { Inter as FontSans, Playfair_Display, Source_Serif_4 } from "next/font/google";
import { cn } from "@/lib/utils";
import { NEWSPAPER_NAME } from "@/lib/newsletter";
import { VideoDialogProvider } from "@/components/ui/VideoDialogContext";
import VideoDialog from "@/components/ui/VideoDialog";

import "@/styles.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: NEWSPAPER_NAME,
    template: `%s · ${NEWSPAPER_NAME}`,
  },
  description: "News and decisions from the Board of Directors, for the owners of Louisa Condominium.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(fontSans.variable, playfair.variable, sourceSerif.variable)}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {/* Kept for the optional video section on Pages */}
        <VideoDialogProvider>
          {children}
          <VideoDialog />
        </VideoDialogProvider>
      </body>
    </html>
  );
}
