const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, 'data');
// Ensure the data directory exists to avoid SQLITE_CANTOPEN
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'clients.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email)`
  );
});

module.exports = db;