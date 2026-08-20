"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { Sube } from "@/types/api";

type SubeComboboxProps = {
  subeler: Sube[];
  value: string;
  onValueChange: (subeKodu: string) => void;
  placeholder?: string;
  disabled?: boolean;
  sadeceAktif?: boolean;
  tumSecenegi?: string;
};

export default function SubeCombobox({
  subeler,
  value,
  onValueChange,
  placeholder = "Şube seçiniz",
  disabled = false,
  sadeceAktif = true,
  tumSecenegi,
}: SubeComboboxProps) {
  const [acik, setAcik] = useState(false);
  const [arama, setArama] = useState("");
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const secilenSube = subeler.find((sube) => sube.kod === value);

  useEffect(() => {
    function disariyaTiklandi(event: MouseEvent) {
      if (!kapsayiciRef.current?.contains(event.target as Node)) setAcik(false);
    }

    document.addEventListener("mousedown", disariyaTiklandi);
    return () => document.removeEventListener("mousedown", disariyaTiklandi);
  }, []);

  const filtrelenmisSubeler = useMemo(() => {
    const metin = arama.trim().toLocaleLowerCase("tr-TR");
    return subeler.filter((sube) => {
      const aktiflikUyuyor = !sadeceAktif || sube.aktifMi;
      const aramaUyuyor =
        !metin ||
        `${sube.kod} ${sube.ad}`.toLocaleLowerCase("tr-TR").includes(metin);
      return aktiflikUyuyor && aramaUyuyor;
    });
  }, [arama, sadeceAktif, subeler]);

  return (
    <div ref={kapsayiciRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={acik}
        onClick={() => setAcik((onceki) => !onceki)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 text-left text-sm font-normal outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:opacity-60"
      >
        <span className={cn("truncate", !secilenSube && "text-slate-400")}>
          {secilenSube ? `${secilenSube.kod} - ${secilenSube.ad}` : placeholder}
        </span>
        <ChevronDown className="ml-2 size-4 shrink-0 text-slate-400" />
      </button>

      {acik && (
        <div className="absolute z-50 mt-2 w-full min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl sm:min-w-[320px]">
          <div className="relative border-b border-slate-100 p-2">
            <Search className="absolute left-5 top-5 size-4 text-slate-400" />
            <input
              autoFocus
              value={arama}
              onChange={(event) => setArama(event.target.value)}
              placeholder="Şube kodu veya tam adını ara..."
              className="h-10 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm font-normal outline-none focus:border-[#0047b3]"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {tumSecenegi && (
              <button
                type="button"
                onClick={() => {
                  onValueChange("");
                  setAcik(false);
                  setArama("");
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-blue-50"
              >
                <Check
                  className={cn(
                    "size-4 shrink-0 text-[#0047b3]",
                    value !== "" && "invisible",
                  )}
                />
                <span className="font-semibold text-slate-900">{tumSecenegi}</span>
              </button>
            )}
            {filtrelenmisSubeler.map((sube) => (
              <button
                key={sube.id}
                type="button"
                onClick={() => {
                  onValueChange(sube.kod);
                  setAcik(false);
                  setArama("");
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-blue-50"
              >
                <Check
                  className={cn(
                    "size-4 shrink-0 text-[#0047b3]",
                    value !== sube.kod && "invisible",
                  )}
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-900">
                    {sube.kod} - {sube.ad}
                  </span>
                  <span className="text-xs text-slate-500">
                    {sube.aktifMi ? "Aktif" : "Pasif"}
                    {sube.musteriSayisi != null
                      ? ` · ${sube.musteriSayisi} müşteri`
                      : ""}
                  </span>
                </span>
              </button>
            ))}
            {filtrelenmisSubeler.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-slate-500">
                Aramayla eşleşen şube bulunamadı.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
