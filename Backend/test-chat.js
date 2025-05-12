import fetch from "node-fetch";

const API_URL = "http://localhost:8000/api";

async function testChat() {
  try {
    // Start a new chat session
    console.log("Starting new chat session...");
    const startResponse = await fetch(`${API_URL}/chat/start`, {
      method: "POST",
    });
    const { chatId } = await startResponse.json();
    console.log("Chat ID:", chatId);

    // First message
    console.log("\nSending first message...");
    const message1 =
      "Tell me about artificial intelligence and its impact on healthcare.";
    const response1 = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message1,
        chatId: chatId,
      }),
    });
    const result1 = await response1.json();
    console.log("User:", message1);
    console.log("Assistant:", result1.reply);

    // Follow-up question
    console.log("\nSending follow-up question...");
    const message2 = "How is it being used in medical imaging specifically?";
    const response2 = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message2,
        chatId: chatId,
      }),
    });
    const result2 = await response2.json();
    console.log("User:", message2);
    console.log("Assistant:", result2.reply);

    // Get chat history
    console.log("\nRetrieving chat history...");
    const historyResponse = await fetch(`${API_URL}/chat/${chatId}/history`);
    const { history } = await historyResponse.json();
    console.log("Chat History:", JSON.stringify(history, null, 2));

    // Clear chat history
    console.log("\nClearing chat history...");
    await fetch(`${API_URL}/chat/${chatId}`, {
      method: "DELETE",
    });
    console.log("Chat history cleared");
  } catch (error) {
    console.error("Error during chat test:", error);
  }
}

// Run the test
testChat();
