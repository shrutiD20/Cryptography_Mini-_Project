const express = require('express');
const path = require('path');
const argon2 = require('argon2');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

const users = {}; // In-memory user storage

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/register.html')));

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (users[username]) {
    return res.json({ success: false, message: 'Username already exists' });
  }

  try {
    const hashedPassword = await argon2.hash(password);
    users[username] = hashedPassword;
    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = users[username];
  if (!hashedPassword) {
    return res.json({ success: false, message: 'Invalid username or password' });
  }

  try {
    const isMatch = await argon2.verify(hashedPassword, password);
    if (isMatch) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
