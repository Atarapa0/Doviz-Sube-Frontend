export function paraYaz(deger: number, dovizKodu = "TRY") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: dovizKodu,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(deger);
}

export function tarihYaz(deger: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(deger));
}
