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


export default function Home() {
  const [dovizler, setDovizler] = useState<Doviz[]>([]);
  const [secilenDoviz, setSecilenDoviz] = useState("");
  const [islemKaynagi, setIslemKaynagi] = useState("");
  const [odemeSekli, setOdemeSekli] = useState("");
  const [miktar, setMiktar] = useState("");
  const [islemTipi, setIslemTipi] = useState("satis");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");
  const [islemSonucu, setIslemSonucu] = useState({ kaynak: "", sonuc: "" });

  useEffect(() => {
    async function dovizleriGetir() {
      try {
        setHata("");
        const response = await fetch("/api/dovizler");

        if (!response.ok) {
          throw new Error(`API isteği başarısız: ${response.status}`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("API beklenen döviz listesini döndürmedi.");
        }

        setDovizler(data as Doviz[]);
      } catch (error) {
        console.error("Dövizler alınamadı:", error);
        setHata("Dövizler getirilemedi. API'nin çalıştığını kontrol edin.");
      } finally {
        setYukleniyor(false);
      }
    }

    void dovizleriGetir();
  }, []);

  function formTemizle() {
    setMiktar("");
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
                <h1 style={{ marginTop: 0, marginBottom: "20px" ,fontWeight: "bold",color: "#5a62d4" ,fontSize: "24px" }}>İşlem Bilgisi</h1>
              </div>

              <input type="hidden" name="islemTipi" value={islemTipi} />

              <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", flexWrap: "wrap", marginBottom: "28px" }}>
                <div style={{ flex: "0 0 280px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Ödenecek Döviz Cinsi:</label>
                  <select value={secilenDoviz} onChange={(e) => setSecilenDoviz(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required>
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
                  <select value={secilenDoviz} onChange={(e) => setSecilenDoviz(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                    <option value="">Seçiniz</option>
                    {dovizler.map((doviz) => (
                      <option key={doviz.id} value={doviz.kod}>
                        {doviz.kod} - {doviz.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Ödenecek Döviz Cinsi:</label>
                  <select value={secilenDoviz} onChange={(e) => setSecilenDoviz(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required>
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
                  <input type="number" value={miktar} onChange={(e) => setMiktar(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Ödenecek Miktar:</label>
                  <input type="number" value={miktar} onChange={(e) => setMiktar(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required />
                </div>

              </div>

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
