"use client";

import { ArrowRight, ArrowRightLeft, Info } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import AppShell from "@/components/layout/AppShell";
import PageHeading from "@/components/layout/PageHeading";
import { useMusteri } from "@/components/providers/MusteriProvider";
import MusteriCombobox from "@/components/ui/musteri-bilgileri";
import { paraYaz } from "@/lib/formatters";
import { arbitrajHesapla } from "@/services/arbitraj-service";
import { dovizCevir } from "@/services/doviz-service";
import { musteriHesaplariniGetir } from "@/services/musteri-service";
import type { ArbitrajHesaplaResponse, MusteriHesapResponse } from "@/types/api";

export default function ArbitrajPage() {
  const { musteriSec } = useMusteri();
  const [musteriId, setMusteriId] = useState("");
  const [musteri, setMusteri] = useState<MusteriHesapResponse | null>(null);
  const [borcluEkNo, setBorcluEkNo] = useState("");
  const [alacakliEkNo, setAlacakliEkNo] = useState("");
  const [miktar, setMiktar] = useState("");
  const [onizleme, setOnizleme] = useState<ArbitrajHesaplaResponse | null>(null);
  const [hesaplamaMesaji, setHesaplamaMesaji] = useState("");
  const [hesaplaniyor, setHesaplaniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [basarili, setBasarili] = useState(false);
  const [isleniyor, setIsleniyor] = useState(false);
  const hesaplamaIstekIdRef = useRef(0);

  async function musteriGetir(id: string) {
    setMusteriId(id);
    setMusteri(null);
    setBorcluEkNo("");
    setAlacakliEkNo("");
    setOnizleme(null);
    setHesaplamaMesaji("");
    setMesaj("");

    if (!/^\d{6}$/.test(id)) {
      setMesaj("");
      return;
    }

    try {
      const data = await musteriHesaplariniGetir(id);
      setMusteri(data);
      musteriSec(data);
    } catch (error) {
      setMesaj(error instanceof Error ? error.message : "Müşteri bulunamadı.");
    }
  }

  const borclu = musteri?.hesaplar.find(
    (hesap) => hesap.hesapEkNo.toString() === borcluEkNo,
  );
  const alacakli = musteri?.hesaplar.find(
    (hesap) => hesap.hesapEkNo.toString() === alacakliEkNo,
  );
  const baslangicMiktari = Number(miktar);
  const birinciAdim = onizleme?.adimlar[0] ?? null;
  const kaynakMiktar = birinciAdim?.girisMiktari ?? null;
  const hedefMiktar = birinciAdim?.cikisMiktari ?? null;
  const caprazKur = birinciAdim
    ? birinciAdim.kaynakAlisKuru / birinciAdim.hedefSatisKuru
    : null;
  const bakiyeYetersiz = Boolean(
    borclu && kaynakMiktar != null && kaynakMiktar > borclu.bakiye,
  );
  const onizlemeHazir = Boolean(
    borclu && alacakli && kaynakMiktar != null && hedefMiktar != null,
  );

  useEffect(() => {
    const istekId = ++hesaplamaIstekIdRef.current;

    if (
      !borclu ||
      !alacakli ||
      !Number.isFinite(baslangicMiktari) ||
      baslangicMiktari <= 0
    ) {
      return;
    }

    const zamanlayici = window.setTimeout(async () => {
      setHesaplaniyor(true);
      setHesaplamaMesaji("");

      try {
        const sonuc = await arbitrajHesapla({
          baslangicDovizKodu: borclu.dovizKodu,
          birinciAraDovizKodu: alacakli.dovizKodu,
          ikinciAraDovizKodu: "TRY",
          baslangicMiktari,
        });

        if (istekId !== hesaplamaIstekIdRef.current) return;
        setOnizleme(sonuc);
      } catch (error) {
        if (istekId !== hesaplamaIstekIdRef.current) return;
        setOnizleme(null);
        setHesaplamaMesaji(
          error instanceof Error
            ? error.message
            : "Arbitraj önizlemesi hesaplanamadı.",
        );
      } finally {
        if (istekId === hesaplamaIstekIdRef.current) setHesaplaniyor(false);
      }
    }, 300);

    return () => window.clearTimeout(zamanlayici);
  }, [alacakli, baslangicMiktari, borclu]);

  async function islemiYap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!musteri || !borclu || !alacakli || kaynakMiktar == null) return;

    if (borcluEkNo === alacakliEkNo) {
      setMesaj("Borçlu ve alacaklı hesap farklı olmalıdır.");
      return;
    }

    if (bakiyeYetersiz) {
      setMesaj("Borçlu hesabın bakiyesi bu işlem için yetersiz.");
      return;
    }

    setIsleniyor(true);
    setBasarili(false);
    setMesaj("");

    try {
      const sonuc = await dovizCevir({
        musteriId: musteri.id,
        borcluHesapEkNo: borclu.hesapEkNo,
        alacakliHesapEkNo: alacakli.hesapEkNo,
        odenecekDovizMiktari: kaynakMiktar,
      });
      const referans =
        "referansNo" in sonuc ? ` Referans: ${String(sonuc.referansNo)}` : "";
      const guncel = await musteriHesaplariniGetir(musteri.id);

      setMusteri(guncel);
      musteriSec(guncel);
      setBasarili(true);
      setMesaj(`Arbitraj işlemi başarılı.${referans}`);
      setMiktar("");
      setOnizleme(null);
    } catch (error) {
      setMesaj(error instanceof Error ? error.message : "Arbitraj işlemi yapılamadı.");
    } finally {
      setIsleniyor(false);
    }
  }

  const yabanciParaHesaplari =
    musteri?.hesaplar.filter((hesap) => hesap.dovizKodu !== "TRY") ?? [];

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1250px] flex-col gap-6">
        <PageHeading
          title="Arbitraj"
          description="Aynı müşterinin iki farklı yabancı para hesabı arasındaki işlemi önce inceleyin, sonra gerçekleştirin."
          icon={ArrowRightLeft}
        />

        <form
          onSubmit={islemiYap}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Müşteri ID
              <MusteriCombobox
                value={musteriId}
                onValueChange={(id) => void musteriGetir(id)}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold">
              Borçlu Hesap
              <select
                required
                disabled={!musteri}
                value={borcluEkNo}
                onChange={(event) => {
                  setBorcluEkNo(event.target.value);
                  setAlacakliEkNo("");
                  setOnizleme(null);
                  setHesaplamaMesaji("");
                }}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 font-normal"
              >
                <option value="">Seçiniz</option>
                {yabanciParaHesaplari.map((hesap) => (
                  <option key={hesap.hesapEkNo} value={hesap.hesapEkNo}>
                    {hesap.hesapEkNo} - {hesap.dovizKodu} -{" "}
                    {paraYaz(hesap.bakiye, hesap.dovizKodu)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold">
              Alacaklı Hesap
              <select
                required
                disabled={!borcluEkNo}
                value={alacakliEkNo}
                onChange={(event) => {
                  setAlacakliEkNo(event.target.value);
                  setOnizleme(null);
                  setHesaplamaMesaji("");
                }}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 font-normal"
              >
                <option value="">Seçiniz</option>
                {yabanciParaHesaplari
                  .filter((hesap) => hesap.hesapEkNo.toString() !== borcluEkNo)
                  .map((hesap) => (
                    <option key={hesap.hesapEkNo} value={hesap.hesapEkNo}>
                      {hesap.hesapEkNo} - {hesap.dovizKodu} -{" "}
                      {paraYaz(hesap.bakiye, hesap.dovizKodu)}
                    </option>
                  ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold">
              Başlangıç Miktarı
              <input
                required
                type="number"
                min="1"
                step="0.0001"
                value={miktar}
                onChange={(event) => {
                  setMiktar(event.target.value);
                  setOnizleme(null);
                  setHesaplamaMesaji("");
                }}
                placeholder="0,00"
                className="h-10 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          {musteri && yabanciParaHesaplari.length < 2 && (
            <p className="mt-5 rounded-md bg-amber-50 p-3 text-sm font-semibold text-amber-700">
              Arbitraj için müşterinin farklı döviz cinslerinde en az iki yabancı
              para hesabı bulunmalıdır.
            </p>
          )}

          {mesaj && (
            <p
              className={`mt-5 rounded-md p-3 text-sm font-semibold ${
                basarili
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {mesaj}
            </p>
          )}

          {hesaplamaMesaji && (
            <p className="mt-5 rounded-md bg-amber-50 p-3 text-sm font-semibold text-amber-700">
              {hesaplamaMesaji}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              disabled={
                !onizlemeHazir ||
                bakiyeYetersiz ||
                hesaplaniyor ||
                isleniyor
              }
              type="submit"
              className="h-10 w-full rounded-md bg-[#0047b3] px-6 text-sm font-semibold text-white hover:bg-[#003b95] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {hesaplaniyor
                ? "Hesaplanıyor..."
                : isleniyor
                  ? "Gerçekleştiriliyor..."
                  : "Arbitrajı Gerçekleştir"}
            </button>
          </div>
        </form>

        {onizlemeHazir &&
          musteri &&
          borclu &&
          alacakli &&
          kaynakMiktar != null &&
          hedefMiktar != null && (
          <section className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#0047b3]">İşlem Önizlemesi</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {musteri.ad} {musteri.soyad} · {musteri.sube.kod} -{" "}
                  {musteri.sube.ad}
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0047b3]">
                API Hesabı
              </span>
            </div>

            <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-lg border border-red-200 bg-red-50/50 p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  Borçlu Hesaptan Düşecek
                </span>
                <p className="mt-2 text-2xl font-bold text-red-700">
                  -{paraYaz(kaynakMiktar, borclu.dovizKodu)}
                </p>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Hesap</dt>
                    <dd className="font-semibold">
                      {borclu.hesapEkNo} · {borclu.dovizKodu}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Mevcut bakiye</dt>
                    <dd className="font-semibold">
                      {paraYaz(borclu.bakiye, borclu.dovizKodu)}
                    </dd>
                  </div>
                  <div className="col-span-2 border-t border-red-200 pt-3">
                    <dt className="text-xs text-slate-500">İşlem sonrası</dt>
                    <dd className={`font-bold ${bakiyeYetersiz ? "text-red-700" : "text-slate-900"}`}>
                      {paraYaz(borclu.bakiye - kaynakMiktar, borclu.dovizKodu)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col items-center justify-center gap-2 px-3 text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-blue-50 text-[#0047b3]">
                  <ArrowRight className="size-5 rotate-90 lg:rotate-0" />
                </span>
                {caprazKur != null && (
                  <p className="max-w-40 text-xs font-semibold text-slate-600">
                    1 {borclu.dovizKodu} ≈ {caprazKur.toFixed(6)}{" "}
                    {alacakli.dovizKodu}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Alacaklı Hesaba Geçecek
                </span>
                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  +{paraYaz(hedefMiktar, alacakli.dovizKodu)}
                </p>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Hesap</dt>
                    <dd className="font-semibold">
                      {alacakli.hesapEkNo} · {alacakli.dovizKodu}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Mevcut bakiye</dt>
                    <dd className="font-semibold">
                      {paraYaz(alacakli.bakiye, alacakli.dovizKodu)}
                    </dd>
                  </div>
                  <div className="col-span-2 border-t border-emerald-200 pt-3">
                    <dt className="text-xs text-slate-500">İşlem sonrası</dt>
                    <dd className="font-bold text-slate-900">
                      {paraYaz(alacakli.bakiye + hedefMiktar, alacakli.dovizKodu)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {bakiyeYetersiz && (
              <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">
                Borçlu hesabın bakiyesi yetersiz. Tahmini gereken tutar{" "}
                {paraYaz(kaynakMiktar, borclu.dovizKodu)}.
              </p>
            )}

            <div className="mt-4 flex gap-2 rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              <Info className="mt-0.5 size-4 shrink-0 text-[#0047b3]" />
              <p>
                Bu önizleme backend tarafından {borclu.dovizKodu} →{" "}
                {alacakli.dovizKodu} → TRY → {borclu.dovizKodu} rotasıyla,
                {onizleme?.kurTarihi ? ` ${onizleme.kurTarihi} tarihli` : " güncel"}{" "}
                TCMB kurları kullanılarak hesaplandı. {onizleme?.aciklama}{" "}
                Başlangıç sonunda {onizleme && paraYaz(onizleme.sonMiktar, onizleme.baslangicDovizKodu)};
                kâr/zarar {onizleme && paraYaz(onizleme.karZararTutari, onizleme.baslangicDovizKodu)}
                ({onizleme?.karZararOrani.toFixed(4)}%).
              </p>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
