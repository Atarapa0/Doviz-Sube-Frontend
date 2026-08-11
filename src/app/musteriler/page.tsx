"use client";

import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
import { type KeyboardEvent, useEffect, useState } from "react";

import AppShell from "@/components/layout/AppShell";
import PageHeading from "@/components/layout/PageHeading";
import { useMusteri } from "@/components/providers/MusteriProvider";
import { musteriHesaplariniGetir, musterileriGetir } from "@/services/musteri-service";
import type { Musteri } from "@/types/api";

export default function MusterilerPage() {
  const { musteriSec } = useMusteri();
  const [musteriler, setMusteriler] = useState<Musteri[]>([]);
  const [arama, setArama] = useState("");
  const [uygulananArama, setUygulananArama] = useState("");
  const [sayfa, setSayfa] = useState(1);
  const [toplamKayit, setToplamKayit] = useState(0);
  const [toplamSayfa, setToplamSayfa] = useState(1);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    let iptalEdildi = false;

    musterileriGetir({
      page: sayfa,
      pageSize: 20,
      arama: uygulananArama || undefined,
    })
      .then((cevap) => {
        if (iptalEdildi) return;
        setMusteriler(cevap.items);
        setToplamKayit(cevap.totalCount);
        setToplamSayfa(Math.max(cevap.totalPages, 1));
      })
      .catch((error: unknown) => {
        if (!iptalEdildi) {
          setMusteriler([]);
          setMesaj(error instanceof Error ? error.message : "Müşteriler alınamadı.");
        }
      })
      .finally(() => {
        if (!iptalEdildi) setYukleniyor(false);
      });

    return () => {
      iptalEdildi = true;
    };
  }, [uygulananArama, sayfa]);

  function enterIleAra(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    const yeniArama = arama.trim();

    // Aynı arama zaten ilk sayfada gösteriliyorsa tekrar API çağrısı yapma.
    if (yeniArama === uygulananArama && sayfa === 1) return;

    setMesaj("");
    setYukleniyor(true);
    setSayfa(1);
    setUygulananArama(yeniArama);
  }

  async function musteriSeciminiYap(musteriId: number) {
    try {
      setMesaj("Müşteri hesapları getiriliyor...");
      const musteri = await musteriHesaplariniGetir(musteriId);
      musteriSec(musteri);
      setMesaj(`${musteri.ad} ${musteri.soyad} header alanına seçildi.`);
    } catch (error) {
      setMesaj(error instanceof Error ? error.message : "Müşteri seçilemedi.");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <PageHeading title="Müşteriler" description="API'den gelen müşterileri arayın ve aktif müşteri olarak seçin." icon={Users} />
          <Link
            href="/yeni-musteri"
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-[#0047b3] px-5 text-sm font-semibold text-white hover:bg-[#003b95]"
          >
            <Plus className="size-4" />
            Yeni Müşteri Ekle
          </Link>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="relative block max-w-lg">
            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            <input value={arama} onChange={(event) => setArama(event.target.value)} onKeyDown={enterIleAra} placeholder="ID, ad soyad veya şube yazıp Enter'a basın" className="h-10 w-full rounded-md border border-slate-300 pl-10 pr-3 outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100" />
          </label>
          {mesaj && <p className="mt-3 text-sm font-medium text-[#0047b3]">{mesaj}</p>}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr>{["Müşteri ID", "Ad Soyad", "Şube", "Hesap Sayısı", "Durum", ""].map((baslik) => <th key={baslik} className="px-6 py-3 font-semibold">{baslik}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {musteriler.map((musteri) => (
                  <tr key={musteri.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold">{musteri.id}</td>
                    <td className="px-6 py-4">{musteri.ad} {musteri.soyad}</td>
                    <td className="px-6 py-4"><span className="block">{musteri.sube.ad}</span><span className="text-xs text-slate-400">{musteri.sube.kod}</span></td>
                    <td className="px-6 py-4">{musteri.hesapSayisi}</td>
                    <td className="px-6 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${musteri.aktifMi ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{musteri.aktifMi ? "Aktif" : "Pasif"}</span></td>
                    <td className="px-6 py-4 text-right"><button type="button" onClick={() => void musteriSeciminiYap(musteri.id)} className="rounded-md bg-[#0047b3] px-3 py-2 text-xs font-semibold text-white hover:bg-[#003b95]">Header&apos;a Seç</button></td>
                  </tr>
                ))}
                {!yukleniyor && musteriler.length === 0 && <tr><td colSpan={6} className="px-6 py-14 text-center text-slate-500">Müşteri bulunamadı.</td></tr>}
                {yukleniyor && <tr><td colSpan={6} className="px-6 py-14 text-center text-slate-500">Müşteriler yükleniyor...</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-slate-500">Toplam {toplamKayit} müşteri · Sayfa {sayfa}/{toplamSayfa}</span>
            <div className="flex gap-2">
              <button type="button" disabled={sayfa <= 1 || yukleniyor} onClick={() => { setYukleniyor(true); setMesaj(""); setSayfa((onceki) => Math.max(1, onceki - 1)); }} className="rounded-md border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40">Önceki</button>
              <button type="button" disabled={sayfa >= toplamSayfa || yukleniyor} onClick={() => { setYukleniyor(true); setMesaj(""); setSayfa((onceki) => onceki + 1); }} className="rounded-md border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40">Sonraki</button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
