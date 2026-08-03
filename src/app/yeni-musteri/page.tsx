"use client";

import { BadgePlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import AppShell from "@/components/layout/AppShell";
import PageHeading from "@/components/layout/PageHeading";
import SubeCombobox from "@/components/ui/sube-combobox";
import { musteriOlustur } from "@/services/musteri-service";
import { subeleriGetir } from "@/services/sube-service";
import type { Sube } from "@/types/api";

export default function YeniMusteriPage() {
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");
  const [subeKodu, setSubeKodu] = useState("");
  const [subeler, setSubeler] = useState<Sube[]>([]);
  const [subelerYukleniyor, setSubelerYukleniyor] = useState(true);
  const [subeHatasi, setSubeHatasi] = useState("");
  const [bakiye, setBakiye] = useState("0");
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [basarili, setBasarili] = useState(false);

  useEffect(() => {
    subeleriGetir()
      .then(setSubeler)
      .catch((error: unknown) =>
        setSubeHatasi(
          error instanceof Error ? error.message : "Şubeler getirilemedi.",
        ),
      )
      .finally(() => setSubelerYukleniyor(false));
  }, []);

  async function kaydet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMesaj(""); setBasarili(false);
    if (!/^\d{4}$/.test(subeKodu)) { setMesaj("Şube kodu tam olarak 4 haneli olmalıdır."); return; }
    setKaydediliyor(true);
    try {
      const result = await musteriOlustur({ ad: ad.trim(), soyad: soyad.trim(), subeKodu, baslangicTryBakiyesi: Number(bakiye) });
      const id = typeof result === "object" && result !== null && "id" in result ? ` Müşteri ID: ${String(result.id)}` : "";
      setBasarili(true); setMesaj(`Müşteri başarıyla oluşturuldu.${id}`); setAd(""); setSoyad(""); setSubeKodu(""); setBakiye("0");
    } catch (error) { setMesaj(error instanceof Error ? error.message : "Müşteri oluşturulamadı."); }
    finally { setKaydediliyor(false); }
  }

  return <AppShell><div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
    <PageHeading title="Yeni Müşteri" description="Müşteri bilgilerini backend'e kaydedin. Başlangıç bakiyesi TRY hesabına uygulanır." icon={BadgePlus} />
    <form onSubmit={kaydet} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-bold text-slate-900">Müşteri Bilgileri</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold">Ad<input required maxLength={100} value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Müşteri adı" className="h-10 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100" /></label>
        <label className="flex flex-col gap-2 text-sm font-semibold">Soyad<input required maxLength={100} value={soyad} onChange={(e) => setSoyad(e.target.value)} placeholder="Müşteri soyadı" className="h-10 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100" /></label>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Kayıtlı Şube
          <SubeCombobox
            subeler={subeler}
            value={subeKodu}
            onValueChange={setSubeKodu}
            disabled={subelerYukleniyor || Boolean(subeHatasi)}
            placeholder={subelerYukleniyor ? "Şubeler yükleniyor..." : "Şube seçiniz"}
          />
          {subeHatasi && (
            <span className="text-xs font-normal text-red-700">{subeHatasi}</span>
          )}
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold">Başlangıç TRY Bakiyesi<input required type="number" min="0" step="0.01" value={bakiye} onChange={(e) => setBakiye(e.target.value)} className="h-10 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100" /></label>
      </div>
      {mesaj && <p className={`mt-5 rounded-md p-3 text-sm font-semibold ${basarili ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{mesaj}</p>}
      <div className="mt-6 flex justify-end"><button disabled={kaydediliyor || !subeKodu} type="submit" className="h-10 rounded-md bg-[#0047b3] px-6 text-sm font-semibold text-white hover:bg-[#003b95] disabled:opacity-50">{kaydediliyor ? "Kaydediliyor..." : "Müşteriyi Kaydet"}</button></div>
    </form>
  </div></AppShell>;
}
