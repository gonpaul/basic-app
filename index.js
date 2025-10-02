// Интерфейс клиента:
// {
//   id: Number,
//   name: String,
//   email: String,
//   phone: String (optional),
//   created_at: String (ISO date)
// }
const API = 'http://localhost:3002/api/clients';

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

let clients = [];

// Загружаем клиентов с сервера при запуске
async function loadClients() {
    try {
        clients = await fetchJSON(API);
        renderClients();
    } catch (error) {
        console.error('Ошибка загрузки клиентов:', error);
        alert('Не удалось загрузить клиентов с сервера');
    }
}

// Загружаем данные при загрузке страницы
loadClients();


const clientList = document.getElementById('client-list');

function renderClients() {
    clientList.innerHTML = '';
    clients.forEach((client, index) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.justifyContent = 'space-between';
        li.style.padding = '12px 16px';
        li.style.margin = '8px 0';
        li.style.background = '#f8f9fa';
        li.style.borderRadius = '8px';
        li.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
        li.style.border = '1px solid #e0e0e0';

        const infoDiv = document.createElement('div');
        infoDiv.style.display = 'flex';
        infoDiv.style.flexDirection = 'column';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = client.name;
        nameSpan.style.fontWeight = 'bold';
        nameSpan.style.fontSize = '1.1em';
        nameSpan.style.color = '#2d4059';

        const detailsSpan = document.createElement('span');
        detailsSpan.style.color = '#555';
        detailsSpan.style.fontSize = '0.97em';
        detailsSpan.textContent = `${client.email}${client.phone ? ', ' + client.phone : ''}`;

        const dateSpan = document.createElement('span');
        dateSpan.style.fontSize = '0.85em';
        dateSpan.style.color = '#a3a3a3';
        dateSpan.textContent = client.created_at.slice(0, 19).replace('T', ' ');

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(detailsSpan);
        infoDiv.appendChild(dateSpan);

        li.appendChild(infoDiv);
        const btn = document.createElement('button');
        btn.textContent = 'убрать';
        btn.addEventListener('click', async () => {
            try {
                await fetchJSON(`${API}/${client.id}`, { method: 'DELETE' });
                clients = clients.filter(c => c.id !== client.id);
                renderClients();
            } catch (error) {
                console.error('Ошибка удаления клиента:', error);
                alert('Не удалось удалить клиента: ' + error.message);
            }
        });
        li.appendChild(btn);
        clientList.appendChild(li);
    });
}

const addButton = document.getElementById('add-button');
addButton.addEventListener('click', async function () {
    // Генерируем уникальный email и имя
    const rand = Math.floor(Math.random() * 10000);
    const newClient = {
        name: "Клиент " + rand,
        email: "client" + rand + "@example.com",
        phone: Math.random() > 0.5 ? "+7999" + (1000000 + rand) : ""
    };
    
    try {
        const response = await fetchJSON(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newClient)
        });
        clients.push(response);
        renderClients();
    } catch (error) {
        console.error('Ошибка добавления клиента:', error);
        alert('Не удалось добавить клиента: ' + error.message);
    }
});