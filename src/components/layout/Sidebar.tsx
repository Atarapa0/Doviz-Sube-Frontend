"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRightLeft,
  BookOpenText,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  Gauge,
  Landmark,
  ListRestart,
  Users,
} from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useMusteri } from "@/components/providers/MusteriProvider";

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: Gauge },
  { title: "Döviz Alış / Satış", href: "/", icon: CircleDollarSign },
  { title: "Döviz İşlem Geçmişi", href: "/doviz-islem-gecmisi", icon: ListRestart },
  { title: "Müşteriler", href: "/musteriler", icon: Users },
  { title: "Şubeler", href: "/subeler", icon: Building2 },
  { title: "Hesap Açma", href: "/hesap-acma", icon: Landmark },
  { title: "Hesap Hareketleri", href: "/hesap-hareketleri", icon: BookOpenText },
  { title: "Güncel Kurlar", href: "/guncel-kurlar", icon: ChartNoAxesCombined },
  { title: "Arbitraj", href: "/arbitraj", icon: ArrowRightLeft },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { secilenMusteri } = useMusteri();
  const secilenSube = secilenMusteri
    ? `${secilenMusteri.sube.kod} - ${secilenMusteri.sube.ad}`
    : "Şube seçilmedi";

  return (
    <ShadcnSidebar
      collapsible="none"
      className="min-h-screen border-r border-[#e0e0e0] bg-[#f4f6f8] text-black"
    >
      <SidebarHeader className="bg-[#f4f6f8] p-5 pb-3">
        <div className="mb-3">
          <h2 className="m-0 text-xl font-bold text-[#0047b3]">Furkan Bankası</h2>
          <p className="m-0 truncate text-xs text-[#666]" title={secilenSube}>
            {secilenSube}
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#f4f6f8] px-3">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className="h-10 rounded-md px-3 text-sm text-black hover:bg-slate-200 hover:text-black data-[active=true]:bg-[#0047b3] data-[active=true]:text-white data-[active=true]:hover:bg-[#0047b3] data-[active=true]:hover:text-white"
                    >
                      <Icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  );
}
