"use client";

import { ChartNoAxesCombined, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AppShell from "@/components/layout/AppShell";
import PageHeading from "@/components/layout/PageHeading";
import { kurlariGetir } from "@/services/doviz-service";
import type { KurResponse } from "@/types/api";

export default function GuncelKurlarPage() {
  const [kurCevabi, setKurCevabi] = useState<KurResponse | null>(null);
  const [arama, setArama] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");

  async function yenile() {
    setYukleniyor(true); setHata("");
    try { setKurCevabi(await kurlariGetir()); }
    catch (error) { setHata(error instanceof Error ? error.message : "Kurlar alınamadı."); }
    finally { setYukleniyor(false); }
  }

  useEffect(() => {
    kurlariGetir()
      .then(setKurCevabi)
      .catch((error: unknown) => setHata(error instanceof Error ? error.message : "Kurlar alınamadı."))
      .finally(() => setYukleniyor(false));
  }, []);

  const kurlar = useMemo(() => {
    const metin = arama.trim().toLocaleLowerCase("tr-TR");
    return (kurCevabi?.kurlar ?? []).filter((kur) => !metin || `${kur.kod} ${kur.isim}`.toLocaleLowerCase("tr-TR").includes(metin));
  }, [arama, kurCevabi]);

  return <AppShell><div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><PageHeading title="Güncel Kurlar" description="Backend'in TCMB servisinden okuduğu güncel alış ve satış kurları." icon={ChartNoAxesCombined} /><div className="text-right text-xs text-slate-500"><span className="block">Kur tarihi</span><strong className="text-sm text-slate-900">{kurCevabi?.tarih ?? "—"}</strong></div></div>
    <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row"><input value={arama} onChange={(event) => setArama(event.target.value)} placeholder="Döviz kodu veya adı ara" className="h-10 flex-1 rounded-md border border-slate-300 px-3 outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100" /><button type="button" onClick={() => void yenile()} className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#0047b3] px-5 text-sm font-semibold text-white hover:bg-[#003b95]"><RefreshCw className="size-4" />Yenile</button></section>
    {hata && <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{hata}</p>}
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{["Döviz Kodu", "Döviz Adı", "Birim", "Alış Kuru", "Satış Kuru"].map((baslik) => <th key={baslik} className="px-6 py-3 font-semibold">{baslik}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{kurlar.map((kur) => <tr key={kur.kod} className="hover:bg-slate-50"><td className="px-6 py-4 font-bold text-[#0047b3]">{kur.kod}</td><td className="px-6 py-4">{kur.isim.trim()}</td><td className="px-6 py-4">{kur.birim}</td><td className="px-6 py-4 tabular-nums">{kur.dovizAlis?.toFixed(4) ?? "—"}</td><td className="px-6 py-4 tabular-nums">{kur.dovizSatis?.toFixed(4) ?? "—"}</td></tr>)}{yukleniyor && <tr><td colSpan={5} className="px-6 py-14 text-center text-slate-500">Kurlar yükleniyor...</td></tr>}</tbody></table></div></section>
  </div></AppShell>;
}
