document.addEventListener("DOMContentLoaded", () => {
    const categories = [
      "Video Games",
      "9th Grade Math",
      "Super Heroes",
      "Sports",
      "Music",
      "General Knowledge",
      "Random",
      "History",
      "Gambling",
      "Politics",
      "Simple Law",
      "Simple Tax",
      "Simple Computer Science",
      "Simple IT",
      "Simple Biology",
      "Simple Chemistry",
      "Simple Physics",
    ];
    const questionElement = document.getElementById("question");
    const answersElement = document.getElementById("answers");
    let triviaQuestions = [];
    let currentAnswer = "";
    let scores = { playerA: 0, playerJ: 0 };
    let skipStatus = { playerA: false, playerJ: false };
    let acceptingAnswers = true;
    let speechSynthesisUtterance = new SpeechSynthesisUtterance();
    speechSynthesisUtterance.volume = 1; // Default volume
  
    let usedQuestions = new Set();
  
    async function loadTriviaQuestions() {
      try {
        const response = await fetch("questions.json");
        const data = await response.json();
        triviaQuestions = data.flatMap((category) =>
          category.questions.map((question) => ({
            ...question,
            category: category.category,
          }))
        );
        generateTriviaQuestion(); // Start the game after loading questions
      } catch (error) {
        console.error("Failed to load trivia questions:", error);
      }
    }
  
    // Function to generate a trivia question
    async function generateTriviaQuestion() {
      acceptingAnswers = true;
      const questionData = getRandomTriviaQuestion();
      currentAnswer = questionData.correct; // Assuming 'correct' is a key in the question object indicating the correct answer
  
      displayQuestion(questionData);
  }
  
  function getRandomTriviaQuestion() {
      let randomIndex;
      let questionData;
      do {
        randomIndex = Math.floor(Math.random() * triviaQuestions.length);
        questionData = triviaQuestions[randomIndex];
      } while (usedQuestions.has(questionData.question));
      usedQuestions.add(questionData.question);
      return questionData;
    }
  
    // Function to display the question and options
    function displayQuestion(data) {
      questionElement.textContent = `${data.category}: ${data.question}`;
      answersElement.innerHTML = data.options.map((option, index) => 
          `<li tabindex="0" data-answer="${'abcd'[index]}">${option}</li>`
      ).join('');
      speak(`${data.category}. ${data.question}. ${data.options.map((opt, i) => `Option ${'ABCD'[i]}: ${opt}`).join(', ')}`);
  }
  
    // Event listener for keyboard inputs
    document.addEventListener("keydown", (event) => {
      if (!acceptingAnswers) return;
  
      const keyMapA = { a: "a", s: "b", d: "c", f: "d" };
      const keyMapJ = { j: "a", k: "b", l: "c", ";": "d" };
  
      if (keyMapA[event.key]) {
        handleAnswerSelection(keyMapA[event.key], "playerA");
      } else if (keyMapJ[event.key]) {
        handleAnswerSelection(keyMapJ[event.key], "playerJ");
      }
    });
  
    // Function to handle answer selection
    function handleAnswerSelection(answerKey, player) {
      if (!acceptingAnswers) return;
  
      let playerLetter = player === "playerA" ? "A" : "J";
      if (answerKey.startsWith("skip")) {
        skipStatus[player] = true;
        if (skipStatus.playerA && skipStatus.playerJ) {
          displayMessage("Both players skipped.");
          endQuestion();
          return;
        }
      } else {
        processAnswer(answerKey, player, playerLetter);
      }
    }
  
    function processAnswer(answerKey, player, playerLetter) {
      let message;
      if (answerKey === currentAnswer) {
        scores[player]++;
        message = `Player ${playerLetter} selected the right answer.`;
      } else {
        scores[player] = Math.max(0, scores[player] - 1);
        message = `Player ${playerLetter} selected the wrong answer.`;
      }
      message += ` Score: ${scores.playerA} to ${scores.playerJ}`;
      displayMessage(message);
    }
  
    // Function to check for a winner
    function checkForWinner(playerLetter) {
      if (scores.playerA >= 8 || scores.playerJ >= 8) {
        const winner = scores.playerA >= 8 ? "Player A" : "Player J";
        displayFinalMessage(`${winner} wins with ${scores[winner === "Player A" ? "playerA" : "playerJ"]} points!`);
        return;
      }
      if (usedQuestions.size === triviaQuestions.length) {
        displayFinalMessage("Wow, you guys suck!");
        return;
      }
      displayScore();
      generateTriviaQuestion();
    }
  
    function displayFinalMessage(message) {
      questionElement.textContent = message;
      answersElement.innerHTML = "";
      speak(message);
      acceptingAnswers = false; // Stop accepting answers
    }
  
    function speak(text) {
      if (!window.speechSynthesis) {
        console.error("Web Speech API not supported");
        return;
      }
      window.speechSynthesis.cancel();
  
      speechSynthesisUtterance.text = text;
      window.speechSynthesis.speak(speechSynthesisUtterance);
    }
  
    function adjustVolume(deltaY) {
      let newVolume =
        speechSynthesisUtterance.volume + (deltaY > 0 ? -0.05 : 0.05);
      newVolume = Math.min(1, Math.max(0, newVolume)); // Clamp between 0 and 1
      speechSynthesisUtterance.volume = newVolume;
      console.log(`Volume adjusted to: ${newVolume * 100}%`);
    }
  
    window.addEventListener("wheel", (event) => {
      adjustVolume(event.deltaY);
    });
  
    // Function to display the current score
    function displayScore() {
      questionElement.textContent = `Player A: ${scores.playerA}, Player J: ${scores.playerJ}`;
      answersElement.innerHTML = "";
    }
  
    // Function to display the winner
    function displayWinner(player) {
      questionElement.textContent = `${player} wins with ${scores[player]} points!`;
      answersElement.innerHTML = "";
    }
  
    function displayMessage(message) {
      questionElement.textContent = message;
      answersElement.innerHTML = "";
      speak(message);
  
      // Delay before the next question or checking for a winner
      setTimeout(() => {
        if (scores.playerA >= 15 || scores.playerJ >= 15) {
          const winner = scores.playerA >= 15 ? "Player A" : "Player J";
          displayFinalMessage(`${winner} wins with ${scores[winner === "Player A" ? "playerA" : "playerJ"]} points!`);
        } else if (usedQuestions.size === triviaQuestions.length) {
          displayFinalMessage("Wow, you guys suck!");
        } else if (acceptingAnswers) {
          generateTriviaQuestion();
        }
      }, 6500);
    }
  
    function endQuestion() {
      skipStatus = { playerA: false, playerJ: false };
    }
  
    // Initial trivia question generation
    loadTriviaQuestions();
  });
  
