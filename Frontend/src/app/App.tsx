import logo from "./assets/BigBoardMateLogo.png";
import smalllogo from "./assets/SmallBoardMateLogo.png";
import { useState } from "react";
import RobotControls from "./components/RobotControls";
import { PDFViewer } from "./components/PDFViewer";
import { FileManager } from "./components/FileManager";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "./components/ui/tabs";
import { Bot } from "lucide-react";
import { toast, Toaster } from "sonner";

/** * IMPORTANT: Import the AI Assistant component
 * Ensure the file exists at src/components/AIAssistant.tsx
 */
import AIAssistant from "./components/AIAssistant";

type RobotMode = "clean" | "scan" | "write" | "idle";
type RobotStatus = "active" | "paused" | "stopped";

interface PDFDocument {
    id: string;
    name: string;
    url: string;
    date: Date;
    pages: number;
}

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadDate: Date;
}

export default function App() {
    const [robotMode, setRobotMode] = useState<RobotMode>("idle");
    const [robotStatus, setRobotStatus] = useState<RobotStatus>("stopped");
    const [scannedDocuments, setScannedDocuments] = useState<PDFDocument[]>([
        {
            id: "1",
            name: "output.pdf",
            url: "http://localhost:8080/api/pdf/latest",
            date: new Date(2026, 1, 18, 9, 30),
            pages: 1,
        },
        {
            id: "2",
            name: "Meeting_Notes_2026-02-17.pdf",
            url: "#",
            date: new Date(2026, 1, 17, 14, 15),
            pages: 2,
        },
    ]);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

    const handleModeChange = (mode: RobotMode) => {
        setRobotMode(mode);
        if (mode === "idle") {
            setRobotStatus("stopped");
        }
        if(mode === "clean" || mode === "scan" || mode === "write") {
            setRobotStatus("active");
        }
        if (mode === "write") {
            toast.info("Write mode will come later");
        }
        toast.success(`Robot mode changed to: ${mode}`);
    };

    const handleStatusChange = (status: RobotStatus) => {
        setRobotStatus(status);

        if (status === "active" && robotMode === "scan") {
            // Simulate scanning completion logic
            setTimeout(() => {
                const newScan: PDFDocument = {
                    id: Date.now().toString(),
                    name: `Whiteboard_Scan_${new Date().toISOString().split("T")[0]}_${new Date().toTimeString().split(" ")[0].replace(/:/g, "-")}.pdf`,
                    url: "http://localhost:8080/api/pdf/latest",
                    date: new Date(),
                    pages: 1,
                };
                setScannedDocuments((prev) => [newScan, ...prev]);
                toast.success("Scan completed successfully!");
                setRobotStatus("stopped");
            }, 3000);
        }

        toast.info(`Robot ${status === "active" ? "started" : status}`);
    };

    const handleFileUpload = (file: File) => {
        const newFile: UploadedFile = {
            id: Date.now().toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date(),
        };
        setUploadedFiles((prev) => [...prev, newFile]);
        toast.success(`File uploaded: ${file.name}`);
    };

    const handleFileRemove = (id: string) => {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
        toast.success("File removed");
    };

    const handleDocumentDelete = (id: string) => {
        setScannedDocuments((prev) => prev.filter((d) => d.id !== id));
        toast.success("Document deleted");
    };

    const handleDocumentDownload = (doc: PDFDocument) => {
        toast.success(`Downloading: ${doc.name}`);
    };

    const isCameraConnected = robotStatus === "active" || robotMode !== "idle";

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />

            {/* Navigation Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="BoardMate Logo" className="size-8" />
                        <div>
                            <h1 className="text-xl font-semibold">BoardMate</h1>
                            <p className="text-sm text-gray-500">
                                Scan, Clean, and Transcribe Whiteboards
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Dashboard Layout */}
            <main className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Main Controls Section */}
                    <div className="lg:col-span-2">
                        <RobotControls
                            mode={robotMode}
                            status={robotStatus}
                            onModeChange={handleModeChange}
                            onStatusChange={handleStatusChange}
                        />
                    </div>

                    {/* Real-time Camera Feed View */}

                </div>

                {/* Content Management Tabs */}
                <Tabs defaultValue="scanned" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="scanned">Scanned PDFs</TabsTrigger>
                        <TabsTrigger value="upload">Upload for Transcription</TabsTrigger>
                    </TabsList>

                    <TabsContent value="scanned" className="mt-6">
                        <PDFViewer
                            documents={scannedDocuments}
                            onDelete={handleDocumentDelete}
                            onDownload={handleDocumentDownload}
                        />
                    </TabsContent>

                    <TabsContent value="upload" className="mt-6">
                        <FileManager
                            uploadedFiles={uploadedFiles}
                            onFileUpload={handleFileUpload}
                            onFileRemove={handleFileRemove}
                        />
                    </TabsContent>
                </Tabs>
            </main>

            {/* AI ASSISTANT FLOATING WIDGET
          This connects to your Node.js backend (Port 5001)
      */}
            <AIAssistant />
        </div>
    );
}