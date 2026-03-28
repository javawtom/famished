// Default eating schedule
const schedule = [
  { id: 'breakfast', label: 'Breakfast', time: '08:00', hour: 8,  icon: 'wb_twilight', description: 'Warm oats with almond butter and berries. Focus on healthy fats and steady release carbs.' },
  { id: 'lunch',     label: 'Lunch',     time: '13:00', hour: 13, icon: 'light_mode',  description: 'Quinoa bowl with roasted sweet potato, tahini dressing, and leafy greens.' },
  { id: 'snack',     label: 'Afternoon Snack', time: '16:00', hour: 16, icon: 'restaurant', description: 'Greek yogurt or a handful of walnuts. A small nudge to keep the metabolism active.' },
  { id: 'dinner',    label: 'Dinner',    time: '19:00', hour: 19, icon: 'bedtime',     description: 'Grilled salmon with asparagus and wild rice. A nutrient-dense end to the day.' },
  { id: 'latenight', label: 'Late Night Fuel', time: '22:00', hour: 22, icon: 'nightlight', description: 'A light protein shake or warm milk with honey. Something gentle before rest.' },
]

export default schedule

/**
 * Get the current hour in US Eastern Time (EST/EDT).
 */
function getEasternHour() {
  const now = new Date()
  const eastern = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  return eastern.getHours()
}

/**
 * Determine the current meal period based on Eastern Time.
 */
export function getCurrentMealPeriod() {
  const hour = getEasternHour()

  if (hour >= 6 && hour < 11)  return { ...schedule[0], mealType: 'breakfast' }
  if (hour >= 11 && hour < 15) return { ...schedule[1], mealType: 'lunch' }
  if (hour >= 15 && hour < 17) return { ...schedule[2], mealType: 'snack' }
  if (hour >= 17 && hour < 22) return { ...schedule[3], mealType: 'dinner' }
  // 10 PM – 6 AM → Late Night
  return { ...schedule[4], mealType: 'latenight' }
}

export function formatTime(time24) {
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}
