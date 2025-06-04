import { apiFetch } from './Einlog.js';

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value
  };
  try {
    const res = await apiFetch('/login', { method: 'POST', body });
    localStorage.setItem('token', res.token);
    window.location.href = 'HW.html';
  } catch (err) {
    alert('Login fehlgeschlagen');
  }
});
