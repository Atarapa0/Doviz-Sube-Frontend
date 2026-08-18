import AppShell from "@/components/layout/AppShell";
import ErrorPanel from "@/components/errors/ErrorPanel";

type HataPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function tekDeger(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function guvenliDonusAdresi(value: string | string[] | undefined) {
  const donusAdresi = tekDeger(value);

  if (
    !donusAdresi ||
    !donusAdresi.startsWith("/") ||
    donusAdresi.startsWith("//") ||
    donusAdresi.startsWith("/hata")
  ) {
    return "/";
  }

  return donusAdresi;
}

export default async function HataPage({ searchParams }: HataPageProps) {
  const params = await searchParams;
  const gelenStatus = Number(tekDeger(params.status));
  const status = [404, 500, 502, 503, 504].includes(gelenStatus)
    ? gelenStatus
    : 500;

  return (
    <AppShell>
      <ErrorPanel
        status={status}
        hataKodu={tekDeger(params.hataKodu)}
        mesaj={tekDeger(params.mesaj)}
        hataId={tekDeger(params.hataId)}
        correlationId={tekDeger(params.correlationId)}
        tekrarDeneAdresi={guvenliDonusAdresi(params.donusAdresi)}
      />
    </AppShell>
  );
}
