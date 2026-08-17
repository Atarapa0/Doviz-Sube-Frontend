"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  RefreshCw,
  ServerOff,
} from "lucide-react";

type ErrorPanelProps = {
  status: number;
  hataKodu?: string;
  mesaj?: string;
  hataId?: string;
  correlationId?: string;
  onRetry?: () => void;
  tekrarDeneAdresi?: string;
};

const hataMetinleri: Record<number, { baslik: string; mesaj: string }> = {
  404: {
    baslik: "İstenen içerik bulunamadı",
    mesaj: "Aradığınız sayfa veya kayıt mevcut değil.",
  },
  500: {
    baslik: "Beklenmeyen bir sistem hatası oluştu",
    mesaj: "İşleminiz tamamlanamadı. Lütfen yeniden deneyin.",
  },
  502: {
    baslik: "API bağlantısı kurulamadı",
    mesaj: "Backend sunucusuna şu anda ulaşılamıyor.",
  },
  503: {
    baslik: "Servis geçici olarak kullanılamıyor",
    mesaj: "Bağlı servislerden biri şu anda yanıt vermiyor.",
  },
};

export default function ErrorPanel({
  status,
  hataKodu,
  mesaj,
  hataId,
  correlationId,
  onRetry,
  tekrarDeneAdresi,
}: ErrorPanelProps) {
  const metin = hataMetinleri[status] ?? hataMetinleri[500];
  const BaglantiIkonu = status === 502 || status === 503 ? ServerOff : AlertTriangle;

  function yenidenDene() {
    if (onRetry) {
      onRetry();
      return;
    }

    window.location.replace(tekrarDeneAdresi ?? "/");
  }

  return (
    <section className="mx-auto flex min-h-[65vh] w-full max-w-4xl items-center justify-center">
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 bg-[#0047b3]" />
        <div className="px-6 py-12 text-center sm:px-12">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-50 text-[#0047b3]">
            <BaglantiIkonu className="size-8" />
          </span>

          <p className="mt-6 text-sm font-bold tracking-[0.2em] text-[#0047b3]">
            HATA {status}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {metin.baslik}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            {mesaj || metin.mesaj}
          </p>

          {(hataKodu || hataId || correlationId) && (
            <dl className="mx-auto mt-7 grid max-w-2xl gap-3 rounded-xl bg-slate-50 p-4 text-left text-xs sm:grid-cols-3">
              {hataKodu && (
                <div>
                  <dt className="font-semibold text-slate-500">Hata kodu</dt>
                  <dd className="mt-1 break-all font-mono text-slate-900">{hataKodu}</dd>
                </div>
              )}
              {hataId && (
                <div>
                  <dt className="font-semibold text-slate-500">Takip numarası</dt>
                  <dd className="mt-1 break-all font-mono text-slate-900">{hataId}</dd>
                </div>
              )}
              {correlationId && (
                <div>
                  <dt className="font-semibold text-slate-500">İstek numarası</dt>
                  <dd className="mt-1 break-all font-mono text-slate-900">{correlationId}</dd>
                </div>
              )}
            </dl>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={yenidenDene}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0047b3] px-5 text-sm font-semibold text-white hover:bg-[#003b95]"
            >
              <RefreshCw className="size-4" />
              Tekrar Dene
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" />
              Geri Dön
            </button>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Home className="size-4" />
              Ana Sayfa
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
