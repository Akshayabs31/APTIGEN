function toggleForm() {
    const form = document.getElementById('auth-form');
    const title = document.getElementById('form-title');
    const registerFields = document.getElementById('register-fields');
    const button = form.querySelector('.btn');
    const toggleText = document.querySelector('.toggle-msg');
  
    if (title.textContent === "Login") {
      title.textContent = "Register";
      registerFields.style.display = "block";
      button.textContent = "Register";
      form.action = "register.php";
      toggleText.innerHTML = 'Already have an account? <a href="#" onclick="toggleForm()">Login</a>';
    } else {
      title.textContent = "Login";
      registerFields.style.display = "none";
      button.textContent = "Login";
      form.action = "login.php";
      toggleText.innerHTML = 'Don\'t have an account? <a href="#" onclick="toggleForm()">Register</a>';
    }
  }
  let isRegister = false;
const formTitle = document.getElementById("form-title");
const form = document.getElementById("auth-form");
const toggleMsg = document.querySelector(".toggle-msg a");
const registerFields = document.getElementById("register-fields");
const submitButton = form.querySelector("button");

// Create error message divs dynamically
["email", "password", "username"].forEach((field) => {
  const input = form.querySelector(`[name="${field}"]`);
  if (input) {
    const error = document.createElement("div");
    error.className = "error";
    error.style.color = "red";
    error.style.fontSize = "0.85em";
    input.parentNode.appendChild(error);
  }
});

function validateForm() {
  const email = form.querySelector('[name="email"]');
  const password = form.querySelector('[name="password"]');
  const username = form.querySelector('[name="username"]');

  const emailError = email.nextElementSibling;
  const passwordError = password.nextElementSibling;
  const usernameError = username?.nextElementSibling;

  let valid = true;

  // Email validation
  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  if (!emailPattern.test(email.value)) {
    emailError.textContent = "Enter a valid email address";
    valid = false;
  } else {
    emailError.textContent = "";
  }

  // Password validation
  if (password.value.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters";
    valid = false;
  } else {
    passwordError.textContent = "";
  }

  // Username validation (only in register mode)
  if (isRegister) {
    if (username.value.trim() === "") {
      usernameError.textContent = "Username is required";
      valid = false;
    } else {
      usernameError.textContent = "";
    }
  }

  submitButton.disabled = !valid;
}

// Attach input events
["email", "password", "username"].forEach((field) => {
  const input = form.querySelector(`[name="${field}"]`);
  if (input) input.addEventListener("input", validateForm);
});

// Toggle login/register mode
function toggleForm() {
  isRegister = !isRegister;
  formTitle.textContent = isRegister ? "Register" : "Login";
  submitButton.textContent = isRegister ? "Register" : "Login";
  form.action = isRegister ? "register.php" : "login.php";
  registerFields.style.display = isRegister ? "block" : "none";
  validateForm(); // trigger validation on toggle
}

  