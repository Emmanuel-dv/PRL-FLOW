import axiosClient from './axiosClient'

export const getAll = () => axiosClient.get('/api/incidents').then((r) => r.data)

export const getById = (id) => axiosClient.get(`/api/incidents/${id}`).then((r) => r.data)

export const create = (data) => axiosClient.post('/api/incidents', data).then((r) => r.data)

export const updateStatus = (id, data) =>
  axiosClient.put(`/api/incidents/${id}/status`, data).then((r) => r.data)
