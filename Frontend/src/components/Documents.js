import { useState } from "react";

export default function Documents({ docs, setDocs }) {
  const [selected, setSelected] = useState(null);
  const [uploadName, setUploadName] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const newDoc = {
      id: docs.length + 1,
      name: file.name,
      date: new Date().toLocaleDateString("en-GB"),
      pages: 1,
      url: objectUrl,
    };
    setDocs([...docs, newDoc]);
    setUploadName(file.name);
    setTimeout(() => setUploadName(null), 3000);
  };

  const isSVG = (name) => name?.toLowerCase().endsWith(".svg");
  const isPDF = (name) => name?.toLowerCase().endsWith(".pdf");

  return (
    <div style={{
      backgroundColor: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      padding: "28px 30px",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Scanned Documents</div>
          <div style={{ color: "#6b7280", fontSize: 13.5 }}>View and manage scanned PDFs</div>
        </div>
        <label style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "9px 18px", borderRadius: 8,
          backgroundColor: "#3b82f6", color: "#fff",
          fontWeight: 500, fontSize: 14, cursor: "pointer", border: "none",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload Document
          <input type="file" accept=".pdf,.png,.jpg,.jpeg,.svg" onChange={handleUpload} style={{ display: "none" }} />
        </label>
      </div>

      {/* Upload toast */}
      {uploadName && (
        <div style={{
          position: "fixed", bottom: 70, right: 28,
          backgroundColor: "#1f2937", color: "#fff",
          padding: "12px 18px", borderRadius: 10,
          fontSize: 13.5, boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", gap: 8,
          zIndex: 200, maxWidth: 320,
        }}>
          <span>✅</span>
          <span>{uploadName} uploaded successfully.</span>
        </div>
      )}

      {/* Two column layout */}
      <div style={{ display: "flex", gap: 16 }}>

        {/* Left: document list */}
        <div style={{
          width: 280, flexShrink: 0,
          border: "1px solid #e5e7eb",
          borderRadius: 10, overflow: "hidden",
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: 14 }}>
            Documents ({docs.length})
          </div>
          <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {docs.map(doc => (
              <div key={doc.id} onClick={() => setSelected(doc)} style={{
                padding: "14px 16px", border: "1px solid",
                borderColor: selected?.id === doc.id ? "#3b82f6" : "#e5e7eb",
                borderRadius: 8, cursor: "pointer",
                backgroundColor: selected?.id === doc.id ? "#eff6ff" : "#fff",
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  <span style={{
                    fontSize: 13, fontWeight: 500, color: "#111827",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170,
                  }}>{doc.name}</span>
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>{doc.date}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#374151", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: 4 }}>
                    {doc.pages} pages
                  </span>
                  <a href={doc.url} download={doc.name} onClick={e => e.stopPropagation()} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 12, color: "#374151", textDecoration: "none", padding: "4px 8px", borderRadius: 6,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: preview */}
        <div style={{
          flex: 1, border: "1px solid #e5e7eb", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: 400, backgroundColor: "#fafafa", overflow: "hidden",
        }}>
          {selected ? (
            <div style={{ padding: "24px 28px", width: "100%", height: "100%" }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{selected.name}</div>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>{selected.date} · {selected.pages} pages</div>
              {isPDF(selected.name) && (
                <iframe src={selected.url} title={selected.name} style={{ width: "100%", height: 420, border: "none", borderRadius: 8 }} />
              )}
              {isSVG(selected.name) && (
                <div style={{
                  width: "100%", height: 420, border: "1px solid #e5e7eb", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: "#fff", overflow: "hidden",
                }}>
                  <img src={selected.url} alt={selected.name} style={{ maxWidth: "100%", maxHeight: "100%" }} />
                </div>
              )}
              {!isPDF(selected.name) && !isSVG(selected.name) && (
                <div style={{
                  width: "100%", height: 420, borderRadius: 8, border: "1px solid #e5e7eb",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14,
                }}>
                  Preview not available for this file type
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#9ca3af" }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" style={{ marginBottom: 16 }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <div style={{ fontSize: 14 }}>Select a document to preview</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}