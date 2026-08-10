"use client";

import { ChevronDown, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { musteriAra, musterileriGetir } from "@/services/musteri-service";
import type { MusteriAramaSonucu } from "@/types/api";

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
  placeholder = "Müşteri ID veya ad soyad ile arayın",
  className,
  inputClassName,
  disabled = false,
}: MusteriComboboxProps) {
  const [aramaMetni, setAramaMetni] = useState(value);
  const [musteriler, setMusteriler] = useState<MusteriAramaSonucu[]>([]);
  const [acik, setAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const istekIdRef = useRef(0);
  const onValueChangeRef = useRef(onValueChange);
  const kullaniciYaziyorRef = useRef(false);

  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  useEffect(() => {
    if (!acik || disabled) return;

    const istekId = ++istekIdRef.current;
    const arama = aramaMetni.trim();
    const zamanlayici = window.setTimeout(async () => {
      setYukleniyor(true);
      setHata("");

      try {
        const sonuc = arama
          ? await musteriAra(arama, 10)
          : (await musterileriGetir({ page: 1, pageSize: 20 })).items;

        if (istekId !== istekIdRef.current) return;
        setMusteriler(sonuc);

        if (
          arama &&
          kullaniciYaziyorRef.current &&
          sonuc.length === 1 &&
          (sonuc[0].id.toString().startsWith(arama) ||
            `${sonuc[0].ad} ${sonuc[0].soyad}`
              .toLocaleLowerCase("tr-TR")
              .includes(arama.toLocaleLowerCase("tr-TR")))
        ) {
          kullaniciYaziyorRef.current = false;
          setAramaMetni(sonuc[0].id.toString());
          onValueChangeRef.current(sonuc[0].id.toString());
          setAcik(false);
        }
      } catch (error) {
        if (istekId !== istekIdRef.current) return;
        setMusteriler([]);
        setHata(
          error instanceof Error ? error.message : "Müşteriler alınamadı.",
        );
      } finally {
        if (istekId === istekIdRef.current) setYukleniyor(false);
      }
    }, arama ? 250 : 0);

    return () => window.clearTimeout(zamanlayici);
  }, [acik, aramaMetni, disabled]);

  useEffect(() => {
    function disariyaTiklandi(event: MouseEvent) {
      if (!kapsayiciRef.current?.contains(event.target as Node)) setAcik(false);
    }

    document.addEventListener("mousedown", disariyaTiklandi);
    return () => document.removeEventListener("mousedown", disariyaTiklandi);
  }, []);

  const eslesenMusteriler = useMemo(() => {
    const aktifMusteriler = musteriler.filter((musteri) => musteri.aktifMi);
    return aktifMusteriler;
  }, [musteriler]);

  function musteriSec(musteri: MusteriAramaSonucu) {
    kullaniciYaziyorRef.current = false;
    setAramaMetni(musteri.id.toString());
    onValueChange(musteri.id.toString());
    setAcik(false);
  }

  function degeriDegistir(girilenDeger: string) {
    const temizDeger = girilenDeger.slice(0, 100);
    kullaniciYaziyorRef.current = true;
    setAramaMetni(temizDeger);
    onValueChange("");
    setAcik(true);
  }

  function menuyuAc() {
    setAramaMetni(value);
    setAcik(true);
  }

  return (
    <div ref={kapsayiciRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
        <input
          inputMode="search"
          maxLength={100}
          disabled={disabled}
          value={acik ? aramaMetni : value}
          onFocus={menuyuAc}
          onChange={(event) => degeriDegistir(event.target.value)}
          placeholder={placeholder}
          aria-label="Müşteri ID veya ad soyad ara"
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
          onClick={() => {
            if (acik) {
              setAcik(false);
            } else {
              menuyuAc();
            }
          }}
          className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-[#0047b3]"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>

      {acik && (
        <div role="dialog" aria-label="Müşteri arama sonuçları" className="absolute z-50 mt-2 w-full min-w-[360px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-3 py-2 text-xs font-medium text-slate-500">
            Müşteri ID veya ad soyad ile arayın
          </div>
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
                Aramanızla eşleşen aktif müşteri bulunamadı.
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
