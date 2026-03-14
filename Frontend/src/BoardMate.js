import { useState } from "react";
import Control from "./components/Control";
import Documents from "./components/Documents";
import Settings from "./components/Settings";
import logoImg from "./asset/boardmate.jpg";

const initialDocs = [
  { id: 1, name: "11.pdf",            date: "12/03/2026", pages: 1, url: "/test/11.pdf" },
  { id: 2, name: "output2.pdf",       date: "12/03/2026", pages: 1, url: "/test/output2.pdf" },
  { id: 3, name: "qumelo_shapes.svg", date: "12/03/2026", pages: 1, url: "/test/qumelo_shapes.svg" },
];

const CLASS_THEMES = {
  "Course A": { bg: "#eff6ff", border: "#bfdbfe", accent: "#3b82f6", label: "#1d4ed8" },
  "Course B": { bg: "#f0fdf4", border: "#bbf7d0", accent: "#22c55e", label: "#15803d" },
  "Course C": { bg: "#faf5ff", border: "#e9d5ff", accent: "#a855f7", label: "#7e22ce" },
  "Course D": { bg: "#fff7ed", border: "#fed7aa", accent: "#f97316", label: "#c2410c" },
};

export default function BoardMate() {
  const [activeTab, setActiveTab] = useState("Control");
  const [robotPos, setRobotPos] = useState({ x: 50, y: 50 });
  const [docs, setDocs] = useState(initialDocs);
  const [currentClass, setCurrentClass] = useState("Course A");
  const [currentRobot, setCurrentRobot] = useState("Robot A");

  const theme = CLASS_THEMES[currentClass];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: theme.bg,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 14,
      color: "#111827",
      display: "flex",
      flexDirection: "column",
      transition: "background-color 0.4s ease",
    }}>

      {/* Header */}
      <div style={{
        backgroundColor: "#fff",
        borderBottom: `1px solid ${theme.border}`,
        padding: "14px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logoImg} alt="BoardMate Logo" style={{ width: 38, height: 38, borderRadius: 8 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, lineHeight: 1.25 }}>BoardMate</div>
            <div style={{ color: "#6b7280", fontSize: 12.5 }}>Scan, Clean, and Transcribe Whiteboards</div>
          </div>
        </div>

        {/* Class badge in header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            backgroundColor: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 12.5,
            fontWeight: 600,
            color: theme.label,
          }}>
            {currentClass} · {currentRobot}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              backgroundColor: "#d1d5db",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#9ca3af">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        backgroundColor: "#fff",
        borderBottom: `1px solid ${theme.border}`,
        display: "flex",
        justifyContent: "center",
      }}>
        {["Control", "Documents", "Settings"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "15px 30px",
            border: "none", background: "none",
            fontSize: 14.5,
            fontWeight: activeTab === tab ? 600 : 400,
            color: activeTab === tab ? "#111827" : "#9ca3af",
            borderBottom: activeTab === tab ? `2px solid ${theme.accent}` : "2px solid transparent",
            cursor: "pointer", marginBottom: -1, outline: "none",
            transition: "color 0.2s",
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "28px", paddingBottom: 72 }}>
        {activeTab === "Control"   && <Control robotPos={robotPos} setRobotPos={setRobotPos} docs={docs} currentClass={currentClass} setCurrentClass={setCurrentClass} currentRobot={currentRobot} setCurrentRobot={setCurrentRobot} theme={theme} />}
        {activeTab === "Documents" && <Documents docs={docs} setDocs={setDocs} />}
        {activeTab === "Settings"  && <Settings robotPos={robotPos} setRobotPos={setRobotPos} />}
      </div>

      {/* Footer */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff", borderTop: `1px solid ${theme.border}`,
        padding: "11px 28px",
        display: "flex", alignItems: "center", gap: 10,
        zIndex: 50,
        transition: "border-color 0.4s ease",
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: "50%", backgroundColor: "#22c55e",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <polyline points="2,6 5,9 10,3"/>
          </svg>
        </div>
        <span style={{ fontSize: 14, color: "#374151" }}>System Status: Robot: <strong>Idle</strong></span>
        <span style={{ color: "#d1d5db", fontSize: 18 }}>•</span>
        <span style={{ fontSize: 14, color: "#6b7280" }}>No Errors Detected</span>
      </div>

    </div>
  );
}