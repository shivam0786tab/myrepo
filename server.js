const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Read DB name from env
const dbName = process.env.DB_NAME || 'myappdb';

// Step 1: Create database if it doesn't exist
const initDbSql = `
  CREATE DATABASE IF NOT EXISTS \`${dbName}\`;
  USE \`${dbName}\`;
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    deleted_at DATETIME DEFAULT NULL
  );
`;

db.query(initDbSql, (err) => {
  if (err) {
    console.error('Error initializing database and table:', err);
    process.exit(1);
  }
  console.log(`Database '${dbName}' and 'users' table ready.`);
});

// Middleware to switch connection to the selected DB (optional if using pool)
db.changeUser({ database: dbName }, err => {
  if (err) {
    console.error('Error switching to database:', err);
    process.exit(1);
  }
});

// API routes
app.post('/api/users', (req, res) => {
  const { name } = req.body;
  db.query('INSERT INTO users (name) VALUES (?)', [name], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ id: result.insertId, name });
  });
});

app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users WHERE deleted_at IS NULL', (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE users SET deleted_at = NOW() WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

app.get('/api/deleted-users', (req, res) => {
  db.query('SELECT * FROM users WHERE deleted_at IS NOT NULL', (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
