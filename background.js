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
  const apiKey = "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";

  if (!apiKey) {
    console.error("No API key found!");
    return;
  }
  const [difficulty, language] = loadSettings();

  switch (difficulty) {
    case "Easy":
      break;
    case "Medium":
      break;
    case "Hard":
      break;
  }
  const endpoint = "https://api.openai.com/v1/chat/completions";
  const sanitizedText = `translate only few words from the the strings, and keep most of the words in the original language so that it is a mix of both the languages, and retrun the the result array"
  `;
  // Define the request payload
  const payload = {
    messages: [
      {
        role: "user",
        content: sanitizedText + prompt,
      },
    ],
    model: "gpt-3.5-turbo",
  };

  // Make the fetch request
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`, // Replace with your actual API key
    },
    body: JSON.stringify(payload),
    n: 1,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.choices && data.choices.length > 0) {
        let cur = data.choices[0].text.trim().split("[");
        let val = cur.length > 1 ? "[" + cur[1] : cur[0];
        let styledText = highlightTranslatedWord(val);
        console.log(styledText);
        callback(styledText);
      }
    })
    .catch((error) => {
      console.error("Error fetching from OpenAI:", error);
    });
}

function loadSettings() {
  let selectedDifficulty = "Medium";
  let selectedLanguage = "Spanish";

  chrome.storage.sync.get(["language", "difficulty"], function (data) {
    if (data.language) {
      selectedLanguage = data.language;
    }

    if (data.difficulty) {
      if (data.difficulty === "1") {
        selectedDifficulty = "Easy";
      } else if (data.difficulty === "2") {
        selectedDifficulty = "Medium";
      } else if (data.difficulty === "3") {
        selectedDifficulty = "Hard";
      }
    }
  });
  return [selectedDifficulty, selectedLanguage];
}

function highlightTranslatedWord(text) {
  const regex = /\#\$(.*?)\$\#/g;
  return text.replace(
    regex,
    '<span style="background-color: yellow;">$1</span>'
  );
}
