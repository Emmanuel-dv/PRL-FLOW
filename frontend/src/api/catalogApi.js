import axiosClient from './axiosClient'

// ── Document Types ────────────────────────────────────────────────────────────
export const getAllDocumentTypes = () =>
  axiosClient.get('/api/document-types').then((r) => r.data)

export const createDocumentType = (data) =>
  axiosClient.post('/api/document-types', data).then((r) => r.data)

export const updateDocumentType = (id, data) =>
  axiosClient.put(`/api/document-types/${id}`, data).then((r) => r.data)

export const deleteDocumentType = (id) =>
  axiosClient.delete(`/api/document-types/${id}`)

// ── EPI Catalog ───────────────────────────────────────────────────────────────
export const getAllEpiCatalog = () =>
  axiosClient.get('/api/epi-catalog').then((r) => r.data)

export const createEpiCatalog = (data) =>
  axiosClient.post('/api/epi-catalog', data).then((r) => r.data)

export const updateEpiCatalog = (id, data) =>
  axiosClient.put(`/api/epi-catalog/${id}`, data).then((r) => r.data)

export const deleteEpiCatalog = (id) =>
  axiosClient.delete(`/api/epi-catalog/${id}`)
