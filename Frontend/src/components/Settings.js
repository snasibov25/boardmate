import { useState } from "react";

export default function Settings({ robotPos, setRobotPos }) {
  const [direction, setDirection] = useState("Up");
  const [steps, setSteps] = useState("");
  const [gotoX, setGotoX] = useState("");
  const [gotoY, setGotoY] = useState("");

  const handleMove = () => {
    const s = parseInt(steps) || 10;
    setRobotPos(prev => {
      if (direction === "Up")    return { ...prev, y: Math.max(0, prev.y - s) };
      if (direction === "Down")  return { ...prev, y: Math.min(100, prev.y + s) };
      if (direction === "Left")  return { ...prev, x: Math.max(0, prev.x - s) };
      if (direction === "Right") return { ...prev, x: Math.min(100, prev.x + s) };
      return prev;
    });
  };

  const handleGoto = () => {
    const x = Math.min(100, Math.max(0, parseInt(gotoX) || 0));
    const y = Math.min(100, Math.max(0, parseInt(gotoY) || 0));
    setRobotPos({ x, y });
  };

  return (
    <div style={{
      backgroundColor: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      padding: "28px 30px",
    }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Settings</div>
      <div style={{ color: "#6b7280", fontSize: 13.5, marginBottom: 26 }}>
        Configure your BoardMate device settings here.
      </div>

      {/* Robot Movement */}
      <div>
        <div style={{ borderTop: "1px solid #e5e7eb", marginBottom: 24 }} />
        <div style={{ color: "#111827", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
          Robot Movement
        </div>

        {/* Current Position */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          backgroundColor: "#f9fafb", border: "1px solid #e5e7eb",
          borderRadius: 8, padding: "11px 16px", marginBottom: 16,
        }}>
          <span style={{ fontSize: 13.5, color: "#374151" }}>
            Current Position: <strong>X: {robotPos.x}</strong> &nbsp; <strong>Y: {robotPos.y}</strong>
          </span>
        </div>

        {/* Manual Movement */}
        <div style={{
          border: "1px solid #e5e7eb", borderRadius: 10,
          padding: "16px", marginBottom: 12,
        }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#6b7280", letterSpacing: 1, marginBottom: 12 }}>
            MANUAL MOVEMENT
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <select
              value={direction}
              onChange={e => setDirection(e.target.value)}
              style={{
                padding: "10px 12px", borderRadius: 8,
                border: "2px solid #3b82f6", fontSize: 14,
                color: "#111827", cursor: "pointer", outline: "none",
                width: 130,
              }}
            >
              {["Up", "Down", "Left", "Right"].map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Steps"
              value={steps}
              onChange={e => setSteps(e.target.value)}
              style={{
                padding: "10px 12px", borderRadius: 8,
                border: "1px solid #d1d5db", fontSize: 14,
                width: 130, outline: "none",
              }}
            />
            <button
              onClick={handleMove}
              style={{
                flex: 1, padding: "10px",
                borderRadius: 8, border: "none",
                backgroundColor: "#111827", color: "#fff",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}
            >
              Move
            </button>
          </div>
        </div>

        {/* Goto Position */}
        <div style={{
          border: "1px solid #e5e7eb", borderRadius: 10,
          padding: "16px",
        }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#6b7280", letterSpacing: 1, marginBottom: 12 }}>
            GOTO POSITION
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input
              type="number"
              placeholder="X"
              value={gotoX}
              onChange={e => setGotoX(e.target.value)}
              style={{
                padding: "10px 12px", borderRadius: 8,
                border: "1px solid #d1d5db", fontSize: 14,
                width: 130, outline: "none",
              }}
            />
            <input
              type="number"
              placeholder="Y"
              value={gotoY}
              onChange={e => setGotoY(e.target.value)}
              style={{
                padding: "10px 12px", borderRadius: 8,
                border: "1px solid #d1d5db", fontSize: 14,
                width: 130, outline: "none",
              }}
            />
            <button
              onClick={handleGoto}
              style={{
                flex: 1, padding: "10px",
                borderRadius: 8, border: "none",
                backgroundColor: "#111827", color: "#fff",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}
            >
              Go
            </button>
          </div>
          <button
            onClick={() => setRobotPos({ x: 50, y: 50 })}
            style={{
              width: "100%", padding: "10px",
              borderRadius: 8, border: "none",
              backgroundColor: "#f3f4f6", color: "#111827",
              fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}
          >
            Reset Position
          </button>
        </div>
      </div>
    </div>
  );
}