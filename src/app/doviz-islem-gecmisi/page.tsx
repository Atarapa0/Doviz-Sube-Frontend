"use client";

import { ListRestart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AppShell from "@/components/layout/AppShell";
import PageHeading from "@/components/layout/PageHeading";
import { paraYaz, tarihYaz } from "@/lib/formatters";
import { dovizIslemleriniGetir } from "@/services/doviz-service";
import type { DovizIslemi } from "@/types/api";

function islemTipi(referans: string) {
  if (referans.includes("DOVA")) return "Döviz Alış";
  if (referans.includes("DOVS")) return "Döviz Satış";
  if (referans.includes("DOVR")) return "Arbitraj";
  return "Döviz İşlemi";
}

export default function DovizIslemGecmisiPage() {
  const [islemler, setIslemler] = useState<DovizIslemi[]>([]);
  const [arama, setArama] = useState("");
  const [tip, setTip] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");

  useEffect(() => {
    dovizIslemleriniGetir()
      .then(setIslemler)
      .catch((error: unknown) => setHata(error instanceof Error ? error.message : "İşlemler alınamadı."))
      .finally(() => setYukleniyor(false));
  }, []);

  const filtrelenmisIslemler = useMemo(() => {
    const metin = arama.trim().toLocaleLowerCase("tr-TR");
    return islemler.filter((islem) => {
      const metinUyuyor = !metin || `${islem.referansNo} ${islem.musteriId} ${islem.musteri.ad} ${islem.musteri.soyad}`.toLocaleLowerCase("tr-TR").includes(metin);
      return metinUyuyor && (!tip || islemTipi(islem.referansNo) === tip);
    });
  }, [arama, islemler, tip]);

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
        <PageHeading title="Döviz İşlem Geçmişi" description="Gerçekleştirilen döviz işlemlerini API'den gelen kayıtlarla inceleyin." icon={ListRestart} />
        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_260px_auto]">
          <input value={arama} onChange={(event) => setArama(event.target.value)} placeholder="Referans, müşteri ID veya ad soyad" className="h-10 rounded-md border border-slate-300 px-3 outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100" />
          <select value={tip} onChange={(event) => setTip(event.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 outline-none"><option value="">Tüm işlem tipleri</option><option>Döviz Alış</option><option>Döviz Satış</option><option>Arbitraj</option></select>
          <button type="button" onClick={() => { setArama(""); setTip(""); }} className="h-10 rounded-md bg-slate-100 px-5 text-sm font-semibold hover:bg-slate-200">Temizle</button>
        </section>
        {hata && <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{hata}</p>}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr>{["Referans", "Tarih", "Müşteri", "İşlem Tipi", "Borçlu", "Alacaklı", "TL Karşılığı"].map((baslik) => <th key={baslik} className="px-5 py-3 font-semibold">{baslik}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{filtrelenmisIslemler.map((islem) => <tr key={islem.id} className="hover:bg-slate-50">
            <td className="px-5 py-4 font-mono text-xs font-semibold text-[#0047b3]">{islem.referansNo}</td><td className="px-5 py-4">{tarihYaz(islem.islemTarihi)}</td><td className="px-5 py-4"><span className="block font-semibold">{islem.musteri.ad} {islem.musteri.soyad}</span><span className="text-xs text-slate-400">{islem.musteriId}</span></td><td className="px-5 py-4">{islemTipi(islem.referansNo)}</td><td className="px-5 py-4">{paraYaz(islem.borcluHesap.miktar, islem.borcluHesap.dovizKodu)}</td><td className="px-5 py-4">{paraYaz(islem.alacakliHesap.miktar, islem.alacakliHesap.dovizKodu)}</td><td className="px-5 py-4 font-semibold">{paraYaz(islem.tlKarsiligi)}</td>
          </tr>)}{!yukleniyor && filtrelenmisIslemler.length === 0 && <tr><td colSpan={7} className="px-6 py-14 text-center text-slate-500">Kayıt bulunamadı.</td></tr>}{yukleniyor && <tr><td colSpan={7} className="px-6 py-14 text-center text-slate-500">İşlemler yükleniyor...</td></tr>}</tbody>
        </table></div></section>
      </div>
    </AppShell>
  );
}
