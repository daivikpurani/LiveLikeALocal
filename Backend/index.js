import express from "express";
import cors from "cors";
import { Ollama } from "ollama";
import dotenv from "dotenv";
import { PineconeStore } from "@langchain/pinecone";
import pinecone from "./pinecone.js";
import {
  processQuery,
  getEmbeddings,
  startNewChat,
  getChatHistory,
  clearChatHistory,
} from "./ollamaHandler.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Ollama client
const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://localhost:11434",
});

let vectorStore;

// Initialize Pinecone Store
async function initializePinecone() {
  const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME);

  const embeddings = {
    embedQuery: async (text) => {
      if (typeof text !== "string") {
        console.error("Invalid text type:", typeof text, text);
        text = String(text);
      }
      return getEmbeddings(text);
    },
    embedDocuments: async (documents) => {
      return Promise.all(
        documents.map(async (doc) => {
          const text = typeof doc === "string" ? doc : doc.pageContent;
          if (typeof text !== "string") {
            console.error("Invalid document text type:", typeof text, text);
            return getEmbeddings(String(text));
          }
          return getEmbeddings(text);
        })
      );
    },
  };

  vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: "",
    textKey: "text",
  });
}

// Initialize Pinecone before starting the server
initializePinecone()
  .then(() => {
    // Start a new chat session
    app.post("/api/chat/start", (req, res) => {
      try {
        const chatId = startNewChat();
        res.json({ chatId });
      } catch (error) {
        console.error("Error starting chat:", error);
        res.status(500).json({ error: "Failed to start chat session" });
      }
    });

    // Get chat history
    app.get("/api/chat/:chatId/history", (req, res) => {
      try {
        const { chatId } = req.params;
        const history = getChatHistory(chatId);
        res.json({ history });
      } catch (error) {
        console.error("Error getting chat history:", error);
        res.status(500).json({ error: "Failed to get chat history" });
      }
    });

    // Clear chat history
    app.delete("/api/chat/:chatId", (req, res) => {
      try {
        const { chatId } = req.params;
        clearChatHistory(chatId);
        res.json({ message: "Chat history cleared" });
      } catch (error) {
        console.error("Error clearing chat history:", error);
        res.status(500).json({ error: "Failed to clear chat history" });
      }
    });

    // Main chat endpoint
    app.post("/api/chat", async (req, res) => {
      try {
        const { message, chatId } = req.body;

        if (!chatId) {
          return res.status(400).json({ error: "chatId is required" });
        }

        // Get embeddings for the query
        const queryEmbedding = await getEmbeddings(message);

        // Search Pinecone for relevant documents
        const results = await vectorStore.similaritySearchWithScore(message, 2);
        const retrievedDocs = results
          .map(([doc]) => doc.pageContent)
          .join("\n\n");
        console.log("Retrieved context:", retrievedDocs);

        // Process the query with context and chat history
        const result = await processQuery(message, retrievedDocs, chatId);

        res.json({
          response: result.response,
          chatHistory: result.chatHistory,
        });
      } catch (error) {
        console.error("API error:", error);
        res.status(500).json({ error: "Failed to process request" });
      }
    });

    // New endpoint for local Ollama processing
    app.post("/api/local-chat", async (req, res) => {
      try {
        const { message } = req.body;

        // Get embeddings for the query
        const queryEmbedding = await getEmbeddings(message);

        // Search Pinecone for relevant documents
        const results = await vectorStore.similaritySearchWithScore(
          queryEmbedding,
          2
        );
        const retrievedDocs = results
          .map(([doc]) => doc.pageContent)
          .join("\n\n");
        console.log("Retrieved context:", retrievedDocs);

        // Process the query with context
        const result = await processQuery(message, retrievedDocs);

        res.json({
          response: result.response,
        });
      } catch (error) {
        console.error("API error:", error);
        res.status(500).json({ error: "Failed to process request" });
      }
    });

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Failed to initialize Pinecone:", error);
    process.exit(1);
  });
