"use client";

import { ListRestart, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AppShell from "@/components/layout/AppShell";
import PageHeading from "@/components/layout/PageHeading";
import SubeCombobox from "@/components/ui/sube-combobox";
import { paraYaz, tarihYaz } from "@/lib/formatters";
import {
  dovizIslemDetayiGetir,
  dovizIsleminiIptal,
  dovizIslemleriniGetir,
} from "@/services/doviz-service";
import { subeleriGetir } from "@/services/sube-service";
import type { DovizIslemi, DovizIslemiDetayResponse, Sube } from "@/types/api";

const SAYFA_BOYUTU = 20;

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
  const [subeKodu, setSubeKodu] = useState("");
  const [subeler, setSubeler] = useState<Sube[]>([]);
  const [sayfa, setSayfa] = useState(1);
  const [toplamSayfa, setToplamSayfa] = useState(1);
  const [toplamKayit, setToplamKayit] = useState(0);
  const [yenilemeSayisi, setYenilemeSayisi] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");
  const [detay, setDetay] = useState<DovizIslemiDetayResponse | null>(null);
  const [detayYukleniyor, setDetayYukleniyor] = useState(false);
  const [detayHatasi, setDetayHatasi] = useState("");
  const [iptalNedeni, setIptalNedeni] = useState("");
  const [iptalEdiliyor, setIptalEdiliyor] = useState(false);

  useEffect(() => {
    subeleriGetir().then(setSubeler).catch(() => {
      setHata("Şube listesi alınamadı.");
    });
  }, []);

  useEffect(() => {
    let iptalEdildi = false;

    dovizIslemleriniGetir({
      page: sayfa,
      pageSize: SAYFA_BOYUTU,
      subeKodu: subeKodu || undefined,
    })
      .then((data) => {
        if (iptalEdildi) return;
        setIslemler(data.items);
        setToplamSayfa(Math.max(data.totalPages, 1));
        setToplamKayit(data.totalCount);
      })
      .catch((error: unknown) => {
        if (!iptalEdildi) {
          setHata(error instanceof Error ? error.message : "İşlemler alınamadı.");
        }
      })
      .finally(() => {
        if (!iptalEdildi) setYukleniyor(false);
      });

    return () => {
      iptalEdildi = true;
    };
  }, [sayfa, subeKodu, yenilemeSayisi]);

  function subeFiltresiniDegistir(yeniSubeKodu: string) {
    if (yeniSubeKodu === subeKodu && sayfa === 1) return;
    setYukleniyor(true);
    setHata("");
    setSayfa(1);
    setSubeKodu(yeniSubeKodu);
  }

  function sayfayiDegistir(yeniSayfa: number) {
    setYukleniyor(true);
    setHata("");
    setSayfa(yeniSayfa);
  }

  async function detayGoster(referansNo: string) {
    setDetay(null);
    setDetayHatasi("");
    setIptalNedeni("");
    setDetayYukleniyor(true);

    try {
      setDetay(await dovizIslemDetayiGetir(referansNo));
    } catch (error) {
      setDetayHatasi(error instanceof Error ? error.message : "İşlem detayı alınamadı.");
    } finally {
      setDetayYukleniyor(false);
    }
  }

  async function islemiIptalEt() {
    if (!detay || !iptalNedeni.trim()) return;

    const referansNo = detay.islem.referansNo;
    const onaylandi = window.confirm(
      `${referansNo} referanslı işlemi ters kayıt oluşturarak iptal etmek istiyor musunuz?`,
    );
    if (!onaylandi) return;

    setIptalEdiliyor(true);
    setDetayHatasi("");

    try {
      await dovizIsleminiIptal(referansNo, iptalNedeni.trim());
      const guncelDetay = await dovizIslemDetayiGetir(referansNo);
      setDetay(guncelDetay);
      setIptalNedeni("");
      setYukleniyor(true);
      setYenilemeSayisi((deger) => deger + 1);
    } catch (error) {
      setDetayHatasi(error instanceof Error ? error.message : "İşlem iptal edilemedi.");
    } finally {
      setIptalEdiliyor(false);
    }
  }

  const filtrelenmisIslemler = useMemo(() => {
    const metin = arama.trim().toLocaleLowerCase("tr-TR");
    return islemler.filter((islem) => {
      const metinUyuyor =
        !metin ||
        `${islem.referansNo} ${islem.musteriId} ${islem.musteri.ad} ${islem.musteri.soyad}`
          .toLocaleLowerCase("tr-TR")
          .includes(metin);
      return metinUyuyor && (!tip || islemTipi(islem.referansNo) === tip);
    });
  }, [arama, islemler, tip]);

  const iptalEdilebilir = Boolean(
    detay && !detay.islem.tersKayitMi && !detay.islem.tersKayitOlusturulduMu,
  );

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
        <PageHeading title="Döviz İşlem Geçmişi" description="Gerçekleştirilen döviz işlemlerini API'den gelen kayıtlarla inceleyin." icon={ListRestart} />
        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-[1fr_230px_300px_auto]">
          <input value={arama} onChange={(event) => setArama(event.target.value)} placeholder="Bu sayfada referans, müşteri ID veya ad soyad ara" className="h-10 rounded-md border border-slate-300 px-3 outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100" />
          <select value={tip} onChange={(event) => setTip(event.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 outline-none"><option value="">Tüm işlem tipleri</option><option>Döviz Alış</option><option>Döviz Satış</option><option>Arbitraj</option></select>
          <SubeCombobox
            subeler={subeler}
            value={subeKodu}
            onValueChange={subeFiltresiniDegistir}
            placeholder="Tüm Şubeler"
            tumSecenegi="Tüm Şubeler"
            sadeceAktif={false}
          />
          <button type="button" onClick={() => { setArama(""); setTip(""); subeFiltresiniDegistir(""); }} className="h-10 rounded-md bg-slate-100 px-5 text-sm font-semibold hover:bg-slate-200">Temizle</button>
        </section>
        {hata && <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{hata}</p>}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr>{["Referans", "Tarih", "Şube", "Müşteri", "İşlem Tipi", "Borçlu", "Alacaklı", "TL Karşılığı", "Durum", ""].map((baslik, index) => <th key={`${baslik}-${index}`} className="px-5 py-3 font-semibold">{baslik}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filtrelenmisIslemler.map((islem) => (
                  <tr key={islem.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-[#0047b3]">{islem.referansNo}</td>
                    <td className="px-5 py-4">{tarihYaz(islem.islemTarihi)}</td>
                    <td className="px-5 py-4"><span className="block font-semibold">{islem.musteri.sube.ad}</span><span className="text-xs text-slate-400">{islem.musteri.sube.kod}</span></td>
                    <td className="px-5 py-4"><span className="block font-semibold">{islem.musteri.ad} {islem.musteri.soyad}</span><span className="text-xs text-slate-400">{islem.musteriId}</span></td>
                    <td className="px-5 py-4">{islemTipi(islem.referansNo)}</td>
                    <td className="px-5 py-4">{paraYaz(islem.borcluHesap.miktar, islem.borcluHesap.dovizKodu)}</td>
                    <td className="px-5 py-4">{paraYaz(islem.alacakliHesap.miktar, islem.alacakliHesap.dovizKodu)}</td>
                    <td className="px-5 py-4 font-semibold">{paraYaz(islem.tlKarsiligi)}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${islem.tersKayitMi ? "bg-amber-50 text-amber-700" : islem.tersKayitOlusturulduMu ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{islem.tersKayitMi ? "Ters kayıt" : islem.tersKayitOlusturulduMu ? "İptal edildi" : "Tamamlandı"}</span></td>
                    <td className="px-5 py-4"><button type="button" onClick={() => void detayGoster(islem.referansNo)} className="rounded-md border border-blue-200 px-3 py-2 text-xs font-semibold text-[#0047b3] hover:bg-blue-50">Detay</button></td>
                  </tr>
                ))}
                {!yukleniyor && filtrelenmisIslemler.length === 0 && <tr><td colSpan={10} className="px-6 py-14 text-center text-slate-500">Kayıt bulunamadı.</td></tr>}
                {yukleniyor && <tr><td colSpan={10} className="px-6 py-14 text-center text-slate-500">İşlemler yükleniyor...</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-500">Toplam {toplamKayit} kayıt · Sayfa {sayfa} / {toplamSayfa}</p>
            <div className="flex gap-2">
              <button type="button" disabled={sayfa <= 1 || yukleniyor} onClick={() => sayfayiDegistir(Math.max(1, sayfa - 1))} className="rounded-md border border-slate-300 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40">Önceki</button>
              <button type="button" disabled={sayfa >= toplamSayfa || yukleniyor} onClick={() => sayfayiDegistir(Math.min(toplamSayfa, sayfa + 1))} className="rounded-md bg-[#0047b3] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Sonraki</button>
            </div>
          </div>
        </section>

        {(detayYukleniyor || detayHatasi || detay) && (
          <section role="dialog" aria-modal="false" aria-labelledby="islem-detay-basligi" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div><h2 id="islem-detay-basligi" className="text-xl font-bold text-slate-900">İşlem Detayı</h2>{detay && <p className="mt-1 font-mono text-sm text-[#0047b3]">{detay.islem.referansNo}</p>}</div>
              <button type="button" onClick={() => { setDetay(null); setDetayHatasi(""); }} aria-label="İşlem detayını kapat" className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><X className="size-5" /></button>
            </div>
            {detayYukleniyor && <p className="py-8 text-center text-slate-500">Detay yükleniyor...</p>}
            {detayHatasi && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{detayHatasi}</p>}
            {detay && (
              <div className="mt-5 space-y-5">
                <div className="grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div><span className="text-xs text-slate-500">Müşteri</span><p className="font-semibold">{detay.islem.musteri.ad} {detay.islem.musteri.soyad}</p></div>
                  <div><span className="text-xs text-slate-500">Şube</span><p className="font-semibold">{detay.islem.musteri.sube.kod} - {detay.islem.musteri.sube.ad}</p></div>
                  <div><span className="text-xs text-slate-500">İşlem tarihi</span><p className="font-semibold">{tarihYaz(detay.islem.islemTarihi)}</p></div>
                  <div><span className="text-xs text-slate-500">TL karşılığı</span><p className="font-semibold">{paraYaz(detay.islem.tlKarsiligi)}</p></div>
                </div>
                <div>
                  <h3 className="mb-3 font-bold text-slate-900">Hesap hareketleri</h3>
                  <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3">Hareket</th><th className="px-4 py-3">Hesap</th><th className="px-4 py-3">Döviz miktarı</th><th className="px-4 py-3">TL karşılığı</th><th className="px-4 py-3">Tarih</th></tr></thead><tbody className="divide-y divide-slate-100">{detay.hesapHareketleri.map((hareket) => {
                    const borcMu = hareket.hareketTuru === "BORC";
                    const hesap = borcMu ? detay.islem.borcluHesap : detay.islem.alacakliHesap;
                    return <tr key={hareket.id}><td className="px-4 py-3 font-semibold">{hareket.hareketTuru}</td><td className="px-4 py-3">Ek No {hesap.hesapEkNo}</td><td className="px-4 py-3">{paraYaz(hareket.dovizMiktari, hesap.dovizKodu)}</td><td className="px-4 py-3">{paraYaz(hareket.tlKarsiligi)}</td><td className="px-4 py-3">{tarihYaz(hareket.islemTarihi)}</td></tr>;
                  })}{detay.hesapHareketleri.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Hesap hareketi bulunamadı.</td></tr>}</tbody></table></div>
                </div>
                {(detay.islem.tersKayitMi || detay.islem.tersKayitOlusturulduMu) && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-bold">{detay.islem.tersKayitMi ? "Bu kayıt bir ters kayıttır." : "Bu işlem ters kayıt oluşturularak iptal edilmiştir."}</p>
                    {detay.islem.orijinalReferansNo && <p className="mt-1">Orijinal referans: <span className="font-mono">{detay.islem.orijinalReferansNo}</span></p>}
                    {detay.islem.tersKayitReferansNo && <p className="mt-1">Ters kayıt referansı: <span className="font-mono">{detay.islem.tersKayitReferansNo}</span></p>}
                    {detay.islem.iptalNedeni && <p className="mt-1">İptal nedeni: {detay.islem.iptalNedeni}</p>}
                  </div>
                )}
                {iptalEdilebilir && (
                  <form onSubmit={(event) => { event.preventDefault(); void islemiIptalEt(); }} className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <label htmlFor="iptal-nedeni" className="block text-sm font-bold text-red-900">İşlemi iptal et</label>
                    <p className="mt-1 text-xs text-red-700">İptal sonucunda bakiyeleri geri alan bir ters kayıt oluşturulur.</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <input id="iptal-nedeni" value={iptalNedeni} onChange={(event) => setIptalNedeni(event.target.value)} required maxLength={500} placeholder="İptal nedenini yazın" className="h-10 flex-1 rounded-md border border-red-200 bg-white px-3 outline-none focus:ring-2 focus:ring-red-200" />
                      <button type="submit" disabled={iptalEdiliyor || !iptalNedeni.trim()} className="h-10 rounded-md bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50">{iptalEdiliyor ? "İptal ediliyor..." : "İşlemi İptal Et"}</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}
