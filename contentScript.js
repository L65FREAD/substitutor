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
      const originalText = paraArray[i];
      const translatedText = res[i].replace(
        /\$\#(.*?)\$\#/g,
        (match, p1) =>
          `<span class="hoverable" style="background-color: rgba(60, 162, 147, 0.5);" data-original="${originalText}">${p1}</span>`
      );
      paragraphs[i].innerHTML = translatedText;
    }

    attachHoverEvents();
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

function attachHoverEvents() {
  const hoverDiv = document.createElement("div");
  hoverDiv.style.position = "absolute";
  hoverDiv.style.backgroundColor = "#333";
  hoverDiv.style.color = "white";
  hoverDiv.style.padding = "5px";
  hoverDiv.style.borderRadius = "5px";
  hoverDiv.style.display = "none";
  hoverDiv.style.zIndex = "1000";
  document.body.appendChild(hoverDiv);

  const hoverableSpans = document.querySelectorAll(".hoverable");
  hoverableSpans.forEach((span) => {
    span.addEventListener("mouseover", (e) => {
      const originalContent = span.getAttribute("data-original");
      hoverDiv.innerHTML = `Original: ${originalContent}`;
      hoverDiv.style.display = "block";
      hoverDiv.style.left = `${e.pageX + 10}px`;
      hoverDiv.style.top = `${e.pageY + 10}px`;
    });

    span.addEventListener("mousemove", (e) => {
      hoverDiv.style.left = `${e.pageX + 10}px`;
      hoverDiv.style.top = `${e.pageY + 10}px`;
    });

    span.addEventListener("mouseout", () => {
      hoverDiv.style.display = "none";
    });
  });
}
