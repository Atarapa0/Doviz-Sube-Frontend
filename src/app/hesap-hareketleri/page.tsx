import { BookOpenText } from "lucide-react";

import { HesapHareketleriPanel } from "@/components/hesap-hareketleri/HesapHareketleriPanel";
import AppShell from "@/components/layout/AppShell";
import PageHeading from "@/components/layout/PageHeading";

export default function HesapHareketleriPage() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
        <PageHeading
          title="Hesap Hareketleri"
          description="Müşterinin tek bir hesabına veya bütün hesaplarına ait borç ve alacak hareketlerini görüntüleyin."
          icon={BookOpenText}
        />
        <HesapHareketleriPanel />
      </div>
    </AppShell>
  );
}
