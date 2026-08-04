"use client";

import Link from "next/link";
import { ArrowRightLeft, BookOpenText, CircleDollarSign, Landmark, Users } from "lucide-react";
import { useEffect, useState } from "react";

import AppShell from "@/components/layout/AppShell";
import PageHeading from "@/components/layout/PageHeading";
import { paraYaz, tarihYaz } from "@/lib/formatters";
import { dovizIslemleriniGetir, kurlariGetir } from "@/services/doviz-service";
import { musterileriGetir } from "@/services/musteri-service";
import type { DovizIslemi } from "@/types/api";

const quickActions = [{ title: "Döviz Alış / Satış", description: "Yeni döviz işlemi başlatın.", href: "/", icon: CircleDollarSign }, { title: "Müşteriler", description: "Müşterileri ve hesapları inceleyin.", href: "/musteriler", icon: Users }, { title: "Hesap Açma", description: "Yeni bir döviz hesabı tanımlayın.", href: "/hesap-acma", icon: Landmark }, { title: "Hesap Hareketleri", description: "Hesap hareketlerini sorgulayın.", href: "/hesap-hareketleri", icon: BookOpenText }];

export default function DashboardPage() {
  const [musteriSayisi, setMusteriSayisi] = useState(0);
  const [islemler, setIslemler] = useState<DovizIslemi[]>([]);
  const [kurTarihi, setKurTarihi] = useState("—");
  const [hata, setHata] = useState("");

  useEffect(() => {
    async function dashboardVerileriniGetir() {
      try {
        const [musteriler, ilkIslemSayfasi, kur] = await Promise.all([
          musterileriGetir({ page: 1, pageSize: 1 }),
          dovizIslemleriniGetir({ page: 1, pageSize: 100 }),
          kurlariGetir(),
        ]);
        const digerSayfalar = ilkIslemSayfasi.totalPages > 1
          ? await Promise.all(
              Array.from(
                { length: ilkIslemSayfasi.totalPages - 1 },
                (_, index) => dovizIslemleriniGetir({ page: index + 2, pageSize: 100 }),
              ),
            )
          : [];

        setMusteriSayisi(musteriler.totalCount);
        setIslemler([
          ...ilkIslemSayfasi.items,
          ...digerSayfalar.flatMap((sayfa) => sayfa.items),
        ]);
        setKurTarihi(kur.tarih);
      } catch (error) {
        setHata(error instanceof Error ? error.message : "Dashboard verileri alınamadı.");
      }
    }

    void dashboardVerileriniGetir();
  }, []);
  const bugun = new Date().toDateString();
  const bugununIslemleri = islemler.filter((islem) => new Date(islem.islemTarihi).toDateString() === bugun);
  const toplamHacim = bugununIslemleri.reduce((toplam, islem) => toplam + islem.tlKarsiligi, 0);

  return <AppShell><div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6"><PageHeading title="Dashboard" description="Müşteri, kur ve döviz işlemi API'lerinden oluşturulan genel bakış." icon={ArrowRightLeft} />
    {hata && <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{hata}</p>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Toplam Müşteri", musteriSayisi.toString()], ["Bugünkü İşlem", bugununIslemleri.length.toString()], ["Bugünkü Hacim", paraYaz(toplamHacim)], ["Kur Tarihi", kurTarihi]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p></div>)}</section>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-5 text-lg font-bold">Hızlı İşlemler</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{quickActions.map((action) => { const Icon = action.icon; return <Link key={action.href} href={action.href} className="group rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"><Icon className="mb-3 size-5 text-[#0047b3]" /><h3 className="font-bold group-hover:text-[#0047b3]">{action.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{action.description}</p></Link>; })}</div></section>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-6 py-4"><h2 className="font-bold">Son Döviz İşlemleri</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{["Referans", "Müşteri", "Tarih", "TL Karşılığı"].map((baslik) => <th key={baslik} className="px-6 py-3">{baslik}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{islemler.slice(0, 5).map((islem) => <tr key={islem.id}><td className="px-6 py-4 font-mono text-xs text-[#0047b3]">{islem.referansNo}</td><td className="px-6 py-4">{islem.musteri.ad} {islem.musteri.soyad}</td><td className="px-6 py-4">{tarihYaz(islem.islemTarihi)}</td><td className="px-6 py-4 font-semibold">{paraYaz(islem.tlKarsiligi)}</td></tr>)}</tbody></table></div></section>
  </div></AppShell>;
}
