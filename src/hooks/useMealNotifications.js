import { useEffect, useCallback } from 'react'
import useLocalStorage from './useLocalStorage'
import schedule from '../data/schedule'

/**
 * Meal reminder notifications.
 * 
 * Fires 30 minutes BEFORE each scheduled meal time so the user has
 * time to prep. Falls back to a visual in-app reminder if browser
 * notifications aren't supported (e.g. iOS Safari).
 * 
 * Schedule (Eastern Time):
 *   Breakfast 8:00 → notify at 7:30
 *   Lunch    13:00 → notify at 12:30
 *   Snack    16:00 → notify at 15:30
 *   Dinner   19:00 → notify at 18:30
 *   Late     22:00 → notify at 21:30
 */

const PREP_LEAD_MINUTES = 30

export default function useMealNotifications() {
  const [enabled, setEnabled] = useLocalStorage('fn-notifications', false)
  const [notifiedToday, setNotifiedToday] = useLocalStorage('fn-notified', {})
  const [pendingReminder, setPendingReminder] = useLocalStorage('fn-pendingReminder', null)

  const supportsNotifications = typeof window !== 'undefined' && 'Notification' in window

  const toggleEnabled = useCallback(async () => {
    if (enabled) {
      setEnabled(false)
      return
    }

    // Always enable the toggle state (so it visually responds)
    setEnabled(true)

    // Try to get notification permission if supported
    if (supportsNotifications && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [enabled, setEnabled, supportsNotifications])

  const sendNotification = useCallback((meal) => {
    // Calculate the actual meal time for the message
    const mealHour = meal.hour
    const mealTimeStr = mealHour > 12 ? `${mealHour - 12}:00 PM` : `${mealHour}:00 AM`

    const messages = {
      breakfast: `Start prepping! 🌅 Breakfast at ${mealTimeStr} — your body's been fasting all night.`,
      lunch: `Time to prep lunch! 🍽️ ${mealTimeStr} is coming — keep the momentum going.`,
      snack: `Quick snack prep! 🥜 Your 4 PM energy boost needs a minute.`,
      dinner: `Start dinner! 🍲 ${mealTimeStr} is in 30 min — time to get cooking.`,
      latenight: `Light prep time! 🌙 A small bite before rest — get it ready.`,
    }

    const body = messages[meal.id] || `Start prepping for ${meal.label}! It's due at ${mealTimeStr}.`

    // Try browser notification first
    if (supportsNotifications && Notification.permission === 'granted') {
      new Notification('Famished — Prep Time! 🍳', {
        body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: `famished-${meal.id}`,
        requireInteraction: true,
      })
    }

    // Always set the in-app reminder (works on all platforms)
    setPendingReminder({ mealId: meal.id, label: meal.label, message: body, timestamp: Date.now() })
  }, [supportsNotifications, setPendingReminder])

  const dismissReminder = useCallback(() => {
    setPendingReminder(null)
  }, [setPendingReminder])

  // Check every 60 seconds if it's time for a meal prep reminder
  useEffect(() => {
    if (!enabled) return

    const check = () => {
      const now = new Date()
      const eastern = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
      const currentHour = eastern.getHours()
      const currentMin = eastern.getMinutes()
      const today = eastern.toISOString().split('T')[0]

      // Build the "notify at" time: 30 min before each meal
      for (const meal of schedule) {
        // Calculate the notification time (30 min before meal)
        let notifyHour = meal.hour
        let notifyMin = 0 - PREP_LEAD_MINUTES
        if (notifyMin < 0) {
          notifyHour -= 1
          notifyMin += 60
        }

        // Check if we're within the 2-minute window of the notification time
        if (currentHour === notifyHour && currentMin >= notifyMin && currentMin < notifyMin + 2) {
          const key = `${today}-${meal.id}`
          if (!notifiedToday[key]) {
            sendNotification(meal)
            setNotifiedToday(prev => ({ ...prev, [key]: true }))
          }
        }
      }
    }

    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [enabled, notifiedToday, sendNotification, setNotifiedToday])

  // Clear old notification keys daily
  useEffect(() => {
    const now = new Date()
    const today = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
      .toISOString().split('T')[0]
    const keys = Object.keys(notifiedToday)
    if (keys.length > 0 && !keys.some(k => k.startsWith(today))) {
      setNotifiedToday({})
    }
  }, [notifiedToday, setNotifiedToday])

  return {
    enabled,
    toggleEnabled,
    supportsNotifications,
    pendingReminder,
    dismissReminder,
    permissionState: supportsNotifications ? Notification.permission : 'unsupported',
  }
}
