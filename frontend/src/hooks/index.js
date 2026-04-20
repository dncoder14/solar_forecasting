import { useState, useEffect } from 'react'
import { getDatasetStats } from '../api/datasetApi'
import { getMetadata }     from '../api/datasetApi'
import { getFeatureLabels } from '../api/forecastApi'

export function useDatasetStats() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  useEffect(() => {
    getDatasetStats().then(setData).catch(setError).finally(() => setLoading(false))
  }, [])
  return { data, loading, error }
}

export function useMetadata() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  useEffect(() => {
    getMetadata().then(setData).catch(setError).finally(() => setLoading(false))
  }, [])
  return { data, loading, error }
}

export function useFeatureLabels() {
  const [data, setData]     = useState({})
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getFeatureLabels().then(setData).finally(() => setLoading(false))
  }, [])
  return { data, loading }
}
