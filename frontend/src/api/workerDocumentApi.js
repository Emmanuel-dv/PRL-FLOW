import axiosClient from './axiosClient'

export const getMy = () =>
  axiosClient.get('/api/worker-documents/my').then((r) => r.data)

export const getById = (id) =>
  axiosClient.get(`/api/worker-documents/${id}`).then((r) => r.data)

export const getByWorker = (workerId) =>
  axiosClient.get(`/api/worker-documents/worker/${workerId}`).then((r) => r.data)

export const getPending = () =>
  axiosClient.get('/api/worker-documents/pending').then((r) => r.data)

export const upload = (formData) =>
  axiosClient
    .post('/api/worker-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)

export const review = (id, data) =>
  axiosClient.put(`/api/worker-documents/${id}/review`, data).then((r) => r.data)

export const getCompliance = (workerId) =>
  axiosClient
    .get(`/api/worker-documents/worker/${workerId}/compliance`)
    .then((r) => r.data)
