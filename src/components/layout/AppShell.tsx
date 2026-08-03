"use client";

import type { CSSProperties, ReactNode } from "react";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "260px" } as CSSProperties}
      className="bg-[#f9fafb]"
    >
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </SidebarProvider>
  );
}
