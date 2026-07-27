"use client";

import Header from "@/app/companents/Header";
import Sidebar from "@/app/companents/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft, Banknote, WalletCards } from "lucide-react";

import { CSSProperties, FormEvent, useEffect, useState } from "react";

type Doviz = {
  id: number;
  kod: string;
  name: string;
  birim: number;
};

type Kur = {
  kod: string;
  isim: string;
  birim: number;
  dovizAlis: number | null;
  dovizSatis: number | null;
};

type KurResponse = {
  tarih: string;
  kurlar: Kur[];
};

function birimKurunuBul(
  dovizKodu: string,
  kurTuru: "alis" | "satis",
  kurlar: Kur[],
) {
  if (dovizKodu === "TRY") return 1;

  const kur = kurlar.find((item) => item.kod === dovizKodu);
  const deger = kurTuru === "alis" ? kur?.dovizAlis : kur?.dovizSatis;

  if (!kur || deger == null) return null;
  return deger / kur.birim;
}

function miktariHesapla(
  kaynak: "alinacak" | "odenecek",
  miktar: number,
  alinacakDoviz: string,
  odenecekDoviz: string,
  kurlar: Kur[],
) {
  const alisKuru = birimKurunuBul(alinacakDoviz, "alis", kurlar);
  const satisKuru = birimKurunuBul(odenecekDoviz, "satis", kurlar);

  if (alisKuru == null || satisKuru == null) return null;

  return kaynak === "alinacak"
    ? (miktar * alisKuru) / satisKuru
    : (miktar * satisKuru) / alisKuru;
}

function miktariYaz(value: number) {
  return Number(value.toFixed(4)).toString();
}


export default function Home() {
  const [dovizler, setDovizler] = useState<Doviz[]>([]);
  const [kurlar, setKurlar] = useState<Kur[]>([]);
  const [kurTarihi, setKurTarihi] = useState("");
  const [secilenDoviz, setSecilenDoviz] = useState("");
  const [alinacakDoviz, setAlinacakDoviz] = useState("");
  const [odenecekDoviz, setOdenecekDoviz] = useState("");
  const [alinacakMiktar, setAlinacakMiktar] = useState("");
  const [odenecekMiktar, setOdenecekMiktar] = useState("");
  const [sonMiktarAlani, setSonMiktarAlani] = useState<"alinacak" | "odenecek">("alinacak");
  const [islemKaynagi, setIslemKaynagi] = useState("");
  const [odemeSekli, setOdemeSekli] = useState("");
  const [miktar, setMiktar] = useState("");
  const [islemTipi, setIslemTipi] = useState("satis");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");
  const [hesaplamaHatasi, setHesaplamaHatasi] = useState("");
  const [islemSonucu, setIslemSonucu] = useState({ kaynak: "", sonuc: "" });

  useEffect(() => {
    void dovizVeKurlariGetir();
  }, []);

  
  async function dovizVeKurlariGetir() {
      try {
        setHata("");
        const [dovizResponse, kurResponse] = await Promise.all([
          fetch("/api/dovizler"),
          fetch("/api/kurlar"),
        ]);

        if (!dovizResponse.ok || !kurResponse.ok) {
          throw new Error(
            `API isteği başarısız: döviz=${dovizResponse.status}, kur=${kurResponse.status}`,
          );
        }

        const dovizData: unknown = await dovizResponse.json();
        const kurData: unknown = await kurResponse.json();

        if (!Array.isArray(dovizData)) {
          throw new Error("API beklenen döviz listesini döndürmedi.");
        }

        if (
          typeof kurData !== "object" ||
          kurData === null ||
          !Array.isArray((kurData as KurResponse).kurlar)
        ) {
          throw new Error("API beklenen kur listesini döndürmedi.");
        }

        const kurSonucu = kurData as KurResponse;
        setDovizler(dovizData as Doviz[]);
        setKurlar(kurSonucu.kurlar);
        setKurTarihi(kurSonucu.tarih);
      } catch (error) {
        console.error("Döviz veya kurlar alınamadı:", error);
        setHata("Döviz ve kur bilgileri getirilemedi. API'nin çalıştığını kontrol edin.");
      } finally {
        setYukleniyor(false);
      }
    }

  function karsiligiGuncelle(
    kaynak: "alinacak" | "odenecek",
    miktarDegeri: string,
    yeniAlinacakDoviz = alinacakDoviz,
    yeniOdenecekDoviz = odenecekDoviz,
  ) {
    if (!miktarDegeri || !yeniAlinacakDoviz || !yeniOdenecekDoviz) {
      if (kaynak === "alinacak") setOdenecekMiktar("");
      else setAlinacakMiktar("");
      return;
    }

    const sonuc = miktariHesapla(
      kaynak,
      Number(miktarDegeri),
      yeniAlinacakDoviz,
      yeniOdenecekDoviz,
      kurlar,
    );

    if (sonuc == null) {
      setHesaplamaHatasi("Seçilen döviz için alış veya satış kuru bulunamadı.");
      return;
    }

    setHesaplamaHatasi("");
    if (kaynak === "alinacak") setOdenecekMiktar(miktariYaz(sonuc));
    else setAlinacakMiktar(miktariYaz(sonuc));
  }

  function alinacakDoviziDegistir(yeniDoviz: string) {
    setAlinacakDoviz(yeniDoviz);
    const kaynakMiktar = sonMiktarAlani === "alinacak" ? alinacakMiktar : odenecekMiktar;
    karsiligiGuncelle(sonMiktarAlani, kaynakMiktar, yeniDoviz, odenecekDoviz);
  }

  function odenecekDoviziDegistir(yeniDoviz: string) {
    setOdenecekDoviz(yeniDoviz);
    const kaynakMiktar = sonMiktarAlani === "alinacak" ? alinacakMiktar : odenecekMiktar;
    karsiligiGuncelle(sonMiktarAlani, kaynakMiktar, alinacakDoviz, yeniDoviz);
  }

  function alinacakMiktariDegistir(yeniMiktar: string) {
    setSonMiktarAlani("alinacak");
    setAlinacakMiktar(yeniMiktar);
    karsiligiGuncelle("alinacak", yeniMiktar);
  }

  function odenecekMiktariDegistir(yeniMiktar: string) {
    setSonMiktarAlani("odenecek");
    setOdenecekMiktar(yeniMiktar);
    karsiligiGuncelle("odenecek", yeniMiktar);
  }

  function formTemizle() {
    setMiktar("");
    setAlinacakMiktar("");
    setOdenecekMiktar("");
    setHesaplamaHatasi("");
    setIslemTipi("");
    setSecilenDoviz("");
  }

  function islemYap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    alert("İşlem bilgileri hazır.");
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "260px" } as CSSProperties}
      className="bg-[#f9fafb]"
    >

      {/* Sol Menü */}
      <Sidebar />

      {/* Sağ Taraf Kapsayıcı */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Üst Bilgi */}
        <Header />
        <main style={{ padding: "30px" }}>


          {yukleniyor && <p>Dövizler yükleniyor...</p>}
          {hata && <p style={{ color: "#b42318", fontWeight: "bold" }}>{hata}</p>}

          {!yukleniyor && !hata && (
            <form onSubmit={islemYap} style={{ backgroundColor: "white", padding: "20px", margin: "10px", borderRadius: "8px", border: "1px solid #e0e0e0", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <h1 style={{ marginTop: 0, marginBottom: "20px", fontWeight: "bold", color: "#5a62d4", fontSize: "24px" }}>İşlem Bilgisi</h1>
                <span style={{ marginLeft: "auto", color: "#667085", fontSize: "12px" }}>Kur tarihi: {kurTarihi}</span>
              </div>

              <input type="hidden" name="islemTipi" value={islemTipi} />

              <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", flexWrap: "wrap", marginBottom: "28px" }}>
                <div style={{ flex: "0 0 280px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Ödenecek Döviz Cinsi:</label>
                  <select value={odenecekDoviz} onChange={(e) => odenecekDoviziDegistir(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                    <option value="">Seçiniz</option>
                    {dovizler.map((doviz) => (
                      <option key={doviz.id} value={doviz.kod}>
                        {doviz.kod} - {doviz.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Tabs value={islemTipi} onValueChange={setIslemTipi} className="w-full md:w-auto">
                  <TabsList className="grid h-auto w-full grid-cols-3 gap-2 bg-transparent p-0 group-data-horizontal/tabs:h-auto md:w-[450px]">
                    <TabsTrigger
                      value="alis"
                      className="h-14 flex-col gap-1 whitespace-normal rounded-lg border border-slate-300 bg-blue-50 px-2 py-1.5 text-center text-[11px] font-bold leading-tight text-slate-700 shadow-sm hover:bg-blue-100 data-active:border-blue-700 data-active:bg-blue-700 data-active:text-white data-active:shadow-md"
                    >
                      <WalletCards className="size-4" />
                      Döviz / Efektif Alış
                    </TabsTrigger>

                    <TabsTrigger
                      value="satis"
                      className="h-14 flex-col gap-1 whitespace-normal rounded-lg border border-slate-300 bg-blue-50 px-2 py-1.5 text-center text-[11px] font-bold leading-tight text-slate-700 shadow-sm hover:bg-blue-100 data-active:border-blue-700 data-active:bg-blue-700 data-active:text-white data-active:shadow-md"
                    >
                      <Banknote className="size-4" />
                      Döviz / Efektif Satış
                    </TabsTrigger>

                    <TabsTrigger
                      value="arbitraj"
                      className="h-14 flex-col gap-1 whitespace-normal rounded-lg border border-slate-300 bg-blue-50 px-2 py-1.5 text-center text-[11px] font-bold leading-tight text-slate-700 shadow-sm hover:bg-blue-100 data-active:border-blue-700 data-active:bg-blue-700 data-active:text-white data-active:shadow-md"
                    >
                      <ArrowRightLeft className="size-4" />
                      Arbitraj
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div style={{ display: "flex", flexDirection: "row", gap: "20px", flexWrap: "nowrap" }}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>İşlem Kaynağı:</label>
                  <select value={islemKaynagi} onChange={(e) => setIslemKaynagi(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                    <option value="">Seçiniz</option>
                    <option value="tl-hesaptan">TL Hesaptan</option>
                    <option value="yp-hesaptan">YP Hesaptan</option>
                    <option value="nakit">Nakit</option>
                  </select>
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Alınacak Döviz Cinsi:</label>
                  <select value={alinacakDoviz} onChange={(e) => alinacakDoviziDegistir(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                    <option value="">Seçiniz</option>
                    {dovizler.map((doviz) => (
                      <option key={doviz.id} value={doviz.kod}>
                        {doviz.kod} - {doviz.name}
                      </option>
                    ))}
                  </select>
                </div>


                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Alınacak Miktar:</label>
                  <input type="number" min="0" step="any" value={alinacakMiktar} onChange={(e) => alinacakMiktariDegistir(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Ödenecek Miktar:</label>
                  <input type="number" min="0" step="any" value={odenecekMiktar} onChange={(e) => odenecekMiktariDegistir(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required />
                </div>

              </div>

              {hesaplamaHatasi && (
                <p style={{ color: "#b42318", fontWeight: "bold", margin: "0 0 10px" }}>
                  {hesaplamaHatasi}
                </p>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#0047b3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                  İşlemi   Gerçekleştir
                </button>
                <button type="button" onClick={formTemizle} style={{ padding: "10px 20px", backgroundColor: "#f0f0f0", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                  İptal
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}



//Todo: Axios Kütüphanesi ile API çağrısı yapıp, dövizleri çekmek ve formu doldurmak. Form gönderildiğinde, seçilen döviz, miktar ve işlem tipine göre bir işlem gerçekleştirmek. İşlem sonucunu kullanıcıya göstermek.
