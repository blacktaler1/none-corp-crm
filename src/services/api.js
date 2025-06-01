import axios from "axios"

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://51.21.243.235:8000/api/"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)

// Supplier API
export const supplierAPI = {
  getAll: (params = {}) => api.get("/suppliers/", { params }),
  getById: (id) => api.get(`/suppliers/${id}/`),
  create: (data) => api.post("/suppliers/", data),
  update: (id, data) => api.put(`/suppliers/${id}/`, data),
  delete: (id) => api.delete(`/suppliers/${id}/`),
}

// Customer API
export const customerAPI = {
  getAll: (params = {}) => api.get("/customers/", { params }),
  getById: (id) => api.get(`/customers/${id}/`),
  create: (data) => api.post("/customers/", data),
  update: (id, data) => api.put(`/customers/${id}/`, data),
  delete: (id) => api.delete(`/customers/${id}/`),
}

// Product API
export const productAPI = {
  getAll: (params = {}) => api.get("/products/", { params }),
  getById: (id) => api.get(`/products/${id}/`),
  create: (data) => api.post("/products/", data),
  update: (id, data) => api.put(`/products/${id}/`, data),
  delete: (id) => api.delete(`/products/${id}/`),
}

// Sale API
export const saleAPI = {
  getAll: (params = {}) => api.get("/sales/", { params }),
  getById: (id) => api.get(`/sales/${id}/`),
  create: (data) => api.post("/sales/", data),
  update: (id, data) => api.put(`/sales/${id}/`, data),
  delete: (id) => api.delete(`/sales/${id}/`),
  getStatistics: () => api.get("/sales/statistics/"),
}

export default api
