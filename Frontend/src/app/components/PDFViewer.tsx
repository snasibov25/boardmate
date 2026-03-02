import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { FileText, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { useState } from "react";

interface PDFDocument {
  id: string;
  name: string;
  url: string;
  date: Date;
  pages: number;
}

interface PDFViewerProps {
  documents: PDFDocument[];
  onDelete: (id: string) => void;
  onDownload: (doc: PDFDocument) => void;
}

export function PDFViewer({ documents, onDelete, onDownload }: PDFViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<PDFDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSelectDocument = (doc: PDFDocument) => {
    setSelectedDoc(doc);
    setCurrentPage(1);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Scanned Documents</CardTitle>
        <CardDescription>View and manage scanned PDFs</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex gap-4 min-h-0">
        {/* Document List */}
        <div className="w-64 border rounded-lg">
          <div className="p-3 border-b">
            <p className="text-sm">Documents ({documents.length})</p>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-2">
              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <FileText className="size-8 mx-auto mb-2 opacity-50" />
                  No documents yet
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedDoc?.id === doc.id ? "bg-blue-50 border-blue-300" : ""
                    }`}
                    onClick={() => handleSelectDocument(doc)}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(doc);
                        }}
                      >
                        <Download className="size-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(doc.id);
                          if (selectedDoc?.id === doc.id) {
                            setSelectedDoc(null);
                          }
                        }}
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

        {/* PDF Preview */}
        
        
        {selectedDoc ? (
          <div className="flex-1 bg-gray-50">
            <iframe
              key={`${selectedDoc.id}-${currentPage}`}
              src={`${selectedDoc.url}#page=${currentPage}`}
              title="PDF Preview"
              className="w-full h-full"
            />
          </div>
        ) : (
          <div> Select a document to preview </div>
        )}
      </CardContent>
    </Card>
  );
}
