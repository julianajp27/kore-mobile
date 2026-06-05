export const API_BASE_URL = 'https://sistema-gestao-atividades-complementares.onrender.com';

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}
