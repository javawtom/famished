import { useEffect, useCallback } from 'react'
import useLocalStorage from './useLocalStorage'
import schedule from '../data/schedule'

/**
 * Meal reminder notifications using the browser Notification API.
 * 
 * Checks every minute if a meal time is within 1 minute of the scheduled time
 * and the user hasn't been notified yet today for that meal.
 * 
 * Stores notification permission and enabled state in localStorage.
 */
export default function useMealNotifications() {
  const [enabled, setEnabled] = useLocalStorage('fn-notifications', false)
  const [notifiedToday, setNotifiedToday] = useLocalStorage('fn-notified', {})

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') {
      setEnabled(true)
      return true
    }
    const result = await Notification.requestPermission()
    if (result === 'granted') {
      setEnabled(true)
      return true
    }
    return false
  }, [setEnabled])

  const disable = useCallback(() => {
    setEnabled(false)
  }, [setEnabled])

  const sendNotification = useCallback((meal) => {
    if (Notification.permission !== 'granted') return

    const messages = {
      breakfast: "Rise and fuel! 🌅 Time for breakfast — your body's been fasting all night.",
      lunch: "Midday fuel check! 🍽️ Keep the momentum going with a solid lunch.",
      snack: "Snack time! 🥜 A quick bite keeps your energy steady.",
      dinner: "Dinner's calling! 🍲 Time to refuel with something hearty.",
      latenight: "Late night fuel! 🌙 A light bite before rest keeps gains going.",
    }

    new Notification('Famished — Time to Eat!', {
      body: messages[meal.id] || `It's time for ${meal.label}!`,
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: `famished-${meal.id}`,
      requireInteraction: true,
    })
  }, [])

  // Check every 60 seconds if it's time for a meal
  useEffect(() => {
    if (!enabled) return

    const check = () => {
      const now = new Date()
      const eastern = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
      const currentHour = eastern.getHours()
      const currentMin = eastern.getMinutes()
      const today = eastern.toISOString().split('T')[0]

      // Reset notified state at midnight
      const storedDate = Object.values(notifiedToday)[0]
      if (storedDate && !Object.keys(notifiedToday).includes(today)) {
        setNotifiedToday({})
      }

      for (const meal of schedule) {
        const mealHour = meal.hour
        // Notify at the exact hour (within first 2 minutes)
        if (currentHour === mealHour && currentMin < 2) {
          const key = `${today}-${meal.id}`
          if (!notifiedToday[key]) {
            sendNotification(meal)
            setNotifiedToday(prev => ({ ...prev, [key]: true }))
          }
        }
      }
    }

    check() // Check immediately
    const interval = setInterval(check, 60000) // Every minute
    return () => clearInterval(interval)
  }, [enabled, notifiedToday, sendNotification, setNotifiedToday])

  return {
    enabled,
    requestPermission,
    disable,
    permissionState: typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  }
}
