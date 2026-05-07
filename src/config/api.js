const BASE = '/api'

function getToken() {
  return localStorage.getItem('mm_token')
}

async function request(method, path, body) {
  const token = getToken()

  const headers = {}

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body:
      body instanceof FormData
        ? body
        : body
        ? JSON.stringify(body)
        : undefined,
  })

  let data = null

  try {
    data = await res.json()
  } catch {}

  if (!res.ok) {
    const msg = data?.erro || data?.mensagem || `Erro ${res.status}`

    const err = new Error(msg)

    err.status = res.status

    throw err
  }

  return data
}

export const api = {

  // ==========================================
  // AUTH
  // ==========================================

  register: (payload) =>
    request('POST', '/sellers', payload),

  activate: (payload) =>
    request('POST', '/sellers/activate', payload),

  login: (payload) =>
    request('POST', '/auth/login', payload),

  // ==========================================
  // PRODUCTS
  // ==========================================

  getProducts: () =>
    request('GET', '/products'),

  createProduct: (payload) =>
    request('POST', '/products', payload),

  updateProduct: (id, payload) =>
    request('PUT', `/products/${id}`, payload),

  inactivateProduct: (id) =>
    request('PATCH', `/products/${id}/inactivate`),

  activateProduct: (id) =>
    request('PATCH', `/products/${id}/activate`),

  uploadProductImage: (formData) =>
    request('POST', '/products/upload', formData),

  // ==========================================
  // SALES
  // ==========================================

  getSales: () =>
    request('GET', '/sales'),

  createSale: (payload) =>
    request('POST', '/sales', payload),

  // ==========================================
  // DASHBOARD
  // ==========================================

  getDashboard: () =>
    request('GET', '/dashboard'),
}