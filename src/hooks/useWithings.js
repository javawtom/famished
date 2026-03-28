import { useState, useEffect, useCallback, useRef } from 'react'

export default function useWithings() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [serverDown, setServerDown] = useState(false)
  const [measurements, setMeasurements] = useState([])
  const [latest, setLatest] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const connectedRef = useRef(false)

  // Check status once on mount
  useEffect(() => {
    checkStatus()
  }, [])

  // Set up auto-refresh interval (reads ref, not state, to avoid re-render loop)
  useEffect(() => {
    const interval = setInterval(() => {
      if (connectedRef.current) {
        fetchMeasurements()
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/withings/status')
      const data = await res.json()
      connectedRef.current = data.connected
      setConnected(data.connected)
      setLoading(false)
      setServerDown(false)

      if (data.connected) {
        fetchMeasurements()
      }
    } catch (err) {
      console.warn('Withings status check failed:', err.message)
      connectedRef.current = false
      setConnected(false)
      setLoading(false)
      setServerDown(true)
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
        connectedRef.current = true
        setConnected(true)
      } else {
        connectedRef.current = false
        setConnected(false)
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
      connectedRef.current = false
      setConnected(false)
      setMeasurements([])
      setLatest(null)
    } catch (err) {
      console.error('Disconnect failed:', err)
    }
  }, [])

  return {
    connected,
    loading,
    serverDown,
    measurements,
    latest,
    syncing,
    connect,
    disconnect,
    refresh: fetchMeasurements,
  }
}
