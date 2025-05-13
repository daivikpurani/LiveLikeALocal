// queryProcessor.js

import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import pkg from "@pinecone-database/pinecone";
const { Pinecone } = pkg;
import OpenAI from "openai";

const openai = new OpenAI();
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Verify index exists and is accessible
let index;
try {
  console.log("Initializing Pinecone index:", process.env.PINECONE_INDEX_NAME);
  index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

  // Test the index with a simple query
  const testQuery = await index.query({
    vector: Array(1536).fill(0), // Test vector of correct dimension
    topK: 1,
    includeMetadata: true,
  });
  console.log("Index test successful:", {
    indexName: process.env.PINECONE_INDEX_NAME,
    testQueryResults: testQuery.matches.length,
  });
} catch (error) {
  console.error("Pinecone index initialization failed:", {
    error: error.message,
    indexName: process.env.PINECONE_INDEX_NAME,
    apiKey: process.env.PINECONE_API_KEY ? "Present" : "Missing",
  });
  throw new Error("Failed to initialize Pinecone index: " + error.message);
}

// Initialize LLM
const localLLM = new ChatOllama({
  model: "llama3.2",
  baseUrl: process.env.OLLAMA_HOST || "http://localhost:11434",
});

// ——————————————
// UTILITIES
// ——————————————
function preprocessQuery(q) {
  return q
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function classifyIntent(rawQuery) {
  // Simple few‐shot intent classification via OpenAI
  const resp = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an intent classifier for SF travel queries. Return one of: find-free, find-category, find-date-range, general.",
      },
      { role: "user", content: `Query: "${rawQuery}"\nIntent:` },
    ],
    temperature: 0,
    max_tokens: 10,
  });
  return resp.choices[0].message.content.trim();
}

function buildMetadataFilter(intent, rawQuery) {
  console.log("\n=== Building Metadata Filter ===");
  console.log("Intent:", intent);
  console.log("Raw query:", rawQuery);

  // Start with an empty filter
  const filter = {};

  // Only add filters if we're very confident about the intent
  if (intent === "find-free") {
    filter.cost = { $eq: "FREE" };
    console.log("Added cost filter for free events");
  }

  if (intent === "find-category") {
    // Look for known categories
    const cats = ["museum", "comedy", "music", "market", "festival", "art"];
    for (const c of cats) {
      if (rawQuery.toLowerCase().includes(c)) {
        filter.category = { $eq: c };
        console.log("Added category filter:", c);
        break;
      }
    }
  }

  if (intent === "find-date-range") {
    // Simplified date filtering - only add if very specific
    const now = new Date();
    if (/this weekend/.test(rawQuery)) {
      const saturday = new Date(
        now.setDate(now.getDate() + (6 - now.getDay()))
      );
      const sunday = new Date(now.setDate(now.getDate() + 1));
      filter.eventDate = {
        $between: [saturday.toISOString(), sunday.toISOString()],
      };
      console.log("Added date range filter for this weekend");
    }
  }

  // If no specific filters were added, use a very permissive filter
  if (Object.keys(filter).length === 0) {
    console.log("No specific filters added, using permissive filter");
    return { type: { $exists: true } }; // This will match all documents
  }

  console.log("Final filter:", JSON.stringify(filter, null, 2));
  return filter;
}

// ——————————————
// VECTOR SEARCH + RERANKING
// ——————————————
async function searchVectorDB(queryEmbedding, filter = {}, topK = 10) {
  console.log("\n=== Vector Search Details ===");
  console.log("Query embedding:", {
    length: queryEmbedding.length,
    sample: queryEmbedding.slice(0, 5), // Show first 5 values
    isAllZeros: queryEmbedding.every((v) => v === 0),
    hasNaN: queryEmbedding.some((v) => isNaN(v)),
  });

  console.log("Search parameters:", {
    indexName: process.env.PINECONE_INDEX_NAME,
    topK,
    includeMetadata: true,
  });

  try {
    const res = await index.query({
      vector: queryEmbedding,
      topK: topK * 2, // Request more results to account for deduplication
      includeMetadata: true,
      includeValues: false,
    });

    // Deduplicate results
    const uniqueMatches = [];
    const seenContents = new Set();
    const seenIds = new Set();

    for (const match of res.matches) {
      // Skip if we've seen this ID before
      if (seenIds.has(match.id)) continue;

      // Get the content to compare
      const content = match.metadata.description || match.metadata.text || "";

      // Skip if content is empty or we've seen very similar content
      if (!content || seenContents.has(content)) continue;

      // Add to our results
      uniqueMatches.push(match);
      seenIds.add(match.id);
      seenContents.add(content);

      // Stop if we have enough unique results
      if (uniqueMatches.length >= topK) break;
    }

    console.log("Search results:", {
      totalMatches: res.matches.length,
      uniqueMatches: uniqueMatches.length,
      firstMatch: uniqueMatches[0]
        ? {
            id: uniqueMatches[0].id,
            score: uniqueMatches[0].score,
            metadata: uniqueMatches[0].metadata,
          }
        : null,
    });

    return uniqueMatches;
  } catch (error) {
    console.error("Vector search failed:", {
      error: error.message,
      errorType: error.constructor.name,
      stack: error.stack,
    });
    throw error;
  }
}

async function rerankWithLLM(rawQuery, matches, topM = 5) {
  const snippets = matches
    .slice(0, topM)
    .map((m, i) => `(${i + 1}) ${m.metadata.description}`)
    .join("\n\n");

  try {
    const response = await localLLM.invoke([
      {
        role: "system",
        content:
          "You are a search result reranker. Score each snippet 1–10 for relevance. Return only the scores in the format: 1) score\n2) score\n...",
      },
      {
        role: "user",
        content: `Query: ${rawQuery}\nSnippets:\n${snippets}\n\nReturn lines sorted by score, e.g.\n1) 8\n2) 10\n...`,
      },
    ]);

    const scores = response.content
      .trim()
      .split("\n")
      .map((l) => l.match(/^(\d+)\)\s*(\d+)/).slice(1))
      .map(([, idx, score]) => ({
        idx: Number(idx) - 1,
        score: Number(score),
      }));

    // sort by score desc
    scores.sort((a, b) => b.score - a.score);
    return scores.map((s) => matches[s.idx]);
  } catch (error) {
    console.error("Error reranking with Llama:", error);
    // If reranking fails, return original matches
    return matches.slice(0, topM);
  }
}

// ——————————————
// SUMMARIZATION
// ——————————————
async function summarizeResults(matches) {
  // Combine all text content with clear separation
  const combined = matches
    .map((match, index) => {
      const text = match.metadata.description || match.metadata.text || "";
      const score = match.score.toFixed(2);
      return `[Event ${
        index + 1
      } - Relevance: ${score}]\n${text}\n-------------------`;
    })
    .join("\n\n");

  try {
    const response = await localLLM.invoke([
      {
        role: "system",
        content: `You are a travel and event planning assistant. Your task is to:
1. Extract and organize all events, activities, and locations from the provided text
2. Group them by time of day (Morning, Afternoon, Evening)
3. Include all relevant details like times, locations, prices, and descriptions
4. Format the response in clear markdown with appropriate headers and sections
5. Add any relevant context or suggestions that would be helpful for a visitor`,
      },
      {
        role: "user",
        content: `Here are the event descriptions. Create a comprehensive itinerary by extracting and organizing all the relevant information:\n\n${combined}`,
      },
    ]);

    return response.content;
  } catch (error) {
    console.error("Error summarizing with Llama:", error);
    // Fallback to a simple format if summarization fails
    return matches
      .map(
        (match) =>
          `- ${match.metadata.description || match.metadata.text || ""}`
      )
      .join("\n");
  }
}

// ——————————————
// FINAL ANSWER GENERATION
// ——————————————
async function generateHumanResponse(rawQuery, summary) {
  const prompt = `
You are an expert SF itinerary assistant. The user asked: "${rawQuery}".

Here is the extracted information about events and activities:
${summary}

Based on this information, create a personalized itinerary that:
1. Is organized by time of day
2. Includes all relevant details from the text
3. Uses clear markdown formatting
4. Provides practical suggestions and context
5. Focuses on the user's specific interests

Format the response in a clear, easy-to-follow structure with appropriate markdown formatting.`;

  try {
    const response = await localLLM.invoke([
      {
        role: "system",
        content:
          "You are a helpful assistant that creates detailed, well-formatted travel itineraries in markdown.",
      },
      { role: "user", content: prompt },
    ]);

    return response.content;
  } catch (error) {
    console.error("Error generating response with Llama:", error);
    throw error;
  }
}

// ——————————————
// MAIN PIPELINE
// ——————————————
export async function answerQuery(userQuery) {
  console.log("\n=== Starting Query Processing ===");
  console.log("Input query:", userQuery);

  // 1. Preprocess
  const q = preprocessQuery(userQuery);
  console.log("Preprocessed query:", q);

  // 2. Classify intent & build filter
  const intent = await classifyIntent(q);
  console.log("Detected intent:", intent);
  const metadataFilter = buildMetadataFilter(intent, userQuery);
  console.log("Built metadata filter:", metadataFilter);

  // 3. Embed
  console.log("\nGenerating embeddings...");
  try {
    const embeddingResp = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: q,
    });
    const queryEmbedding = embeddingResp.data[0].embedding;
    console.log("Embedding generation successful:", {
      model: "text-embedding-ada-002",
      dimension: queryEmbedding.length,
      sample: queryEmbedding.slice(0, 5), // Show first 5 values
    });

    // 4. Vector search
    console.log("\nExecuting vector search...");
    const rawMatches = await searchVectorDB(queryEmbedding, {}, 100);
    console.log("Raw matches found:", rawMatches.length);

    if (rawMatches.length === 0) {
      console.log("No matches found, returning fallback response");
      return "Sorry—I can't find any events matching that. Could you try a different date, category, or filter?";
    }

    // 5. (Optional) Rerank top 10 with LLM if scores are close
    let topMatches = rawMatches.slice(0, 50);
    console.log("Top matches before reranking:", topMatches.length);
    // topMatches = await rerankWithLLM(q, topMatches, 50);
    console.log("Top matches after reranking:", topMatches.length);
    console.log("Top matches:", topMatches);

    // 6. Summarize
    console.log("\nGenerating summary...");
    const summary = await summarizeResults(topMatches);
    console.log("Generated summary:", summary);

    // 7. Generate final
    console.log("\nGenerating final response...");
    const response = await generateHumanResponse(userQuery, summary);
    console.log("=== Query Processing Complete ===\n");

    return response;
  } catch (error) {
    console.error("Error in query processing:", {
      error: error.message,
      errorType: error.constructor.name,
      stack: error.stack,
    });
    throw error;
  }
}
