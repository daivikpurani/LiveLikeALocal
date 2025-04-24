// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PineconeStore } from "@langchain/pinecone";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import pinecone from "./pinecone.js";
import ollama from "ollama";                 // default export = function ✅

dotenv.config();
const MODEL = process.env.OLLAMA_MODEL || "llama3";

const run = async () => {
  const pcIndex = pinecone.index("travelagent");
  const vectorStore = await PineconeStore.fromExistingIndex(
    new HuggingFaceInferenceEmbeddings({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      apiKey: process.env.HUGGINGFACE_API_KEY,
    }),
    { pineconeIndex: pcIndex, namespace: "default" },
  );

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;

      const docs = await vectorStore.similaritySearch(message, 3);
      const context = docs.map(d => d.pageContent).join("\n\n");

      const response = await ollama.chat({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a travel-planning assistant." },
          { role: "system", content: `Context:\n${context}` },
          { role: "user", content: message },
        ],
        options: { temperature: 0.7 },
      });

      res.json({ reply: response.message.content.trim() });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed" });
    }
  });

  app.listen(3000, () => console.log("Server on 3000"));
};
run();
