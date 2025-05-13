import fetch from "node-fetch";

async function testEndpoint() {
  try {
    console.log("Testing /api/chat/test endpoint...");

    const response = await fetch("http://localhost:8000/api/chat/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "What are some unique things to do in San Francisco?",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log("\n=== Test Results ===");
    console.log("\nResponse:", result.response);
    console.log("\nRetrieved Context:", result.context);
    console.log("\nEmbedding length:", result.embedding.length);
  } catch (error) {
    console.error("Error testing endpoint:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response body:", await error.response.text());
    }
  }
}

// Run the test
testEndpoint();
