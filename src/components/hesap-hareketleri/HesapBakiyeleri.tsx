import { paraYaz } from "@/lib/formatters";
import type { HesapHareketleriResponse } from "@/types/api";

type HesapBakiyeleriProps = {
  cevaplar: HesapHareketleriResponse[];
};

export function HesapBakiyeleri({ cevaplar }: HesapBakiyeleriProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-bold text-slate-900">Hesap Bakiyeleri</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cevaplar.map((cevap) => (
          <div
            key={cevap.hesap.hesapEkNo}
            className="rounded-lg border border-slate-200 p-4"
          >
            <span className="text-xs text-slate-500">
              Ek No {cevap.hesap.hesapEkNo}
            </span>
            <p className="mt-1 font-bold text-[#0047b3]">
              {cevap.hesap.dovizKodu} · {cevap.hesap.dovizAdi}
            </p>
            <p className="mt-2 text-sm font-semibold">
              {paraYaz(cevap.hesap.bakiye, cevap.hesap.dovizKodu)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
