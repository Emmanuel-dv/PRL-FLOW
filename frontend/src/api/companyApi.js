import axiosClient from './axiosClient'

export const getAll = () => axiosClient.get('/api/companies').then((r) => r.data)

export const getById = (id) => axiosClient.get(`/api/companies/${id}`).then((r) => r.data)

export const create = (data) => axiosClient.post('/api/companies', data).then((r) => r.data)

export const update = (id, data) =>
  axiosClient.put(`/api/companies/${id}`, data).then((r) => r.data)
