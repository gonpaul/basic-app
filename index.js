// Интерфейс клиента:
// {
//   id: Number,
//   name: String,
//   email: String,
//   phone: String (optional),
//   created_at: String (ISO date)
// }

let nextClientId = 1;
let clients = [
    {
        id: nextClientId++,
        name: "Иван Иванов",
        email: "ivan" + Math.floor(Math.random() * 1000) + "@example.com",
        phone: "+79991234567",
        created_at: new Date().toISOString()
    },
    {
        id: nextClientId++,
        name: "Мария Петрова",
        email: "maria" + Math.floor(Math.random() * 1000) + "@example.com",
        phone: "+79997654321",
        created_at: new Date().toISOString()
    },
    {
        id: nextClientId++,
        name: "John Smith",
        email: "john" + Math.floor(Math.random() * 1000) + "@example.com",
        phone: "",
        created_at: new Date().toISOString()
    }
];

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
        btn.addEventListener('click', () => {
            clients.splice(index, 1);
            renderClients();
        });
        li.appendChild(btn);
        clientList.appendChild(li);
    });
}

const addButton = document.getElementById('add-button');
addButton.addEventListener('click', function () {
    // Генерируем уникальный email и имя
    const rand = Math.floor(Math.random() * 10000);
    const newClient = {
        id: nextClientId++,
        name: "Клиент " + rand,
        email: "client" + rand + "@example.com",
        phone: Math.random() > 0.5 ? "+7999" + (1000000 + rand) : "",
        created_at: new Date().toISOString()
    };
    // Проверка уникальности email
    if (clients.some(c => c.email === newClient.email)) {
        alert("Email уже существует!");
        return;
    }
    clients.push(newClient);
    renderClients();
});

renderClients();