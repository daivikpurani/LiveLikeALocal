import { getEmbeddings, processQuery, startNewChat } from "./ollamaHandler.js";

async function testEmbeddings() {
  try {
    console.log("\n=== Testing Embeddings ===");
    const text = "What is the capital of France?";
    const embedding = await getEmbeddings(text);

    console.log("Embedding generated successfully!");
    console.log("Embedding length:", embedding.length);
    console.log("First few values:", embedding.slice(0, 5));

    if (embedding.length === 1536) {
      console.log("✅ Dimension check passed: 1536 dimensions");
    } else {
      console.log(
        "❌ Dimension check failed: Expected 1536, got",
        embedding.length
      );
    }
  } catch (error) {
    console.error("Error testing embeddings:", error);
  }
}

async function testQueryProcessing() {
  try {
    console.log("\n=== Testing Query Processing ===");
    const chatId = startNewChat();
    const query = "What is the capital of France?";
    const context =
      "Paris is the capital and largest city of France. It is known for the Eiffel Tower and the Louvre Museum.";

    console.log("Processing query with context...");
    const result = await processQuery(query, context, chatId);

    console.log("\nResponse:", result.response);
    console.log("Embedding length:", result.embedding.length);
    console.log("Chat history length:", result.chatHistory.length);

    if (result.embedding.length === 1536) {
      console.log("✅ Query processing dimension check passed");
    } else {
      console.log("❌ Query processing dimension check failed");
    }
  } catch (error) {
    console.error("Error testing query processing:", error);
  }
}

// Run all tests
async function runTests() {
  console.log("Starting tests...");
  await testEmbeddings();
  await testQueryProcessing();
  console.log("\nAll tests completed!");
}

// Run the tests
runTests();
