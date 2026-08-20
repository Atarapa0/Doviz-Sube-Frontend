"use client";

import { Search, Trash2, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  musteriAra,
  musteriHesaplariniGetir,
  musterileriGetir,
} from "@/services/musteri-service";
import type {
  MusteriAramaSonucu,
  MusteriHesapResponse,
} from "@/types/api";

type MusteriPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onMusteriSec: (musteriId: string) => void;
};

type AramaKriterleri = {
  musteriNo: string;
  ad: string;
  soyad: string;
  subeKodu: string;
  subeAdi: string;
};

const bosKriterler: AramaKriterleri = {
  musteriNo: "",
  ad: "",
  soyad: "",
  subeKodu: "",
  subeAdi: "",
};

function metniKucult(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR");
}

function bakiyeYaz(bakiye: number, dovizKodu: string) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(bakiye) + ` ${dovizKodu}`;
}

export default function MusteriPopup({
  isOpen,
  onClose,
  onMusteriSec,
}: MusteriPopupProps) {
  const [kriterler, setKriterler] = useState<AramaKriterleri>(bosKriterler);
  const [sonuclar, setSonuclar] = useState<MusteriAramaSonucu[]>([]);
  const [secilenMusteri, setSecilenMusteri] =
    useState<MusteriHesapResponse | null>(null);
  const [araniyor, setAraniyor] = useState(false);
  const [hesaplarYukleniyor, setHesaplarYukleniyor] = useState(false);
  const [aramaYapildi, setAramaYapildi] = useState(false);
  const [hata, setHata] = useState("");
  const sonucAlaniRef = useRef<HTMLDivElement>(null);
  const hesapAlaniRef = useRef<HTMLElement>(null);

  function mobildeAlanaGit(alan: HTMLElement | null) {
    if (!alan || !window.matchMedia("(max-width: 1023px)").matches) return;
    window.requestAnimationFrame(() => {
      alan.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  useEffect(() => {
    if (!isOpen) return;
    function escapeIleKapat(event: KeyboardEvent) {
      if (event.key === "Escape" ) onClose();
     // if (event.key === "Enter" /*&& secilenMusteri) onMusteriSec(secilenMusteri.id.toString());*/) secimiKullan();
    }

    document.addEventListener("keydown", escapeIleKapat);
    return () => document.removeEventListener("keydown", escapeIleKapat);
  }, [isOpen, onClose]);


  function kriteriDegistir(alan: keyof AramaKriterleri, value: string) {
    const yeniDeger =
      alan === "musteriNo" || alan === "subeKodu"
        ? value.replace(/\D/g, "")
        : value;
    setKriterler((mevcut) => ({ ...mevcut, [alan]: yeniDeger }));
  }
  function temizle() {
    setKriterler(bosKriterler);
    setSonuclar([]);
    setSecilenMusteri(null);
    setAramaYapildi(false);
    setHata("");
  }

  async function ara() {
    setAraniyor(true);
    setHata("");
    setSecilenMusteri(null);

    try {
      // Arama API'si tek bir `q` değeri kabul ediyor. En ayırt edici kriteri
      // API'ye gönderip diğer alanları dönen sonuçlar üzerinde daraltıyoruz.
      const serbestArama =
        kriterler.musteriNo || kriterler.ad || kriterler.soyad;

      const bulunanlar = serbestArama
        ? await musteriAra(serbestArama, 50)
        : (
            await musterileriGetir({
              page: 1,
              pageSize: 100,
              subeKodu: kriterler.subeKodu || undefined,
            })
          ).items;

      const filtrelenmis = bulunanlar.filter((musteri) => {
        const ad = metniKucult(kriterler.ad);
        const soyad = metniKucult(kriterler.soyad);
        const subeAdi = metniKucult(kriterler.subeAdi);

        return (
          (!kriterler.musteriNo ||
            musteri.id.toString().includes(kriterler.musteriNo)) &&
          (!ad || metniKucult(musteri.ad).includes(ad)) &&
          (!soyad || metniKucult(musteri.soyad).includes(soyad)) &&
          (!kriterler.subeKodu ||
            musteri.sube.kod.includes(kriterler.subeKodu)) &&
          (!subeAdi || metniKucult(musteri.sube.ad).includes(subeAdi)) &&
          musteri.aktifMi
        );
      });

      setSonuclar(filtrelenmis);
      setAramaYapildi(true);
      mobildeAlanaGit(sonucAlaniRef.current);
    } catch (error) {
      setSonuclar([]);
      setAramaYapildi(true);
      setHata(error instanceof Error ? error.message : "Müşteriler aranamadı.");
    } finally {
      setAraniyor(false);
    }
  }

  function enterIleAra(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (
      event.key !== "Enter" ||
      araniyor ||
      (event.target as HTMLElement).closest("button")
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    void ara();
  }

  async function musteriSatiriniSec(musteri: MusteriAramaSonucu) {
    setHesaplarYukleniyor(true);
    setHata("");

    try {
      const detay = await musteriHesaplariniGetir(musteri.id);
      setSecilenMusteri(detay);
      mobildeAlanaGit(hesapAlaniRef.current);
    } catch (error) {
      setSecilenMusteri(null);
      setHata(
        error instanceof Error
          ? error.message
          : "Müşterinin hesapları getirilemedi.",
      );
    } finally {
      setHesaplarYukleniyor(false);
    }
  }

  function secimiKullan() {
    if (!secilenMusteri) return;
    onMusteriSec(secilenMusteri.id. toString());
    onClose();
  }

  if (!isOpen ) return null;
  return (<div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-0 backdrop-blur-[2px] sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="musteri-popup-baslik"
        className="flex h-svh max-h-svh w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h2 id="musteri-popup-baslik" className="text-lg font-bold text-slate-900">
              Müşteri ve Hesap Sorgulama
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Arama kriterlerini girin, müşteriyi ve kullanacağınız hesabı görüntüleyin.
            </p>
          </div>
          <Button className="shrink-0" type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Pencereyi kapat">
            <X />
          </Button>
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2 sm:px-5">
          <Button type="button" variant="ghost" onClick={temizle}>
            <Trash2 /> Temizle
          </Button>
          <Button type="button" onClick={() => void ara()} className="bg-[#0047b3] text-white hover:bg-[#00398f] max-sm:flex-1">
            <Search /> Bütün Müşterileri Getir
          </Button>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto bg-slate-50 p-3 sm:p-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div
            onKeyDown={enterIleAra}
            className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h3 className="mb-4 text-sm font-bold text-[#0047b3]">Arama Kriterleri</h3>
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700">
                Müşteri No
                <Input autoFocus inputMode="numeric" value={kriterler.musteriNo} onChange={(event) => kriteriDegistir("musteriNo", event.target.value)} className="mt-1 h-10" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Ad
                <Input value={kriterler.ad} onChange={(event) => kriteriDegistir("ad", event.target.value)} className="mt-1 h-10" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Soyad
                <Input value={kriterler.soyad} onChange={(event) => kriteriDegistir("soyad", event.target.value)} className="mt-1 h-10" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Şube Kodu
                <Input inputMode="numeric" maxLength={4} value={kriterler.subeKodu} onChange={(event) => kriteriDegistir("subeKodu", event.target.value)} className="mt-1 h-10" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Şube Adı
                <Input value={kriterler.subeAdi} onChange={(event) => kriteriDegistir("subeAdi", event.target.value)} className="mt-1 h-10" />
              </label>
            </div>
            <Button
              type="button"
              onClick={() => void ara()}
              disabled={araniyor}
              className="mt-5 h-10 w-full bg-[#0047b3] text-white hover:bg-[#00398f]"
            >
              <Search /> {araniyor ? "Aranıyor..." : "Müşteri Ara"}
            </Button>
          </div>

          <div ref={sonucAlaniRef} className="flex min-h-0 scroll-mt-3 flex-col gap-4 lg:grid lg:min-h-[560px] lg:grid-rows-[minmax(250px,1fr)_minmax(220px,0.8fr)]">
            <section className="min-h-0 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-bold text-[#0047b3]">Arama Sonuçları</h3>
                <span className="text-xs text-slate-500">{sonuclar.length} müşteri</span>
              </div>
              <div className="max-h-[300px] overflow-auto">
                <div className="divide-y divide-slate-100 md:hidden">
                  {sonuclar.map((musteri) => (
                    <button
                      key={musteri.id}
                      type="button"
                      onClick={() => void musteriSatiriniSec(musteri)}
                      className={`w-full p-4 text-left ${secilenMusteri?.id === musteri.id ? "bg-blue-50" : "bg-white"}`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <strong className="text-sm text-slate-900">{musteri.ad} {musteri.soyad}</strong>
                        <span className="shrink-0 text-xs font-bold text-[#0047b3]">#{musteri.id}</span>
                      </span>
                      <span className="mt-2 block text-xs text-slate-500">
                        {musteri.sube.kod} · {musteri.sube.ad}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">{musteri.hesapSayisi} hesap</span>
                    </button>
                  ))}
                </div>
                <div className="hidden md:block">
                  <Table className="min-w-[680px]">
                    <TableHeader className="sticky top-0 bg-slate-100">
                      <TableRow>
                        <TableHead>Müşteri No</TableHead>
                        <TableHead>Ad</TableHead>
                        <TableHead>Soyad</TableHead>
                        <TableHead>Şube Kodu</TableHead>
                        <TableHead>Şube Adı</TableHead>
                        <TableHead className="text-right">Hesap</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sonuclar.map((musteri) => (
                        <TableRow
                          key={musteri.id}
                          data-state={secilenMusteri?.id === musteri.id ? "selected" : undefined}
                          onClick={() => void musteriSatiriniSec(musteri)}
                          onDoubleClick={secimiKullan}
                          className="cursor-pointer"
                        >
                          <TableCell className="font-semibold">{musteri.id}</TableCell>
                          <TableCell>{musteri.ad}</TableCell>
                          <TableCell>{musteri.soyad}</TableCell>
                          <TableCell>{musteri.sube.kod}</TableCell>
                          <TableCell>{musteri.sube.ad}</TableCell>
                          <TableCell className="text-right">{musteri.hesapSayisi}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {!aramaYapildi && !araniyor && (
                  <p className="p-10 text-center text-sm text-slate-500">Kriterleri girip Ara butonuna basın.</p>
                )}
                {aramaYapildi && !araniyor && sonuclar.length === 0 && !hata && (
                  <p className="p-10 text-center text-sm text-slate-500">Kriterlere uygun aktif müşteri bulunamadı.</p>
                )}
                {araniyor && <p className="p-10 text-center text-sm text-slate-500">Müşteriler getiriliyor...</p>}
              </div>
            </section>

            <section ref={hesapAlaniRef} className="min-h-0 shrink-0 scroll-mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <UserRound className="size-4 text-[#0047b3]" />
                  <h3 className="truncate text-sm font-bold text-[#0047b3]">
                    {secilenMusteri
                      ? `${secilenMusteri.id} - ${secilenMusteri.ad} ${secilenMusteri.soyad}`
                      : "Seçilen Müşterinin Ek Noları"}
                  </h3>
                </div>
                {secilenMusteri && <span className="hidden shrink-0 text-xs text-slate-500 sm:block">{secilenMusteri.sube.kod} - {secilenMusteri.sube.ad}</span>}
              </div>
              <div className="max-h-[250px] overflow-auto">
                <div className="grid gap-2 p-3 md:hidden">
                  {secilenMusteri?.hesaplar.map((hesap) => (
                    <div key={`${hesap.hesapEkNo}-${hesap.dovizKodu}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <strong className="text-sm text-[#0047b3]">{hesap.dovizKodu} · Ek {hesap.hesapEkNo}</strong>
                        <span className={`text-xs font-semibold ${hesap.aktifMi ? "text-emerald-700" : "text-red-700"}`}>{hesap.aktifMi ? "Aktif" : "Pasif"}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{hesap.dovizAdi}</p>
                      <p className="mt-2 text-sm font-bold text-slate-900">{bakiyeYaz(hesap.bakiye, hesap.dovizKodu)}</p>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block">
                  <Table className="min-w-[560px]">
                    <TableHeader className="sticky top-0 bg-slate-100">
                      <TableRow>
                        <TableHead>Ek No</TableHead>
                        <TableHead>Döviz Kodu</TableHead>
                        <TableHead>Döviz Adı</TableHead>
                        <TableHead>Bakiye</TableHead>
                        <TableHead>Durum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {secilenMusteri?.hesaplar.map((hesap) => (
                        <TableRow key={`${hesap.hesapEkNo}-${hesap.dovizKodu}`}>
                          <TableCell className="font-semibold">{hesap.hesapEkNo}</TableCell>
                          <TableCell>{hesap.dovizKodu}</TableCell>
                          <TableCell>{hesap.dovizAdi}</TableCell>
                          <TableCell>{bakiyeYaz(hesap.bakiye, hesap.dovizKodu)}</TableCell>
                          <TableCell>
                            <span className={hesap.aktifMi ? "text-emerald-700" : "text-red-700"}>{hesap.aktifMi ? "Aktif" : "Pasif"}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {!secilenMusteri && !hesaplarYukleniyor && <p className="p-8 text-center text-sm text-slate-500">Hesaplarını görmek için üst tablodan bir müşteri seçin.</p>}
                {hesaplarYukleniyor && <p className="p-8 text-center text-sm text-slate-500">Müşteri hesapları getiriliyor...</p>}
              </div>
            </section>
          </div>
        </div>

        {hata && <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 sm:px-5">{hata}</p>}
        <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
          <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={onClose}>İptal</Button>
          <Button type="button" disabled={!secilenMusteri || hesaplarYukleniyor} onClick={secimiKullan} className="w-full bg-[#0047b3] text-white hover:bg-[#00398f] sm:w-auto">Seçili Müşteriyi Kullan</Button>
        </footer>
      </section>
    </div>);
}
