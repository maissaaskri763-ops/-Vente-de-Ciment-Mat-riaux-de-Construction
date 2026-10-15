const TOKEN_KEY = 'vent_auth_token';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const saveAuthSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem('vent_auth_user', JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('vent_auth_user');
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('vent_auth_user') || 'null');
  } catch {
    return null;
  }
};

export const apiFetch = (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...options, headers });
};
