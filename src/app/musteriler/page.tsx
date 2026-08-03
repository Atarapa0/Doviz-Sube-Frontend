"use client";

import { Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AppShell from "@/components/layout/AppShell";
import PageHeading from "@/components/layout/PageHeading";
import { useMusteri } from "@/components/providers/MusteriProvider";
import { musteriHesaplariniGetir, musterileriGetir } from "@/services/musteri-service";
import type { Musteri } from "@/types/api";

export default function MusterilerPage() {
  const { musteriSec } = useMusteri();
  const [musteriler, setMusteriler] = useState<Musteri[]>([]);
  const [arama, setArama] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    musterileriGetir()
      .then(setMusteriler)
      .catch((error: unknown) => setMesaj(error instanceof Error ? error.message : "Müşteriler alınamadı."))
      .finally(() => setYukleniyor(false));
  }, []);

  const filtrelenmisMusteriler = useMemo(() => {
    const metin = arama.trim().toLocaleLowerCase("tr-TR");
    if (!metin) return musteriler;
    return musteriler.filter((musteri) =>
      `${musteri.id} ${musteri.ad} ${musteri.soyad} ${musteri.sube.kod} ${musteri.sube.ad}`
        .toLocaleLowerCase("tr-TR")
        .includes(metin),
    );
  }, [arama, musteriler]);

  async function musteriSeciminiYap(musteriId: number) {
    try {
      setMesaj("Müşteri hesapları getiriliyor...");
      const musteri = await musteriHesaplariniGetir(musteriId);
      musteriSec(musteri);
      setMesaj(`${musteri.ad} ${musteri.soyad} header alanına seçildi.`);
    } catch (error) {
      setMesaj(error instanceof Error ? error.message : "Müşteri seçilemedi.");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
        <PageHeading title="Müşteriler" description="API'den gelen müşterileri arayın ve aktif müşteri olarak seçin." icon={Users} />

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="relative block max-w-lg">
            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            <input value={arama} onChange={(event) => setArama(event.target.value)} placeholder="ID, ad soyad veya şube ara" className="h-10 w-full rounded-md border border-slate-300 pl-10 pr-3 outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100" />
          </label>
          {mesaj && <p className="mt-3 text-sm font-medium text-[#0047b3]">{mesaj}</p>}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr>{["Müşteri ID", "Ad Soyad", "Şube", "Hesap Sayısı", "Durum", ""].map((baslik) => <th key={baslik} className="px-6 py-3 font-semibold">{baslik}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filtrelenmisMusteriler.map((musteri) => (
                  <tr key={musteri.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold">{musteri.id}</td>
                    <td className="px-6 py-4">{musteri.ad} {musteri.soyad}</td>
                    <td className="px-6 py-4"><span className="block">{musteri.sube.ad}</span><span className="text-xs text-slate-400">{musteri.sube.kod}</span></td>
                    <td className="px-6 py-4">{musteri.hesapSayisi}</td>
                    <td className="px-6 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${musteri.aktifMi ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{musteri.aktifMi ? "Aktif" : "Pasif"}</span></td>
                    <td className="px-6 py-4 text-right"><button type="button" onClick={() => void musteriSeciminiYap(musteri.id)} className="rounded-md bg-[#0047b3] px-3 py-2 text-xs font-semibold text-white hover:bg-[#003b95]">Header&apos;a Seç</button></td>
                  </tr>
                ))}
                {!yukleniyor && filtrelenmisMusteriler.length === 0 && <tr><td colSpan={6} className="px-6 py-14 text-center text-slate-500">Müşteri bulunamadı.</td></tr>}
                {yukleniyor && <tr><td colSpan={6} className="px-6 py-14 text-center text-slate-500">Müşteriler yükleniyor...</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
