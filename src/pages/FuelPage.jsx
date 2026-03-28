import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { getCurrentMealPeriod, formatTime } from '../data/schedule'
import { getHealthyMeals, getQuickMeals } from '../data/meals'

const encouragements = [
  'Stay Gentle',
  'You Are Enough',
  'One Bite at a Time',
  'Small Steps Matter',
  'Be Kind to Yourself',
]

function getEncouragement() {
  const day = new Date().getDay()
  return encouragements[day % encouragements.length]
}

export default function FuelPage() {
  const { currentWeight, markEaten, isMealEaten } = useApp()
  const mealPeriod = getCurrentMealPeriod()
  const encouragement = getEncouragement()

  const healthyOption = useMemo(() => {
    const type = mealPeriod.mealType === 'snack' ? 'lunch' : mealPeriod.mealType
    const meals = getHealthyMeals(type)
    const dayIndex = new Date().getDay()
    return meals[dayIndex % meals.length]
  }, [mealPeriod.mealType])

  const quickOption = useMemo(() => {
    const type = mealPeriod.mealType === 'snack' ? 'lunch' : mealPeriod.mealType
    const meals = getQuickMeals(type)
    const dayIndex = new Date().getDay()
    return meals[dayIndex % meals.length]
  }, [mealPeriod.mealType])

  const eaten = isMealEaten(mealPeriod.mealType)
  const [justAte, setJustAte] = useState(false)
  
  const progressPercent = Math.min(100, Math.round(((currentWeight - 145) / (175 - 145)) * 100))

  const handleEaten = () => {
    markEaten(mealPeriod.mealType)
    setJustAte(true)
    setTimeout(() => setJustAte(false), 2000)
  }

  const [expandedMeal, setExpandedMeal] = useState(null)

  return (
    <div className="space-y-10 animate-fade-up">
      {/* ===== WELCOME & ENCOURAGEMENT ===== */}
      <section className="space-y-2">
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">{encouragement}</h2>
        <p className="text-secondary text-lg leading-relaxed">
          You are doing enough. Let's find something simple to nourish you today.
        </p>
      </section>

      {/* ===== CURRENT MEAL SPOTLIGHT ===== */}
      <section className="bg-surface-container-lowest rounded-[2rem] p-7 botanical-shadow">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary filled">{mealPeriod.icon}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">Current Meal</span>
        </div>
        <h3 className="text-3xl font-bold text-primary mb-1">{mealPeriod.label}</h3>
        <p className="text-secondary-dim text-sm font-medium">
          {formatTime(mealPeriod.time)} • {mealPeriod.mealType === 'snack' ? 'Quick Energy' : 'Energy Focus'}
        </p>

        <div className="mt-7 space-y-3 stagger-children">
          {/* Healthy Option */}
          {healthyOption && (
            <div
              className="group cursor-pointer p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container-highest transition-all duration-300"
              onClick={() => setExpandedMeal(expandedMeal === healthyOption.id ? null : healthyOption.id)}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-primary font-bold text-xs block">Option 1: Healthy</span>
                  <h4 className="text-xl font-bold text-on-surface">{healthyOption.name}</h4>
                  <p className="text-secondary text-sm">{healthyOption.description}</p>
                </div>
                <span className="material-symbols-outlined text-primary-dim opacity-40 group-hover:opacity-100 transition-opacity">
                  {expandedMeal === healthyOption.id ? 'expand_less' : 'arrow_forward_ios'}
                </span>
              </div>
              {expandedMeal === healthyOption.id && (
                <div className="mt-4 pt-4 space-y-2 animate-fade-up" style={{ borderTop: '1px solid rgba(175,179,173,0.15)' }}>
                  {healthyOption.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary-dim text-sm mt-0.5">check_circle</span>
                      <p className="text-on-surface-variant text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Option */}
          {quickOption && (
            <div
              className="group cursor-pointer p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container-highest transition-all duration-300"
              onClick={() => setExpandedMeal(expandedMeal === quickOption.id ? null : quickOption.id)}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-tertiary font-bold text-xs block">Option 2: Quick</span>
                  <h4 className="text-xl font-bold text-on-surface">{quickOption.name}</h4>
                  <p className="text-secondary text-sm">{quickOption.description}</p>
                </div>
                <span className="material-symbols-outlined text-primary-dim opacity-40 group-hover:opacity-100 transition-opacity">
                  {expandedMeal === quickOption.id ? 'expand_less' : 'arrow_forward_ios'}
                </span>
              </div>
              {expandedMeal === quickOption.id && (
                <div className="mt-4 pt-4 space-y-2 animate-fade-up" style={{ borderTop: '1px solid rgba(175,179,173,0.15)' }}>
                  {quickOption.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary-dim text-sm mt-0.5">check_circle</span>
                      <p className="text-on-surface-variant text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* I've Eaten Button */}
        <div className="mt-8">
          <button
            onClick={handleEaten}
            disabled={eaten}
            className={`w-full py-4 rounded-full font-bold text-lg transition-all duration-300 active:scale-95 ${
              eaten || justAte
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-gradient-to-r from-primary to-primary-dim text-on-primary botanical-shadow'
            }`}
          >
            {eaten ? '\u2713 You\u2019ve fueled up' : justAte ? '\u2713 Logged!' : "I've Eaten"}
          </button>
        </div>
      </section>

      {/* ===== MINI PROGRESS ===== */}
      <section className="bg-surface-container p-7 rounded-[2rem] space-y-5">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h4 className="text-xl font-bold text-on-surface">Your Journey</h4>
            <p className="text-secondary text-sm">Targeting 175 lbs for health</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-primary">{currentWeight}</span>
            <span className="text-secondary font-bold ml-1">lbs</span>
          </div>
        </div>

        <div className="relative pt-1">
          <div className="h-4 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-fixed-dim rounded-full transition-all duration-1000 ease-out progress-pulse"
              style={{ width: `${Math.max(3, progressPercent)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[11px] font-bold text-outline uppercase tracking-tighter">
            <span>145 lbs</span>
            <span>175 lbs</span>
          </div>
        </div>

        <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: 'rgba(209, 232, 221, 0.3)' }}>
          <span className="material-symbols-outlined text-primary filled">colors_spark</span>
          <p className="text-on-primary-container text-sm font-medium">
            Progress is quiet, but it's happening every day.
          </p>
        </div>
      </section>
    </div>
  )
}
