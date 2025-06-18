
      // Toggle sidebar
      function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('show');
      }

      // Hide sidebar on window resize if screen is wide
      window.addEventListener('resize', () => {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth >= 768) {
          sidebar.classList.remove('show');
        }
      });

      // DOM Elements
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
        restartBtn = document.querySelector(".restart"),
        medalContainer = document.querySelector("#medal-container"),
        feedbackTitle = document.querySelector("#feedback-title"),
        feedbackText = document.querySelector("#feedback-text");

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

          // Set the category name in the select dropdown
          const categorySelect = document.getElementById('category');
          for (let i = 0; i < categorySelect.options.length; i++) {
            if (categorySelect.options[i].value === selectedCategory) {
              categorySelect.selectedIndex = i;
              break;
            }
          }

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
          })
          .catch(error => {
            console.error("Error fetching questions:", error);
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start Quiz';
            alert("Failed to load questions. Please try again.");
          });
      };

      startBtn.addEventListener("click", startQuiz);

      // 4. Show question
      const showQuestion = (question) => {
        clearInterval(timer);
        const questionText = document.querySelector(".question"),
          answersWrapper = document.querySelector(".answer-wrapper"),
          questionNumber = document.querySelector(".number");

        // Decode HTML entities in question
        questionText.innerHTML = decodeHtmlEntities(question.question);

        const answers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
        answersWrapper.innerHTML = "";

        answers.forEach((answer) => {
          answersWrapper.innerHTML += `
            <div class="answer">
              <span class="text">${decodeHtmlEntities(answer)}</span>
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
        submitBtn.style.display = "flex";
        nextBtn.style.display = "none";

        time = timePerQuestion.value;
        startTimer(time);
      };

      // Helper function to decode HTML entities
      function decodeHtmlEntities(text) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
      }

      // 5. Timer logic
      const startTimer = (timeLimit) => {
        clearInterval(timer);
        time = timeLimit;

        // Update progress ring for timer
        updateProgressRing(time, timeLimit);

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
        updateProgressRing(value, timePerQuestion.value);
      };

      // Update progress ring visualization
      function updateProgressRing(current, total) {
        const circle = document.querySelector('.progress-ring-circle');
        if (circle) {
          const circumference = 2 * Math.PI * 72;
          const offset = circumference - (current / total) * circumference;
          circle.style.strokeDasharray = circumference;
          circle.style.strokeDashoffset = offset;
          
          // Change color based on remaining time percentage
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

      // 6. Check answer (with confetti! 🎉)
      const checkAnswer = () => {
        clearInterval(timer);

        const selectedAnswer = document.querySelector(".answer.selected");
        const correctAnswerText = questions[currentQuestion].correct_answer;

        if (selectedAnswer) {
          const userAnswer = selectedAnswer.querySelector(".text").innerHTML;
          if (userAnswer === decodeHtmlEntities(correctAnswerText)) {
            score++;
            selectedAnswer.classList.add("correct");
            triggerConfetti();
          } else {
            selectedAnswer.classList.add("wrong");
          }
        }

        document.querySelectorAll(".answer").forEach((answer) => {
          const text = answer.querySelector(".text").innerHTML;
          if (text === decodeHtmlEntities(correctAnswerText)) {
            answer.classList.add("correct");
          }
          answer.classList.add("checked");
        });

        submitBtn.style.display = "none";
        nextBtn.style.display = "flex";
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

      // 8. Show final score with medal system
      const showScore = () => {
        quiz.classList.add("hide");
        endScreen.classList.remove("hide");
        
        finalScore.innerHTML = score;
        totalScore.innerHTML = `/ ${questions.length}`;
        
        // Calculate percentage
        const percentage = (score / questions.length) * 100;
        
        // Set medal based on score
        if (percentage >= 90) {
          // Gold Trophy for 90% and above
          medalContainer.innerHTML = '<i class="fas fa-trophy gold-trophy"></i>';
          feedbackTitle.textContent = 'Perfect Score!';
          feedbackText.textContent = `You aced this quiz with ${score} out of ${questions.length} correct answers. You're a true champion!`;
        } 
        else if (percentage >= 75) {
          // Silver Medal for 75-89%
          medalContainer.innerHTML = '<i class="fas fa-medal silver-medal"></i>';
          feedbackTitle.textContent = 'Great Job!';
          feedbackText.textContent = `You scored ${score} out of ${questions.length}. Impressive performance! Just a bit more for gold next time.`;
        }
        else if (percentage >= 50) {
          // Bronze Medal for 50-74%
          medalContainer.innerHTML = '<i class="fas fa-medal bronze-medal"></i>';
          feedbackTitle.textContent = 'Good Effort!';
          feedbackText.textContent = `You got ${score} out of ${questions.length}. You're on the right track - keep practicing to improve!`;
        }
        else {
          // Star for below 50%
          medalContainer.innerHTML = '<i class="fas fa-star participation-star"></i>';
          feedbackTitle.textContent = 'Keep Practicing!';
          feedbackText.textContent = `You scored ${score} out of ${questions.length}. Every expert was once a beginner - try again to improve your score!`;
        }
        
        // Animate the medal
        medalContainer.style.animation = 'bounce 1s ease 3';
        
        // Set progress ring to final score
        updateProgressRing(score, questions.length);
        
        // Save quiz data
        saveQuizData();
      };

      // 9. Restart quiz
      restartBtn.addEventListener("click", () => {
        window.location.reload();
      });

      // 10. Loading animation
      const loadingAnimation = () => {
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading';
        startBtn.disabled = true;
      };

      // 11. Audio
      const playAudio = (src) => {
        const audio = new Audio(`../js/${src}`);
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed:", e));
      };

      // 12. Confetti function 🎉
      function triggerConfetti() {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6a11cb', '#2575fc', '#ffffff']
        });
      }

      // 13. Save quiz data to localStorage
      const saveQuizData = () => {
        const quizResult = {
          topic: category.options[category.selectedIndex].text,
          score: score,
          answer: questions.length,
          categoryId: category.value,
          difficulty: difficulty.value,
          numQuestions: numQuestions.value,
          timePerQuestion: timePerQuestion.value,
          timestamp: new Date().toISOString()
        };

        const currentUser = localStorage.getItem("currentUser");
        const resultKey = `${currentUser}_generalQuizResults`;

        let quizHistory = JSON.parse(localStorage.getItem(resultKey)) || [];
        quizHistory.push(quizResult);

        localStorage.setItem(resultKey, JSON.stringify(quizHistory));
      };

      // 14. Fixed version to get quiz history for current user
      function getQuizHistory() {
        const currentUser = localStorage.getItem("currentUser");
        const resultKey = `${currentUser}_generalQuizResults`;
        return JSON.parse(localStorage.getItem(resultKey)) || [];
      }
</script>
<script>
// Dynamically load common header
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
