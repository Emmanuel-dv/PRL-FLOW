import axiosClient from './axiosClient'

export const getAll = () => axiosClient.get('/api/users').then((r) => r.data)

export const getById = (id) => axiosClient.get(`/api/users/${id}`).then((r) => r.data)

export const create = (data) => axiosClient.post('/api/users', data).then((r) => r.data)

export const update = (id, data) =>
  axiosClient.put(`/api/users/${id}`, data).then((r) => r.data)

export const deactivate = (id) => axiosClient.delete(`/api/users/${id}`).then((r) => r.data)
