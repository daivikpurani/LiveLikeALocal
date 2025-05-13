import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Initialize LLM
const localLLM = new ChatOllama({
  model: process.env.OLLAMA_CHAT_MODEL || "llama3.2",
  baseUrl: process.env.OLLAMA_HOST || "http://localhost:11434",
});

function preprocessQuery(query) {
  // Remove special characters and extra whitespace
  query = query.replace(/[^\w\s]/g, " ");
  query = query.replace(/\s+/g, " ").trim();
  return query.toLowerCase();
}

async function improveQuery(originalQuery) {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a search query optimizer. Your task is to improve the given search query to get better results.
Follow these rules strictly:
1. DO NOT add concepts or terms that are not directly related to the query
2. DO NOT make assumptions about the context
3. ONLY add synonyms or closely related terms that are directly relevant
4. Keep the core meaning of the original query intact
5. If the query is about a specific term or concept, focus on that term/concept
6. Include both specific and general terms to capture different levels of relevance

Return ONLY the improved query, nothing else.`,
    ],
    ["user", "Improve this search query: {query}"],
  ]);

  const chain = prompt.pipe(localLLM).pipe(new StringOutputParser());
  const improvedQuery = await chain.invoke({ query: originalQuery });
  return improvedQuery.trim();
}

async function rerankResults(query, results, topK = 5) {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a search result reranker. Your task is to evaluate how well each result matches the query.
Consider:
1. Semantic relevance to the query
2. Completeness of information
3. Specificity to the query topic
4. Clarity and coherence

Return ONLY the indices of the top {topK} most relevant results in order of relevance.
Example format: "2,0,1" means result 2 is most relevant, then 0, then 1.`,
    ],
    [
      "user",
      `Query: {query}

Results:
{results}

Return the indices of the top {topK} most relevant results:`,
    ],
  ]);

  const formattedResults = results
    .map((result, i) => `Result ${i}:\n${result.pageContent}\n`)
    .join("\n");

  const chain = prompt.pipe(localLLM).pipe(new StringOutputParser());
  const rerankedIndices = await chain.invoke({
    query,
    results: formattedResults,
    topK,
  });

  try {
    const indices = rerankedIndices
      .split(",")
      .map((idx) => parseInt(idx.trim()));
    return indices.map((idx) => results[idx]);
  } catch {
    return results.slice(0, topK);
  }
}

async function generateHumanResponse(query, results) {
  const context = results
    .map((result, i) => `Source ${i + 1}:\n${result.pageContent}`)
    .join("\n\n");

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful AI assistant. Your task is to generate a clear, concise, and accurate response to the user's query based on the provided sources.
Follow these guidelines:
1. Use only information from the provided sources
2. Write in a clear, conversational tone
3. Structure your response logically
4. If the sources contain conflicting information, acknowledge this
5. If you're unsure about something, say so
6. Keep the response focused and relevant to the query

Format your response as a well-structured paragraph or multiple paragraphs if needed.`,
    ],
    [
      "user",
      `Query: {query}

Sources:
{context}

Please provide a clear and accurate response to the query based on the sources above:`,
    ],
  ]);

  const chain = prompt.pipe(localLLM).pipe(new StringOutputParser());
  const response = await chain.invoke({
    query,
    context,
  });

  return response.trim();
}

export { preprocessQuery, improveQuery, rerankResults, generateHumanResponse };
