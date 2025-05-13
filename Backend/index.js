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
import fs from "fs";

dotenv.config();
const MODEL = process.env.OLLAMA_MODEL || "llama3";

const app = express();
app.use(cors());
app.use(express.json());

// Store feedback (in a real app, you'd use a database)
let feedbackStore = [];

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

    // New travel planning endpoint
    app.post("/api/travel-chat", async (req, res) => {
      const startTime = Date.now();
      try {
        const { message } = req.body;
        console.log("\n=== PINEONE DATA RETRIEVAL ===");
        console.log("Searching Pinecone for:", message);

        let docs;
        try {
          docs = await vectorStore.similaritySearch(message, 3);
          console.log("\nRetrieved documents from Pinecone:");
          docs.forEach((doc, index) => {
            console.log(`\nDocument ${index + 1}:`);
            console.log(doc.pageContent);
          });
        } catch (pineErr) {
          console.error("Pinecone search error:", pineErr);
          return res.status(500).json({ error: "Pinecone search failed", details: pineErr.message || pineErr });
        }

        const context = docs.map(d => d.pageContent).join("\n\n");
        console.log("\nCombined context being sent to AI:", context);

        let response;
        try {
          response = await ollama.chat({
            model: MODEL,
            messages: [
              { role: "system", content: "You are a travel-planning assistant." },
              { role: "system", content: `Context:\n${context}` },
              { role: "user", content: message },
            ],
            options: { temperature: 0.7 },
          });
          console.log("\nAI Response:", response.message.content.trim());
        } catch (ollamaErr) {
          console.error("Ollama chat error:", ollamaErr);
          return res.status(500).json({ error: "Ollama chat failed", details: ollamaErr.message || ollamaErr });
        }

        console.log("=== END PINEONE DATA RETRIEVAL ===\n");
        const responseId = Date.now().toString();

        const elapsed = Date.now() - startTime;
        console.log(`Request processed in ${elapsed}ms`);

        res.json({ 
          reply: response.message.content.trim(),
          responseId: responseId
        });
      } catch (error) {
        console.error("API error (outer catch):", error);
        res.status(500).json({ error: "Failed to process request", details: error.message || error });
      }
    });

    // New feedback endpoint
    app.post("/api/feedback", (req, res) => {
      try {
        const { responseId, rating, comment, location } = req.body;
        
        if (!responseId || !rating) {
          return res.status(400).json({ 
            error: "responseId and rating are required" 
          });
        }

        const feedback = {
          id: Date.now().toString(),
          responseId,
          rating,
          comment: comment || "",
          location: location || "",
          timestamp: new Date().toISOString()
        };

        feedbackStore.push(feedback);
        console.log("New feedback received:", feedback);

        res.json({ 
          message: "Feedback received successfully",
          feedback 
        });
      } catch (error) {
        console.error("Error saving feedback:", error);
        res.status(500).json({ error: "Failed to save feedback" });
      }
    });

    // Get all feedback
    app.get("/api/feedback", (req, res) => {
      try {
        res.json({ feedback: feedbackStore });
      } catch (error) {
        console.error("Error retrieving feedback:", error);
        res.status(500).json({ error: "Failed to retrieve feedback" });
      }
    });

    // Get feedback for a specific location
    app.get("/api/feedback/location/:location", (req, res) => {
      try {
        const { location } = req.params;
        const locationFeedback = feedbackStore.filter(
          f => f.location.toLowerCase() === location.toLowerCase()
        );
        res.json({ feedback: locationFeedback });
      } catch (error) {
        console.error("Error retrieving location feedback:", error);
        res.status(500).json({ error: "Failed to retrieve location feedback" });
      }
    });

    // Add this new endpoint
    app.get('/test-results', (req, res) => {
        try {
            const results = JSON.parse(fs.readFileSync('test_results.csv', 'utf8'));
            
            // Calculate summary statistics
            const summary = {
                avgAccuracy: results.reduce((acc, curr) => acc + curr.accuracy_score, 0) / results.length,
                avgRelevance: results.reduce((acc, curr) => acc + curr.relevance_score, 0) / results.length,
                overallScore: results.reduce((acc, curr) => acc + curr.overall_score, 0) / results.length
            };

            res.json({ results, summary });
        } catch (error) {
            res.status(500).json({ error: 'Failed to read test results' });
        }
    });

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Failed to initialize Pinecone:", error);
    process.exit(1);
  });
