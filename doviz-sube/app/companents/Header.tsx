import { JSX } from "react/jsx-runtime";

export default function Header(): JSX.Element {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 30px", borderBottom: "1px solid #e0e0e0", backgroundColor: "white" }}>
      
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <span style={{ backgroundColor: "#f0f0f0", padding: "5px 10px", borderRadius: "4px", fontSize: "14px" }}>ID: 4892-XT</span>
      </div>

      <div>
        <input 
          placeholder="İşlem veya hesap ara..." 
          style={{ padding: "8px 15px", borderRadius: "20px", border: "1px solid #ccc", width: "300px", outline: "none" }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <span style={{ position: "relative", cursor: "pointer" }}>
          🔔
          <span style={{ position: "absolute", top: "-2px", right: "-2px", fontSize: "8px" }}>🔴</span>
        </span>
        <span style={{ cursor: "pointer" }}>⚙️</span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#ccc" }}></div>
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>Ahmet Yılmaz</span>
        </div>
      </div>
    </header>
  );
}