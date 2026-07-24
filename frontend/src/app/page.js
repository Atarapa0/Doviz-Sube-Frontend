"use client";

import { useState, useEffect } from "react";
import Header from ",,/components/Header";
import Sidebar from "@/components/Sidebar";

export default function DovizEkrani() {
  const [dovizKurlari, setDovizKurlari] = useState({});
  const [secilenDoviz, setSecilenDoviz] = useState("");
  const [miktar, setMiktar] = useState("");
  const [islemTipi, setIslemTipi] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    kurVerileriniGetir();
  }, []);

  const kurVerileriniGetir = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/kurlar");
      const data = await response.json();
      setDovizKurlari(data);
      setYukleniyor(false);
    } catch (error) {
      console.error("Döviz kurları alınamadı:", error);
      setYukleniyor(false);
    }
  };

  const formTemizle = () => {
    setMiktar("");
    setIslemTipi("");
    setSecilenDoviz("");
  };

  const islemYap = (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller
    
    const veri = { secilenDoviz, miktar: Number(miktar), islemTipi };
    console.log("Backend'e gidecek veri:", veri);
    
    // İşlem başarılı olduktan sonra formu temizle
    alert("İşlem onaylandı!");
    formTemizle();
  };

  return (
    <div style={{ display: "flex", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      
      {/* Sol Menü */}
      <Sidebar />

      {/* Sağ Taraf Kapsayıcı */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Üst Bilgi */}
        <Header />

        {/* Ana İçerik ve Form */}
        <main style={{ padding: "30px" }}>
          <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Döviz Alış/Satış/Arbitraj</h2>
          
          {yukleniyor ? (
            <p>Kurlar yükleniyor...</p>
          ) : (
            <form onSubmit={islemYap} style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e0e0e0", maxWidth: "600px" }}>
              
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Döviz Seçimi:</label>
                <select value={secilenDoviz} onChange={(e) => setSecilenDoviz(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                  <option value="">Seçiniz</option>
                  {Object.keys(dovizKurlari).map((doviz) => (
                    <option key={doviz} value={doviz}>{doviz}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Miktar:</label>
                <input type="number" value={miktar} onChange={(e) => setMiktar(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>İşlem Tipi:</label>
                <select value={islemTipi} onChange={(e) => setIslemTipi(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                  <option value="">Seçiniz</option>
                  <option value="alis">Alış</option>
                  <option value="satis">Satış</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#0047b3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                  İşlemi Gerçekleştir
                </button>
                <button type="button" onClick={formTemizle} style={{ padding: "10px 20px", backgroundColor: "#f0f0f0", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                  İptal
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}