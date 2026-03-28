import { createContext, useContext, useCallback, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import meals from '../data/meals'

const AppContext = createContext()

// Pick 3 weekly recipes deterministically based on the current week number
function getWeekNumber() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now - start
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
}

function pickWeeklyRecipes(weekNum) {
  // Rotate through dinner meals (both healthy & quick)
  const dinners = meals.filter(m => m.type === 'dinner')
  const lunches = meals.filter(m => m.type === 'lunch')
  const all = [...dinners, ...lunches]
  const start = (weekNum * 3) % all.length
  const picks = []
  for (let i = 0; i < 3; i++) {
    picks.push(all[(start + i) % all.length])
  }
  return picks
}

export function AppProvider({ children }) {
  const [currentWeight, setCurrentWeight] = useLocalStorage('fn-weight', 145)
  const [targetWeight, setTargetWeight] = useLocalStorage('fn-targetWeight', 175)
  const [weightLog, setWeightLog] = useLocalStorage('fn-weightLog', [
    { date: '2026-01-01', weight: 145 },
  ])
  const [checkedGroceries, setCheckedGroceries] = useLocalStorage('fn-checkedGroceries', {})
  const [eatenMeals, setEatenMeals] = useLocalStorage('fn-eatenMeals', {})
  const [cookedRecipes, setCookedRecipes] = useLocalStorage('fn-cookedRecipes', {})
  const [streakDays, setStreakDays] = useLocalStorage('fn-streak', 0)

  // Compute streak: count consecutive days (backwards from today) with at least one logged meal
  const computedStreak = useMemo(() => {
    const today = new Date()
    let streak = 0
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateKey = d.toISOString().split('T')[0]
      const dayMeals = eatenMeals[dateKey]
      if (dayMeals && Object.values(dayMeals).some(v => v)) {
        streak++
      } else if (i === 0) {
        // Today hasn't been logged yet, that's ok — don't break streak
        continue
      } else {
        break
      }
    }
    return streak
  }, [eatenMeals])

  const weekNum = getWeekNumber()
  const weeklyRecipes = useMemo(() => pickWeeklyRecipes(weekNum), [weekNum])

  const toggleGrocery = useCallback((id) => {
    setCheckedGroceries(prev => ({ ...prev, [id]: !prev[id] }))
  }, [setCheckedGroceries])

  const markEaten = useCallback((mealType) => {
    const today = new Date().toISOString().split('T')[0]
    setEatenMeals(prev => ({
      ...prev,
      [today]: { ...(prev[today] || {}), [mealType]: true }
    }))
  }, [setEatenMeals])

  const unmarkEaten = useCallback((mealType) => {
    const today = new Date().toISOString().split('T')[0]
    setEatenMeals(prev => {
      const todayMeals = { ...(prev[today] || {}) }
      delete todayMeals[mealType]
      return { ...prev, [today]: todayMeals }
    })
  }, [setEatenMeals])

  const markCooked = useCallback((mealId) => {
    const today = new Date().toISOString().split('T')[0]
    setCookedRecipes(prev => ({ ...prev, [mealId]: today }))
  }, [setCookedRecipes])

  const logWeight = useCallback((weight) => {
    const today = new Date().toISOString().split('T')[0]
    setCurrentWeight(weight)
    setWeightLog(prev => {
      const filtered = prev.filter(e => e.date !== today)
      return [...filtered, { date: today, weight }].sort((a, b) => a.date.localeCompare(b.date))
    })
  }, [setCurrentWeight, setWeightLog])

  const isMealEaten = useCallback((mealType) => {
    const today = new Date().toISOString().split('T')[0]
    return !!(eatenMeals[today] && eatenMeals[today][mealType])
  }, [eatenMeals])

  const resetGroceryList = useCallback(() => {
    setCheckedGroceries({})
  }, [setCheckedGroceries])

  const value = {
    currentWeight,
    targetWeight,
    setTargetWeight,
    weightLog,
    checkedGroceries,
    eatenMeals,
    cookedRecipes,
    streakDays: computedStreak,
    weeklyRecipes,
    toggleGrocery,
    markEaten,
    unmarkEaten,
    markCooked,
    logWeight,
    isMealEaten,
    resetGroceryList,
    setStreakDays,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
