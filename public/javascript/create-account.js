document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('create-account-form');
  const message = document.getElementById('message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = form.username.value.trim();
    const password = form.password.value.trim();

    // Validate username and password
    if (!validateUsername(username)) {
      alert('Username can only contain letters and digits.');
      return;
    }

    if (!validatePassword(password)) {
      alert('Password must be at least 4 characters long and contain both letters and digits.');
      return;
    }

    // Check username availability and create account
    try {
      const response = await fetch('/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Account created successfully! You can now log in.');
        form.reset();
      } else {
        alert(result.message); 
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  });

  function validateUsername(username) {
    return /^[a-zA-Z0-9]+$/.test(username);
  }

  function validatePassword(password) {
    return /[a-zA-Z]/.test(password) && /\d/.test(password) && password.length >= 4;
  }
});
