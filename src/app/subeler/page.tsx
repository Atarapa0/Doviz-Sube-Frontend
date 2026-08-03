"use client";

import Link from "next/link";
import { Building2, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AppShell from "@/components/layout/AppShell";
import PageHeading from "@/components/layout/PageHeading";
import { subeleriGetir } from "@/services/sube-service";
import type { Sube } from "@/types/api";

export default function SubelerPage() {
  const [subeler, setSubeler] = useState<Sube[]>([]);
  const [arama, setArama] = useState("");
  const [durum, setDurum] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");

  useEffect(() => {
    subeleriGetir()
      .then(setSubeler)
      .catch((error: unknown) =>
        setHata(error instanceof Error ? error.message : "Şubeler alınamadı."),
      )
      .finally(() => setYukleniyor(false));
  }, []);

  const filtrelenmisSubeler = useMemo(() => {
    const metin = arama.trim().toLocaleLowerCase("tr-TR");
    return subeler.filter((sube) => {
      const metinUyuyor =
        !metin ||
        `${sube.kod} ${sube.ad}`.toLocaleLowerCase("tr-TR").includes(metin);
      const durumUyuyor =
        !durum || (durum === "aktif" ? sube.aktifMi : !sube.aktifMi);
      return metinUyuyor && durumUyuyor;
    });
  }, [arama, durum, subeler]);

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <PageHeading
            title="Şubeler"
            description="Bankaya kayıtlı şubeleri, tam adlarını ve müşteri sayılarını görüntüleyin."
            icon={Building2}
          />
          <Link
            href="/yeni-sube"
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-[#0047b3] px-5 text-sm font-semibold text-white hover:bg-[#003b95]"
          >
            <Plus className="size-4" />
            Yeni Şube Ekle
          </Link>
        </div>

        <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_220px_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            <input
              value={arama}
              onChange={(event) => setArama(event.target.value)}
              placeholder="Şube kodu veya tam adını ara"
              className="h-10 w-full rounded-md border border-slate-300 pl-10 pr-3 outline-none focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <select
            value={durum}
            onChange={(event) => setDurum(event.target.value)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3"
          >
            <option value="">Tüm durumlar</option>
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setArama("");
              setDurum("");
            }}
            className="h-10 rounded-md bg-slate-100 px-5 text-sm font-semibold hover:bg-slate-200"
          >
            Temizle
          </button>
        </section>

        {hata && (
          <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">
            {hata}
          </p>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {["Şube Kodu", "Tam Şube Adı", "Müşteri Sayısı", "Oluşturma Tarihi", "Durum"].map(
                    (baslik) => (
                      <th key={baslik} className="px-6 py-3 font-semibold">
                        {baslik}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrelenmisSubeler.map((sube) => (
                  <tr key={sube.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-[#0047b3]">{sube.kod}</td>
                    <td className="px-6 py-4 font-semibold">{sube.ad}</td>
                    <td className="px-6 py-4">{sube.musteriSayisi ?? "—"}</td>
                    <td className="px-6 py-4">
                      {sube.olusturmaTarihi
                        ? new Intl.DateTimeFormat("tr-TR").format(
                            new Date(sube.olusturmaTarihi),
                          )
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          sube.aktifMi
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {sube.aktifMi ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                  </tr>
                ))}
                {yukleniyor && (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-slate-500">
                      Şubeler yükleniyor...
                    </td>
                  </tr>
                )}
                {!yukleniyor && filtrelenmisSubeler.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-slate-500">
                      Şube bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
