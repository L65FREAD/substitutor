chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "translateText") {
    fetchOpenAIResponse(message.prompt, (response) => {
      sendResponse(response);
    });
    return true; // Indicate asynchronous response
  }
});

function fetchOpenAIResponse(prompt, callback) {
  const apiKey = "";
  if (!apiKey) {
    console.error("No API key found!");
    return;
  }

  const [difficulty, language] = loadSettings();
  const endpoint = "https://api.openai.com/v1/chat/completions";
  let content = "";

  switch (difficulty) {
    case "Hard":
      const length = Math.ceil(prompt.length * 0.3);
      let randomIndices = [];
      while (randomIndices.length < length) {
        let rand = Math.floor(Math.random() * prompt.length);
        if (!randomIndices.includes(rand)) {
          randomIndices.push(rand);
        }
      }
      let selectedPrompts = randomIndices.map((index) => prompt[index]);
      content = `Translate the following paragraphs to ${language}: ${selectedPrompts.join(
        " "
      )}`;
      break;
    case "Easy":
      content = `Translate only a few words from the strings, and keep most of the words in the original language so that it is a mix of both the languages.`;
      break;
    case "Medium":
      // ... (Your existing Medium code)
      break;
  }

  const payload = {
    messages: [{ role: "user", content }],
    model: "gpt-3.5-turbo",
  };

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.choices && data.choices.length > 0) {
        let translated = highlightTranslatedWord(data.choices[0].text.trim());
        if (difficulty === "Hard") {
          randomIndices.forEach((index, i) => {
            prompt[index] = translated.split(" ")[i];
          });
          callback(prompt);
        } else {
          callback(translated);
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching from OpenAI:", error);
    });
}

function loadSettings() {
  let selectedDifficulty = "Easy";
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
