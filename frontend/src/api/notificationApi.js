import axiosClient from './axiosClient'

export const getAll = () => axiosClient.get('/api/notifications').then((r) => r.data)

export const getUnread = () =>
  axiosClient.get('/api/notifications/unread').then((r) => r.data)

export const countUnread = () =>
  axiosClient.get('/api/notifications/unread/count').then((r) => r.data)

export const markAsRead = (id) =>
  axiosClient.put(`/api/notifications/${id}/read`).then((r) => r.data)

export const markAllAsRead = () =>
  axiosClient.put('/api/notifications/read-all').then((r) => r.data)
