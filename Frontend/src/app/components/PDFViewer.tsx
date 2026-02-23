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
        <div className="flex-1 border rounded-lg flex flex-col">
          {selectedDoc ? (
            <>
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{selectedDoc.name}</p>
                  <p className="text-xs text-gray-500">
                    Page {currentPage} of {selectedDoc.pages}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(selectedDoc.pages, currentPage + 1))}
                    disabled={currentPage === selectedDoc.pages}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-4 bg-gray-50 flex items-center justify-center">
                {/* Simulated PDF page - in production, use react-pdf's Document and Page components */}
                <div className="bg-white shadow-lg p-8 rounded" style={{ aspectRatio: "8.5/11", height: "90%" }}>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="mt-8 text-center text-gray-400 text-sm">
                      PDF Preview - Page {currentPage}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="size-16 mx-auto mb-4 opacity-50" />
                <p>Select a document to preview</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
