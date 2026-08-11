"use client";

import { Landmark } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import AppShell from "@/components/layout/AppShell";
import PageHeading from "@/components/layout/PageHeading";
import { useMusteri } from "@/components/providers/MusteriProvider";
import MusteriCombobox from "@/components/ui/musteri-bilgileri";
import { paraYaz } from "@/lib/formatters";
import { dovizleriGetir } from "@/services/doviz-service";
import { hesapAc } from "@/services/hesap-service";
import { musteriHesaplariniGetir } from "@/services/musteri-service";
import type { Doviz, MusteriHesapResponse } from "@/types/api";

export default function HesapAcmaPage() {
  const { musteriSec } = useMusteri();
  const [musteriId, setMusteriId] = useState("");
  const [musteri, setMusteri] = useState<MusteriHesapResponse | null>(null);
  const [dovizler, setDovizler] = useState<Doviz[]>([]);
  const [dovizKodu, setDovizKodu] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [basarili, setBasarili] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  useEffect(() => { dovizleriGetir().then(setDovizler).catch(() => setMesaj("Döviz listesi alınamadı.")); }, []);

  async function musteriGetir(id: string) {
    setMusteriId(id); setMusteri(null); setDovizKodu(""); setBasarili(false);
    if (!/^\d{6}$/.test(id)) { setMesaj(""); return; }
    try { const data = await musteriHesaplariniGetir(id); setMusteri(data); musteriSec(data); setMesaj(""); }
    catch (error) { setMesaj(error instanceof Error ? error.message : "Müşteri bulunamadı."); }
  }

  async function hesabıAc(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!musteri || !dovizKodu) return; setKaydediliyor(true); setBasarili(false);
    try { await hesapAc(musteri.id, dovizKodu); const guncel = await musteriHesaplariniGetir(musteri.id); setMusteri(guncel); musteriSec(guncel); setBasarili(true); setMesaj(`${dovizKodu} hesabı başarıyla açıldı.`); setDovizKodu(""); }
    catch (error) { setMesaj(error instanceof Error ? error.message : "Hesap açılamadı."); }
    finally { setKaydediliyor(false); }
  }

  const mevcutKodlar = new Set(musteri?.hesaplar.map((hesap) => hesap.dovizKodu) ?? []);
  return <AppShell><div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6"><PageHeading title="Hesap Açma" description="Müşteriyi getirip sahip olmadığı bir döviz cinsinde yeni hesap açın." icon={Landmark} />
    <form onSubmit={hesabıAc} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid gap-5 md:grid-cols-3"><label className="flex flex-col gap-2 text-sm font-semibold">Müşteri ID<MusteriCombobox value={musteriId} onValueChange={(id) => void musteriGetir(id)} /></label><label className="flex flex-col gap-2 text-sm font-semibold">Müşteri<input readOnly value={musteri ? `${musteri.ad} ${musteri.soyad}` : ""} className="h-10 rounded-md border border-slate-300 bg-slate-50 px-3 font-normal" /></label><label className="flex flex-col gap-2 text-sm font-semibold">Yeni Hesap Dövizi<select required disabled={!musteri} value={dovizKodu} onChange={(e) => setDovizKodu(e.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 font-normal"><option value="">Seçiniz</option>{dovizler.filter((doviz) => !mevcutKodlar.has(doviz.kod)).map((doviz) => <option key={doviz.id} value={doviz.kod}>{doviz.kod} - {doviz.name}</option>)}</select></label></div>
      {mesaj && <p className={`mt-5 rounded-md p-3 text-sm font-semibold ${basarili ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{mesaj}</p>}<div className="mt-6 flex justify-end"><button disabled={!musteri || !dovizKodu || kaydediliyor} type="submit" className="h-10 rounded-md bg-[#0047b3] px-6 text-sm font-semibold text-white disabled:opacity-50">{kaydediliyor ? "Açılıyor..." : "Hesabı Aç"}</button></div>
    </form>
    {musteri && <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 font-bold">Mevcut Hesaplar · {musteri.sube.kod} - {musteri.sube.ad}</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{musteri.hesaplar.map((hesap) => <div key={hesap.hesapEkNo} className="rounded-lg border border-slate-200 p-4"><span className="text-xs text-slate-500">Ek No {hesap.hesapEkNo}</span><p className="mt-1 font-bold text-[#0047b3]">{hesap.dovizKodu} · {hesap.dovizAdi}</p><p className="mt-2 text-sm">{paraYaz(hesap.bakiye, hesap.dovizKodu)}</p></div>)}</div></section>}
  </div></AppShell>;
}
