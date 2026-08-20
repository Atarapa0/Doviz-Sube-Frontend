"use client";

import { Bell, Settings } from "lucide-react";
import { useRef, useState } from "react";

import { useMusteri } from "@/components/providers/MusteriProvider";
import { musteriHesaplariniGetir } from "@/services/musteri-service";
import { SidebarTrigger } from "@/components/ui/sidebar";
import MusteriSearch from "../ui/musteri-search";

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

    setAramaMesaji("");
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
    <header className="flex min-h-20 min-w-0 flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:gap-4 sm:px-5 md:px-8">
      <div className="flex shrink-0 items-center gap-2">
        <SidebarTrigger className="md:hidden" aria-label="Menüyü aç" />
        <span className="hidden rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:inline-flex">
          ID: 4892-XT
        </span>
      </div>

      <div className="relative order-3 w-full lg:order-none lg:mx-auto lg:max-w-md">
        <MusteriSearch
          value={musteriId}
            onValueChange={musteriIdDegistir}  
             adSoyadAranabilir={true}
             placeholder="Müşteri ID veya ad soyad ile arayın"
          inputClassName="rounded-full"
            />
        {aramaMesaji && (
          <span className="absolute left-4 top-11 text-[11px] font-medium text-amber-700">
            {aramaMesaji}
          </span>
        )}
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-4">
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
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-bold text-slate-900">{adSoyad}</p>
            <p className="max-w-52 truncate text-[11px] text-slate-500">{sube}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
