console.log("contentScript.js loaded");

// This function will be executed when the content script is injected
function modifyDOM() {
  const paragraphs = document.querySelectorAll("p");
  let paraArray = [];
  let maxCount = 1024 - 150;
  let runningCount = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    runningCount += paragraphs[i].textContent.split(" ").length;
    if (runningCount > maxCount) {
      runningCount = 0;
      break;
    }
    paraArray.push(paragraphs[i].textContent);
  }

  getResponseFromOpenAI(JSON.stringify(paraArray), (response) => {
    console.table(response);
    const res = JSON.parse(response);
    for (let i = 0; i < res.length; i++) {
      //TODO: Deign UI for the translation
      paragraphs[i].textContent = res[i];
    }
  });
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
