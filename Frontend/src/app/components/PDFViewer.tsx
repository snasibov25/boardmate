import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { FileText, Download, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";

interface PDFDocument {
  id: string;
  name: string;
  url: string;
  date: Date;
  pages: number;
}

export function PDFViewer() {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<PDFDocument | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDocuments = () => {
    setLoading(true);
    fetch("/api/pdf/list")
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data.map((d: any) => ({ ...d, date: new Date(d.date) })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;
    await fetch(`/api/pdf/file/${doc.name}`, { method: "DELETE" });
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  const handleDownload = (doc: PDFDocument) => {
    const a = document.createElement("a");
    a.href = doc.url;
    a.download = doc.name;
    a.click();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Scanned Documents</CardTitle>
            <CardDescription>View and manage scanned PDFs</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={loadDocuments} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex gap-4 min-h-0">
        <div className="w-64 border rounded-lg">
          <div className="p-3 border-b">
            <p className="text-sm">Documents ({documents.length})</p>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-2">
              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <FileText className="size-8 mx-auto mb-2 opacity-50" />
                  {loading ? "Loading..." : "No documents yet"}
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedDoc?.id === doc.id ? "bg-blue-50 border-blue-300" : ""
                    }`}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="size-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.date.toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {doc.pages} pages
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs flex-1"
                        onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                      >
                        <Download className="size-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {selectedDoc ? (
          <div className="flex-1 bg-gray-50">
            <iframe
              src={selectedDoc.url}
              title="PDF Preview"
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a document to preview
          </div>
        )}
      </CardContent>
    </Card>
  );
}