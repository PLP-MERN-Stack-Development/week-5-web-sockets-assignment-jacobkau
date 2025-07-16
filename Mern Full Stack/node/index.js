const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const connectDB = require('./db');
const User = require('./models/User');

connectDB(); // Connect to MongoDB

const saltRounds = 10;

// 📁 Multer setup for profile image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// 🧠 Middleware
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// 🛡️ Session config using MongoDB
app.use(
  session({
    secret: 'jacobwittykaumwambwajames',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/witty' }),
  })
);

// 📄 Static HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'home.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'views', 'signup.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
  } else {
    res.redirect('/login');
  }
});
app.get('/settings', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'views', 'settings.html'));
});

// 📝 Signup
app.post('/signup', upload.single('profilePic'), async (req, res) => {
  const { username, password } = req.body;
  const profilePic = req.file ? req.file.filename : null;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.send('Username already exists.');

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ username, password: hashedPassword, profilePic });
    await newUser.save();

    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.send('Error signing up.');
  }
});

// 🔐 Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.user = {
        id: user._id,
        username: user.username,
        profilePic: user.profilePic,
      };
      res.redirect('/dashboard');
    } else {
      res.send('❌ Invalid login. <a href="/login">Try again</a>');
    }
  } catch (err) {
    console.error(err);
    res.send('Login error.');
  }
});

// 🔓 Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.send('👋 You are logged out. <a href="/login">Login again</a>');
  });
});

// ⚙️ Update Settings
app.post('/update-settings', upload.single('profilePic'), async (req, res) => {
  const { username, password } = req.body;
  const profilePic = req.file ? req.file.filename : null;

  try {
    const user = await User.findById(req.session.user.id);
    if (!user) return res.send('User not found.');

    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, saltRounds);
    if (profilePic) user.profilePic = profilePic;

    await user.save();

    req.session.user = {
      id: user._id,
      username: user.username,
      profilePic: user.profilePic,
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.send('Settings update failed.');
  }
});

// 📦 API: Get session data
app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.json({
      username: req.session.user.username,
      profilePic: req.session.user.profilePic
        ? `/uploads/${req.session.user.profilePic}`
        : null,
    });
  } else {
    res.json({});
  }
});

// 🚀 Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
