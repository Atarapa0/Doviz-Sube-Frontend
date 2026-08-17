import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MusteriProvider } from "@/components/providers/MusteriProvider";

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
    <html lang="tr" className="h-full font-sans antialiased">
      <body className="flex min-h-full flex-col">
        <TooltipProvider>
          <MusteriProvider>{children}</MusteriProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
