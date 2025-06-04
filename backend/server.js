require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');

const { register, login, verifyToken, authMiddleware } = require('./auth');
const { log } = require('./logger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const dataPath = path.join(__dirname, 'data', 'hardware_db.json');
const idPath = path.join(__dirname, 'data', 'ID.txt');

function loadHardware() {
  if (!fs.existsSync(dataPath)) return [];
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data || '[]');
}

function saveHardware(items) {
  fs.writeFileSync(dataPath, JSON.stringify(items, null, 2));
}

function getNextId() {
  let id = 1;
  if (fs.existsSync(idPath)) {
    id = parseInt(fs.readFileSync(idPath, 'utf8'), 10) + 1;
  }
  fs.writeFileSync(idPath, String(id));
  return id;
}

app.get('/items', authMiddleware, (req, res) => {
  res.json(loadHardware());
});

app.post('/save-object', authMiddleware, (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    serial: Joi.string().required()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const items = loadHardware();
  const newItem = { id: getNextId(), ...req.body };
  items.push(newItem);
  saveHardware(items);
  log(`Added hardware id ${newItem.id}`);
  res.status(201).json(newItem);
});

app.delete('/details/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  let items = loadHardware();
  const index = items.findIndex(it => it.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  const removed = items.splice(index, 1)[0];
  saveHardware(items);
  log(`Deleted hardware id ${id}`);
  res.json(removed);
});

app.post('/register', register);
app.post('/login', login);
app.get('/verify-token', verifyToken);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  log('Server started');
});
