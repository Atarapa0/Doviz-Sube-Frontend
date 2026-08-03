"use client";

import { Bell, Search, Settings } from "lucide-react";
import { useRef, useState } from "react";

import { useMusteri } from "@/components/providers/MusteriProvider";
import { musteriHesaplariniGetir } from "@/services/musteri-service";

export default function Header() {
  const { secilenMusteri, musteriSec } = useMusteri();
  const [musteriId, setMusteriId] = useState("");
  const [aramaMesaji, setAramaMesaji] = useState("");
  const aramaIdRef = useRef(0);

  async function musteriAra(id: string) {
    const aramaId = ++aramaIdRef.current;
    setAramaMesaji("Müşteri aranıyor...");

    try {
      const musteri = await musteriHesaplariniGetir(id);
      if (aramaId !== aramaIdRef.current) return;
      musteriSec(musteri);
      setAramaMesaji("");
    } catch (error) {
      if (aramaId !== aramaIdRef.current) return;
      setAramaMesaji(
        error instanceof Error ? error.message : "Müşteri bulunamadı.",
      );
    }
  }

  function musteriIdDegistir(value: string) {
    const sadeceRakam = value.replace(/\D/g, "");
    setMusteriId(sadeceRakam);
    aramaIdRef.current += 1;

    if (sadeceRakam.length === 6) {
      void musteriAra(sadeceRakam);
      return;
    }

    setAramaMesaji(sadeceRakam ? "Müşteri ID 6 haneli olmalı." : "");
  }

  const adSoyad = secilenMusteri
    ? `${secilenMusteri.ad} ${secilenMusteri.soyad}`
    : "Müşteri seçilmedi";
  const sube = secilenMusteri
    ? `${secilenMusteri.sube.kod} - ${secilenMusteri.sube.ad}`
    : "Kayıtlı şube bilgisi";
  const basHarfler = secilenMusteri
    ? `${secilenMusteri.ad.charAt(0)}${secilenMusteri.soyad.charAt(0)}`
    : "M";

  return (
    <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3 md:px-8">
      <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
        ID: 4892-XT
      </span>

      <div className="relative order-3 w-full max-w-md lg:order-none">
        <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
        <input
          inputMode="numeric"
          maxLength={6}
          value={musteriId}
          onChange={(event) => musteriIdDegistir(event.target.value)}
          placeholder="Müşteri ID giriniz (100000)"
          aria-label="Müşteri ID"
          className="h-10 w-full rounded-full border border-slate-300 pl-10 pr-4 text-sm outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100"
        />
        {aramaMesaji && (
          <span className="absolute left-4 top-11 text-[11px] font-medium text-amber-700">
            {aramaMesaji}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button type="button" aria-label="Bildirimler" className="text-slate-500 hover:text-[#0047b3]">
          <Bell className="size-5" />
        </button>
        <button type="button" aria-label="Ayarlar" className="text-slate-500 hover:text-[#0047b3]">
          <Settings className="size-5" />
        </button>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0047b3] text-xs font-bold text-white">
            {basHarfler}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{adSoyad}</p>
            <p className="max-w-52 truncate text-[11px] text-slate-500">{sube}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
