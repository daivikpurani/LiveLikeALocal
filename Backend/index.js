import express from "express";
import cors from "cors";
import { Ollama } from "ollama";
import dotenv from "dotenv";
import { PineconeStore } from "@langchain/pinecone";
import pinecone from "./pinecone.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Ollama client
const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://localhost:11434",
});

// Initialize Pinecone Store once
const pineconeIndex = pinecone.index("collab-chat-mini");
const vectorStore = new PineconeStore({
  pineconeIndex,
  namespace: "chat-history",
});

// Custom embeddings function using Ollama
async function getEmbeddings(text) {
  const response = await ollama.embeddings({
    model: "nomic-embed-text",
    prompt: text,
  });
  return response.embedding;
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message, is_new_chat } = req.body;

    // Get embeddings for the query
    const queryEmbedding = await getEmbeddings(message);

    // Search Pinecone for relevant documents
    const results = await vectorStore.similaritySearchWithScore(
      queryEmbedding,
      2
    );
    const retrievedDocs = results.map(([doc]) => doc.pageContent).join("\n\n");
    console.log(retrievedDocs);

    // Construct the prompt with retrieved context
    const prompt = `Context: ${retrievedDocs}\n\nUser: ${message}\n\nAssistant:`;

    // Generate response using Ollama
    const response = await ollama.chat({
      model: "mistral",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that uses the provided context to answer questions accurately.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    res.json({ reply: response.message.content });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
