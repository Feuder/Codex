import { apiFetch, getToken } from './Einlog.js';

document.addEventListener('DOMContentLoaded', () => {
  loadItems();
  document.getElementById('hwForm').addEventListener('submit', addItem);
});

async function loadItems() {
  const items = await apiFetch('/items');
  const list = document.getElementById('hardwareList');
  list.innerHTML = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.textContent = `${item.id}: ${item.name} (${item.type})`; 
    const btn = document.createElement('button');
    btn.textContent = 'Löschen';
    btn.onclick = () => deleteItem(item.id);
    div.appendChild(btn);
    list.appendChild(div);
  });
}

async function addItem(e) {
  e.preventDefault();
  const body = {
    name: document.getElementById('name').value,
    type: document.getElementById('type').value,
    serial: document.getElementById('serial').value
  };
  await apiFetch('/save-object', { method: 'POST', body });
  loadItems();
}

async function deleteItem(id) {
  await apiFetch(`/details/${id}`, { method: 'DELETE' });
  loadItems();
}
