const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const ejsLayouts = require('express-ejs-layouts');
const { title } = require('process');

const app = express();
const PORT = process.env.PORT || 3017;

app.use(ejsLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// const PETS_FILE = path.join(__dirname, 'pets.txt');
// const LOGIN_FILE = path.join(__dirname, 'login.txt');
// const AVAIL_FILE = path.join(__dirname, 'available.txt');
const LOGIN_FILE = process.env.LOGIN_FILE ? path.resolve(process.env.LOGIN_FILE) : path.join(__dirname, 'login.txt');
const AVAIL_FILE = process.env.AVAIL_FILE ? path.resolve(process.env.AVAIL_FILE) : path.join(__dirname, 'available.txt');
const PETS_FILE = process.env.PETS_FILE ? path.resolve(process.env.PETS_FILE) : path.join(__dirname, 'pets.txt');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: '317-173',
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

app.get('/home', (req, res) => {
  res.render('home', { 
    title: 'Home' });
});

app.get('/find', (req, res) => {
  res.render('find', { 
    title: 'Find a Pet' });
});

// checks login status and redirect accordingly
app.get('/check-login', (req, res) => {
  if (req.session.user) {
    res.render('giveaway', { title: 'Give Away'});
  } else {
    res.render('login', {title: 'Login'});
  }
});

app.get('/login', (req, res) => {
  res.render('login', { 
    title: 'Login' });
});

// serve the giveaway form page
app.get('/giveaway', (req, res) => {
  if (req.session.user) {
    res.render('giveaway', { title: 'Give Away'});
  } else {
    res.redirect('/login');
  }
});

app.get('/dogcare', (req, res) => {
  res.render('dogcare', { 
    title: 'Dog Care' });
});

app.get('/catcare', (req, res) => {
  res.render('catcare', { 
    title: 'Cat Care' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { 
    title: 'Contact Us' });
});

app.get('/disclaimer', (req, res) => {
  res.render('disclaimer', { 
    title: 'Privacy/Disclamer Statement' });
});

app.get('/account', (req, res) => {
  res.render('account', { title: 'Create an Account' });
});

app.get('/logout', (req, res) => {
  if (!req.session || !req.session.user) {
    // no active session 
    return res.redirect('/?logout-message=No active session to log out.');
  }
  // destroy the session
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error logging out.');
    }

    // redirect to home or login page with a logout confirmation message
    res.redirect('/?logout-message=You have been logged out successfully.');  });
});

app.get('/pets', (req, res) => {
  fs.readFile(PETS_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading pet data');
    }

    const pets = JSON.parse(data);
    const filteredPets = pets.filter(pet => {
      const otherCatsSelected = req.query.otherCats === 'true';
      const otherDogsSelected = req.query.otherDogs === 'true';
      const noOtherAnimalsSelected = req.query.noOtherAnimals === 'true';
      
      // Determine if the pet should be shown based on the selected filters
      const showPet = (!req.query.type || pet.type === req.query.type) &&
                      (!req.query.catBreed || req.query.catBreed === 'All' || pet.breed === req.query.catBreed) &&
                      (!req.query.dogBreed || req.query.dogBreed === 'All' || pet.breed === req.query.dogBreed) &&
                      (!req.query.age || req.query.age === 'All' || pet.age.toLowerCase() === req.query.age.toLowerCase()) &&
                      (!req.query.gender || req.query.gender === 'All' || pet.gender.toLowerCase() === req.query.gender.toLowerCase()) &&
                      // 1. Handles all cases for pets that are friendly to both cats and dogs depending on if client selects that they have other cats,
                      // other dogs, or no other animals at home.
                      //    Example: if client selects otherDogs only, filter will still display all pets that are friendly to dogs AND cats.
                      // 2. In the case that otherCats is selected, this filters out any pet that is not friendly to other cats.
                      // Same applies to if otherDogs is selected.
                      ((noOtherAnimalsSelected && !pet.otherCats && !pet.otherDogs) ||  
                       (otherCatsSelected && (pet.otherCats && (pet.otherDogs || !otherDogsSelected))) ||
                       (otherDogsSelected && (pet.otherDogs && (pet.otherCats || !otherCatsSelected))) ||
                       (otherCatsSelected && otherDogsSelected) ||
                       (!otherCatsSelected && !otherDogsSelected && noOtherAnimalsSelected)) &&
                      (req.query.kidsFriendly === undefined || req.query.kidsFriendly === 'false' || pet.kidsFriendly === (req.query.kidsFriendly === 'true'));
      
      return showPet;
    });
    res.render('pets', { 
      title: 'Browse Available Pets', 
      pets: filteredPets });
  });
});

// handles logout
app.post('/logout', (req, res) => {
  if (!req.session || !req.session.user) {
    // no active session
    return res.json({ success: false, message: 'No active session to log out.' });
  }
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.json({ success: true, message: 'You have been logged out successfully.' });
  });
});

// route to handle account creation
app.post('/create-account', (req, res) => {
  const { username, password } = req.body;

  // returns message for invalid username or password formats
  if (!validateUsername(username) || !validatePassword(password)) {
    return res.json({ success: false, message: 'Invalid username or password format.' });
  }

  console.log('Login file path:', LOGIN_FILE);

  fs.readFile(LOGIN_FILE, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      return res.json({ success: false, message: 'Unable to read login file.' });
    }

    const users = err ? [] : data.split('\n').filter(line => line.trim()).map(line => line.split(':')[0]);

    // handles if username is already existing
    if (users.includes(username)) {
      return res.json({ success: false, message: 'Username is already taken. Please choose another one.' });
    }

    fs.appendFile(LOGIN_FILE, `${username}:${password}\n`, (err) => {
      if (err) {
        return res.json({ success: false, message: 'Unable to write to login file.' });
      }
      res.json({ success: true, message: 'Account created successfully. You can now log in.' });
    });
  });
});

// validation functions for username and passwords
function validateUsername(username) {
  return /^[a-zA-Z0-9]+$/.test(username);
}

function validatePassword(password) {
  return /[a-zA-Z]/.test(password) && /\d/.test(password) && password.length >= 4;
}

// handles login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // validate username and password formats
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return res.status(400).json({ success: false, message: 'Invalid username format.' });
  }
  if (password.length < 4 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({ success: false, message: 'Invalid password format.' });
  }

  // read login file and check credentials
  fs.readFile(LOGIN_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading login file:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    const credentials = data.split(/\r?\n/).some(line => {
      const [storedUsername, storedPassword] = line.split(':').map(part => part.trim());
      console.log('Checking username:', storedUsername, 'password:', storedPassword);
      return storedUsername === username && storedPassword === password;
    });

    if (credentials) {
      req.session.user = username; // start a session
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// handle pet submission
app.post('/submit-pet', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  const { fname, lname, email, animal, 'cat-breed': catBreed, 'dog-breed': dogBreed, age, gender, 'dog-friendly': dogFriendly, 'cat-friendly': catFriendly, kids, comment } = req.body;

  if (!fname || !lname || !email || !animal || !age || !gender || !dogFriendly || !catFriendly || !kids) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  // determine the breed
  const breed = animal === 'cat' ? catBreed : dogBreed;

  // read the pets file to find the highest ID
  fs.readFile(AVAIL_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error reading pet file' });
    }

    let newPetId = 1; // defaults to 1 if the file is empty

    if (data.trim()) {
      const petEntries = data.trim().split('\n');
      if (petEntries.length > 0) {
        const lastEntry = petEntries[petEntries.length - 1];
        const fields = lastEntry.split(':');

        // check that we have at least one field and it can be parsed
        if (fields.length > 0) {
          const lastId = parseInt(fields[0], 10);
          if (!isNaN(lastId)) {
            newPetId = lastId + 1; // increment the highest ID
          } else {
            console.error('Invalid ID format in last entry:', lastEntry);
          }
        }
      }
    }
    const petEntry = `${newPetId}:${req.session.user}:${animal}:${breed}:${age}:${gender}:${dogFriendly}:${catFriendly}:${kids}:${comment}\n`;

    fs.appendFile(AVAIL_FILE, petEntry, err => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error adding pet.' });
      }
      res.json({ success: true, message: 'Pet added successfully.' });
    });
  });
});

// start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
