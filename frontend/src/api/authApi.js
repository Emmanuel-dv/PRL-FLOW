import axiosClient from './axiosClient'
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const login = (email, password) =>
  axiosClient.post('/api/auth/login', { email, password }).then((r) => r.data)

export const register = (data) =>
  axiosClient.post('/api/auth/register', data).then((r) => r.data)

export const refreshToken = (token) =>
  axios
    .post(`${BASE}/api/auth/refresh`, {}, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
