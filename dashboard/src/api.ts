const API_BASE = window.location.origin;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('sovereign_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  
  if (response.status === 401 || response.status === 403) {
      // Automatic session invalidation
      
  }

  return response.json();
}

export function saveSovereignToken(token: string) {
    localStorage.setItem('sovereign_token', token);
}

export function clearSovereignToken() {
    localStorage.removeItem('sovereign_token');
}
