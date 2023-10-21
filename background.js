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
  const apiKey = "";

  if (!apiKey) {
    console.error("No API key found!");
    return;
  }
  const sanitizedText =
    'Do a simple transformation from one array to another based on the following conditions:[text] is an input array of with each entry being a different paragraph of English text. For each paragraph in the array translate a few words with difficulty [difficulty] from English to [foreign_language]. Return an array in the same format with only the substituted words being changed, also leave any punctuation marks unchanged from the translation and do not pick any numbers, names of places or people.Wrap each changed word or phrase in [foreign_language] with the string $# at the beginning and end. E.g “Hello, !” should get translated to “$#Hola, ?$#” in Spanish. Output one array of the changed entries.\nHere is an example of the array translation from English to Spanish: \n“””If [text] =[\n”A band of more mainstream Republicans brought down the hard-line conservative, but the G.O.P. has hardly stemmed the chaos.”, \n“Leaders, foreign ministers and diplomats from dozens of Arab, European, African and other countries gathered in Cairo on Saturday for a “peace summit” aimed at de-escalating the violence in Gaza. But after hours of speeches, they had little to show for the trip other than a gaping divide, as Arab leaders castigated Western countries for their silence on Israel’s airstrikes on Palestinian civilians in Gaza.”] \n[difficulty] = easy, and [foreign_language] = Spanish\nPick a random number of words - choose based on difficulty [difficulty] : easy  is about 5% of words, medium is about 10% of words and hard is about 20% of words — also choose more rare and longer words for hard, and more common and shorter words for easy.\nBecause we are on easy we pick about 5% of  words to translate and so this is 5 to 6 words . \nCheck that each of the words are not a number, name of a place or the name of a \nThen output = [\n”$#Una$# band of $#más$# mainstream Republicans brought down the hard-line $conservadora$, but the G.O.P. has hardly stemmed the chaos”, \n“‘$#Líderes$#, foreign ministers and diplomats from dozens of $#árabe$#, European, African and other countries gathered in Cairo on Saturday for a “peace summit” aimed at de-escalating the violence in Gaza. But after hours of speeches, they had little to show for the trip other than a gaping divide, as $#árabe$# leaders castigated Western countries for their silence on Israel’s airstrikes on Palestinian civilians in Gaza"]\nExplain your reasoning of the output: \n-“A” is translated to “Una”  and $# is added, because “una” is surrounded by $# and this is not a number, name of a place or city.\n-Cairo is a name of a city, so it is not translated and there are no $# characters added around the word.\n-“more” is translated to “más” and $# is added,  because “more” is surrounded by $# and this is not a number, name of a place or city.\n-“conservatives” is translated to “conservadora” and $# is added,  because “conservadora” is surrounded by $# and this is not a number, name of a place or city.';
  // Define the endpoint URL
  const endpoint =
    "https://api.openai.com/v1/engines/gpt-3.5-turbo/completions";

  // Define the request payload
  const payload = {
    prompt: sanitizedText + prompt,
    max_tokens: 2048,
  };

  // Make the fetch request
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`, // Replace with your actual API key
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.choices && data.choices.length > 0) {
        translatedText = highlightTranslatedWord(translatedText);
        callback(data.choices[0].text.trim());
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
  return { selectedDifficulty, selectedLanguage };
}

function highlightTranslatedWord(text) {
  const regex = /\#\$(.*?)\$\#/g;
  return text.replace(
    regex,
    '<span style="background-color: yellow;">$1</span>'
  );
}
