import { useState } from "react";
import Login from "./Login";
import BoardMate from "./BoardMate";
import logoImg from "./asset/boardmate.jpg";

export default function App() {
  const [page, setPage] = useState("login"); // "login" | "welcome" | "main"
  const [username, setUsername] = useState("");

  const handleLogin = (name) => {
    setUsername(name);
    setPage("main");
  };

  if (page === "login") return <Login onLogin={handleLogin} />;

  if (page === "welcome") return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f3f4f6",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        backgroundColor: "#fff", borderRadius: 16, padding: "48px 40px",
        width: 380, textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb",
        animation: "fadeIn 0.4s ease",
      }}>
        <img src={logoImg} alt="BoardMate" style={{ width: 60, height: 60, borderRadius: 12, marginBottom: 20 }} />
        <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
          Welcome back, {username}! 👋
        </div>
        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>
          Taking you to your dashboard...
        </div>
        {/* Loading dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              backgroundColor: "#3b82f6",
              animation: `bounce 0.8s ease ${i * 0.15}s infinite`,
            }} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );

  return <BoardMate />;
}