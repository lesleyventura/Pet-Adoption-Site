document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('giveaway-form');
  const errorMessageContainer = document.getElementById('error-message');
  const messageContainer = document.getElementById('form-message');
  
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessageContainer.innerHTML = '';
    messageContainer.innerHTML = '';

    let errorMessages = [];

    // get form values
    const fname = document.getElementById('fname').value.trim();
    const lname = document.getElementById('lname').value.trim();
    const email = document.getElementById('email').value.trim();
    const animal = form.querySelector('input[name="animal"]:checked');
    const catBreed = document.getElementById('cat-breed').value;
    const dogBreed = document.getElementById('dog-breed').value;
    const age = document.getElementById('age').value;
    const gender = form.querySelector('input[name="gender"]:checked');
    const dogFriendly = form.querySelector('input[name="dog-friendly"]:checked');
    const catFriendly = form.querySelector('input[name="cat-friendly"]:checked');
    const kidFriendly = form.querySelector('input[name="kids"]:checked');
    
    // verification for any missing input
    if (!fname) errorMessages.push('Please enter your first name.');
    if (!lname) errorMessages.push('Please enter your family name.');
    if (!email || !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      errorMessages.push('Please enter a valid email address.');
    }

    if (!animal) {
      errorMessages.push('Please select an animal type.');
    } else {
      if (animal.id === 'cat' && catBreed === '') {
        errorMessages.push('Please select a cat breed.');
      } else if (animal.id === 'dog' && dogBreed === '') {
        errorMessages.push('Please select a dog breed.');
      }
    }

    if (age === '') errorMessages.push('Please select the age of the animal.');
    if (!gender) errorMessages.push('Please select the gender of the animal.');
    if (!dogFriendly) errorMessages.push('Please specify if the animal is friendly with other dogs.');
    if (!catFriendly) errorMessages.push('Please specify if the animal is friendly with other cats.');
    if (!kidFriendly) errorMessages.push('Please specify if the animal is suitable for a family with small children.');

    if (errorMessages.length > 0) {
      alert(errorMessages.join('\n'));
      event.preventDefault();
    }

    try {
      const response = await fetch('/submit-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fname,
          lname,
          email,
          animal: animal.id,
          'cat-breed': catBreed,
          'dog-breed': dogBreed,
          age,
          gender: gender.id,
          'dog-friendly': dogFriendly.value,
          'cat-friendly': catFriendly.value,
          kids: kidFriendly.value,
          comment: document.getElementById('comment').value.trim()
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        form.reset(); // reset the form fields
      } else {
        alert(result.message); // display error message from the server
      }
    } catch (error) {
      console.error('Error:', error);
    }

  });
});
