"use client";

import { Building2, UserRound, WalletCards, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { musteriHesaplariniGetir } from "@/services/musteri-service";
import type { MusteriHesapResponse } from "@/types/api";

type MusteriDetayPopupProps = {
  isOpen: boolean;
  musteriId: number | null;
  onClose: () => void;
};

type MusteriDetaySonucu = {
  musteriId: number;
  musteri: MusteriHesapResponse | null;
  hata: string;
};

function bakiyeYaz(bakiye: number, dovizKodu: string) {
  return `${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(bakiye)} ${dovizKodu}`;
}

export default function MusteriDetayPopup({
  isOpen,
  musteriId,
  onClose,
}: MusteriDetayPopupProps) {
  const [sonuc, setSonuc] = useState<MusteriDetaySonucu | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function escapeIleKapat(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", escapeIleKapat);
    return () => document.removeEventListener("keydown", escapeIleKapat);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || musteriId === null) return;

    let iptalEdildi = false;

    musteriHesaplariniGetir(musteriId)
      .then((cevap) => {
        if (!iptalEdildi) {
          setSonuc({ musteriId, musteri: cevap, hata: "" });
        }
      })
      .catch((error: unknown) => {
        if (!iptalEdildi) {
          setSonuc({
            musteriId,
            musteri: null,
            hata:
              error instanceof Error
                ? error.message
                : "Müşteri detayı alınamadı.",
          });
        }
      });

    return () => {
      iptalEdildi = true;
    };
  }, [isOpen, musteriId]);

  if (!isOpen) return null;

  const guncelSonuc = sonuc?.musteriId === musteriId ? sonuc : null;
  const musteri = guncelSonuc?.musteri ?? null;
  const hata = guncelSonuc?.hata ?? "";
  const yukleniyor = musteriId !== null && guncelSonuc === null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="musteri-detay-baslik"
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="musteri-detay-baslik"
              className="flex items-center gap-2 text-lg font-bold text-slate-900"
            >
              <UserRound className="size-5 text-[#0047b3]" />
              Müşteri Detayı
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Müşteri, şube ve döviz hesaplarını görüntüleyin.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Müşteri detayını kapat"
          >
            <X />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-6">
          {yukleniyor && (
            <p className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Müşteri detayı yükleniyor...
            </p>
          )}

          {hata && (
            <p className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">
              {hata}
            </p>
          )}

          {!yukleniyor && musteri && (
            <div className="space-y-5">
              <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500">
                    Müşteri numarası
                  </span>
                  <p className="mt-1 text-lg font-bold text-[#0047b3]">
                    {musteri.id}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500">
                    Ad soyad
                  </span>
                  <p className="mt-1 font-bold text-slate-900">
                    {musteri.ad} {musteri.soyad}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500">
                    Durum
                  </span>
                  <p className="mt-1 font-bold">
                    {musteri.aktifMi ? "Aktif" : "Pasif"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500">
                    Hesap sayısı
                  </span>
                  <p className="mt-1 font-bold">{musteri.hesaplar.length}</p>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#0047b3]">
                  <Building2 className="size-4" /> Şube Bilgisi
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <span className="text-xs text-slate-500">Şube kodu</span>
                    <p className="mt-1 font-semibold">{musteri.sube.kod}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-500">Tam şube adı</span>
                    <p className="mt-1 font-semibold">{musteri.sube.ad}</p>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-[#0047b3]">
                    <WalletCards className="size-4" /> Döviz Hesapları
                  </h3>
                  <span className="text-xs text-slate-500">
                    {musteri.hesaplar.length} ek numara
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Ek No</th>
                        <th className="px-5 py-3 font-semibold">Döviz</th>
                        <th className="px-5 py-3 font-semibold">Döviz Adı</th>
                        <th className="px-5 py-3 text-right font-semibold">
                          Bakiye
                        </th>
                        <th className="px-5 py-3 text-right font-semibold">
                          Durum
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {musteri.hesaplar.map((hesap) => (
                        <tr key={hesap.hesapEkNo}>
                          <td className="px-5 py-4 font-bold">
                            {hesap.hesapEkNo}
                          </td>
                          <td className="px-5 py-4 font-semibold text-[#0047b3]">
                            {hesap.dovizKodu}
                          </td>
                          <td className="px-5 py-4">{hesap.dovizAdi}</td>
                          <td className="px-5 py-4 text-right font-semibold">
                            {bakiyeYaz(hesap.bakiye, hesap.dovizKodu)}
                          </td>
                          <td className="px-5 py-4 text-right">
                            {hesap.aktifMi ? "Aktif" : "Pasif"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {musteri.hesaplar.length === 0 && (
                    <p className="p-10 text-center text-sm text-slate-500">
                      Müşteriye ait döviz hesabı bulunmuyor.
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
