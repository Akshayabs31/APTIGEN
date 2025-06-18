 const quizScreen = document.querySelector('.quiz-screen');
  const questionText = document.querySelector('.question');
  const questionNumber = document.querySelector('.question-number');
  const answerWrapper = document.querySelector('.answer-wrapper');
  const submitBtn = document.querySelector('.submit');
  const nextBtn = document.querySelector('.next');
  const prevBtn = document.querySelector('.prev');
  const finalScore = document.querySelector('.final-score');
  const totalScore = document.querySelector('.total-score');
  const endScreen = document.querySelector('.end-screen');
  const reviewScreen = document.querySelector('.review-screen');
  const reviewContainer = document.querySelector('.review-container');
  const sidePanel = document.querySelector('.side-panel');
  const questionsNavigation = document.querySelector('.questions-navigation');
  const timerDisplay = document.querySelector("#timer span");
  const tadaSound = document.getElementById("tadaSound");
  const clickSound = document.getElementById("clickSound");
  const medalContainer = document.getElementById("medal-container");
  const feedbackTitle = document.getElementById("feedback-title");
  const feedbackText = document.getElementById("feedback-text");

  let questions = [], currentQuestion = 0, score = 0, timer;
  let userAnswers = [];

  // Sample questions if fetch fails
  const sampleQuestions = [
    {
      question: "What is the capital of France?",
      options: ["London", "Paris", "Berlin", "Madrid"],
      answer: "Paris",
      explanation: "Paris has been the capital of France since the 5th century."
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      answer: "Mars",
      explanation: "Mars appears red due to iron oxide (rust) on its surface."
    },
    {
      question: "What is the largest mammal on Earth?",
      options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
      answer: "Blue Whale",
      explanation: "The blue whale can reach lengths of up to 100 feet and weights of 200 tons."
    },
    {
      question: "Which element has the chemical symbol 'O'?",
      options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
      answer: "Oxygen",
      explanation: "Oxygen is essential for respiration and has the atomic number 8."
    },
    {
      question: "Who painted the Mona Lisa?",
      options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
      answer: "Leonardo da Vinci",
      explanation: "Leonardo da Vinci painted the Mona Lisa between 1503 and 1506."
    },
    {
      question: "What is the hardest natural substance on Earth?",
      options: ["Gold", "Iron", "Diamond", "Quartz"],
      answer: "Diamond",
      explanation: "Diamond is the hardest known natural material with a rating of 10 on the Mohs scale."
    },
    {
      question: "Which country is home to the kangaroo?",
      options: ["New Zealand", "South Africa", "Australia", "Brazil"],
      answer: "Australia",
      explanation: "Kangaroos are marsupials native to Australia."
    },
    {
      question: "What is the largest organ in the human body?",
      options: ["Liver", "Brain", "Skin", "Heart"],
      answer: "Skin",
      explanation: "The skin is the body's largest organ, with a surface area of about 20 square feet."
    },
    {
      question: "Which planet is closest to the Sun?",
      options: ["Venus", "Mercury", "Earth", "Mars"],
      answer: "Mercury",
      explanation: "Mercury is the smallest and innermost planet in the Solar System."
    },
    {
      question: "What is the main component of the Sun?",
      options: ["Liquid Lava", "Hydrogen", "Oxygen", "Carbon"],
      answer: "Hydrogen",
      explanation: "The Sun is primarily composed of hydrogen (about 70%) and helium (about 28%)."
    }
  ];

  window.addEventListener('load', () => {
    const category = localStorage.getItem('selectedCategory') || 'sample';
    try {
      fetch(`data/${category}.json`)
        .then(res => res.json())
        .then(data => {
          questions = getRandomQuestions(data, 10);
          initializeQuiz();
        })
        .catch(() => {
          questions = getRandomQuestions(sampleQuestions, 10);
          initializeQuiz();
        });
    } catch (e) {
      questions = getRandomQuestions(sampleQuestions, 10);
      initializeQuiz();
    }
  });

  function initializeQuiz() {
    totalScore.textContent = questions.length;
    showQuestion();
    createNavigation();
    startTimer();
  }

  function getRandomQuestions(data, count) {
    if (data.length <= count) return data;
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  function showQuestion() {
    const q = questions[currentQuestion];
    questionText.innerHTML = q.question;
    questionNumber.textContent = `Q${currentQuestion + 1}`;
    answerWrapper.innerHTML = '';
    q.options.forEach(opt => {
      const div = document.createElement('div');
      div.classList.add('answer');
      div.innerHTML = `
        <div class="answer-option">
          <div class="option-letter">${String.fromCharCode(65 + q.options.indexOf(opt))}</div>
          <div class="option-text">${opt}</div>
        </div>
      `;
      if (userAnswers[currentQuestion] === opt) {
        div.classList.add('selected');
      }
      div.onclick = () => {
        playSound(clickSound);
        document.querySelectorAll('.answer').forEach(a => a.classList.remove('selected'));
        div.classList.add('selected');
        userAnswers[currentQuestion] = opt;
        updateNavigationButtons();
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

  function updateProgressBar() {
    const progress = document.getElementById('progress');
    const percentage = (currentQuestion / (questions.length - 1)) * 100;
    progress.style.width = `${percentage}%`;
  }

  function createNavigation() {
    questionsNavigation.innerHTML = '';
    questions.forEach((_, idx) => {
      const button = document.createElement('button');
      button.classList.add('question-nav-btn');
      button.innerHTML = `<span>${idx + 1}</span>`;
      button.onclick = () => {
        playSound(clickSound);
        currentQuestion = idx;
        showQuestion();
      };
      questionsNavigation.appendChild(button);
    });
  }

  function updateNavigationButtons() {
    const navBtns = document.querySelectorAll('.question-nav-btn');
    navBtns.forEach((btn, idx) => {
      btn.classList.remove('answered', 'current-nav');
      if (userAnswers[idx]) {
        btn.classList.add('answered');
      }
      if (idx === currentQuestion) {
        btn.classList.add('current-nav');
      }
    });
  }

  nextBtn.onclick = () => {
    playSound(clickSound);
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      showQuestion();
    }
  };

  prevBtn.onclick = () => {
    playSound(clickSound);
    if (currentQuestion > 0) {
      currentQuestion--;
      showQuestion();
    }
  };

  submitBtn.onclick = () => {
    playSound(clickSound);
    submitQuiz();
    showResultScreen();
  };

  document.querySelectorAll('.restart').forEach(btn => {
    btn.onclick = () => {
      playSound(clickSound);
      setTimeout(() => location.reload(), 300);
    };
  });

  document.querySelector('.review').onclick = () => {
    playSound(clickSound);
    showReviewScreen();
  };

  function startTimer() {
    let totalTime = 20 * 60;
    timer = setInterval(() => {
      if (totalTime <= 0) {
        clearInterval(timer);
        submitQuiz();
        showResultScreen();
      } else {
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        timerDisplay.innerText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        totalTime--;
        if (totalTime <= 60) {
          timerDisplay.parentElement.classList.add('warning');
        }
      }
    }, 1000);
  }

  function submitQuiz() {
    clearInterval(timer);
    score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) score++;
    });
    quizScreen.classList.add('hide');
    document.querySelector('.progress-bar').classList.add('hide');
    document.querySelector('#timer').classList.add('hide');
    endScreen.classList.remove('hide');
    sidePanel.classList.add('hide');
    document.querySelector('.score-display').innerHTML = `<span class="final-score">${score}</span><span class="total-score">/${questions.length}</span>`;
    displayResults(score);
    // Save result to localStorage
    const user = localStorage.getItem("currentUser");
    const topic = localStorage.getItem("selectedCategory") || "Unknown";
    const date = new Date().toISOString();
    if (user && topic) {
      const resultKey = `${user}_apsQuizResults`;
      const results = JSON.parse(localStorage.getItem(resultKey)) || [];
      results.push({ topic, score, answer: questions.length, timestamp: date });
      localStorage.setItem(resultKey, JSON.stringify(results));
    }
    let highScore = parseInt(localStorage.getItem('highScore')) || 0;
    if (score > highScore) {
      localStorage.setItem('highScore', score);
      playSound(tadaSound);
      // Swal alert removed as per user request
    }
  }

  function displayResults(score) {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) {
      medalContainer.innerHTML = '<i class="fas fa-trophy gold-trophy"></i>';
      feedbackTitle.textContent = 'Perfect Score!';
      feedbackText.textContent = `You aced this quiz with ${score} out of ${questions.length} correct answers. You're a true champion!`;
    } else if (percentage >= 75) {
      medalContainer.innerHTML = '<i class="fas fa-medal silver-medal"></i>';
      feedbackTitle.textContent = 'Great Job!';
      feedbackText.textContent = `You scored ${score} out of ${questions.length}. Impressive performance! Just a bit more for gold next time.`;
    } else if (percentage >= 50) {
      medalContainer.innerHTML = '<i class="fas fa-medal bronze-medal"></i>';
      feedbackTitle.textContent = 'Good Effort!';
      feedbackText.textContent = `You got ${score} out of ${questions.length}. You're on the right track - keep practicing to improve!`;
    } else {
      medalContainer.innerHTML = '<i class="fas fa-star participation-star"></i>';
      feedbackTitle.textContent = 'Keep Practicing!';
      feedbackText.textContent = `You scored ${score} out of ${questions.length}. Every expert was once a beginner - try again to improve your score!`;
    }
    medalContainer.style.animation = 'bounce 1s ease 3';
    updateProgressRing(score, questions.length);
    if (percentage === 100) {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      setTimeout(() => {
        confetti({ particleCount: 150, angle: 60, spread: 80, origin: { x: 0 } });
        confetti({ particleCount: 150, angle: 120, spread: 80, origin: { x: 1 } });
      }, 300);
    }
  }

  function updateProgressRing(current, total) {
    const circle = document.querySelector('.progress-ring-circle');
    if (circle) {
      const circumference = 2 * Math.PI * 72;
      const offset = circumference - (current / total) * circumference;
      circle.style.strokeDasharray = circumference;
      circle.style.strokeDashoffset = offset;
      const percent = (current / total) * 100;
      if (percent > 50) {
        circle.style.stroke = '#6a11cb';
      } else if (percent > 25) {
        circle.style.stroke = '#ffc107';
      } else {
        circle.style.stroke = '#dc3545';
      }
    }
  }

  function playSound(sound) {
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log("Audio play failed:", e));
    }
  }

  // Show/hide quiz header and navigation header as required
  function showQuizHeader(show) {
    document.querySelector('.quiz-header').style.display = show ? '' : 'none';
  }

  // Dynamically load navigation header only on result/review screens
  function loadNavHeader() {
    if (!document.querySelector('.navbar')) {
      fetch("../header.html")
        .then(res => res.text())
        .then(text => {
          const temp = document.createElement('div');
          temp.innerHTML = text;
          temp.querySelectorAll('script').forEach(oldScript => {
            const newS = document.createElement('script');
            if (oldScript.src) {
              newS.src = oldScript.src;
            } else {
              newS.textContent = oldScript.textContent;
            }
            document.head.appendChild(newS);
            oldScript.remove();
          });
          document.body.insertBefore(temp, document.body.firstChild);
        })
        .catch(console.error);
    }
  }

  // Patch submit and review button logic to use the above
  function showResultScreen() {
    quizScreen.classList.add('hide');
    document.querySelector('.progress-bar').classList.add('hide');
    document.querySelector('#timer').classList.add('hide');
    endScreen.classList.remove('hide');
    sidePanel.classList.add('hide');
    document.querySelector('.score-display').innerHTML = `<span class="final-score">${score}</span><span class="total-score">/${questions.length}</span>`;
    displayResults(score);
    showQuizHeader(false); // Hide quiz header
    loadNavHeader();       // Show navigation header
  }

  function showReviewScreen() {
    endScreen.classList.add('hide');
    reviewScreen.classList.remove('hide');
    reviewContainer.innerHTML = '';
    showQuizHeader(false); // Hide quiz header
    loadNavHeader();       // Show navigation header

    questions.forEach((q, idx) => {
      const div = document.createElement('div');
      div.classList.add('review-item');
      const isCorrect = userAnswers[idx] === q.answer;
      const userAnswer = userAnswers[idx] || "Not Answered";
      const correctMark = isCorrect ? '<i class="fas fa-check-circle correct-icon"></i>' : '<i class="fas fa-times-circle wrong-icon"></i>';
      div.innerHTML = `
        <div class="review-question">
          <span class="question-number">Q${idx + 1}:</span>
          <span class="question-text">${q.question}</span>
        </div>
        <div class="review-answer ${isCorrect ? 'correct' : 'wrong'}">
          <span class="answer-label">Your Answer:</span>
          <span class="user-answer">${userAnswer}</span>
          ${correctMark}
        </div>
        <div class="correct-answer">
          <span class="answer-label">Correct Answer:</span>
          <span class="correct-text">${q.answer}</span>
        </div>
        ${q.explanation ? `
        <div class="explanation">
          <span class="explanation-label">Explanation:</span>
          <span class="explanation-text">${q.explanation}</span>
        </div>
        ` : ''}
      `;
      reviewContainer.appendChild(div);
    });
  }
