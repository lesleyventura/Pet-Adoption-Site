document.getElementById('logout-form').addEventListener('submit', function(event) {
  event.preventDefault(); 

  fetch('/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // show confirmation message
      alert(data.message);
      window.location.href = '/home';
    } else {
      alert(data.message || 'Error logging out. Please try again.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error logging out. Please try again.');
  });
});



