"use client";

import { Building2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { musterileriGetir } from "@/services/musteri-service";
import { subeDetayiGetir } from "@/services/sube-service";
import type { Musteri, Sube } from "@/types/api";

type SubeDetayPopupProps = {
  isOpen: boolean;
  subeKodu: string | null;
  onClose: () => void;
};

type SubeDetaySonucu = {
  subeKodu: string;
  sube: Sube | null;
  hata: string;
};

type SubeMusterileriSonucu = {
  anahtar: string;
  musteriler: Musteri[];
  toplamMusteri: number;
  toplamSayfa: number;
  hata: string;
};

const SAYFA_BOYUTU = 10;

function tarihYaz(value?: string) {
  if (!value) return "—";
  const tarih = new Date(value);
  return Number.isNaN(tarih.getTime())
    ? "—"
    : new Intl.DateTimeFormat("tr-TR").format(tarih);
}

export default function SubeDetayPopup({
  isOpen,
  subeKodu,
  onClose,
}: SubeDetayPopupProps) {
  const [sayfa, setSayfa] = useState(1);
  const [detaySonucu, setDetaySonucu] = useState<SubeDetaySonucu | null>(
    null,
  );
  const [musteriSonucu, setMusteriSonucu] =
    useState<SubeMusterileriSonucu | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function escapeIleKapat(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", escapeIleKapat);
    return () => document.removeEventListener("keydown", escapeIleKapat);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !subeKodu) return;

    let iptalEdildi = false;

    subeDetayiGetir(subeKodu)
      .then((cevap) => {
        if (!iptalEdildi) {
          setDetaySonucu({ subeKodu, sube: cevap, hata: "" });
        }
      })
      .catch((error: unknown) => {
        if (!iptalEdildi) {
          setDetaySonucu({
            subeKodu,
            sube: null,
            hata:
              error instanceof Error
                ? error.message
                : "Şube detayı alınamadı.",
          });
        }
      });

    return () => {
      iptalEdildi = true;
    };
  }, [isOpen, subeKodu]);

  useEffect(() => {
    if (!isOpen || !subeKodu) return;

    let iptalEdildi = false;
    const anahtar = `${subeKodu}-${sayfa}`;

    musterileriGetir({
      page: sayfa,
      pageSize: SAYFA_BOYUTU,
      subeKodu,
    })
      .then((cevap) => {
        if (iptalEdildi) return;
        setMusteriSonucu({
          anahtar,
          musteriler: cevap.items,
          toplamMusteri: cevap.totalCount,
          toplamSayfa: Math.max(cevap.totalPages, 1),
          hata: "",
        });
      })
      .catch((error: unknown) => {
        if (!iptalEdildi) {
          setMusteriSonucu({
            anahtar,
            musteriler: [],
            toplamMusteri: 0,
            toplamSayfa: 1,
            hata:
              error instanceof Error
                ? error.message
                : "Şubenin müşterileri alınamadı.",
          });
        }
      });

    return () => {
      iptalEdildi = true;
    };
  }, [isOpen, sayfa, subeKodu]);

  if (!isOpen) return null;

  const guncelDetay = detaySonucu?.subeKodu === subeKodu ? detaySonucu : null;
  const musteriAnahtari = `${subeKodu}-${sayfa}`;
  const guncelMusteriler =
    musteriSonucu?.anahtar === musteriAnahtari ? musteriSonucu : null;
  const sube = guncelDetay?.sube ?? null;
  const detayHatasi = guncelDetay?.hata ?? "";
  const detayYukleniyor = Boolean(subeKodu) && guncelDetay === null;
  const musteriler = guncelMusteriler?.musteriler ?? [];
  const toplamMusteri = guncelMusteriler?.toplamMusteri ?? 0;
  const toplamSayfa = guncelMusteriler?.toplamSayfa ?? 1;
  const musteriHatasi = guncelMusteriler?.hata ?? "";
  const musterilerYukleniyor = Boolean(subeKodu) && guncelMusteriler === null;

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
        aria-labelledby="sube-detay-baslik"
        className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="sube-detay-baslik"
              className="flex items-center gap-2 text-lg font-bold text-slate-900"
            >
              <Building2 className="size-5 text-[#0047b3]" /> Şube Detayı
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Şube bilgilerini ve şubeye kayıtlı müşterileri görüntüleyin.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Şube detayını kapat"
          >
            <X />
          </Button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-slate-50 p-6">
          {detayYukleniyor && (
            <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              Şube detayı yükleniyor...
            </p>
          )}
          {detayHatasi && (
            <p className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">
              {detayHatasi}
            </p>
          )}
          {!detayYukleniyor && sube && (
            <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <span className="text-xs text-slate-500">Şube kodu</span>
                <p className="mt-1 text-lg font-bold text-[#0047b3]">
                  {sube.kod}
                </p>
              </div>
              <div className="lg:col-span-2">
                <span className="text-xs text-slate-500">Tam şube adı</span>
                <p className="mt-1 font-bold">{sube.ad}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Durum</span>
                <p className="mt-1 font-bold">
                  {sube.aktifMi ? "Aktif" : "Pasif"}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Oluşturma tarihi</span>
                <p className="mt-1 font-bold">
                  {tarihYaz(sube.olusturmaTarihi)}
                </p>
              </div>
            </section>
          )}

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#0047b3]">
                <Users className="size-4" /> Şubeye Kayıtlı Müşteriler
              </h3>
              <span className="text-xs text-slate-500">
                Toplam {toplamMusteri} müşteri
              </span>
            </div>

            {musteriHatasi && (
              <p className="m-4 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">
                {musteriHatasi}
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Müşteri ID</th>
                    <th className="px-5 py-3 font-semibold">Ad Soyad</th>
                    <th className="px-5 py-3 font-semibold">Hesap Sayısı</th>
                    <th className="px-5 py-3 font-semibold">Kayıt Tarihi</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {musteriler.map((musteri) => (
                    <tr key={musteri.id}>
                      <td className="px-5 py-4 font-bold text-[#0047b3]">
                        {musteri.id}
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        {musteri.ad} {musteri.soyad}
                      </td>
                      <td className="px-5 py-4">{musteri.hesapSayisi}</td>
                      <td className="px-5 py-4">
                        {tarihYaz(musteri.olusturmaTarihi)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {musteri.aktifMi ? "Aktif" : "Pasif"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!musterilerYukleniyor && musteriler.length === 0 && !musteriHatasi && (
                <p className="p-10 text-center text-sm text-slate-500">
                  Bu şubeye kayıtlı müşteri bulunmuyor.
                </p>
              )}
              {musterilerYukleniyor && (
                <p className="p-10 text-center text-sm text-slate-500">
                  Müşteriler yükleniyor...
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm">
              <span className="text-slate-500">
                Sayfa {sayfa}/{toplamSayfa}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={sayfa <= 1 || musterilerYukleniyor}
                  onClick={() => setSayfa((onceki) => Math.max(1, onceki - 1))}
                  className="rounded-md border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40"
                >
                  Önceki
                </button>
                <button
                  type="button"
                  disabled={sayfa >= toplamSayfa || musterilerYukleniyor}
                  onClick={() => setSayfa((onceki) => onceki + 1)}
                  className="rounded-md border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40"
                >
                  Sonraki
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
