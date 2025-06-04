import { apiFetch } from './Einlog.js';

document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value
  };
  try {
    await apiFetch('/register', { method: 'POST', body });
    window.location.href = 'Login.html';
  } catch (err) {
    alert('Registrierung fehlgeschlagen');
  }
});
