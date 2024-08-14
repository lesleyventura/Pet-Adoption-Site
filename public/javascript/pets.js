document.addEventListener('DOMContentLoaded', async () => {
  const queryString = window.location.search.slice(1);

  async function fetchPets(queryString) {
    const response = await fetch(`/pets?${queryString}`);
    if (!response.ok) {
      console.error('Failed to fetch pets:', response.statusText);
      return [];
    }
    return response.json();
  }

  try {
    const pets = await fetchPets(queryString);
    displayPets(pets);
  } catch (error) {
    console.error('Error:', error);
  }

  function displayPets(pets) {
    const petsContainer = document.getElementById('pets-container');
    petsContainer.innerHTML = ''; // clear previous results
  
    pets.forEach(pet => {
      const formattedAge = pet.age.charAt(0).toUpperCase() + pet.age.slice(1).toLowerCase();
      const petElement = document.createElement('div');
      petElement.className = 'pet';
  
      petElement.innerHTML = `
        <div class="pet-picture-row">
          <img class="pet-picture" src="/pictures/${pet.image}" alt="${pet.name}">
        </div>
        <div class="info">
          <div class="pet-info">
            <p class="pet-name">${pet.name}</p>
            <p class="pet-breed">Breed: ${pet.breed}</p>
            <p class="pet-age">Age: ${formattedAge}</p>
            <p class="pet-gender">Gender: ${pet.gender}</p>
            <p class="pet-friendliness">${pet.otherCats ? 'Friendly with other cats' : 'Not friendly with other cats'}</p>
            <p class="pet-friendliness">${pet.otherDogs ? 'Friendly with other dogs' : 'Not friendly with other dogs'}</p>
            <p>${pet.kidsFriendly ? 'Kid Friendly' : 'Not Kid Friendly'}</p>
          </div>
          <div class="pet-interested">
            <button class="interested-button">Interested!</button>
          </div>
        </div>
      `;
  
      petsContainer.appendChild(petElement);
    });
  }

});

