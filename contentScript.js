function modifyDOM() {
  const paragraphs = document.querySelectorAll("p");
  let paraArray = [];
  let totalTokens = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const paraText = paragraphs[i].textContent;
    const paraTokens = countTokens(paraText);

    if (totalTokens + paraTokens < 1800) {
      paraArray.push(paraText);
      totalTokens += paraTokens;
    } else {
      break;
    }
  }

  getResponseFromOpenAI(paraArray, (response) => {
    const res = JSON.parse(response);
    for (let i = 0; i < res.length; i++) {
      //TODO: Design UI for the translation
      paragraphs[i].innerHTML = res[i];
    }
  });
}

function countTokens(text) {
  return text.split(/\s+/).length;
}

modifyDOM();

function getResponseFromOpenAI(message, callback) {
  chrome.runtime.sendMessage(
    { action: "translateText", prompt: message },
    (response) => {
      callback(response);
    }
  );
}
