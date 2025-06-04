export function getToken() {
  return localStorage.getItem('token');
}

export async function apiFetch(url, options = {}) {
  options.headers = options.headers || {};
  const token = getToken();
  if (token) options.headers['Authorization'] = token;
  if (options.body && typeof options.body !== 'string') {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
