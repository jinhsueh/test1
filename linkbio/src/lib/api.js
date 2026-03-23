const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

export const api = {
  // auth
  register: (email, handle, password) =>
    req('POST', '/api/auth/register', { email, handle, password }),
  login: (email, password) =>
    req('POST', '/api/auth/login', { email, password }),
  me: () => req('GET', '/api/auth/me'),

  // pages
  listPages: () => req('GET', '/api/pages/'),
  createPage: (data) => req('POST', '/api/pages/', data),
  getPage: (id) => req('GET', `/api/pages/${id}`),
  updatePage: (id, data) => req('PUT', `/api/pages/${id}`, data),
  deletePage: (id) => req('DELETE', `/api/pages/${id}`),
  getPublicPage: (handle) => req('GET', `/api/pages/public/${handle}`),

  // analytics
  recordClick: (page_handle, block_id) =>
    req('POST', '/api/analytics/click', { page_handle, block_id }),
  getAnalytics: (page_id) => req('GET', `/api/analytics/${page_id}`),
}
