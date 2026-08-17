import ErrorPanel from "@/components/errors/ErrorPanel";
import AppShell from "@/components/layout/AppShell";

export default function NotFound() {
  return (
    <AppShell>
      <ErrorPanel
        status={404}
        hataKodu="SAYFA_BULUNAMADI"
        mesaj="Gitmek istediğiniz sayfa bulunamadı veya taşınmış olabilir."
      />
    </AppShell>
  );
}

