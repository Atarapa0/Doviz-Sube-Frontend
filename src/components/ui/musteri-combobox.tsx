"use client";

import { ChevronDown, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { musterileriGetir } from "@/services/musteri-service";
import type { Musteri } from "@/types/api";

type MusteriComboboxProps = {
  value: string;
  onValueChange: (musteriId: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
};

export default function MusteriCombobox({
  value,
  onValueChange,
  placeholder = "Müşteri ID girin veya seçin",
  className,
  inputClassName,
  disabled = false,
}: MusteriComboboxProps) {
  const [musteriler, setMusteriler] = useState<Musteri[]>([]);
  const [acik, setAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");
  const kapsayiciRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    musterileriGetir()
      .then(setMusteriler)
      .catch((error: unknown) =>
        setHata(error instanceof Error ? error.message : "Müşteriler alınamadı."),
      )
      .finally(() => setYukleniyor(false));
  }, []);

  useEffect(() => {
    function disariyaTiklandi(event: MouseEvent) {
      if (!kapsayiciRef.current?.contains(event.target as Node)) setAcik(false);
    }

    document.addEventListener("mousedown", disariyaTiklandi);
    return () => document.removeEventListener("mousedown", disariyaTiklandi);
  }, []);

  const eslesenMusteriler = useMemo(() => {
    const arama = value.trim().toLocaleLowerCase("tr-TR");
    const aktifMusteriler = musteriler.filter((musteri) => musteri.aktifMi);
    if (!arama) return aktifMusteriler;

    return aktifMusteriler.filter((musteri) => {
      const idEslesiyor = musteri.id.toString().startsWith(arama);
      const adEslesiyor = `${musteri.ad} ${musteri.soyad}`
        .toLocaleLowerCase("tr-TR")
        .includes(arama);
      return idEslesiyor || adEslesiyor;
    });
  }, [musteriler, value]);

  function musteriSec(musteri: Musteri) {
    onValueChange(musteri.id.toString());
    setAcik(false);
  }

  function degeriDegistir(girilenDeger: string) {
    const sadeceRakam = girilenDeger.replace(/\D/g, "").slice(0, 6);
    const eslesmeler = musteriler.filter(
      (musteri) =>
        musteri.aktifMi && musteri.id.toString().startsWith(sadeceRakam),
    );

    if (sadeceRakam && eslesmeler.length === 1) {
      musteriSec(eslesmeler[0]);
      return;
    }

    onValueChange(sadeceRakam);
    setAcik(true);
  }

  return (
    <div ref={kapsayiciRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
        <input
          inputMode="numeric"
          maxLength={6}
          disabled={disabled}
          value={value}
          onFocus={() => setAcik(true)}
          onChange={(event) => degeriDegistir(event.target.value)}
          placeholder={placeholder}
          aria-label="Müşteri ID"
          autoComplete="off"
          className={cn(
            "h-10 w-full rounded-md border border-slate-300 bg-white pl-10 pr-10 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100",
            inputClassName,
          )}
        />
        <button
          type="button"
          disabled={disabled}
          aria-label="Müşteri listesini aç"
          onClick={() => setAcik((onceki) => !onceki)}
          className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-[#0047b3]"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>

      {acik && (
        <div className="absolute z-50 mt-2 w-full min-w-[360px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="max-h-72 overflow-y-auto p-1">
            {eslesenMusteriler.map((musteri) => (
              <button
                key={musteri.id}
                type="button"
                onClick={() => musteriSec(musteri)}
                className="flex w-full items-start gap-3 rounded-md px-3 py-3 text-left hover:bg-blue-50"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0047b3]">
                  <UserRound className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-900">
                    {musteri.id} - {musteri.ad} {musteri.soyad}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {musteri.sube.kod} - {musteri.sube.ad}
                  </span>
                </span>
              </button>
            ))}

            {yukleniyor && (
              <p className="px-3 py-8 text-center text-sm text-slate-500">
                Müşteriler yükleniyor...
              </p>
            )}
            {!yukleniyor && !hata && eslesenMusteriler.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-slate-500">
                Bu ID ile başlayan aktif müşteri bulunamadı.
              </p>
            )}
            {hata && (
              <p className="px-3 py-8 text-center text-sm font-medium text-red-700">
                {hata}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
