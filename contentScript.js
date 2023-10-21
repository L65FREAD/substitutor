console.log("contentScript.js loaded");

// This function will be executed when the content script is injected
function modifyDOM() {
  // Append "hello" to all paragraph elements
  const paragraphs = document.querySelectorAll("p");
  let paraArray = [];

  paragraphs.forEach((p) => {
    paraArray.push(p.textContent);
  });

  getResponseFromOpenAI(JSON.stringify(paraArray), (response) => {
    console.log(response);
    const res = JSON.parse(response);
    for (let i = 0; i < res.length; i++) {
      paragraphs[i].textContent = res[i];
    }
  });
}

// Call the function immediately upon script execution
// modifyDOM();

function getResponseFromOpenAI(message, callback) {
  chrome.runtime.sendMessage(
    { action: "translateText", prompt: message },
    (response) => {
      callback(response);
    }
  );
}
