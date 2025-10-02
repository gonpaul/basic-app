- бд (хранит данные - постоянный носитель)
    - что я должен хранить и как это сделать?
- сервер (обрабатывает запросы и данные, взаимодействует бд и клиентом)
    - как я должен обрабатывать запросы с клиента и работать с информацией?
    - как сохранять результат обработки в бд? 
- клиент (загруженное приложение в твоём браузере)
    - что я хочу видеть на экране и как оно должно выглядеть, работать?
    - как настроить связь с бекендом?

клиент ---общается с----> сервер ---общается с----> бд

1. сделать базовую страницу html
2. понять зачем хранить данные и зачем бек
3. описать требования для базы данных и сделать модель
4. связать бд с сервером и написать основную логику обработки
5. связать логику обработки сервера с фронтом


# 1
## Список клиентов

- doctype
    - html
        - head
        - body

[x] - теги
[x] - аттрибуты
[x] - стиль и селектор
[x] - связка html и css через <link> 
[ ] - 

# 2. Понять зачем хранить данные и зачем бек
# basic-app

Зачем хранить данные:
- долговременность: перезапуск браузера/ПК не стирает список
- консистентность: у всех пользователей один источник истины
- поиск/фильтры/сортировка: быстрее и надёжнее на стороне БД
- безопасность: не выдаём лишние данные, скрываем токены/ключи

Зачем нужен сервер (бекенд):
- валидирует входные данные и применяет бизнес‑правила
- управляет доступом (аутентификация/авторизация)
- общается с БД и возвращает только нужные поля
- инкапсулирует сложную логику, чтобы фронт был проще

Что будем хранить (сущность «Клиент»):
- id (целое, автоинкремент)
- name (строка, 2..100 символов)
- email (строка, уникальный, формат email)
- phone (строка, опционально)
- created_at (дата/время создания записи)

Минимальные операции:
- создать клиента
- получить список клиентов
- обновить данные клиента
- удалить клиента


# 3. Описать требования для базы данных и сделать модели

БД: SQLite (файл в проекте). Преимущества: простая, без сервера,
кроссплатформенная.

Схема таблицы `clients`:
```sql
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Индексы (по необходимости):
```sql
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
```

Базовые инварианты/валидация:
- name: не пустое, длина 2..100
- email: формат email, уникален
- phone: опционально, цифры/+, длина 7..20 (проверим на сервере)

Модель данных (логическая):
```json
{
  "id": 1,
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "phone": "+79991234567",
  "created_at": "2025-10-02T12:00:00Z"
}
```


# 4. Связать БД с сервером и написать основную логику

Подготовка окружения (в каталоге проекта):
```bash
npm init -y
npm install express sqlite3 cors
```

Структура (всё в `basic-app/`):
- `server.js` — запуск Express и роуты
- `db.js` — подключение к SQLite и инициализация схемы
- `data/clients.db` — файл БД (создастся автоматически)

Пример `db.js` (инициализация):
```js
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'data', 'clients.db');
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
```

Пример `server.js` (роуты CRUD):
```js
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
```

Команды запуска (в одном терминале):
```bash
node server.js
```

Проверка API (примеры curl):
```bash
curl http://localhost:3000/api/clients
curl -X POST http://localhost:3000/api/clients \
  -H 'Content-Type: application/json' \
  -d '{"name":"Иван","email":"ivan@example.com"}'
```


# 5. Связать логику сервера с фронтом

Цель: страница из `index.html`/`index.js` показывает список клиентов,
даёт добавить/редактировать/удалять.

Минимальные шаги:
1) загрузить список при открытии страницы
2) отправить форму создания нового клиента
3) кнопки «изменить», «удалить» для каждой строки

Пример кода для `index.js` (адаптируйте под вашу разметку):
```js
const API = 'http://localhost:3000/api/clients';

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadClients() {
  const list = await fetchJSON(API);
  const tbody = document.querySelector('#clients-body');
  tbody.innerHTML = '';
  for (const c of list) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.name}</td>
      <td>${c.email}</td>
      <td>${c.phone || ''}</td>
      <td>
        <button data-ed="${c.id}">Изм.</button>
        <button data-del="${c.id}">Удал.</button>
      </td>`;
    tbody.appendChild(tr);
  }
}

async function createClient(name, email, phone) {
  await fetchJSON(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone })
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadClients().catch(console.error);
  const form = document.querySelector('#new-client');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    try {
      await createClient(name, email, phone);
      form.reset();
      await loadClients();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  });
});
```

Минимальная разметка таблицы и формы в `index.html`:
```html
<form id="new-client">
  <input name="name" placeholder="Имя" required />
  <input name="email" type="email" placeholder="Email" required />
  <input name="phone" placeholder="Телефон" />
  <button type="submit">Добавить</button>
  <small>API: http://localhost:3000</small>
  <hr />
</form>

<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Имя</th>
      <th>Email</th>
      <th>Телефон</th>
      <th>Действия</th>
    </tr>
  </thead>
  <tbody id="clients-body"></tbody>
  </table>
```

Замечания:
- браузер и сервер работают на разных порталах (CORS включён)
- храните секреты в переменных окружения, не в репозитории
- для продакшна используйте `pm2`, резервные копии БД и миграции
