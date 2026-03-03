import React, { useState, useRef } from 'react';
import {MessageSquare, Upload, Send, Loader2, X, Bot} from 'lucide-react';
import AIHelperIcon from './assets/AiButtonImage.png';
// Connection URL for your Node.js AI Backend
const NODE_API_BASE = "http://localhost:5001";

const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [question, setQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Function to handle PDF/Document upload to Node.js server
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${NODE_API_BASE}/upload`, {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                setFile(selectedFile);
                setChatHistory(prev => [...prev, { role: 'ai', content: `✅ File "${selectedFile.name}" uploaded. I am ready to analyze it.` }]);
            }
        } catch (error) {
            console.error("Connection Error:", error);
            setChatHistory(prev => [...prev, { role: 'ai', content: "❌ Error connecting to Node.js backend (Port 5001)." }]);
        } finally {
            setUploading(false);
        }
    };

    // Function to send questions to the AI chat endpoint
    const handleAsk = async () => {
        if (!question.trim()) return;

        const userQuery = question;
        setQuestion("");
        setChatHistory(prev => [...prev, { role: 'user', content: userQuery }]);
        setLoading(true);

        try {
            const response = await fetch(`${NODE_API_BASE}/chat?question=${encodeURIComponent(userQuery)}`);
            const answer = await response.text();
            setChatHistory(prev => [...prev, { role: 'ai', content: answer }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'ai', content: "❌ Failed to reach AI service." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
            {/* AI Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                    {/* Header with new icon */}
                    <div className="p-4 bg-slate-900 text-white flex justify-between items-center font-medium">
                    <span className="flex items-center gap-2">
                        <img src={AIHelperIcon} alt="AI" className="w-6 h-6 object-contain" />
                        AI Assistant
                    </span>
                        <button onClick={() => setIsOpen(false)} className="hover:text-gray-300 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Message List Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-sm">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl ${
                                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-2 text-gray-400 italic text-xs ml-2">
                                <Loader2 size={12} className="animate-spin" />
                                AI is generating response...
                            </div>
                        )}
                    </div>

                    {/* Input & Upload Controls */}
                    <div className="p-3 border-t bg-white">
                        <div className="flex items-center gap-2 mb-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 flex items-center gap-1 text-gray-600 transition-colors"
                            >
                                {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                {file ? file.name : "Analyze Document"}
                            </button>
                            <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} />
                        </div>

                        <div className="flex gap-2">
                            <input
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                                placeholder="Type your question..."
                                className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleAsk}
                                disabled={loading || !question.trim()}
                                className="bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700 disabled:opacity-50 transition-all"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button using your new design */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative w-16 h-16 transition-all duration-300 active:scale-90"
            >
                {/* The main logo image */}
                <img
                    src={AIHelperIcon}
                    alt="AI Helper"
                    className="w-full h-full object-contain rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow"
                />

                {/* Optional: A small "online" dot or glow effect */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                )}
            </button>
        </div>
    );
    }

export default AIAssistant;