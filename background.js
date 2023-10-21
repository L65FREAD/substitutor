// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "translateText") {
    fetchOpenAIResponse(message.prompt, (response) => {
      sendResponse(response);
    });

    // This is important: it indicates that the response will be sent asynchronously
    return true;
  }
});

function fetchOpenAIResponse(prompt, callback) {
  // Retrieve API key from Chrome storage (assuming you've set it there)
  chrome.storage.local.get(["openai_key"], function (result) {
    const apiKey = "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";

    if (!apiKey) {
      console.error("No API key found!");
      return;
    }

    fetch("https://api.openai.com/v1/engines/davinci/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 150,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.choices && data.choices.length > 0) {
          callback(data.choices[0].text.trim());
        }
      })
      .catch((error) => {
        console.error("Error fetching from OpenAI:", error);
      });
  });
}
