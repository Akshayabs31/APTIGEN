function startQuiz(category) {
    localStorage.setItem('selectedCategory', category);
    window.location.href = 'quiz.html';
  }
  