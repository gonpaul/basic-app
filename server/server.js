const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Список клиентов
app.get('/api/clients', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Создать клиента
app.post('/api/clients', (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name || name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'invalid name' });
  }
  const emailOk = /.+@.+\..+/.test(email || '');
  if (!emailOk) return res.status(400).json({ error: 'invalid email' });
  const stmt = db.prepare(
    'INSERT INTO clients(name, email, phone) VALUES (?, ?, ?)'
  );
  stmt.run([name, email, phone || null], function (err) {
    if (err) return res.status(409).json({ error: err.message });
    db.get('SELECT * FROM clients WHERE id = ?', [this.lastID], (e, row) => {
      if (e) return res.status(500).json({ error: e.message });
      res.status(201).json(row);
    });
  });
});

// Обновить клиента
app.put('/api/clients/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, email, phone } = req.body || {};
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id' });
  if (name && (name.length < 2 || name.length > 100)) {
    return res.status(400).json({ error: 'invalid name' });
  }
  if (email && !/.+@.+\..+/.test(email)) {
    return res.status(400).json({ error: 'invalid email' });
  }
  db.run(
    `UPDATE clients SET name = COALESCE(?, name),
     email = COALESCE(?, email), phone = COALESCE(?, phone)
     WHERE id = ?`,
    [name || null, email || null, phone || null, id],
    function (err) {
      if (err) return res.status(409).json({ error: err.message });
      db.get('SELECT * FROM clients WHERE id = ?', [id], (e, row) => {
        if (e) return res.status(500).json({ error: e.message });
        res.json(row);
      });
    }
  );
});

// Удалить клиента
app.delete('/api/clients/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id' });
  db.run('DELETE FROM clients WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes > 0 });
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));