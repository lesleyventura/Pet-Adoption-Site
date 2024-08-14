document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const logoutMessage = params.get('logout-message');
  
  if (logoutMessage) {
    alert(logoutMessage);
    setTimeout(() => {
      window.location.href = '/';
    }, 1000); 
  }

  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('login-message');

  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // get form values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // verification for proper input format
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      alert('Username must contain letters and digits only.');
      return;
    }
    if (password.length < 4 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      alert('Password must be at least 4 characters long and contain at least one letter and one digit.');
      return;
    }

    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.href = '/check-login'; // redirect on successful login
      } else {
        alert(data.message || 'Login failed.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      errorMessage.innerText = 'An error occurred. Please try again later.';
    });
  });
});

