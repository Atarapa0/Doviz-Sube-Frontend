"use client";

import { BookOpenText } from "lucide-react";
import { useState } from "react";

import AppShell from "@/components/layout/AppShell";
import PageHeading from "@/components/layout/PageHeading";
import { useMusteri } from "@/components/providers/MusteriProvider";
import { paraYaz, tarihYaz } from "@/lib/formatters";
import { hesapHareketleriniGetir } from "@/services/hesap-service";
import { musteriHesaplariniGetir } from "@/services/musteri-service";
import type { HesapHareketleriResponse, MusteriHesapResponse } from "@/types/api";

export default function HesapHareketleriPage() {
  const { musteriSec } = useMusteri();
  const [musteriId, setMusteriId] = useState("");
  const [musteri, setMusteri] = useState<MusteriHesapResponse | null>(null);
  const [hesapEkNo, setHesapEkNo] = useState("");
  const [cevap, setCevap] = useState<HesapHareketleriResponse | null>(null);
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function musteriGetir(id: string) {
    setMusteriId(id); setMusteri(null); setHesapEkNo(""); setCevap(null);
    if (!/^\d{6}$/.test(id)) { setMesaj(id ? "Müşteri ID 6 haneli olmalı." : ""); return; }
    try { const data = await musteriHesaplariniGetir(id); setMusteri(data); musteriSec(data); setMesaj(""); }
    catch (error) { setMesaj(error instanceof Error ? error.message : "Müşteri bulunamadı."); }
  }

  async function hareketleriGetir() {
    if (!musteri || !hesapEkNo) return; setYukleniyor(true); setMesaj("");
    try { setCevap(await hesapHareketleriniGetir(musteri.id, hesapEkNo)); }
    catch (error) { setMesaj(error instanceof Error ? error.message : "Hesap hareketleri alınamadı."); }
    finally { setYukleniyor(false); }
  }

  return <AppShell><div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6"><PageHeading title="Hesap Hareketleri" description="Müşterinin hesap ek numarasına ait gerçek borç ve alacak hareketlerini görüntüleyin." icon={BookOpenText} />
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid gap-4 md:grid-cols-[1fr_1.5fr_auto]"><label className="flex flex-col gap-2 text-sm font-semibold">Müşteri ID<input inputMode="numeric" maxLength={6} value={musteriId} onChange={(e) => void musteriGetir(e.target.value.replace(/\D/g, ""))} placeholder="100000" className="h-10 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100" /></label><label className="flex flex-col gap-2 text-sm font-semibold">Hesap<select disabled={!musteri} value={hesapEkNo} onChange={(e) => { setHesapEkNo(e.target.value); setCevap(null); }} className="h-10 rounded-md border border-slate-300 bg-white px-3 font-normal"><option value="">Hesap seçiniz</option>{musteri?.hesaplar.map((hesap) => <option key={hesap.hesapEkNo} value={hesap.hesapEkNo}>{hesap.hesapEkNo} - {hesap.dovizKodu} - {paraYaz(hesap.bakiye, hesap.dovizKodu)}</option>)}</select></label><button type="button" disabled={!hesapEkNo || yukleniyor} onClick={() => void hareketleriGetir()} className="mt-auto h-10 rounded-md bg-[#0047b3] px-6 text-sm font-semibold text-white disabled:opacity-50">{yukleniyor ? "Getiriliyor..." : "Hareketleri Getir"}</button></div>{mesaj && <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-semibold text-amber-700">{mesaj}</p>}</section>
    {cevap && <><section className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="text-xs text-slate-500">Hesap</span><p className="mt-2 font-bold">{cevap.hesap.hesapEkNo} · {cevap.hesap.dovizKodu}</p></div><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="text-xs text-slate-500">Güncel Bakiye</span><p className="mt-2 font-bold text-[#0047b3]">{paraYaz(cevap.hesap.bakiye, cevap.hesap.dovizKodu)}</p></div><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="text-xs text-slate-500">Hareket Sayısı</span><p className="mt-2 font-bold">{cevap.hareketler.length}</p></div></section><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{["Tarih", "Referans", "Hareket", "Döviz Miktarı", "TL Karşılığı"].map((baslik) => <th key={baslik} className="px-6 py-3 font-semibold">{baslik}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{cevap.hareketler.map((hareket) => <tr key={hareket.id}><td className="px-6 py-4">{tarihYaz(hareket.islemTarihi)}</td><td className="px-6 py-4 font-mono text-xs text-[#0047b3]">{hareket.referansNo}</td><td className="px-6 py-4"><span className={`rounded-full px-2 py-1 text-xs font-bold ${hareket.hareketTuru === "ALACAK" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{hareket.hareketTuru}</span></td><td className="px-6 py-4">{paraYaz(hareket.dovizMiktari, cevap.hesap.dovizKodu)}</td><td className="px-6 py-4">{paraYaz(hareket.tlKarsiligi)}</td></tr>)}{cevap.hareketler.length === 0 && <tr><td colSpan={5} className="px-6 py-14 text-center text-slate-500">Bu hesapta hareket bulunmuyor.</td></tr>}</tbody></table></div></section></>}
  </div></AppShell>;
}
