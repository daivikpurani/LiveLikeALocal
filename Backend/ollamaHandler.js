import { Ollama } from "ollama";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Ollama client for chat
const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://localhost:11434",
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get model names from environment variables with defaults
const EMBEDDING_MODEL = "text-embedding-ada-002";
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || "llama3.2";

// Store chat histories
const chatHistories = new Map();

// Function to get embeddings using OpenAI
export async function getEmbeddings(text) {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error getting embeddings:", error);
    throw error;
  }
}

// Function to get chat response from Ollama
export async function getChatResponse(prompt, context = "", chatHistory = []) {
  try {
    const systemPrompt = context
      ? `You are a helpful assistant. Use the following context to answer the question accurately:\n\nContext: ${context}\n\n`
      : "You are a helpful assistant.";

    // Construct messages array with chat history
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...chatHistory,
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await ollama.chat({
      model: CHAT_MODEL,
      messages: messages,
      options: {
        temperature: 0.7,
        top_p: 0.95,
      },
    });

    return response.message.content;
  } catch (error) {
    console.error("Error getting chat response:", error);
    throw error;
  }
}

// Function to process a query with context and chat history
export async function processQuery(query, context = "", chatId = null) {
  try {
    // Get embeddings for the query using OpenAI
    const queryEmbedding = await getEmbeddings(query);

    // Get or initialize chat history
    let chatHistory = [];
    if (chatId) {
      chatHistory = chatHistories.get(chatId) || [];
    }

    // Get chat response with context and history
    const response = await getChatResponse(query, context, chatHistory);

    // Update chat history
    if (chatId) {
      chatHistory.push(
        { role: "user", content: query },
        { role: "assistant", content: response }
      );
      chatHistories.set(chatId, chatHistory);
    }

    return {
      embedding: queryEmbedding,
      response: response,
      chatHistory: chatHistory,
    };
  } catch (error) {
    console.error("Error processing query:", error);
    throw error;
  }
}

// Function to start a new chat
export function startNewChat() {
  const chatId = Date.now().toString();
  chatHistories.set(chatId, []);
  return chatId;
}

// Function to get chat history
export function getChatHistory(chatId) {
  return chatHistories.get(chatId) || [];
}

// Function to clear chat history
export function clearChatHistory(chatId) {
  chatHistories.delete(chatId);
}
