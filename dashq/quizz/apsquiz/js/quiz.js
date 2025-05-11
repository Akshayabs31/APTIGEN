const quizScreen = document.querySelector('.quiz-screen');
const questionText = document.querySelector('.question');
const answerWrapper = document.querySelector('.answer-wrapper');
const submitBtn = document.querySelector('.submit');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');
const finalScore = document.querySelector('.final-score');
const totalScore = document.querySelector('.total-score');
const endScreen = document.querySelector('.end-screen');
const reviewScreen = document.querySelector('.review-screen');
const reviewContainer = document.querySelector('.review-container');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const toggleBtn = document.getElementById("darkModeToggle");
const sidePanel = document.querySelector('.side-panel');
const questionsNavigation = document.querySelector('.questions-navigation');
const timerDisplay = document.getElementById("timer");
const tadaSound = document.getElementById("tadaSound");

let questions = [], currentQuestion = 0, score = 0, timer;
let userAnswers = [];

// Load questions on window load
window.addEventListener('load', () => {
  const category = localStorage.getItem('selectedCategory') || 'sample';
  fetch(`data/${category}.json`)
    .then(res => res.json())
    .then(data => {
      questions = getRandomQuestions(data, 10);
      totalScore.textContent = questions.length;
      showQuestion();
      createNavigation();
      startTimer();
    });
});

// Get a shuffled set of questions
function getRandomQuestions(data, count) {
  const shuffled = data.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Display question and options
function showQuestion() {
  const q = questions[currentQuestion];
  questionText.innerHTML = q.question;
  answerWrapper.innerHTML = '';

  q.options.forEach(opt => {
    const div = document.createElement('div');
    div.classList.add('answer');
    div.innerText = opt;

    if (userAnswers[currentQuestion] === opt) {
      div.classList.add('selected');
    }

    div.onclick = () => {
      document.querySelectorAll('.answer').forEach(a => a.classList.remove('selected'));
      div.classList.add('selected');
      userAnswers[currentQuestion] = opt;
    };
    answerWrapper.appendChild(div);
  });

  document.querySelector('.current').textContent = currentQuestion + 1;
  prevBtn.disabled = currentQuestion === 0;

  if (currentQuestion === questions.length - 1) {
    submitBtn.classList.remove('hide');
    nextBtn.classList.add('hide');
  } else {
    submitBtn.classList.add('hide');
    nextBtn.classList.remove('hide');
  }

  updateProgressBar();
  updateNavigationButtons();
}

// Update progress bar width
function updateProgressBar() {
  const progress = document.getElementById('progress');
  const percentage = currentQuestion / (questions.length - 1) * 100;
  progress.style.width = `${percentage}%`;
}

// Create question number buttons in side panel
function createNavigation() {
  questions.forEach((_, idx) => {
    const button = document.createElement('button');
    button.classList.add('question-nav-btn');
    button.textContent = `Q${idx + 1}`;
    button.onclick = () => {
      currentQuestion = idx;
      showQuestion();
    };
    questionsNavigation.appendChild(button);
  });
}

// Update navigation buttons in the side panel based on answered questions
function updateNavigationButtons() {
  const navBtns = document.querySelectorAll('.question-nav-btn');
  navBtns.forEach((btn, idx) => {
    if (userAnswers[idx]) {
      btn.classList.add('answered');
    } else {
      btn.classList.remove('answered');
    }
  });
}

// Next and Previous button functionality
nextBtn.onclick = () => {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion();
  }
};

prevBtn.onclick = () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion();
  }
};

// ✅ Submit button click handler
submitBtn.onclick = () => {
  submitQuiz();
};

// Restart quiz
document.querySelectorAll('.restart').forEach(btn => {
  btn.onclick = () => location.reload();
});

// Review answers screen
document.querySelector('.review').onclick = () => {
  endScreen.classList.add('hide');
  reviewScreen.classList.remove('hide');
  reviewContainer.innerHTML = '';

  questions.forEach((q, idx) => {
    const div = document.createElement('div');
    div.classList.add('review-item');

    const isCorrect = userAnswers[idx] === q.answer;
    const userAnswer = userAnswers[idx] || "Not Answered";
    const correctMark = isCorrect ? "✅" : "❌";

    div.innerHTML = `
      <b>Q${idx + 1}:</b> ${q.question}<br>
      <b>Your Answer:</b> <span style="color:${isCorrect ? 'rgb(9, 200, 104)' : 'red'}">${userAnswer}</span> ${correctMark}<br>
      <b>Correct Answer:</b> <span style="color:rgb(22, 173, 98);font-weight:bold">${q.answer}</span><br>
      <b>Explanation:</b> ${q.explanation || "No explanation provided."}
    `;
    reviewContainer.appendChild(div);
  });
};

// Start countdown timer
function startTimer() {
  let totalTime = 20 * 60;
  timer = setInterval(() => {
    if (totalTime <= 0) {
      clearInterval(timer);
      submitQuiz();
    } else {
      const minutes = Math.floor(totalTime / 60);
      const seconds = totalTime % 60;
      timerDisplay.innerText = `Time: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
      totalTime--;
    }
  }, 1000);
}

// Submit quiz and show score
function submitQuiz() {
  clearInterval(timer);
  score = 0;

  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.answer) score++;
  });

  quizScreen.classList.add('hide');
  document.querySelector('.progress-bar').classList.add('hide');
  timerDisplay.classList.add('hide');
  endScreen.classList.remove('hide');
  sidePanel.classList.add('hide');

  finalScore.innerText = score;

  // Save results to localStorage
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const resultKey = `${currentUser}_apsQuizResults`;
    const results = JSON.parse(localStorage.getItem(resultKey)) || [];
    results.push({
      topic: localStorage.getItem('selectedCategory'),
      score: score,
      date: new Date().toLocaleString()
    });
    localStorage.setItem(resultKey, JSON.stringify(results));
  }

  let highScore = parseInt(localStorage.getItem('highScore')) || 0;
  if (score > highScore) {
    localStorage.setItem('highScore', score);
    tadaSound?.play();
    Swal.fire({
      title: '🏆 New High Score!',
      icon: 'success',
      background: '#1c1c1c',
      color: '#fff',
      confirmButtonColor: '#3498db'
    });
  }

  if (score === questions.length) {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    Swal.fire({
      title: '🌟 Perfect Score!',
      text: 'You answered all questions correctly!',
      icon: 'success',
      background: '#1c1c1c',
      color: '#fff',
      confirmButtonColor: '#00c853'
    });
  }

  highScoreDisplay.textContent = `High Score: ${localStorage.getItem('highScore')}`;
}

// Toggle between dark and light theme
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  toggleBtn.innerHTML = document.body.classList.contains("dark") ? "☀️" : "🌙";
});
