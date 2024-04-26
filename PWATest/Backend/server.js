// server.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Connect to SQLite database
const db = new sqlite3.Database('./notes.db');

app.use(express.json());

app.use(express.static('public'));

// Define routes for CRUD operations
// Example routes: GET /notes, POST /notes, PUT /notes/:id, DELETE /notes/:id

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// server.js
app.get("/",(req,res) =>{
    res.sendFile("/public/index.html")
})
// GET all notes
app.get('/notes', (req, res) => {
    db.all('SELECT * FROM notes', (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  });
  
  // POST a new note
  app.post('/notes', (req, res) => {
    const { title, content } = req.body;
    db.run('INSERT INTO notes (title, content) VALUES (?, ?)', [title, content], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    });
  });
  
  // PUT update a note
  app.put('/notes/:id', (req, res) => {
    const { title, content } = req.body;
    const id = req.params.id;
    db.run('UPDATE notes SET title = ?, content = ? WHERE id = ?', [title, content, id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    });
  });
  
  // DELETE a note
  app.delete('/notes/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM notes WHERE id = ?', id, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ deleted: this.changes });
    });
  });
  