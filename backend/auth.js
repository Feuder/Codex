const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { log } = require('./logger');

const usersPath = path.join(__dirname, 'data', 'users_db.json');
const secret = process.env.JWT_SECRET || 'secretkey';

function loadUsers() {
  if (!fs.existsSync(usersPath)) return [];
  const data = fs.readFileSync(usersPath, 'utf8');
  return JSON.parse(data || '[]');
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function register(req, res) {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).required(),
    password: Joi.string().min(6).required()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const users = loadUsers();
  if (users.find(u => u.username === req.body.username)) {
    return res.status(409).json({ error: 'User already exists' });
  }
  users.push({ username: req.body.username, password: req.body.password });
  saveUsers(users);
  log(`Registered user ${req.body.username}`);
  res.status(201).json({ message: 'User registered' });
}

function login(req, res) {
  const users = loadUsers();
  const user = users.find(u => u.username === req.body.username && u.password === req.body.password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ username: user.username }, secret, { expiresIn: '1h' });
  log(`User ${user.username} logged in`);
  res.json({ token });
}

function verifyToken(req, res) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    res.json({ valid: true, username: decoded.username });
  });
}

function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

module.exports = { register, login, verifyToken, authMiddleware };
