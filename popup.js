document.addEventListener('DOMContentLoaded', function () {
  const languageSelect = document.getElementById('languageSelect');
  const difficultyLabel = document.getElementById('difficultyLabel');
  const difficultyRange = document.getElementById('difficultyRange');

  languageSelect.addEventListener('change', function (e) {
    const selectedLanguage = e.target.value;
    // Handle the language change
  });

  difficultyRange.addEventListener('input', function (e) {
    const value = e.target.value;
    let difficulty = 'Medium';
    if (value === '1') {
      difficulty = 'Easy';
    } else if (value === '2') {
      difficulty = 'Medium';
    } else if (value === '3') {
      difficulty = 'Hard';
    }
    difficultyLabel.textContent = `Difficulty: ${difficulty}`;
  });
});
