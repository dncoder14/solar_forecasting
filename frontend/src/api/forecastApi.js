import api from './client'

export const predict          = (features)  => api.post('/predict', { features })
export const getFeatureLabels = ()          => api.get('/feature-labels')
