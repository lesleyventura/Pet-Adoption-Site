document.addEventListener('DOMContentLoaded', () => {
  const findForm = document.getElementById('find-pet-form');

  if (findForm) {
    const animalRadios = findForm.querySelectorAll('input[name="type"]');
    const catBreedSelect = document.getElementById('cat-breed');
    const dogBreedSelect = document.getElementById('dog-breed');

    // disables select menu for cat or dog depeding on the type of animal that was chosen by client
    function updateBreedSelects() {
        const selectedAnimal = findForm.querySelector('input[name="type"]:checked');
        
        const isCatSelected = selectedAnimal.id === 'cat';
        const isDogSelected = selectedAnimal.id === 'dog';

        catBreedSelect.disabled = !isCatSelected;
        dogBreedSelect.disabled = !isDogSelected;
    }

    animalRadios.forEach(radio => {
      radio.addEventListener('change', () => {
          updateBreedSelects(); 
      });
    });

    findForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const errorMessageContainer = document.getElementById('error-message');
        errorMessageContainer.innerHTML = '';
        let errorMessages = [];

        // get form values
        const animal = findForm.querySelector('input[name="type"]:checked');
        const gender = findForm.querySelector('input[name="gender"]:checked');
        const kids = findForm.querySelector('input[name="kidsFriendly"]:checked');
        const catBreed = document.getElementById('cat-breed').value;
        const dogBreed = document.getElementById('dog-breed').value;
        const age = document.getElementById('age').value;
        const otherCats = document.getElementById('other-cats').checked;
        const otherDogs = document.getElementById('other-dogs').checked;
        const noOtherAnimal = document.getElementById('no-other-animals').checked;

        // verification for any missing input
        if (!animal) {
            errorMessages.push('Please select an animal type.');
        } else {
            if (animal.id === 'cat' && catBreed === '') {
                errorMessages.push('Please select a cat breed.');
            } else if (animal.id === 'dog' && dogBreed === '') {
                errorMessages.push('Please select a dog breed.');
            }
        }

        if (age === '') errorMessages.push('Please select a preferred age.');
        if (!gender) errorMessages.push('Please select a gender.');
        if (!noOtherAnimal && !otherCats && !otherDogs) {
            errorMessages.push('Please specify if you have other pets at home.');
        }

        if (!kids) errorMessages.push('Please select if you have children.');

        if (errorMessages.length > 0) {
          alert(errorMessages.join('\n'));
        } else {
          const formData = new URLSearchParams({
            type: animal.value,
            catBreed: catBreed,
            dogBreed: dogBreed,
            age: age,
            gender: gender.value,
            otherCats: otherCats ? 'true' : 'false',
            otherDogs: otherDogs ? 'true' : 'false',
            noOtherAnimals: noOtherAnimal ? 'true' : 'false',
            kidsFriendly: kids.value
          }).toString();
          window.location.href = `/pets?${formData}`;
        }
    });
  }
});
