const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
const STORAGE_KEY = 'cerebrose_admin_pw';

export function getAdminPassword() {
  return sessionStorage.getItem(STORAGE_KEY) || '';
}

export function setAdminPassword(password) {
  sessionStorage.setItem(STORAGE_KEY, password);
}

export function clearAdminPassword() {
  sessionStorage.removeItem(STORAGE_KEY);
}

async function request(path, options) {
  const res = await fetch(`${SOCKET_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-admin-password': getAdminPassword() },
    ...options
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearAdminPassword();
    throw new Error(body.error || 'Mot de passe admin invalide');
  }
  if (!res.ok) throw new Error(body.error || `Erreur ${res.status}`);
  return body;
}

// Throws if the password is wrong; used to validate a login attempt.
export function verifyAdminPassword() {
  return request('/admin/games');
}

export function fetchGamesConfig() {
  return request('/admin/games');
}

export function fetchGameData(gameId) {
  return request(`/admin/games/${gameId}/data`);
}

export function saveGameData(gameId, content) {
  return request(`/admin/games/${gameId}/data`, {
    method: 'PUT',
    body: JSON.stringify({ content })
  });
}
