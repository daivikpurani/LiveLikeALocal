import {
  getEmbeddings,
  getChatResponse,
  processQuery,
} from "./ollamaHandler.js";

async function testEmbeddings() {
  try {
    console.log("Testing embeddings...");
    const text = "What is the capital of France?";
    const embedding = await getEmbeddings(text);
    console.log("Embedding generated successfully!");
    console.log("Embedding length:", embedding.length);
    console.log("First few values:", embedding.slice(0, 5));
  } catch (error) {
    console.error("Embedding test failed:", error);
  }
}

async function testChat() {
  try {
    console.log("\nTesting chat...");
    const prompt = "What is the capital of France?";
    const response = await getChatResponse(prompt);
    console.log("Chat response:", response);
  } catch (error) {
    console.error("Chat test failed:", error);
  }
}

async function testFullQuery() {
  try {
    console.log("\nTesting full query with context...");
    const query = "What is the capital of France?";
    const context =
      "Paris is the capital and largest city of France. It is known for the Eiffel Tower and the Louvre Museum.";
    const result = await processQuery(query, context);
    console.log("Response:", result.response);
    console.log("Embedding length:", result.embedding.length);
  } catch (error) {
    console.error("Full query test failed:", error);
  }
}

// Run all tests
async function runTests() {
  console.log("Starting tests...\n");

  await testEmbeddings();
  await testChat();
  await testFullQuery();

  console.log("\nAll tests completed!");
}

runTests().catch(console.error);
