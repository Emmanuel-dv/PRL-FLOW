import axiosClient from './axiosClient'

export const getDashboard = () => axiosClient.get('/api/dashboard').then((r) => r.data)
