import api from './client'

export const getDatasetStats = () => api.get('/dataset-stats')
export const getMetadata     = () => api.get('/metadata')
