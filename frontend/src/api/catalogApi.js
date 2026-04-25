import axiosClient from './axiosClient'

export const getAllDocumentTypes = () =>
  axiosClient.get('/api/document-types').then((r) => r.data)

export const createDocumentType = (data) =>
  axiosClient.post('/api/document-types', data).then((r) => r.data)

export const getAllEpiCatalog = () =>
  axiosClient.get('/api/epi-catalog').then((r) => r.data)

export const createEpiCatalog = (data) =>
  axiosClient.post('/api/epi-catalog', data).then((r) => r.data)
