import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MusteriProvider } from "@/components/providers/MusteriProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Döviz Şube",
  description: "Banka şubesi döviz alım satım ekranı",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <MusteriProvider>{children}</MusteriProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
