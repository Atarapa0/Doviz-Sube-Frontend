export default function Sidebar() {
  return (
    <aside style={{ display: "flex", flexDirection: "column", width: "260px", minHeight: "100vh", backgroundColor: "#f4f6f8", borderRight: "1px solid #e0e0e0", padding: "20px" }}>
      
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ margin: 0, color: "#0047b3" }}>xxxxx Bankası</h2>
        <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>xxxx Şube</p>
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li style={{ padding: "10px", marginBottom: "5px", cursor: "pointer", borderRadius: "4px" }}>Dashboard</li>
          <li style={{ padding: "10px", marginBottom: "5px", cursor: "pointer", borderRadius: "4px" }}>Transfers</li>
          <li style={{ padding: "10px", marginBottom: "5px", cursor: "pointer", borderRadius: "4px", backgroundColor: "#0047b3", color: "white" }}>Currency Exchange</li>
          <li style={{ padding: "10px", marginBottom: "5px", cursor: "pointer", borderRadius: "4px" }}>Arbitrage</li>
        </ul>
      </nav>

      
    </aside>
  );
}