import axiosClient from './axiosClient'

export const getAll = () => axiosClient.get('/api/job-positions').then((r) => r.data)

export const getById = (id) =>
  axiosClient.get(`/api/job-positions/${id}`).then((r) => r.data)

export const create = (data) =>
  axiosClient.post('/api/job-positions', data).then((r) => r.data)

export const update = (id, data) =>
  axiosClient.put(`/api/job-positions/${id}`, data).then((r) => r.data)

export const deactivate = (id) =>
  axiosClient.delete(`/api/job-positions/${id}`).then((r) => r.data)

export const assignDocument = (id, data) =>
  axiosClient.post(`/api/job-positions/${id}/documents`, data).then((r) => r.data)

export const getDocuments = (id) =>
  axiosClient.get(`/api/job-positions/${id}/documents`).then((r) => r.data)

export const assignEpi = (id, data) =>
  axiosClient.post(`/api/job-positions/${id}/epis`, data).then((r) => r.data)

export const getEpis = (id) =>
  axiosClient.get(`/api/job-positions/${id}/epis`).then((r) => r.data)
