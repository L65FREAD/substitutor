chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "translateText") {
    fetchOpenAIResponse(message.prompt).then((response) => {
      sendResponse(response);
    });
    return true;
  }
});

async function fetchOpenAIResponse(prompt) {
  const [difficulty, language] = await loadSettings();
  let content = "";

  // for hard
  let randomIndices = [];

  // for medium
  let translatedIndices = [];

  switch (difficulty) {
    case "Hard":
      const length = Math.ceil(prompt.length * 0.2);
      randomIndices = getRandomIndices(prompt.length, length);
      let selectedPrompts = randomIndices
        .map((index) => prompt[index])
        .join(" &&& ");
      content = `Translate the following text to ${language}: ${selectedPrompts}`;
      break;
    case "Easy":
      content = getStringForEasy(language, prompt);
      break;
    case "Medium":
      let contentForTranslation = [];
      for (let i = 0; i < prompt.length; i++) {
        let sentences = prompt[i].split(".");
        let indicesToTranslate;
        if (sentences.length == 1) {
          if (Math.random() > 0.5) {
            indicesToTranslate = [0];
          } else {
            indicesToTranslate = [];
          }
        } else {
          let randomIndex = Math.floor(Math.random() * sentences.length);
          indicesToTranslate = [randomIndex];
        }
        contentForTranslation.push(
          sentences
            .filter((_, idx) => indicesToTranslate.includes(idx))
            .join(" &&& ")
        );
        translatedIndices.push(indicesToTranslate);
      }
      content = `Translate the following text to ${language}: ${contentForTranslation.join(
        " &&& "
      )}`;
      break;
  }

  const payload = {
    messages: [{ role: "user", content }],
    model: "gpt-3.5-turbo",
  };

  return new Promise((resolve, reject) => {
    sendRequestToOpenAI(
      payload,
      difficulty,
      prompt,
      randomIndices,
      translatedIndices,
      (translated) => {
        resolve(translated);
      }
    );
  });
}

function sendRequestToOpenAI(
  payload,
  difficulty,
  prompt,
  randomIndices,
  translatedIndices,
  callback
) {
  const apiKey = "";
  const endpoint = "https://api.openai.com/v1/chat/completions";

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
        let translated = data.choices[0].message.content.trim();
        if (difficulty === "Hard") {
          let splitVals = translated.split("&&&");
          for (let i = 0; i < randomIndices.length; i++) {
            prompt[randomIndices[i]] = `$#${splitVals[i]}$#`;
          }
          translated = JSON.stringify(prompt);
        } else if (difficulty === "Easy") {
          translated = highlightTranslatedWord(translated);
        } else if (difficulty === "Medium") {
          let translatedSentences = translated.split("&&&");
          for (let i = 0; i < prompt.length; i++) {
            let sentences = prompt[i].split(".");
            for (let j = 0; j < translatedIndices[i].length; j++) {
              sentences[
                translatedIndices[i][j]
              ] = `$#${translatedSentences.shift()}$#`;
            }
            prompt[i] = sentences.join(".");
          }
          translated = JSON.stringify(prompt);
        }
        callback(translated);
      }
    })
    .catch((error) => {
      console.error("Error fetching from OpenAI:", error);
    });
}

async function loadSettings() {
  return new Promise((resolve, reject) => {
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
      resolve([selectedDifficulty, selectedLanguage]);
    });
  });
}

function highlightTranslatedWord(text) {
  const regex = /\#\$(.*?)\$\#/g;
  return text.replace(
    regex,
    '<span style="background-color: yellow;">$1</span>'
  );
}

function getRandomIndices(max, count) {
  let randomIndicesSet = new Set();
  while (randomIndicesSet.size < count) {
    randomIndicesSet.add(Math.floor(Math.random() * max));
  }
  return [...randomIndicesSet];
}

function getStringForEasy(language, prompt) {
  return `While keeping the arrays the same, translate every seventh wor
  [language]=${language} [text]= ${prompt} `;
}
