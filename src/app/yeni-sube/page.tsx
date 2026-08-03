"use client";

import { MapPinPlus } from "lucide-react";
import { useState, type FormEvent } from "react";

import AppShell from "@/components/layout/AppShell";
import PageHeading from "@/components/layout/PageHeading";
import { subeOlustur } from "@/services/sube-service";

export default function YeniSubePage() {
  const [kod, setKod] = useState("");
  const [ad, setAd] = useState("");
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [basarili, setBasarili] = useState(false);

  async function kaydet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMesaj("");
    setBasarili(false);

    if (!/^\d{4}$/.test(kod)) {
      setMesaj("Şube kodu tam olarak 4 haneli olmalıdır.");
      return;
    }

    if (!ad.trim()) {
      setMesaj("Şubenin tam adını girin.");
      return;
    }

    setKaydediliyor(true);
    try {
      const yeniSube = await subeOlustur({ kod, ad: ad.trim() });
      setBasarili(true);
      setMesaj(`${yeniSube.kod} - ${yeniSube.ad} başarıyla oluşturuldu.`);
      setKod("");
      setAd("");
    } catch (error) {
      setMesaj(error instanceof Error ? error.message : "Şube oluşturulamadı.");
    } finally {
      setKaydediliyor(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6">
        <PageHeading
          title="Yeni Şube"
          description="Bankaya yeni bir şube kodu ve tam şube adı tanımlayın."
          icon={MapPinPlus}
        />

        <form
          onSubmit={kaydet}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-6 text-lg font-bold text-slate-900">Şube Bilgileri</h2>
          <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Şube Kodu
              <input
                required
                inputMode="numeric"
                maxLength={4}
                value={kod}
                onChange={(event) => setKod(event.target.value.replace(/\D/g, ""))}
                placeholder="Örn: 2327"
                className="h-10 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Tam Şube Adı
              <input
                required
                maxLength={100}
                value={ad}
                onChange={(event) => setAd(event.target.value)}
                placeholder="Örn: İstanbul Beşiktaş Şubesi"
                className="h-10 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          {mesaj && (
            <p
              className={`mt-5 rounded-md p-3 text-sm font-semibold ${
                basarili
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {mesaj}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              disabled={kaydediliyor}
              type="submit"
              className="h-10 rounded-md bg-[#0047b3] px-6 text-sm font-semibold text-white hover:bg-[#003b95] disabled:opacity-50"
            >
              {kaydediliyor ? "Oluşturuluyor..." : "Şubeyi Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
