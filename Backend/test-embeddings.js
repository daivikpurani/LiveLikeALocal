import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: "",
});

async function testEmbeddings() {
  try {
    console.log("Testing OpenAI embeddings API...");

    // Test text
    const text = "What is the capital of France?";

    // Get embeddings
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    const embedding = response.data[0].embedding;

    // Log results
    console.log("\nEmbedding generated successfully!");
    console.log("Embedding length:", embedding.length);
    console.log("First few values:", embedding.slice(0, 5));
    console.log("\nFull embedding:", embedding);

    // Verify dimensions
    if (embedding.length === 1536) {
      console.log("\n✅ Dimension check passed: 1536 dimensions");
    } else {
      console.log(
        "\n❌ Dimension check failed: Expected 1536, got",
        embedding.length
      );
    }
  } catch (error) {
    console.error("Error testing embeddings:", error);
  }
}

// Run the test
testEmbeddings();
