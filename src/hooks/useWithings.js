import { useState, useEffect, useCallback } from 'react'

export default function useWithings() {
  const [status, setStatus] = useState({ connected: false, loading: true })
  const [measurements, setMeasurements] = useState([])
  const [latest, setLatest] = useState(null)
  const [syncing, setSyncing] = useState(false)

  // Check connection status on mount + auto-refresh every 60s when connected
  useEffect(() => {
    checkStatus()

    const interval = setInterval(() => {
      if (status.connected) {
        fetchMeasurements()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [status.connected])

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/withings/status')
      const data = await res.json()
      setStatus({ connected: data.connected, loading: false })

      // Auto-fetch measurements if connected
      if (data.connected) {
        fetchMeasurements()
      }
    } catch (err) {
      console.warn('Withings status check failed (is the API server running?):', err.message)
      setStatus({ connected: false, loading: false, serverDown: true })
    }
  }, [])

  const fetchMeasurements = useCallback(async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/withings/measurements')
      const data = await res.json()

      if (data.connected) {
        setMeasurements(data.measurements || [])
        setLatest(data.latest || null)
        setStatus({ connected: true, loading: false })
      } else {
        setStatus({ connected: false, loading: false })
      }
    } catch (err) {
      console.warn('Measurement fetch failed:', err.message)
    } finally {
      setSyncing(false)
    }
  }, [])

  const connect = useCallback(() => {
    window.location.href = '/api/withings/authorize'
  }, [])

  const disconnect = useCallback(async () => {
    try {
      await fetch('/api/withings/disconnect', { method: 'POST' })
      setStatus({ connected: false, loading: false })
      setMeasurements([])
      setLatest(null)
    } catch (err) {
      console.error('Disconnect failed:', err)
    }
  }, [])

  return {
    connected: status.connected,
    loading: status.loading,
    serverDown: status.serverDown,
    measurements,
    latest,
    syncing,
    connect,
    disconnect,
    refresh: fetchMeasurements,
  }
}
