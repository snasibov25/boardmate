import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import chat from "./chat.js";

dotenv.config();

const app = express();
// Enable CORS for your React frontend (localhost:5173 or 3000)
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        // Save with original name to avoid confusion
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage: storage });

const PORT = 5001;

// Global variable to store the current file path
// Initialized as null so chat.js knows there is no file yet
let filePath = null;

// Endpoint: Upload a file
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }
        filePath = req.file.path;
        console.log("File uploaded and saved to:", filePath);
        res.send("File uploaded successfully.");
    } catch (error) {
        res.status(500).send("Upload failed: " + error.message);
    }
});

// Endpoint: Chat with AI (Works with or without a file)
app.get("/chat", async (req, res) => {
    const userQuestion = req.query.question;

    if (!userQuestion) {
        return res.status(400).send("Please provide a question.");
    }

    try {
        console.log(`Received question: ${userQuestion} | Current File: ${filePath || "None"}`);

        /**
         * Call the chat logic.
         * If filePath is null, chat.js should handle it as a general conversation.
         */
        const resp = await chat(filePath, userQuestion);

        // Send only the text response back to the frontend
        res.send(resp.text || "AI produced an empty response.");
    } catch (error) {
        console.error("AI Server Error:", error);
        // Return a 500 error instead of crashing the server
        res.status(500).send("AI Processing Error: " + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`-----------------------------------------------`);
    console.log(`🚀 AI Server is running on http://localhost:${PORT}`);
    console.log(`📂 Uploads directory: D:/Git/boardmate/AiServer/uploads`);
    console.log(`-----------------------------------------------`);
});