document.addEventListener("DOMContentLoaded", function () {
  const languageSelect = document.getElementById("languageSelect");
  const difficultyLabel = document.getElementById("difficultyLabel");
  const difficultyRange = document.getElementById("difficultyRange");

  const saveButton = document.getElementById("saveButton");

  let selectedDifficulty = "Medium";
  let selectedLanguage = "English";

  languageSelect.addEventListener("change", function (e) {
    selectedLanguage = e.target.value;
    // Handle the language change
  });

  difficultyRange.addEventListener("input", function (e) {
    const value = e.target.value;
    if (value === "1") {
      difficulty = "Easy";
    } else if (value === "2") {
      difficulty = "Medium";
    } else if (value === "3") {
      difficulty = "Hard";
    }
    difficultyLabel.textContent = `Difficulty: ${difficulty}`;
  });

  saveButton.addEventListener("click", function () {
    // Get values
    selectedLanguage = languageSelect.value;
    selectedDifficulty = difficultyRange.value;

    // Save values to Chrome storage
    chrome.storage.sync.set(
      {
        language: selectedLanguage,
        difficulty: selectedDifficulty,
      },
      function () {
        console.log("Settings saved");
      }
    );
    window.close();
  });

  function loadSettings() {
    chrome.storage.sync.get(["language", "difficulty"], function (data) {
      if (data.language) {
        languageSelect.value = data.language;
        selectedLanguage = data.language;
      } else {
        languageSelect.value = "English"; // Default
      }

      if (data.difficulty) {
        difficultyRange.value = data.difficulty;
        if (data.difficulty === "1") {
          selectedDifficulty = "Easy";
        } else if (data.difficulty === "2") {
          selectedDifficulty = "Medium";
        } else if (data.difficulty === "3") {
          selectedDifficulty = "Hard";
        }
        difficultyLabel.textContent = `Difficulty: ${selectedDifficulty}`;
      } else {
        difficultyRange.value = "2"; // Default
        difficultyLabel.textContent = "Difficulty: Medium";
      }
    });
  }

  // Call the function to load settings when the popup opens
  loadSettings();
});
