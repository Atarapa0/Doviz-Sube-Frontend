export default function Sidebar() {
  return (
    <aside style={{ display: "flex", flexDirection: "column", width: "260px", minHeight: "100vh", backgroundColor: "#f4f6f8", borderRight: "1px solid #e0e0e0", padding: "20px" }}>
      
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ margin: 0, color: "#0047b3" }}>FinOps Global</h2>
        <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>TREASURY DEPT</p>
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li style={{ padding: "10px", marginBottom: "5px", cursor: "pointer", borderRadius: "4px" }}>Dashboard</li>
          <li style={{ padding: "10px", marginBottom: "5px", cursor: "pointer", borderRadius: "4px" }}>Transfers</li>
          <li style={{ padding: "10px", marginBottom: "5px", cursor: "pointer", borderRadius: "4px", backgroundColor: "#0047b3", color: "white" }}>Currency Exchange</li>
          <li style={{ padding: "10px", marginBottom: "5px", cursor: "pointer", borderRadius: "4px" }}>Arbitrage</li>
        </ul>
      </nav>

      <div style={{ marginTop: "auto" }}>
        <button style={{ width: "100%", padding: "10px", backgroundColor: "#0047b3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "15px" }}>
          + New Transaction
        </button>
        <p style={{ margin: "5px 0", cursor: "pointer" }}>Support</p>
        <p style={{ margin: "5px 0", cursor: "pointer" }}>Settings</p>
      </div>
    </aside>
  );
}