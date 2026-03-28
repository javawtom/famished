import { useState, useEffect, useCallback } from 'react'

/**
 * Hook for Withings Sleep Mat data.
 * Fetches sleep summaries (score, deep/REM/light hours, HR, breathing)
 * from the local API server's /api/withings/sleep endpoint.
 */
export default function useSleepData() {
  const [nights, setNights] = useState([])
  const [latest, setLatest] = useState(null)
  const [averages, setAverages] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSleep = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/withings/sleep')
      if (!res.ok) {
        if (res.status === 401) {
          // Not connected — that's fine, not an error
          setLoading(false)
          return
        }
        throw new Error(`Sleep fetch failed: ${res.status}`)
      }

      const data = await res.json()
      if (data.connected) {
        setNights(data.nights || [])
        setLatest(data.latest || null)
        setAverages(data.averages || null)
      }
    } catch (err) {
      // Server not running or no sleep data — don't spam console
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount + every 5 minutes
  useEffect(() => {
    fetchSleep()
    const interval = setInterval(fetchSleep, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchSleep])

  // Helper: get sleep quality label from score
  const getQuality = (score) => {
    if (!score) return { label: '—', color: '#787c77' }
    if (score >= 80) return { label: 'Excellent', color: '#2d7a4f' }
    if (score >= 60) return { label: 'Good', color: '#4f645b' }
    if (score >= 40) return { label: 'Fair', color: '#b8860b' }
    return { label: 'Poor', color: '#a73b21' }
  }

  // Helper: correlate sleep with eating (did they eat well yesterday?)
  const getCorrelation = (eatenMeals) => {
    if (!latest || !eatenMeals) return null

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yKey = yesterday.toISOString().split('T')[0]
    const dayMeals = eatenMeals[yKey]

    if (!dayMeals) return null

    const mealsEaten = Object.values(dayMeals).filter(Boolean).length
    const sleepScore = latest.sleepScore

    if (mealsEaten >= 4 && sleepScore >= 70) {
      return { message: 'Full day of eating → great sleep. Keep this up.', type: 'positive' }
    }
    if (mealsEaten >= 4 && sleepScore < 50) {
      return { message: 'Ate well but slept poorly. Check screen time or caffeine.', type: 'neutral' }
    }
    if (mealsEaten <= 2 && sleepScore < 50) {
      return { message: 'Skipped meals + bad sleep. Your body can\'t recover on empty.', type: 'negative' }
    }
    if (mealsEaten <= 2 && sleepScore >= 70) {
      return { message: 'Slept okay despite skipping meals. Don\'t count on that lasting.', type: 'warning' }
    }
    return null
  }

  return {
    nights,
    latest,
    averages,
    loading,
    error,
    refresh: fetchSleep,
    getQuality,
    getCorrelation,
  }
}
