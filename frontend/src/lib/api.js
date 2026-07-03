// =========================================================================
// CLIENTE DA API — wrapper sobre fetch com token JWT e tratamento de erro.
// Em dev, BASE fica vazio e o proxy do Vite encaminha /api -> :4000.
// Em produção, defina VITE_API_URL.
// =========================================================================
const BASE = import.meta.env.VITE_API_URL || ''
const TOKEN_KEY = 'cometa_admin_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Erro na requisição')
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  del: (p) => request('DELETE', p),
}

// --- Endpoints agrupados por recurso -----------------------------------
export const authApi = {
  login: (email, senha) => api.post('/auth/login', { email, senha }),
  me: () => api.get('/auth/me'),
  updateAccount: (data) => api.put('/auth/me', data),
}

export const projectsApi = {
  list: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  remove: (id) => api.del(`/projects/${id}`),
}

export const routinesApi = {
  listByProject: (projectId) => api.get(`/projects/${projectId}/routines`),
  create: (projectId, data) => api.post(`/projects/${projectId}/routines`, data),
  calendar: (projectId, start, end) =>
    api.get(`/projects/${projectId}/calendar?start=${start}&end=${end}`),
  update: (id, data) => api.put(`/routines/${id}`, data),
  remove: (id) => api.del(`/routines/${id}`),
  setCompletion: (id, data, status) => api.post(`/routines/${id}/completions`, { data, status }),
}

export const usersApi = {
  assignable: () => api.get('/users/assignable'),
  modules: () => api.get('/users/modules'),
  list: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.del(`/users/${id}`),
}

export const obligationsApi = {
  listByProject: (projectId) => api.get(`/projects/${projectId}/obligations`),
  create: (projectId, data) => api.post(`/projects/${projectId}/obligations`, data),
  update: (id, data) => api.put(`/obligations/${id}`, data),
  remove: (id) => api.del(`/obligations/${id}`),
  reorder: (projectId, itens) => api.put(`/projects/${projectId}/obligations/reorder`, { itens }),
}
