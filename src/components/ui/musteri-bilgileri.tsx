"use client";

import { Search } from "lucide-react";
import { KeyboardEvent, useId, useState } from "react";

import { cn } from "@/lib/utils";
import MusteriPopup from "./musteri-popup";

type MusteriNumberEntryProps = {
  value: string;
  onValueChange: (musteriId: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
};

export default function MusteriNumberEntry({
  value,
  onValueChange,
  placeholder = "Müşteri numarası",
  className,
  inputClassName,
  disabled = false,
}: MusteriNumberEntryProps) {
  const [popupAcik, setPopupAcik] = useState(false);
  const [taslakMusteriNo, setTaslakMusteriNo] = useState<string | null>(null);
  const [uyari, setUyari] = useState("");
  const uyariId = useId();
  const gorunenMusteriNo = taslakMusteriNo ?? value;

  function degeriDegistir(girilenDeger: string) {
    setTaslakMusteriNo(girilenDeger.replace(/\D/g, "").slice(0, 6));
    setUyari("");
  }

  function enterIleAra(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    event.stopPropagation();

    if (!/^\d{6}$/.test(gorunenMusteriNo)) {
      setUyari("Müşteri numarası 6 haneli olmalıdır.");
      return;
    }

    setUyari("");
    setTaslakMusteriNo(null);
    onValueChange(gorunenMusteriNo);
  }

  //BURASI AYNI KALACAK 
  function popupSeciminiUygula(musteriId: string) {
    setTaslakMusteriNo(null);
    setUyari("");
    onValueChange(musteriId);
  }
  function popupAc() {
  setPopupAcik(true);
}

function popupKapat() {
  setPopupAcik(false);
}

  return (
    <div className={cn("relative", className)}>
      <input
        inputMode="numeric"
        maxLength={6}
        disabled={disabled}
        value={gorunenMusteriNo}
        onChange={(event) => degeriDegistir(event.target.value)}
        onKeyDown={enterIleAra}
        placeholder={placeholder}
        aria-label="Müşteri numarası"
        aria-invalid={Boolean(uyari)}
        aria-describedby={uyari ? uyariId : undefined}
        autoComplete="off"
        className={cn(
          "h-10 w-full rounded-md border border-slate-300 bg-white px-3 pr-11 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-[#0047b3] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100",
          inputClassName,
        )}
      />
      <button
        type="button"
        disabled={disabled}
        aria-label="Müşteri arama penceresini aç"
        onClick={() => popupAc()}
        className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-[#0047b3] disabled:pointer-events-none"
      >
        <Search className="size-4" />
      </button>

      <MusteriPopup
        isOpen={popupAcik}
        onClose={() => popupKapat()}
        onMusteriSec={popupSeciminiUygula}
      />

      {uyari && (
        <p
          id={uyariId}
          className="mt-1 text-xs font-medium text-amber-700"
        >
          {uyari}
        </p>
      )}
    </div>
  );
}
