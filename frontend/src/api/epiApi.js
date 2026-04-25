import axiosClient from './axiosClient'

export const getAll = () => axiosClient.get('/api/epi-deliveries').then((r) => r.data)

export const getById = (id) =>
  axiosClient.get(`/api/epi-deliveries/${id}`).then((r) => r.data)

export const getByCompany = () =>
  axiosClient.get('/api/epi-deliveries/company').then((r) => r.data)

export const create = (data) =>
  axiosClient.post('/api/epi-deliveries', data).then((r) => r.data)

export const markDelivered = (id) =>
  axiosClient.put(`/api/epi-deliveries/${id}/deliver`).then((r) => r.data)

export const confirm = (id) =>
  axiosClient.post(`/api/epi-deliveries/${id}/confirm`).then((r) => r.data)
