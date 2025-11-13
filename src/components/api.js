const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let msg = `Error ${res.status}`
    try { const data = await res.json(); msg = data.detail || msg } catch {}
    throw new Error(msg)
  }
  try { return await res.json() } catch { return null }
}

export const Auth = {
  register: (name, email, password) => api('/api/auth/register', { method: 'POST', body: { name, email, password } }),
  login: (email, password) => api('/api/auth/login', { method: 'POST', body: { email, password } }),
}

export const Movies = {
  list: (params = {}) => {
    const q = new URLSearchParams(params)
    const qs = q.toString() ? `?${q.toString()}` : ''
    return api(`/api/movies${qs}`)
  },
  get: (id) => api(`/api/movies/${id}`),
  seed: () => api('/api/seed', { method: 'POST' }),
}

export const MyList = {
  add: (token, movie_id) => api('/api/list/add', { method: 'POST', body: { token, movie_id } }),
  get: (token) => api(`/api/list?token=${encodeURIComponent(token)}`),
}
