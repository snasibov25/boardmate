import { useState, useRef, useEffect } from "react";
import robotLogo from "../asset/boardmate.jpg";

function generateCleanPath() {
  const steps = [];
  const rows = 6;
  for (let i = 0; i < rows; i++) {
    const y = 95 - i * (90 / (rows - 1));
    if (i % 2 === 0) {
      steps.push({ x: 5, y });
      steps.push({ x: 95, y });
    } else {
      steps.push({ x: 95, y });
      steps.push({ x: 5, y });
    }
  }
  return steps;
}

export default function Control({ robotPos, setRobotPos, docs, currentClass, setCurrentClass, currentRobot, setCurrentRobot, theme }) {
  const [mode, setMode] = useState("Idle");
  const [robotStatus, setRobotStatus] = useState("Idle");
  const [toast, setToast] = useState(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showCleanModal, setShowCleanModal] = useState(false);

  const [uploadedSVG, setUploadedSVG] = useState(null);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [svgPlaced, setSvgPlaced] = useState(false);
  const [svgMode, setSvgMode] = useState(null);
  const [svgPos, setSvgPos] = useState({ x: 0, y: 0 });
  const [svgSize, setSvgSize] = useState({ w: 120, h: 120 });
  const [selectedDocName, setSelectedDocName] = useState(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const [displayPos, setDisplayPos] = useState({ x: 50, y: 50 });

  const trailCanvasRef = useRef(null);
  const trailPointsRef = useRef([]);
  const animRef = useRef(null);
  const boardRef = useRef(null);
  const dragging = useRef(false);
  const resizing = useRef(false);
  const dragStart = useRef({});

  const boardHeight = 500;
  const svgDocs = docs?.filter(d => d.name.toLowerCase().endsWith(".svg")) || [];

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const sendCommand = async (command) => {
    try {
      const res = await fetch("http://localhost:5001/api/robot/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      console.log(data);
    } catch (e) {
      showToast("Failed to connect to robot.");
    }
  };

  // Poll backend for task completion
  useEffect(() => {
    if (robotStatus !== "Running") return;

    const poll = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:5001/api/robot/status");
        const data = await res.json();
        if (data.status === "done" || data.status === "error") {
          clearInterval(poll);
          stopAnimation();
          trailPointsRef.current = [];
          drawTrail();
          setRobotStatus("Idle");
          setMode("Idle");
          showToast(data.status === "done" ? "Task complete!" : "Error occurred.");
        }
      } catch (e) {}
    }, 1500);

    return () => clearInterval(poll);
  }, [robotStatus]);

  const drawTrail = () => {
    const canvas = trailCanvasRef.current;
    const board = boardRef.current;
    if (!canvas || !board) return;

    const w = board.offsetWidth;
    const h = board.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);

    const pts = trailPointsRef.current;
    if (pts.length < 2) return;

    const toPixel = (p) => ({
      px: (p.x / 100) * w,
      py: ((100 - p.y) / 100) * h,
    });

    for (let i = 1; i < pts.length; i++) {
      const a = toPixel(pts[i - 1]);
      const b = toPixel(pts[i]);
      const alpha = 0.05 + (i / pts.length) * 0.25;
      ctx.beginPath();
      ctx.moveTo(a.px, a.py);
      ctx.lineTo(b.px, b.py);
      ctx.strokeStyle = `rgba(34,197,94,${alpha})`;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    pts.forEach((p, i) => {
      if (i === pts.length - 1) return;
      const { px, py } = toPixel(p);
      const alpha = 0.05 + (i / pts.length) * 0.2;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,197,94,${alpha})`;
      ctx.fill();
    });
  };

  const stopAnimation = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    setIsAnimating(false);
  };

  const animateCleanPath = () => {
    if (isAnimating) return;
    const path = generateCleanPath();
    trailPointsRef.current = [];
    setIsAnimating(true);

    let segmentIndex = 0;
    let progress = 0;
    const SPEED = 0.0006;
    let lastTime = null;

    const refDist = Math.sqrt(
      (path[1].x - path[0].x) ** 2 + (path[1].y - path[0].y) ** 2
    );

    const tick = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      const from = path[segmentIndex];
      const to = path[segmentIndex + 1];
      if (!from || !to) return;

      const segDist = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
      const speedScale = segDist / refDist;
      progress += (SPEED * delta) / speedScale;

      if (progress >= 1) {
        progress = 0;
        segmentIndex++;

        if (segmentIndex >= path.length - 1) {
          const last = path[path.length - 1];
          setDisplayPos({ x: last.x, y: last.y });
          setRobotPos({ x: last.x, y: last.y });
          trailPointsRef.current = [...path];
          drawTrail();
          setTimeout(() => {
            trailPointsRef.current = [];
            drawTrail();
            setIsAnimating(false);
          }, 600);
          return;
        }

        trailPointsRef.current = [...path.slice(0, segmentIndex + 1)];
      }

      const f = path[segmentIndex];
      const t = path[segmentIndex + 1];
      if (!f || !t) return;

      const x = f.x + (t.x - f.x) * progress;
      const y = f.y + (t.y - f.y) * progress;

      setDisplayPos({ x, y });
      setRobotPos({ x: Math.round(x), y: Math.round(y) });

      trailPointsRef.current = [...path.slice(0, segmentIndex + 1), { x, y }];
      drawTrail();

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const canvas = trailCanvasRef.current;
    const board = boardRef.current;
    if (!canvas || !board) return;
    canvas.width = board.offsetWidth;
    canvas.height = board.offsetHeight;
  }, []);

  const handleBoardClick = (e) => {
    if (svgPlaced || isAnimating) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / rect.width * 100);
    const y = Math.round((1 - (e.clientY - rect.top) / rect.height) * 100);
    const nx = Math.min(100, Math.max(0, x));
    const ny = Math.min(100, Math.max(0, y));
    setRobotPos({ x: nx, y: ny });
    setDisplayPos({ x: nx, y: ny });
  };

  const loadSVGFromUrl = async (url, name) => {
    try {
      const res = await fetch(url);
      const text = await res.text();
      setUploadedSVG(text);
      setSelectedDocName(name);
      setShowDocsModal(false);
      setShowPlaceModal(true);
    } catch {
      showToast("Failed to load SVG file.");
    }
  };

  const handleSVGUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedSVG(ev.target.result);
      setSelectedDocName(file.name);
      setShowWriteModal(false);
      setShowPlaceModal(true);
    };
    reader.readAsText(file);
  };

  const handleAutoFit = () => {
    setMode("Write"); setSvgMode("auto"); setSvgPlaced(true); setShowPlaceModal(false);
    showToast("SVG auto-fitted to board. Press Start to run.");
  };

  const handleManual = () => {
    setMode("Write"); setSvgMode("manual"); setSvgPlaced(true); setShowPlaceModal(false);
    const bw = boardRef.current ? boardRef.current.offsetWidth : 300;
    setSvgSize({ w: 120, h: 120 });
    setSvgPos({ x: bw / 2 - 60, y: boardHeight / 2 - 60 });
    showToast("Drag to move, drag corners to resize.");
  };

  const handleSVGMouseDown = (e) => {
    if (svgMode !== "manual") return;
    e.stopPropagation(); e.preventDefault();
    dragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, sx: svgPos.x, sy: svgPos.y };
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragUp);
  };
  const onDragMove = (e) => {
    if (!dragging.current) return;
    setSvgPos({ x: dragStart.current.sx + (e.clientX - dragStart.current.mx), y: dragStart.current.sy + (e.clientY - dragStart.current.my) });
  };
  const onDragUp = () => {
    dragging.current = false;
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", onDragUp);
  };

  const handleResizeMouseDown = (e, corner) => {
    e.stopPropagation(); e.preventDefault();
    resizing.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, sx: svgPos.x, sy: svgPos.y, sw: svgSize.w, sh: svgSize.h, corner };
    window.addEventListener("mousemove", onResizeMove);
    window.addEventListener("mouseup", onResizeUp);
  };
  const onResizeMove = (e) => {
    if (!resizing.current) return;
    const { mx, my, sx, sy, sw, sh, corner } = dragStart.current;
    const dx = e.clientX - mx, dy = e.clientY - my, min = 30;
    let newW = sw, newH = sh, newX = sx, newY = sy;
    if (corner === "se") { newW = Math.max(min, sw + dx); newH = Math.max(min, sh + dy); }
    else if (corner === "sw") { newW = Math.max(min, sw - dx); newH = Math.max(min, sh + dy); newX = sx + sw - newW; }
    else if (corner === "ne") { newW = Math.max(min, sw + dx); newH = Math.max(min, sh - dy); newY = sy + sh - newH; }
    else if (corner === "nw") { newW = Math.max(min, sw - dx); newH = Math.max(min, sh - dy); newX = sx + sw - newW; newY = sy + sh - newH; }
    setSvgSize({ w: newW, h: newH }); setSvgPos({ x: newX, y: newY });
  };
  const onResizeUp = () => {
    resizing.current = false;
    window.removeEventListener("mousemove", onResizeMove);
    window.removeEventListener("mouseup", onResizeUp);
  };

  const handleClearSVG = () => { setUploadedSVG(null); setSvgPlaced(false); setSvgMode(null); setSelectedDocName(null); };

  const handleDot = (top, left, cursor, corner) => (
    <div onMouseDown={(e) => handleResizeMouseDown(e, corner)} style={{
      position: "absolute", top, left, width: 10, height: 10,
      backgroundColor: theme.accent, border: "2px solid #fff", borderRadius: "50%",
      cursor, transform: "translate(-50%, -50%)", zIndex: 10,
      boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
    }} />
  );

  return (
    <div style={{
      backgroundColor: "#fff", border: `1px solid ${theme.border}`,
      borderRadius: 14, padding: "28px 30px",
      display: "flex", flexDirection: "column", gap: 28,
      transition: "border-color 0.4s ease",
    }}>

      <div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          backgroundColor: theme.bg, border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: "12px 16px", marginBottom: 24,
          transition: "background-color 0.4s ease, border-color 0.4s ease",
        }}>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Course Name: <strong style={{ color: theme.label }}>{currentClass}</strong></div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Robot: <strong style={{ color: theme.label }}>{currentRobot}</strong></div>
          </div>
          <button onClick={() => setShowSwitchModal(true)} style={{ fontSize: 13, color: theme.accent, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Switch →</button>
        </div>

        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Robot Controls</div>
        <div style={{ color: "#6b7280", fontSize: 13.5, marginBottom: 26 }}>Select operation mode and control robot status</div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 10 }}>Operation Mode</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "Clean", color: "#22c55e", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20H7L3 16l13-13 4 4-3.5 3.5"/><path d="M6 17l4-4"/></svg> },
              { label: "Scan",  color: "#3b82f6", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 8V5a1 1 0 011-1h3M4 16v3a1 1 0 001 1h3M16 4h3a1 1 0 011 1v3M16 20h3a1 1 0 001-1v-3"/></svg> },
              { label: "Write", color: "#f97316", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg> },
              { label: "Idle",  color: "#9ca3af", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="12"/></svg> },
            ].map(({ label, color, icon }) => (
              <button key={label} onClick={() => {
                if (label === "Write" && mode !== "Write") { setMode("Idle"); setShowWriteModal(true); return; }
                if (label === "Clean") { setShowCleanModal(true); return; }
                const newMode = mode === label ? "Idle" : label;
                setMode(newMode);
                showToast(newMode === "Idle" ? "Currently Idle. Please select a mode." : `Mode set to ${newMode}. Press Start to run.`);
              }} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "9px 22px", borderRadius: 8,
                border: (mode === label || (label === "Clean" && mode === "Clean+Scan")) ? "none" : "1px solid #d1d5db",
                backgroundColor: (mode === label || (label === "Clean" && mode === "Clean+Scan")) ? color : "#fff",
                color: (mode === label || (label === "Clean" && mode === "Clean+Scan")) ? "#fff" : "#374151",
                fontWeight: 500, fontSize: 14, cursor: "pointer", outline: "none", transition: "all 0.2s",
              }}>{icon}{label}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 10 }}>Robot Status</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => {
              if (mode === "Idle") { showToast("Please select a mode before starting."); return; }
              setRobotStatus("Running");
              if (mode === "Scan")       { sendCommand("start scan"); animateCleanPath(); }
              if (mode === "Clean")      { sendCommand("start clean"); animateCleanPath(); }
              if (mode === "Clean+Scan") { sendCommand("start clean scan"); animateCleanPath(); }
              if (mode === "Write")      sendCommand("start write");
            }} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "10px 0", width: 120, borderRadius: 8, border: "none",
              backgroundColor: robotStatus === "Running" ? "#22c55e" : "#e5e7eb",
              color: robotStatus === "Running" ? "#fff" : "#6b7280",
              fontWeight: 600, fontSize: 14, cursor: "pointer", outline: "none", transition: "all 0.2s",
            }}>
              <svg width="11" height="11" viewBox="0 0 11 12" fill="currentColor"><polygon points="0,0 11,6 0,12"/></svg>Start
            </button>
            <button onClick={() => {
              if (mode === "Idle") { showToast("Please select a mode before starting."); return; }
              stopAnimation();
              setRobotStatus("Paused");
            }} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "10px 22px", borderRadius: 8,
              border: robotStatus === "Paused" ? "none" : "1px solid #d1d5db",
              backgroundColor: robotStatus === "Paused" ? "#eab308" : "#fff",
              color: robotStatus === "Paused" ? "#fff" : "#374151",
              fontWeight: 500, fontSize: 14, cursor: "pointer", outline: "none", transition: "all 0.2s",
            }}>
              <svg width="12" height="13" viewBox="0 0 12 13" fill="currentColor"><rect x="0.5" y="0.5" width="4" height="12" rx="1"/><rect x="7.5" y="0.5" width="4" height="12" rx="1"/></svg>Pause
            </button>
            <button onClick={() => {
              stopAnimation();
              setRobotStatus("Idle");
              setMode("Idle");
              trailPointsRef.current = [];
              drawTrail();
              sendCommand("stop");
            }} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "10px 22px", borderRadius: 8, border: "none",
              backgroundColor: robotStatus === "Idle" ? "#ef4444" : "#e5e7eb",
              color: robotStatus === "Idle" ? "#fff" : "#6b7280",
              fontWeight: 500, fontSize: 14, cursor: "pointer", outline: "none", transition: "all 0.2s",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18.36 6.64A9 9 0 115.64 6.64"/><line x1="12" y1="2" x2="12" y2="12"/></svg>Stop
            </button>
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          backgroundColor: "#f9fafb", border: "1px solid #e5e7eb",
          borderRadius: 8, padding: "11px 16px", marginBottom: 9,
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 13.5, color: "#374151" }}>
            System Status: Robot: <strong>{robotStatus}</strong>
            {mode === "Clean+Scan" && <span style={{ marginLeft: 8, fontSize: 12, color: "#22c55e", fontWeight: 500 }}>· Clean + Scan</span>}
            {isAnimating && <span style={{ marginLeft: 8, fontSize: 12, color: "#22c55e", fontWeight: 500 }}>· Running...</span>}
          </span>
        </div>

        <div style={{ fontSize: 13, color: "#6b7280" }}>
          <button onClick={() => {
            stopAnimation();
            setRobotPos({ x: 0, y: 0 });
            setDisplayPos({ x: 0, y: 0 });
            trailPointsRef.current = [];
            drawTrail();
            showToast("Robot position reset to (0, 0).");
          }} style={{ color: theme.accent, background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 0, fontWeight: 500 }}>
            Reset Position
          </button>
        </div>
      </div>

      {/* Robot Position Board */}
      <div>
        <div style={{ borderTop: "1px solid #e5e7eb", marginBottom: 24 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ color: "#111827", fontWeight: 700, fontSize: 16 }}>Robot Position</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {svgPlaced ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{selectedDocName}</span>
                <button onClick={handleClearSVG} style={{ fontSize: 12, color: "#ef4444", background: "none", border: "1px solid #fca5a5", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Clear SVG</button>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                X: <strong style={{ color: "#111827" }}>{Math.round(displayPos.x)}</strong>
                &nbsp;&nbsp;Y: <strong style={{ color: "#111827" }}>{Math.round(displayPos.y)}</strong>
              </div>
            )}
          </div>
        </div>

        <div style={{ position: "relative", paddingLeft: 28, paddingBottom: 22 }}>
          {[100, 80, 60, 40, 20, 0].map(val => (
            <div key={`y${val}`} style={{
              position: "absolute", left: 0, top: (100 - val) / 100 * boardHeight - 6,
              fontSize: 10, color: "#9ca3af", lineHeight: 1, width: 22, textAlign: "right",
            }}>{val}</div>
          ))}

          <div
            ref={boardRef}
            onClick={handleBoardClick}
            style={{
              width: "100%", height: boardHeight, borderRadius: 8, overflow: "hidden",
              border: `2px solid ${theme.border}`, boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              position: "relative",
              cursor: isAnimating ? "default" : (svgPlaced && svgMode === "manual" ? "default" : "crosshair"),
              backgroundColor: "#fafafa", transition: "border-color 0.4s ease",
            }}
          >
            <img style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} alt="" />

            <canvas
              ref={trailCanvasRef}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }}
            />

            {svgPlaced && svgMode === "auto" && uploadedSVG && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ width: "100%", height: "100%" }} dangerouslySetInnerHTML={{ __html: uploadedSVG.replace(/<svg/, '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%"') }} />
              </div>
            )}
            {svgPlaced && svgMode === "manual" && uploadedSVG && (
              <div onMouseDown={handleSVGMouseDown} style={{ position: "absolute", left: svgPos.x, top: svgPos.y, width: svgSize.w, height: svgSize.h, cursor: "grab", userSelect: "none", outline: `1.5px dashed ${theme.accent}` }}>
                <div style={{ width: "100%", height: "100%", pointerEvents: "none" }} dangerouslySetInnerHTML={{ __html: uploadedSVG.replace(/<svg/, `<svg style="width:${svgSize.w}px;height:${svgSize.h}px"`) }} />
                {handleDot("0%", "0%", "nw-resize", "nw")}
                {handleDot("0%", "100%", "ne-resize", "ne")}
                {handleDot("100%", "0%", "sw-resize", "sw")}
                {handleDot("100%", "100%", "se-resize", "se")}
              </div>
            )}

            {!svgPlaced && (
              <img
                src={robotLogo}
                alt="robot"
                style={{
                  position: "absolute",
                  width: 80,
                  height: "auto",
                  left: `${displayPos.x}%`,
                  top: `${100 - displayPos.y}%`,
                  transform: "translate(-50%, -50%)",
                  transition: "none",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              />
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            {[0, 20, 40, 60, 80, 100].map(val => (
              <div key={`x${val}`} style={{ fontSize: 10, color: "#9ca3af" }}>{val}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 70, right: 28, backgroundColor: "#1f2937", color: "#fff",
          padding: "12px 18px", borderRadius: 10, fontSize: 13.5,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8,
          zIndex: 200, maxWidth: 320, animation: "slideUp 0.25s ease",
        }}>
          <span>💡</span><span>{toast}</span>
        </div>
      )}

      {/* Clean Modal */}
      {showCleanModal && (
        <div onClick={() => setShowCleanModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "#fff", borderRadius: 14, padding: "32px", width: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Clean Mode</div>
            <div style={{ color: "#6b7280", fontSize: 13.5, marginBottom: 24 }}>Would you also like to scan while cleaning?</div>
            <button onClick={() => { setMode("Clean+Scan"); setShowCleanModal(false); showToast("Mode set to Clean + Scan. Press Start to run."); }} style={{ width: "100%", padding: "16px", border: "1px solid #e5e7eb", borderRadius: 10, backgroundColor: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12, textAlign: "left" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 20H7L3 16l13-13 4 4-3.5 3.5" stroke="#22c55e"/><path d="M6 17l4-4" stroke="#22c55e"/>
                  <path d="M4 8V5a1 1 0 011-1h3M4 16v3a1 1 0 001 1h3M16 4h3a1 1 0 011 1v3M16 20h3a1 1 0 001-1v-3" stroke="#3b82f6"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 3 }}>Clean + Scan</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Clean the board and scan simultaneously</div>
              </div>
            </button>
            <button onClick={() => { setMode("Clean"); setShowCleanModal(false); showToast("Mode set to Clean. Press Start to run."); }} style={{ width: "100%", padding: "16px", border: "1px solid #e5e7eb", borderRadius: 10, backgroundColor: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24, textAlign: "left" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20H7L3 16l13-13 4 4-3.5 3.5"/><path d="M6 17l4-4"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 3 }}>Clean Only</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Just clean the board without scanning</div>
              </div>
            </button>
            <button onClick={() => setShowCleanModal(false)} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 8, backgroundColor: "#fff", color: "#6b7280", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Write Modal */}
      {showWriteModal && (
        <div onClick={() => setShowWriteModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "#fff", borderRadius: 14, padding: "32px", width: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Write Mode</div>
            <div style={{ color: "#6b7280", fontSize: 13.5, marginBottom: 24 }}>Select an existing SVG or upload a new file to write on the whiteboard.</div>
            <button onClick={() => { setShowWriteModal(false); setShowDocsModal(true); }} style={{ width: "100%", padding: "14px 16px", border: "1px solid #e5e7eb", borderRadius: 10, backgroundColor: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 12, textAlign: "left" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>Select from Documents</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{svgDocs.length > 0 ? `${svgDocs.length} SVG file${svgDocs.length > 1 ? "s" : ""} available` : "No SVG files in Documents"}</div>
              </div>
            </button>
            <label style={{ width: "100%", padding: "14px 16px", border: "1px solid #e5e7eb", borderRadius: 10, backgroundColor: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>Upload New File</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Upload a SVG to write</div>
              </div>
              <input type="file" accept=".svg" style={{ display: "none" }} onChange={handleSVGUpload} />
            </label>
            <button onClick={() => setShowWriteModal(false)} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 8, backgroundColor: "#fff", color: "#6b7280", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Docs Modal */}
      {showDocsModal && (
        <div onClick={() => setShowDocsModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "#fff", borderRadius: 14, padding: "32px", width: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Select SVG File</div>
            <div style={{ color: "#6b7280", fontSize: 13.5, marginBottom: 20 }}>Choose an SVG file from your documents</div>
            {svgDocs.length === 0 ? (
              <div style={{ textAlign: "center", color: "#9ca3af", padding: "32px 0", fontSize: 14 }}>No SVG files found.<br/>Upload an SVG file first.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {svgDocs.map(doc => (
                  <button key={doc.id} onClick={() => loadSVGFromUrl(doc.url, doc.name)} style={{ width: "100%", padding: "14px 16px", border: "1px solid #e5e7eb", borderRadius: 10, backgroundColor: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{doc.name}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{doc.date}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setShowDocsModal(false)} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 8, backgroundColor: "#fff", color: "#6b7280", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Place Modal */}
      {showPlaceModal && (
        <div onClick={() => setShowPlaceModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "#fff", borderRadius: 14, padding: "32px", width: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Place SVG on Board</div>
            <div style={{ color: "#6b7280", fontSize: 13.5, marginBottom: 24 }}>How would you like to place <strong>{selectedDocName}</strong>?</div>
            <button onClick={handleAutoFit} style={{ width: "100%", padding: "16px", border: "1px solid #e5e7eb", borderRadius: 10, backgroundColor: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12, textAlign: "left" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 3 }}>Auto Fit</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Automatically center and scale SVG to fill the entire board</div>
              </div>
            </button>
            <button onClick={handleManual} style={{ width: "100%", padding: "16px", border: "1px solid #e5e7eb", borderRadius: 10, backgroundColor: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24, textAlign: "left" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><path d="M5 9l4-4 4 4M9 5v14M15 9l4 4-4 4M19 13H5"/></svg>
              </div>pip3 install flask flask-cors requests
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 3 }}>Manual Place</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Drag to move, drag corners to resize</div>
              </div>
            </button>
            <button onClick={() => setShowPlaceModal(false)} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 8, backgroundColor: "#fff", color: "#6b7280", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Switch Modal */}
      {showSwitchModal && (
        <div onClick={() => setShowSwitchModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "#fff", borderRadius: 14, padding: "32px", width: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Switch Course</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>Course</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Course A", "Course B", "Course C", "Course D"].map(c => {
                  const colors = { "Course A": "#3b82f6", "Course B": "#22c55e", "Course C": "#a855f7", "Course D": "#f97316" };
                  const bgs = { "Course A": "#eff6ff", "Course B": "#f0fdf4", "Course C": "#faf5ff", "Course D": "#fff7ed" };
                  const borders = { "Course A": "#bfdbfe", "Course B": "#bbf7d0", "Course C": "#e9d5ff", "Course D": "#fed7aa" };
                  const isSelected = currentClass === c;
                  return (
                    <button key={c} onClick={() => { setCurrentClass(c); setCurrentRobot(c.replace("Course", "Robot")); }} style={{
                      width: "100%", padding: "12px 16px",
                      border: `2px solid ${isSelected ? colors[c] : borders[c]}`,
                      borderRadius: 10, backgroundColor: bgs[c],
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                      transition: "all 0.15s",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: colors[c] }} />
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{c}</span>
                      </div>
                      {isSelected && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors[c]} strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", marginBottom: 24, marginTop: 8, fontSize: 13, color: "#6b7280" }}>
              Robot will be automatically set to: <strong style={{ color: "#111827" }}>{currentRobot}</strong>
            </div>
            <button onClick={() => setShowSwitchModal(false)} style={{
              width: "100%", padding: "10px", borderRadius: 8, border: "none",
              backgroundColor: theme.accent, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>Confirm</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}