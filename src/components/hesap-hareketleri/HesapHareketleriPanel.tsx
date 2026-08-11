"use client";

import { useMemo, useState } from "react";

import { HesapBakiyeleri } from "@/components/hesap-hareketleri/HesapBakiyeleri";
import { useMusteri } from "@/components/providers/MusteriProvider";
import MusteriCombobox from "@/components/ui/musteri-bilgileri";
import { paraYaz, tarihYaz } from "@/lib/formatters";
import {
  hesapHareketleriniGetir,
  musteriTumHesapHareketleriniGetir,
} from "@/services/hesap-service";
import { musteriHesaplariniGetir } from "@/services/musteri-service";
import type {
  HesapHareketleriResponse,
  MusteriHesapResponse,
} from "@/types/api";

const TUM_HESAPLAR = "tumu";

export function HesapHareketleriPanel() {
  const { musteriSec } = useMusteri();
  const [musteriId, setMusteriId] = useState("");
  const [musteri, setMusteri] = useState<MusteriHesapResponse | null>(null);
  const [hesapEkNo, setHesapEkNo] = useState("");
  const [cevaplar, setCevaplar] = useState<HesapHareketleriResponse[]>([]);
  const [sonucGosteriliyor, setSonucGosteriliyor] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function musteriGetir(id: string) {
    setMusteriId(id);
    setMusteri(null);
    setHesapEkNo("");
    setCevaplar([]);
    setSonucGosteriliyor(false);

    if (!/^\d{6}$/.test(id)) {
      setMesaj("");
      return;
    }

    try {
      const data = await musteriHesaplariniGetir(id);
      setMusteri(data);
      musteriSec(data);
      setMesaj("");
    } catch (error) {
      setMesaj(error instanceof Error ? error.message : "Müşteri bulunamadı.");
    }
  }

  async function hareketleriGetir() {
    if (!musteri || !hesapEkNo) return;

    setYukleniyor(true);
    setMesaj("");
    setSonucGosteriliyor(false);

    try {
      let sonuclar: HesapHareketleriResponse[];

      if (hesapEkNo === TUM_HESAPLAR) {
        const topluCevap = await musteriTumHesapHareketleriniGetir(musteri.id);
        sonuclar = topluCevap.hesaplar.map((hesap) => ({
          hesap: {
            musteriId: topluCevap.musteriId,
            hesapEkNo: hesap.hesapEkNo,
            dovizKodu: hesap.dovizKodu,
            dovizAdi: hesap.dovizAdi,
            bakiye: hesap.bakiye,
            aktifMi: hesap.aktifMi,
          },
          hareketler: hesap.hareketler,
        }));
      } else {
        sonuclar = [await hesapHareketleriniGetir(musteri.id, hesapEkNo)];
      }

      setCevaplar(sonuclar);
      setSonucGosteriliyor(true);
    } catch (error) {
      setCevaplar([]);
      setMesaj(
        error instanceof Error ? error.message : "Hesap hareketleri alınamadı.",
      );
    } finally {
      setYukleniyor(false);
    }
  }

  const hareketler = useMemo(
    () =>
      cevaplar
        .flatMap((cevap) =>
          cevap.hareketler.map((hareket) => ({
            ...hareket,
            hesapEkNo: cevap.hesap.hesapEkNo,
            dovizKodu: cevap.hesap.dovizKodu,
          })),
        )
        .sort(
          (ilk, ikinci) =>
            new Date(ikinci.islemTarihi).getTime() -
            new Date(ilk.islemTarihi).getTime(),
        ),
    [cevaplar],
  );

  const tumHesaplarSecili = hesapEkNo === TUM_HESAPLAR;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_1.5fr_auto]">
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Müşteri ID
            <MusteriCombobox
              value={musteriId}
              onValueChange={(id) => void musteriGetir(id)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold">
            Hesap
            <select
              disabled={!musteri}
              value={hesapEkNo}
              onChange={(event) => {
                setHesapEkNo(event.target.value);
                setCevaplar([]);
                setSonucGosteriliyor(false);
              }}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 font-normal"
            >
              <option value="">Hesap seçiniz</option>
              <option value={TUM_HESAPLAR}>Tüm Hesaplar</option>
              {musteri?.hesaplar.map((hesap) => (
                <option key={hesap.hesapEkNo} value={hesap.hesapEkNo}>
                  {hesap.hesapEkNo} - {hesap.dovizKodu} -{" "}
                  {paraYaz(hesap.bakiye, hesap.dovizKodu)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={!hesapEkNo || yukleniyor}
            onClick={() => void hareketleriGetir()}
            className="mt-auto h-10 rounded-md bg-[#0047b3] px-6 text-sm font-semibold text-white hover:bg-[#003b95] disabled:opacity-50"
          >
            {yukleniyor ? "Getiriliyor..." : "Hareketleri Getir"}
          </button>
        </div>

        {mesaj && (
          <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-semibold text-amber-700">
            {mesaj}
          </p>
        )}
      </section>

      {sonucGosteriliyor && (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs text-slate-500">Kapsam</span>
              <p className="mt-2 font-bold">
                {tumHesaplarSecili
                  ? "Tüm Hesaplar"
                  : `${cevaplar[0]?.hesap.hesapEkNo} · ${cevaplar[0]?.hesap.dovizKodu}`}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs text-slate-500">Görüntülenen Hesap</span>
              <p className="mt-2 font-bold text-[#0047b3]">{cevaplar.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs text-slate-500">Toplam Hareket</span>
              <p className="mt-2 font-bold">{hareketler.length}</p>
            </div>
          </section>

          <HesapBakiyeleri cevaplar={cevaplar} />

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    {["Hesap", "Döviz", "Tarih", "Referans", "Hareket", "Döviz Miktarı", "TL Karşılığı"].map(
                      (baslik) => (
                        <th key={baslik} className="px-5 py-3 font-semibold">
                          {baslik}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hareketler.map((hareket) => (
                    <tr key={`${hareket.hesapEkNo}-${hareket.id}`} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold">{hareket.hesapEkNo}</td>
                      <td className="px-5 py-4 font-bold text-[#0047b3]">
                        {hareket.dovizKodu}
                      </td>
                      <td className="px-5 py-4">{tarihYaz(hareket.islemTarihi)}</td>
                      <td className="px-5 py-4 font-mono text-xs text-[#0047b3]">
                        {hareket.referansNo}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${
                            hareket.hareketTuru === "ALACAK"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {hareket.hareketTuru}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {paraYaz(hareket.dovizMiktari, hareket.dovizKodu)}
                      </td>
                      <td className="px-5 py-4">{paraYaz(hareket.tlKarsiligi)}</td>
                    </tr>
                  ))}
                  {hareketler.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-14 text-center text-slate-500">
                        Seçilen kapsama ait hesap hareketi bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
