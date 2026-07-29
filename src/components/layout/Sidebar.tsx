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

const menuItems = [
  "Dashboard",
  "Döviz Alış / Satış",
  "Döviz İşlem Geçmişi",
  "Müşteriler",
  "Yeni Müşteri",
  "Hesap Açma",
  "Hesap Hareketleri",
  "Güncel Kurlar",
  "Arbitraj",
];

export default function Sidebar() {
  return (
    <ShadcnSidebar
      collapsible="none"
      className="min-h-screen border-r border-[#e0e0e0] bg-[#f4f6f8] text-black"
    >
      <SidebarHeader className="bg-[#f4f6f8] p-5 pb-3">
        <div className="mb-3">
          <h2 className="m-0 text-xl font-bold text-[#0047b3]">xxxxx Bankası</h2>
          <p className="m-0 text-xs text-[#666]">xxxx Şube</p>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#f4f6f8] px-3">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive = item === "Döviz Alış / Satış";

                return (
                  <SidebarMenuItem key={item}>
                    <SidebarMenuButton
                      isActive={isActive}
                      className="h-10 rounded-md px-3 text-sm text-black hover:bg-slate-200 hover:text-black data-[active=true]:bg-[#0047b3] data-[active=true]:text-white data-[active=true]:hover:bg-[#0047b3] data-[active=true]:hover:text-white"
                    >
                      <span>{item}</span>
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
