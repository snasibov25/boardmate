import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

const chat = async (filePath, query) => {
    // Step 1: Initialize the LLM
    const model = new ChatOpenAI({
        modelName: "gpt-3.5-turbo",
        openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
    });

    // --- LOGIC BRANCHING ---

    if (filePath) {
        /**
         * SCENARIO A: Document-based Chat (RAG)
         * If a file path exists, we analyze the document.
         */
        console.log("Mode: Document Analysis");

        const loader = new PDFLoader(filePath);
        const data = await loader.load();

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 0,
        });

        const splitDocs = await textSplitter.splitDocuments(data);

        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
        });

        const vectorStore = await MemoryVectorStore.fromDocuments(
            splitDocs,
            embeddings,
        );

        const template = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.

{context}
Question: {question}
Helpful Answer:`;

        const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
            prompt: PromptTemplate.fromTemplate(template),
        });

        const response = await chain.call({
            query: query,
        });

        return response; // Returns { text: "..." }

    } else {
        /**
         * SCENARIO B: General Conversation
         * If no file is uploaded, just talk to the AI normally.
         */
        console.log("Mode: General Chat");

        // In direct chat, we just invoke the model with the query
        const response = await model.invoke(query);

        // Standardize output format to match RetrievalQAChain's response
        return { text: response.content };
    }
};

export default chat;