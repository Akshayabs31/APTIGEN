const categoryScreen = document.querySelector(".category-screen"),
  categoryBoxes = document.querySelectorAll(".category-box"),
  startScreen = document.querySelector(".start-screen"),
  quiz = document.querySelector(".quiz"),
  endScreen = document.querySelector(".end-screen"),
  progressBar = document.querySelector(".progress-bar"),
  progressText = document.querySelector(".progress-text"),
  startBtn = document.querySelector(".start"),
  numQuestions = document.querySelector("#num-questions"),
  category = document.querySelector("#category"),
  difficulty = document.querySelector("#difficulty"),
  timePerQuestion = document.querySelector("#time"),
  submitBtn = document.querySelector(".submit"),
  nextBtn = document.querySelector(".next"),
  finalScore = document.querySelector(".final-score"),
  totalScore = document.querySelector(".total-score"),
  restartBtn = document.querySelector(".restart");

let questions = [],
  time = 30,
  score = 0,
  currentQuestion = 0,
  timer = null;

// 1. Show category screen on load
window.addEventListener("load", () => {
  categoryScreen.classList.remove("hide");
  startScreen.classList.add("hide");
  quiz.classList.add("hide");
  endScreen.classList.add("hide");
});

// 2. Handle category box click
categoryBoxes.forEach((box) => {
  box.addEventListener("click", () => {
    const selectedCategory = box.dataset.id;
    category.value = selectedCategory;

    categoryScreen.classList.add("hide");
    startScreen.classList.remove("hide");
  });
});

// 3. Start quiz
const startQuiz = () => {
  const num = numQuestions.value,
    cat = category.value,
    diff = difficulty.value;

  loadingAnimation();

  const url = `https://opentdb.com/api.php?amount=${num}&category=${cat}&difficulty=${diff}&type=multiple`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      questions = data.results;
      setTimeout(() => {
        startScreen.classList.add("hide");
        quiz.classList.remove("hide");
        currentQuestion = 0;
        score = 0;
        showQuestion(questions[currentQuestion]);
      }, 1000);
    });
};

startBtn.addEventListener("click", startQuiz);

// 4. Show question
const showQuestion = (question) => {
  clearInterval(timer);
  const questionText = document.querySelector(".question"),
    answersWrapper = document.querySelector(".answer-wrapper"),
    questionNumber = document.querySelector(".number");

  questionText.innerHTML = question.question;

  const answers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
  answersWrapper.innerHTML = "";

  answers.forEach((answer) => {
    answersWrapper.innerHTML += `
      <div class="answer">
        <span class="text">${answer}</span>
        <span class="checkbox"><i class="fas fa-check"></i></span>
      </div>
    `;
  });

  questionNumber.innerHTML = `Question <span class="current">${currentQuestion + 1}</span><span class="total">/${questions.length}</span>`;

  const answersDiv = document.querySelectorAll(".answer");
  answersDiv.forEach((answer) => {
    answer.addEventListener("click", () => {
      if (!answer.classList.contains("checked")) {
        answersDiv.forEach((a) => a.classList.remove("selected"));
        answer.classList.add("selected");
        submitBtn.disabled = false;
      }
    });
  });

  submitBtn.disabled = true;
  submitBtn.style.display = "block";
  nextBtn.style.display = "none";

  time = timePerQuestion.value;
  startTimer(time);
};

// 5. Timer logic
const startTimer = (timeLimit) => {
  clearInterval(timer);
  time = timeLimit;

  timer = setInterval(() => {
    if (time === 3) {
      playAudio("countdown.mp3");
    }
    if (time >= 0) {
      progress(time);
      time--;
    } else {
      checkAnswer();
    }
  }, 1000);
};

const progress = (value) => {
  const percentage = (value / timePerQuestion.value) * 100;
  progressBar.style.width = `${percentage}%`;
  progressText.innerHTML = `${value}`;
};

// 6. Check answer (with confetti!)
const checkAnswer = () => {
  clearInterval(timer);

  const selectedAnswer = document.querySelector(".answer.selected");
  const correctAnswerText = questions[currentQuestion].correct_answer;

  if (selectedAnswer) {
    const userAnswer = selectedAnswer.querySelector(".text").innerHTML;
    if (userAnswer === correctAnswerText) {
      score++;
      selectedAnswer.classList.add("correct");
      triggerConfetti(); // 🎉 play confetti if correct
    } else {
      selectedAnswer.classList.add("wrong");
    }
  }

  document.querySelectorAll(".answer").forEach((answer) => {
    const text = answer.querySelector(".text").innerHTML;
    if (text === correctAnswerText) {
      answer.classList.add("correct");
    }
    answer.classList.add("checked");
  });

  submitBtn.style.display = "none";
  nextBtn.style.display = "block";
};

submitBtn.addEventListener("click", checkAnswer);

// 7. Next question
const nextQuestion = () => {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion(questions[currentQuestion]);
  } else {
    showScore();
  }
};

nextBtn.addEventListener("click", nextQuestion);

// 8. Show final score
const showScore = () => {
  quiz.classList.add("hide");
  endScreen.classList.remove("hide");
  finalScore.innerHTML = score;
  totalScore.innerHTML = `/ ${questions.length}`;
};

// 9. Restart quiz
restartBtn.addEventListener("click", () => {
  window.location.reload();
});

// 10. Loading animation
const loadingAnimation = () => {
  startBtn.innerHTML = "Loading";
  const loadingInterval = setInterval(() => {
    if (startBtn.innerHTML.length >= 10) {
      startBtn.innerHTML = "Loading";
    } else {
      startBtn.innerHTML += ".";
    }
  }, 500);
};

// 11. Audio
const playAudio = (src) => {
  const audio = new Audio(`../js/${src}`);
  audio.volume = 1;
  audio.play();
};

// 12. Confetti function 🎉
function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}


