"use client";

import { Search, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { musteriAra } from "@/services/musteri-service";
import type { MusteriAramaSonucu } from "@/types/api";
import MusteriPopup from "./musteri-popup";
import { cn } from "@/lib/utils";

type MusteriSearchProps = {
  value: string;
  onValueChange: (musteriId: string) => void;
  adSoyadAranabilir?: boolean;
  popupKullanilsinMi?: boolean;
  placeholder?: string;
  inputClassName?: string;
};

export default function MusteriSearch({
  value,
  onValueChange,
  adSoyadAranabilir = true,
  popupKullanilsinMi = true,
  inputClassName,
}: MusteriSearchProps) {
  const [aramaMetni, setAramaMetni] = useState(value);
  const [sonuclar, setSonuclar] = useState<MusteriAramaSonucu[]>([]);
  const [listeAcik, setListeAcik] = useState(false);
  const [popupAcik, setPopupAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  const istekIdRef = useRef(0);
  const kullaniciYaziyorRef = useRef(false);
  const onValueChangeRef = useRef(onValueChange);

  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  useEffect(() => {
    const arama = aramaMetni.trim();

    if (!listeAcik || !arama) {
      return;
    }

    const sadeceRakam = /^\d+$/.test(arama);

    if (!adSoyadAranabilir && !sadeceRakam) {
      return;
    }

    const istekId = ++istekIdRef.current;

    const zamanlayici = window.setTimeout(async () => {
      setYukleniyor(true);
      setHata("");

      try {
        const sonuc = await musteriAra(arama, 10);

        // Daha eski API isteği sonradan döndüyse sonucu kullanma.
        if (istekId !== istekIdRef.current) return;

        const aktifSonuclar = sonuc.filter(
          (musteri) => musteri.aktifMi,
        );

        setSonuclar(aktifSonuclar);

        // Arama yalnızca bir müşteriyle eşleşirse otomatik seç.
        if (
          kullaniciYaziyorRef.current &&
          aktifSonuclar.length === 1
        ) {
          musteriSec(aktifSonuclar[0]);
        }
      } catch (error) {
        if (istekId !== istekIdRef.current) return;

        setSonuclar([]);
        setHata(
          error instanceof Error
            ? error.message
            : "Müşteriler alınamadı.",
        );
      } finally {
        if (istekId === istekIdRef.current) {
          setYukleniyor(false);
        }
      }
    }, 250);

    return () => window.clearTimeout(zamanlayici);
  }, [adSoyadAranabilir, aramaMetni, listeAcik]);

  function musteriSec(musteri: MusteriAramaSonucu) {
    kullaniciYaziyorRef.current = false;
    setAramaMetni(musteri.id.toString());
    setSonuclar([]);
    setListeAcik(false);
    onValueChangeRef.current(musteri.id.toString());
  }

  function aramayiDegistir(deger: string) {
    const sadeceRakam = /^\d*$/.test(deger);

    if (!adSoyadAranabilir && !sadeceRakam) {
      return;
    }

    kullaniciYaziyorRef.current = true;
    setAramaMetni(deger.slice(0, 100));
    setListeAcik(true);

    if (!deger.trim()) {
      setSonuclar([]);
      setHata("");
    }

    // Kullanıcı yeni aramaya başladığı için önceki seçimi temizle.
    onValueChangeRef.current("");
  }

  function popupAc() {
    setPopupAcik(true);
  }

  function popupKapat() {
    setPopupAcik(false);
  }

  function popupSeciminiUygula(musteriId: string) {
    setAramaMetni(musteriId);
    onValueChangeRef.current(musteriId);
    setPopupAcik(false);
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          value={aramaMetni}
          onChange={(event) => aramayiDegistir(event.target.value)}
          placeholder={
            adSoyadAranabilir
              ? "Müşteri no veya ad soyad"
              : "Müşteri numarası"
          }
          className={cn("h-10 w-full rounded-md border border-slate-300 px-3 pr-11", inputClassName)}
        />

        {popupKullanilsinMi && (
          <button
            type="button"
            onClick={popupAc}
            aria-label="Detaylı müşteri araması"
            className="absolute right-1 top-1 flex size-8 items-center justify-center"
          >
            <Search className="size-4" />
          </button>
        )}
      </div>

      {listeAcik && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
          {sonuclar.map((musteri) => (
            <button
              key={musteri.id}
              type="button"
              onClick={() => musteriSec(musteri)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-blue-50"
            >
              <UserRound className="size-4" />

              <span>
                <strong>
                  {musteri.id} – {musteri.ad} {musteri.soyad}
                </strong>

                <small className="block text-slate-500">
                  {musteri.sube.kod} – {musteri.sube.ad}
                </small>
              </span>
            </button>
          ))}

          {yukleniyor && (
            <p className="p-3 text-sm text-slate-500">
              Aranıyor...
            </p>
          )}

          {hata && (
            <p className="p-3 text-sm text-red-700">
              {hata}
            </p>
          )}
        </div>
      )}

      <MusteriPopup
        isOpen={popupAcik}
        onClose={popupKapat}
        onMusteriSec={popupSeciminiUygula}
      />
    </div>
  );
}
